[].forEach.call(document.querySelectorAll('a[href^="http"], a[href^="/"]'), function (item, index){
    if (item.href.indexOf('kbb.com') > -1) {
        console.log('Url found: ' + item.href);
    }
});
