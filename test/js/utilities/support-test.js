
module('Utility - support', {
    setup: function () {
        this.fakeXHR = {};
        this.util = Crocodoc.getUtilityForTest('support');
    }
});

test('isXHRSupported() should return true if XHR is supported', function() {
    this.stub(this.util, 'getXHR').returns(this.fakeXHR);
    ok(this.util.isXHRSupported(), 'XHR should be supported');
});

test('isXHRSupported() should return false if XHR is not supported', function() {
    this.stub(this.util, 'getXHR').returns(null);
    ok(!this.util.isXHRSupported(), 'XHR should be supported');
});

test('isCORSSupported() should return true if CORS is supported', function() {
    this.fakeXHR.withCredentials = true;
    this.stub(this.util, 'getXHR').returns(this.fakeXHR);
    ok(this.util.isCORSSupported(), 'CORS should be supported');
});

test('isCORSSupported() should return false if CORS is not supported', function() {
    this.stub(this.util, 'getXHR').returns(this.fakeXHR);
    ok(!this.util.isCORSSupported(), 'CORS should not be supported');
});
