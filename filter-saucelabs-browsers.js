/*jshint node: true*/

var _ = require('lodash');

function getHighestVersionBrowser(b1, b2) {
    var v1 = b1.version.split('.').map(parseInt),
        v2 = b2.version.split('.').map(parseInt);
    if (v1[0] > v2[0]) {
        return b1;
    } else if (v1[0] === v2[0]) {
        if (v1.length > 1 && v1[1] > v2[1]) {
            return b1;
        } else {
            return b2;
        }
    } else {
        return b2;
    }
}

function getHighestStableVersionForPlatform(browsers, platform) {
    var thisPlatform = _.filter(browsers, { platform: platform });
    thisPlatform = _.filter(thisPlatform, function (browser) {
        return !/beta/i.test(browser.version);
    });
    return _.reduce(thisPlatform, function (highest, browser) {
        return getHighestVersionBrowser(highest, browser);
    });
}

function filterBrowserName(browsers, regex) {
    return _.filter(browsers, function (browser) {
        return regex.test(browser.longBrowserName);
    });
}

function getPlatforms(browsers) {
    return _.uniq(_.pluck(browsers, 'platform'));
}

// get the latest version of a given browser per platform
function getLatestByBrowserName(browsers, regex) {
    browsers = filterBrowserName(browsers, regex);

    return _.map(getPlatforms(browsers), function (platform) {
        return getHighestStableVersionForPlatform(browsers, platform);
    });
}

// get all IE browsers greater than the given version
function getIE(browsers, version) {
    browsers = filterBrowserName(browsers, /internet explorer/i);
    browsers = _.filter(browsers, function (browser) {
        // find IE browsers higher than version 7
        return getHighestVersionBrowser(browser, { version: version.toString() }) === browser;
    });
    return _.uniq(browsers, false, 'version');
}

module.exports = function (browsers) {
    var firefox = getLatestByBrowserName(browsers, /firefox/i);
    var chrome = getLatestByBrowserName(browsers, /chrome/i);
    var iphone = getLatestByBrowserName(browsers, /iphone/i);
    var ipad = getLatestByBrowserName(browsers, /ipad/i);
    var ie = getIE(browsers, 7);
    var android = getLatestByBrowserName(browsers, /android/i);
    var safari = getLatestByBrowserName(browsers, /safari/i);

    return {
        all: [].concat(firefox, chrome, safari, ie, iphone, ipad, android),
        android: android,
        chrome: chrome,
        firefox: firefox,
        ie: ie,
        iphone: iphone,
        ipad: ipad,
        ios: [].concat(iphone, ipad),
        safari: safari
    };
};
