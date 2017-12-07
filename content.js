var logDomain = '';

// listen message
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "clicked_browser_action" ) {
            var allUrls = 
                [].map.call(document.querySelectorAll('a[href^="http"], a[href^="/"]'), (item) => {
                    if (!logDomain || item.href.indexOf(logDomain) > -1) {
                        return item.href;
                    }
                    return '';
                })
                .filter(item => item !== '');

            chrome.runtime.sendMessage({"message": "open_new_tab", "urls": allUrls.slice(0, 5)});
        }
    }
);
