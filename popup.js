var port = chrome.extension.connect({
  name: "Sample Communication"
});
// port.postMessage("Hi BackGround");
// port.onMessage.addListener(function(msg) {
//   console.log("message recieved" + msg);
// });

// // TODO: move logic to background to avoid data lost issue
// var _validatedUrls = [];
// var _userAgent = '';
// var _alreadyValidated = {};

// function fetchUrlStatus(url, userAgent, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', 'http://localhost:2150/api/linkchecker', true);
//   xhr.setRequestHeader("Content-Type", "application/json");
//   xhr.withCredentials = true;

//   xhr.onreadystatechange = function() {
//       if (xhr.readyState === 4 && xhr.status === 200) {
//           var data = JSON.parse(xhr.responseText);
//           console.log(`Result: ${data.StatusCode} | ${data.Success} | ${url}`);
//           callback(data);
//       }
//   };

//   var data = {
//       Url: url,
//       UserAgent: userAgent
//   };
//   xhr.send(JSON.stringify(data));
// }

// function appendZipCode(url, zip) {
//   if (url.indexOf('?') > -1) {
//     return url.replace('?', `?zipcode=${zip}&`);
//   }
//   else url + `?zipcode=${zip}`;
// }

// function validateUrls() {
//   [].forEach.call(document.querySelectorAll('input[type=checkbox]'), item => {
//     if (item.checked) {
//       var index = parseInt(item.value),
//           url = _validatedUrls[index];

//       if (!_alreadyValidated[url]) {
//         _alreadyValidated[url] = true;
//         fetchUrlStatus(appendZipCode(url, 12345), _userAgent, data => {
//           updateLinkStatus(index, data);
//         });
//       }
//     }
//   });
// };

function updateLinkStatus(index, data) {
  var li = document.getElementById(`link_${index}`);
  if (li) {
    var status = document.getElementById(`status_${index}`);
    if (!status) {
      status = document.createElement('span');
      status.id = `status_${index}`;
      li.appendChild(status);
    }
    
    status.innerText = ` | ${data.StatusCode} | ${data.Success}`;
    li.style.backgroundColor = data.Success ? 'green' : 'red';
  }
}

function processUrls(urls) {
  var urlList = document.getElementById('urlList');
  urlList.innerHTML = '';

  _validatedUrls = [];  
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

      _validatedUrls.push(url);
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

document.addEventListener('DOMContentLoaded', () => {
  var fetchUrlButton = document.getElementById('fetchUrls'),
      validateButton = document.getElementById('validateUrls'),
      selectAllButton = document.getElementById('selectAll');

  fetchUrlButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {'message': 'request_urls'});
    });
  });

  validateButton.addEventListener('click', validateUrls);
  selectAllButton.addEventListener('click', selectAll);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.message) {
      case 'response_urls':
        processUrls(request.urls);
        port.postMessage({message: 'fetch_data', userAgent: request.userAgent, urls: request.urls});
        break;
    }
  }
);

port.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.message) {
      case 'load_data':
        processUrls(request.urls);
        break;
    }
  }
);
