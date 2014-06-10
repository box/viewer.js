module('Utility - url', {
    setup: function () {
        this.util = Crocodoc.getUtility('url');
    }
});

test('getCurrentURL() should return the current URL when called', function () {
    equal(this.util.getCurrentURL(), window.location.href);
});

test('makeAbsolute() should return an absolute href when called', function () {
    var path = '/hello/world',
        origin = location.protocol + '//' + location.host;

    equal(this.util.makeAbsolute(path), origin + path);
});

test('makeAbsolute() should return the same url when called with a url that is already absolute', function () {
    var path = 'http://blah.webs/hello/world';

    equal(this.util.makeAbsolute(path), path);
});

test('isCrossDomain() should return true when called with a cross-domain url', function () {
    var path = 'http://blah.webs/hello/world';
    ok(this.util.isCrossDomain(path));
});

test('isCrossDomain() should return false when called with a same-domain url', function () {
    var path = location.protocol + '//' + location.host + '/hello/world';
    ok(!this.util.isCrossDomain(path));
    path = 'a/relative/path';
    ok(!this.util.isCrossDomain(path));
});

test('parse() should return a parsed version of a url when called', function () {
    var port = 4000,
        protocol = 'http:',
        hostname = 'viewer.technology',
        host = hostname + ':' + port,
        pathname = '/is/a/technology',
        hash = '#for-realz',
        search = '?beep=boop&bop=beep',
        href = protocol + '//' + host + pathname + search + hash,
        parsed = this.util.parse(href);

    equal(parsed.port, port);
    equal(parsed.protocol, protocol);
    equal(parsed.hostname, hostname);
    equal(parsed.host, host);
    equal(parsed.pathname, pathname);
    equal(parsed.hash, hash);
    equal(parsed.search, search);
    equal(parsed.href, href);
});

