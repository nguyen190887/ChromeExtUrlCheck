var logDomain = '';

// listen message
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "request_urls" ) {
            let existingUrls = {};
            let allUrls = [];
            [].forEach.call(document.querySelectorAll('a[href^="http"], a[href^="/"]'), (item) => {
                if (!logDomain || item.href.indexOf(logDomain) > -1) {
                    let url = item.href;
                    if (!existingUrls[url]) {
                        allUrls.push(url);
                        existingUrls[url] = true;
                    }
                }
            });

            chrome.runtime.sendMessage(
                {
                    "message": "response_urls",
                    "urls": allUrls, //.slice(0, 3),
                    "userAgent" : navigator.userAgent
                });
        }
    }
);
