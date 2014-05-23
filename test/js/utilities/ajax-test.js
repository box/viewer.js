
module('Utility - ajax', {
    setup: function () {
        this.util = Crocodoc.getUtility('ajax');
    }
});

// @TODO: test ajax.request

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
