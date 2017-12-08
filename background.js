// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // Send a message to the active tab
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       var activeTab = tabs[0];
//       chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
//     });
// });

var _isConnected = false;
var _validatedUrls = [];
var _userAgent = '';
var _alreadyValidated = {};
var _linkStatus = {};

function resetLinkStatus() {
    _alreadyValidated = {};
    _linkStatus = {};
}

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
  return url + `?zipcode=${zip}`;
}

function validateUrls(urlIndexes, port) {
    let totalLinks = urlIndexes.length,
        count = 0,
        failedCount = 0,
        successCount = 0,
        ignoredCount = 0;

  [].forEach.call(urlIndexes, index => {
      var url = _validatedUrls[index];

      if (!_alreadyValidated[url]) {
        _alreadyValidated[url] = true;
        fetchUrlStatus(appendZipCode(url, 12345), _userAgent, data => {
            let status = { statusCode: data.StatusCode, success: data.Success};
            _linkStatus[index] = status;

            if (_isConnected) {
                try {
                    port.postMessage({message: 'update_link_status', index, status});
                } catch(e) {}
            }

            if (data.Success) {
                successCount++;
            } else {
                failedCount++;
            }

            count++;
            if (count == totalLinks) {
                port.postMessage({message: 'done_validation', status: {successCount, failedCount, ignoredCount}});
            }
        });
      } else {
          totalLinks--;
          ignoredCount++;
      }
  });
};

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         // TODO
//     }
// );

chrome.extension.onConnect.addListener(function(port) {
    _isConnected = true;
    console.log("Connected .....");
    
    port.postMessage({message: 'load_data', urls: _validatedUrls, linkStatus: _linkStatus});

    port.onMessage.addListener(function(request) {         
         switch(request.message) {
            case 'fetch_data':
                _userAgent = request.userAgent;
                _validatedUrls = request.urls;
                resetLinkStatus();
                break;
            case 'validate_data':
                validateUrls(request.urlIndexes, port);
                break;
        }
    });

    port.onDisconnect.addListener(function() {
        _isConnected = false;
    });
})