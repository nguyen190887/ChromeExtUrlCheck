var port = chrome.extension.connect({
  name: "Popup-Background Communication"
});

function validateUrls() {
  let urlIndexes = []
    .filter
    .call(document.querySelectorAll('input[type=checkbox]'), item => item.checked)
    .map(item => parseInt(item.value));
  port.postMessage({message: 'validate_data', urlIndexes});
  markValidationInProgress(urlIndexes.length);
};

function updateLinkStatus(index, data) {
  if (data) {
    var li = document.getElementById(`link_${index}`);
    if (li) {
      var status = document.getElementById(`status_${index}`);
      if (!status) {
        status = document.createElement('span');
        status.id = `status_${index}`;
        li.appendChild(status);
      }
      
      status.innerText = ` | ${data.statusCode} | ${data.success}`;
      li.style.backgroundColor = data.success ? 'green' : 'red';
    }
  }
}

function processUrls(urls, linkStatus = {}) {
  var urlList = document.getElementById('urlList');
  urlList.innerHTML = '';

  // _validatedUrls = [];  
  var index = 0;
  [].forEach.call(urls, url => {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.innerText = url;

      var checkbox = document.createElement('input');
      checkbox.id = `checkbox_${index}`;
      checkbox.value = index;
      checkbox.type = 'checkbox';
      
      var li = document.createElement('li');
      li.id = `link_${index}`;
      li.appendChild(checkbox);
      li.appendChild(a);

      urlList.appendChild(li);

      updateLinkStatus(index, linkStatus[index]);

      // _validatedUrls.push(url);
      index++;
  });
}

function selectAll () {
  var logDomain = document.getElementById('logDomain').value;

  [].forEach.call(document.querySelectorAll('input[type=checkbox]'), item => {
    var link = item.nextElementSibling;
    if (link && link.href.indexOf(logDomain) > -1) {
      item.checked = true;
    } else {
      item.checked = false;
    }
  });
}

function unselectAll () {
  [].forEach.call(document.querySelectorAll('input[type=checkbox]'), item => {
    item.checked = false;
  });
}

function setResult(html) {
  let div = document.getElementById('validationResult');
  div.innerHTML = html;
}

function updateValidateResult(status) {
  setResult(
    `Done: <span class="passed">${status.successCount} passed</span>,
    <span class="failed">${status.failedCount} failed</span>,
    <span class="ignored">${status.ignoredCount} ignored</span>`);
}

function resetValidationResult() {
  setResult('');
}

function markValidationInProgress(linkCount) {
  setResult(`Processing ${linkCount} links...`);
}

document.addEventListener('DOMContentLoaded', () => {
  var fetchUrlButton = document.getElementById('fetchUrls'),
      validateButton = document.getElementById('validateUrls'),
      selectAllButton = document.getElementById('selectAll'),
      unselectAllButton = document.getElementById('unselectAll');

  fetchUrlButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {'message': 'request_urls'});
    });
  });

  validateButton.addEventListener('click', validateUrls);
  selectAllButton.addEventListener('click', selectAll);
  unselectAllButton.addEventListener('click', unselectAll);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.message) {
      case 'response_urls':
        processUrls(request.urls);
        port.postMessage({message: 'fetch_data', userAgent: request.userAgent, urls: request.urls});
        resetValidationResult();
        break;
    }
  }
);

port.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.message) {
      case 'load_data':
        processUrls(request.urls, request.linkStatus);
        break;
      case 'update_link_status':
        updateLinkStatus(request.index, request.status);
        break;
      case 'done_validation':
        updateValidateResult(request.status);
        break;
    }
  }
);
