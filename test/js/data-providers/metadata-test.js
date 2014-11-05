module('Data Provider: metadata', {
    setup: function () {
        var me = this;
        this.promise = Crocodoc.getUtilityForTest('promise');
        this.deferred = this.promise.deferred();
        this.fakePromise = {
            abort: function () {},
            then: function () { return me.deferred.promise(); },
            promise: function (x) { return me.deferred.promise(x); }
        };
        this.utilities = {
            ajax: {
                fetch: function () {}
            },
            common: {
                parseJSON: Crocodoc.getUtilityForTest('common').parseJSON
            }
        };
        this.config = {
            url: '',
            template: {
                json: 'info.json'
            },
            queryString: ''
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.dataProvider = Crocodoc.getComponentForTest('data-provider-metadata', this.scope);
    },
    teardown: function () {
        this.scope.destroy();
    }
});

test('creator should return an object with a get function', function(){
    equal(typeof this.dataProvider, 'object');
    equal(typeof this.dataProvider.get, 'function');
});

test('get() should return a promise with an abort() function', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.fakePromise);
    propEqual(this.dataProvider.get(), this.promise.deferred().promise({abort:function(){}}));
});

test('abort() should call abort on the promise returned from ajax.fetch when called on the returned promise', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.fakePromise);
    this.mock(this.fakePromise).expects('abort').once();

    var promise = this.dataProvider.get();
    promise.abort();
});

test('getURL() should return the correct URL to the json file when called', function() {
    this.config.url = 'http://beep.boop/bop/';
    equal(this.dataProvider.getURL(), this.config.url + this.config.template.json, 'the URL should be correct');
});

test('get() should parse the JSON response when called', function () {
    var json = '{ "numpages": 10, "dimensions": { "width": 100, "height": 100 } }';

    this.stub(this.utilities.ajax, 'fetch').returns(this.deferred.promise());

    this.deferred.resolve(json);

    var promise = this.dataProvider.get();
    promise.done(function (data) {
        equal(typeof data, 'object', 'data should be an object');
    });
});
