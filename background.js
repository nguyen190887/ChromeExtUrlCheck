// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "open_new_tab") {
            [].forEach.call(request.urls, url => {
                // chrome.tabs.create({"url": url});

                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'http://localhost:2150/api/linkchecker', true);
                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var data = JSON.parse(xhr.responseText);
                        console.log(`Result: ${data.StatusCode} | ${data.Success} | ${url}`);
                    }
                };

                // xhr.send(`Url=${encodeURIComponent(url)}&UserAgent=${request.userAgent}`);
                var data = {
                    Url: url,
                    UserAgent: request.userAgent
                };
                xhr.send(JSON.stringify(data));
            });
        }
    }
);
