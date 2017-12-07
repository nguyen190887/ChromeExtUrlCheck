var logDomain = '';
[].forEach.call(document.querySelectorAll('a[href^="http"], a[href^="/"]'), function (item, index){
    if (!logDomain || item.href.indexOf(logDomain) > -1) {
        console.log('Url found: ' + item.href);
    }
});
