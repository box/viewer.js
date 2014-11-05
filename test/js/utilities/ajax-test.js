
module('Utility - ajax', {
    setup: function () {
        this.xhr = {
            open: function () {},
            setRequestHeader: function () {},
            send: function () {}
        };
        this.xdr = {
            open: function () {},
            send: function () {}
        };
        this.utilities = {
            common: Crocodoc.getUtilityForTest('common'),
            promise: Crocodoc.getUtilityForTest('promise'),
            url: {
                isCrossDomain: function () {},
                parse: function () {},
                appendQueryParams: function () {}
            },
            support: {
                isXHRSupported: function () {},
                isCORSSupported: function () {},
                getXHR: sinon.stub().returns(this.xhr),
                getXDR: sinon.stub().returns(this.xdr)
            }
        };
        this.framework = Crocodoc.getFrameworkForTest(this);
        this.util = Crocodoc.getUtilityForTest('ajax', this.framework);
    }
});

test('fetch() should resolve a promise if the successful response is non-empy', function() {
    var promiseResolved = false;
    var responseObject = { responseText: 'some data' };
    this.stub(this.util, 'request').yieldsToOn('success', responseObject);


    var promise = this.util.fetch('someurl', 0);
    promise.done(function(){
        ok(true, 'promise should be resolved');
    });
});

test('fetch() should reject a promise if the successful response is empty', function() {
    var promiseResolved = false;
    var responseObject = { responseText: '' };
    this.stub(this.util, 'request').yieldsToOn('success', responseObject);


    var promise = this.util.fetch('someurl', 0);
    promise.fail(function(){
        ok(true, 'promise should be rejected');
    });
});

test('fetch() should reject a promise if the request fails', function() {
    var promiseResolved = false;
    var responseObject = {
        status: 404,
        statusText: 'not found'
    };

    this.stub(this.util, 'request').yieldsToOn('fail', responseObject);

    var promise = this.util.fetch('someurl', 0);
    promise.fail(function(){
        ok(true, 'promise should be rejected');
    });
});

test('request() should fail when called and XHR is not supported', function () {
    var options = {
        fail: sinon.spy()
    };
    this.stub(this.utilities.support, 'isXHRSupported').returns(false);
    this.util.request('some url', options);
    ok(options.fail.called, 'fail should be called');
});

test('request() should make an XHR when called with a same domain URL and XHR is supported', function () {
    var url = 'some url',
        openSpy = this.spy(this.xhr, 'open'),
        sendSpy = this.spy(this.xhr, 'send');

    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url);
    ok(openSpy.calledWith('GET', url, true), 'open should be called with correct params');
    ok(sendSpy.calledWith(''), 'send should be called with correct params');
});

test('request() should set request headers properly when called and XHR is supported', function () {
    var url = 'some url',
        setRequestHeaderSpy = this.spy(this.xhr, 'setRequestHeader'),
        headers = [
            ['content-type', 'application/x-shibe'],
            ['x-very-header', 'wow']
        ];

    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url, { headers: headers });
    ok(setRequestHeaderSpy.calledWith(headers[0][0], headers[0][1]), 'setRequestHeader should be called with correct params');
    ok(setRequestHeaderSpy.calledWith(headers[1][0], headers[1][1]), 'setRequestHeader should be called with correct params');
});

test('request() should make an XHR when called with cross domain URL and CORS is supported', function () {
    var url = 'some url',
        openSpy = this.spy(this.xhr, 'open'),
        sendSpy = this.spy(this.xhr, 'send');

    this.stub(this.utilities.url, 'isCrossDomain').returns(true);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.stub(this.utilities.support, 'isCORSSupported').returns(true);
    this.util.request(url);
    ok(openSpy.calledWith('GET', url, true), 'open should be called with correct params');
    ok(sendSpy.calledWith(''), 'send should be called with correct params');
});

test('request() should make an XDR when called with cross domain URL and CORS is not supported, but XDR is supported', function () {
    var url = 'some url',
        openSpy = this.spy(this.xdr, 'open'),
        sendSpy = this.spy(this.xdr, 'send');

    this.stub(this.utilities.url, 'isCrossDomain').returns(true);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.stub(this.utilities.support, 'isCORSSupported').returns(false);
    this.util.request(url);
    ok(openSpy.calledWith('GET', url), 'open should be called with correct params');
    ok(sendSpy.calledWith(''), 'send should be called with correct params');
});

test('request() should fail when called with cross domain URL and CORS is not supported, and XDR is not supported', function () {
    var url = 'some url',
        options = { fail: this.spy() };

    this.stub(this.xdr, 'open').throws();

    this.stub(this.utilities.url, 'isCrossDomain').returns(true);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.stub(this.utilities.support, 'isCORSSupported').returns(false);
    this.util.request(url, options);
    ok(options.fail.called, 'request should fail');
});

test('request() should succeed when called and the request is successful and XHR is supported', function () {
    var url = 'some url',
        options = {
            success: this.spy(),
            fail: this.spy()
        };

    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url, options);

    this.xhr.readyState = 4;
    this.xhr.status = 200;
    this.xhr.onreadystatechange();
    ok(options.fail.notCalled, 'request should not fail');
    ok(options.success.called, 'request should succeed');
});

test('request() should fail when called and the request is unsuccessful and XHR is supported', function () {
    var url = 'some url',
        options = {
            success: this.spy(),
            fail: this.spy()
        };

    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.url, 'parse').returns({ protocol: 'http' });
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url, options);

    this.xhr.readyState = 4;
    this.xhr.status = 404;
    this.xhr.onreadystatechange();
    ok(options.fail.called, 'request should fail');
    ok(options.success.notCalled, 'request should not succeed');
});

test('request() should succeed when called and the XDR request is successful', function () {
    var url = 'some url',
        options = {
            success: this.spy(),
            fail: this.spy()
        };

    this.stub(this.utilities.url, 'isCrossDomain').returns(true);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.stub(this.utilities.support, 'isCORSSupported').returns(false);
    this.util.request(url, options);

    this.xdr.onload();
    ok(options.fail.notCalled, 'request should not fail');
    ok(options.success.called, 'request should succeed');
});

test('request() should fail when called and the XDR request is unsuccessful', function () {
    var url = 'some url',
        options = {
            success: this.spy(),
            fail: this.spy()
        };

    this.stub(this.utilities.url, 'isCrossDomain').returns(true);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.stub(this.utilities.support, 'isCORSSupported').returns(false);
    this.util.request(url, options);

    this.xdr.onerror();
    ok(options.fail.called, 'request should fail');
    ok(options.success.notCalled, 'request should not succeed');
});

test('request() should append data as query parameters if the request method is GET and data is supplied as a non-string', function () {
    var url = 'some url',
        options = {
            data: { wow: 'such data' }
        },
        paramed = this.utilities.common.param(options.data),
        appendSpy = this.stub(this.utilities.url, 'appendQueryParams').returns('a different url');

    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url, options);
    ok(appendSpy.calledWith(url, paramed), 'query params should be appended');
});

test('request() should send raw data as the body if the request method is not GET and data is supplied as a string', function () {
    var url = 'some url',
        options = {
            method: 'POST',
            data: 'some data'
        },
        sendSpy = this.spy(this.xhr, 'send');

    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url, options);
    ok(sendSpy.calledWith(options.data), 'raw data should be sent');
});

test('request() should send urlencoded data as the body if the request method is not GET and data is supplied as a non-string', function () {
    var url = 'some url',
        options = {
            method: 'POST',
            data: { wow: 'such data' }
        },
        paramed = this.utilities.common.param(options.data),
        sendSpy = this.spy(this.xhr, 'send');


    this.stub(this.utilities.url, 'isCrossDomain').returns(false);
    this.stub(this.utilities.support, 'isXHRSupported').returns(true);
    this.util.request(url, options);
    ok(sendSpy.calledWith(paramed), 'urlencoded data should be sent');
});
