module('Data Provider: page-img', {
    setup: function () {
        var me = this;
        this.$deferred = $.Deferred();
        this.promise = {
            abort: function () {},
            then: function () { return me.$deferred.promise(); },
            promise: function (x) { return me.$deferred.promise(x); }
        };
        this.utilities = {
            ajax: {
                fetch: function () {}
            },
            common: {
                template: sinon.stub().returns(''),
                countInStr: sinon.stub().returns(10000)
            },
            browser: {},
            subpx: {
                isSubpxSupported: function () {}
            }
        };
        this.config = {
            url: '',
            template: {
                img: 'page-{{page}}.png'
            },
            queryString: ''
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.dataProvider = Crocodoc.getComponentForTest('data-provider-page-img', this.scope);
    },
    teardown: function () {
        this.scope.destroy();
    }
});

test('creator should return an object with a get function', function(){
    equal(typeof this.dataProvider, 'object');
    equal(typeof this.dataProvider.get, 'function');
});

test('getImage() should return a new Image object when called', function() {
    var img = this.dataProvider.getImage();
    ok(img instanceof Image, 'should return a new image');
});

test('get() should return a $.Promise with an abort() function', function() {
    var img = {
        setAttribute: this.spy()
    };
    this.stub(this.dataProvider, 'getImage').returns(img);
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    propEqual(this.dataProvider.get('page-img', 1), $.Deferred().promise({abort:function(){}}));
});

test('abort() should abort the image load when called on the returned promise', function() {
    var img = {
        setAttribute: function () {},
        removeAttribute: this.spy()
    };
    this.stub(this.dataProvider, 'getImage').returns(img);

    var promise = this.dataProvider.get('page-img', 2);
    promise.abort();
    ok(img.removeAttribute.calledWith('src'), 'image load should be aborted');
});

test('getURL() should return the correct URL to the png file when called', function() {
    this.utilities.common.template = Crocodoc.getUtility('common').template;
    this.config.url = 'http://beep.boop/bop/';
    equal(this.dataProvider.getURL(3), this.config.url + 'page-3.png', 'the URL should be correct');
});

test('get() should return a promise that is resolved with the img object when the image successfully loads', function () {
    var img = {
        setAttribute: this.spy()
    };
    this.stub(this.dataProvider, 'getImage').returns(img);

    var promise = this.dataProvider.get('page-img', 2);

    img.onload();
    promise.done(function (i) {
        equal(i, img, 'img object should be resolved');
    });
});

test('get() should retry Crocodoc.ASSET_REQUEST_RETRIES times when the image fails to load', function () {
    var url = 'someurl.png';
    var img = {
        setAttribute: function () {},
        removeAttribute: function () {}
    };
    this.stub(this.dataProvider, 'getURL').returns(url);
    this.stub(this.dataProvider, 'getImage').returns(img);

    var loadSpy = this.spy(img, 'setAttribute').withArgs('src', url);
    var abortSpy = this.spy(img, 'removeAttribute').withArgs('src');

    var promise = this.dataProvider.get('page-img', 2);

    for (var i = 0; i < Crocodoc.ASSET_REQUEST_RETRIES; ++i) {
        img.onerror();
    }
    equal(abortSpy.callCount, Crocodoc.ASSET_REQUEST_RETRIES, 'should be retried the correct number of times');
    equal(loadSpy.callCount, Crocodoc.ASSET_REQUEST_RETRIES + 1, 'should be loaded the correct number of times');
});

test('get() should return a promise that is rejected with the error object when the image fails to load', function () {
    var img = {
        setAttribute: function () {},
        removeAttribute: function () {}
    };
    this.stub(this.dataProvider, 'getImage').returns(img);

    var promise = this.dataProvider.get('page-img', 2);

    img.onerror();
    img.onerror();
    promise.fail(function (err) {
        ok(err, 'error object should be rejected');
    });
});
