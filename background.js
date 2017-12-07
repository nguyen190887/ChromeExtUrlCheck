// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // Send a message to the active tab
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       var activeTab = tabs[0];
//       chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
//     });
// });

var _validatedUrls = [];
var _userAgent = '';
var _alreadyValidated = {};

function fetchUrlStatus(url, userAgent, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:2150/api/linkchecker', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.withCredentials = true;

  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          console.log(`Result: ${data.StatusCode} | ${data.Success} | ${url}`);
          callback(data);
      }
  };

  var data = {
      Url: url,
      UserAgent: userAgent
  };
  xhr.send(JSON.stringify(data));
}

function appendZipCode(url, zip) {
  if (url.indexOf('?') > -1) {
    return url.replace('?', `?zipcode=${zip}&`);
  }
  else url + `?zipcode=${zip}`;
}

function validateUrls() {
  [].forEach.call(document.querySelectorAll('input[type=checkbox]'), item => {
    if (item.checked) {
      var index = parseInt(item.value),
          url = _validatedUrls[index];

      if (!_alreadyValidated[url]) {
        _alreadyValidated[url] = true;
        fetchUrlStatus(appendZipCode(url, 12345), _userAgent, data => {
          updateLinkStatus(index, data);
        });
      }
    }
  });
};

// function updateLinkStatus(index, data) {
//   var li = document.getElementById(`link_${index}`);
//   if (li) {
//     var status = document.getElementById(`status_${index}`);
//     if (!status) {
//       status = document.createElement('span');
//       status.id = `status_${index}`;
//       li.appendChild(status);
//     }
    
//     status.innerText = ` | ${data.StatusCode} | ${data.Success}`;
//     li.style.backgroundColor = data.Success ? 'green' : 'red';
//   }
// }

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // switch(request.message) {
        //     case 'response_urls':
        //         _userAgent = request.userAgent;
        //         _validatedUrls = request.urls;
        //     break;
        // }
    }
);

chrome.extension.onConnect.addListener(function(port) {
    console.log("Connected .....");

    port.postMessage({message: 'load_data', urls: _validatedUrls});

    port.onMessage.addListener(function(request) {         
         switch(request.message) {
            case 'fetch_data':
                _userAgent = request.userAgent;
                _validatedUrls = request.urls;
                break;
            case 'validate_data':
                // TODO: validate data here
                break;
        }
    });
})