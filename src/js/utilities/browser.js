/**
 * @fileOverview browser detection for use when feature detection won't work
 */

Crocodoc.addUtility('browser', function () {

    'use strict';

    var ua = navigator.userAgent,
        browser = {},
        ios, android, blackberry,
        webos, silk, ie;

    ios = /iphone|ipod|ipad/i.test(ua);
    android = /android/i.test(ua);
    webos = /webos/i.test(ua);
    blackberry = /blackberry/i.test(ua);
    silk = /blackberry/i.test(ua);
    ie = /MSIE/i.test(ua);

    if (ie) {
        browser.ie = true;
        browser.version = parseFloat(/MSIE\s+(\d+\.\d+)/i.exec(ua)[1]);
        browser.ielt9 = browser.version < 9;
        browser.ielt10 = browser.version < 10;
    }
    if (ios) {
        browser.ios = true;
    }
    browser.mobile = /mobile/i.test(ua) || ios || android || blackberry || webos || silk;
    browser.firefox = /firefox/i.test(ua);
    if (/safari/i.test(ua)) {
        browser.chrome = /chrome/i.test(ua);
        browser.safari = !browser.chrome;
    }

    return browser;
});
