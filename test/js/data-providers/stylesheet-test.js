module('Data Provider: stylesheet', {
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
            browser: {}
        };
        this.config = {
            id: 'VIEWER-ID',
            url: '',
            template: {
                css: 'stylesheet.css'
            },
            queryString: ''
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.dataProvider = Crocodoc.getComponentForTest('data-provider-stylesheet', this.scope);
    },
    teardown: function () {
        this.scope.destroy();
        this.dataProvider.destroy();
    }
});

test('creator should return an object with a get function', function(){
    equal(typeof this.dataProvider, 'object');
    equal(typeof this.dataProvider.get, 'function');
});

test('get() should return a $.Promise with an abort() function', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    propEqual(this.dataProvider.get(), $.Deferred().promise({abort:function(){}}));
});

test('get() should return a cached promise when called a second time', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    equal(this.dataProvider.get(), this.dataProvider.get());
});

test('abort() should call abort on the promise returned from ajax.fetch when called on the returned promise', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    this.mock(this.promise).expects('abort').once();

    var promise = this.dataProvider.get();
    promise.abort();
});

test('getURL() should return the correct URL to the css file when called', function() {
    this.config.url = 'http://beep.boop/bop/';
    equal(this.dataProvider.getURL(), this.config.url + this.config.template.css, 'the URL should be correct');
});

test('get() should apply the IE font hack to the css when called in IE', function () {
    var css = '.crocodoc { font-family: crocodoc-font-blah; }';
    this.utilities.browser.ie = true;

    this.stub(this.utilities.ajax, 'fetch').returns(this.$deferred.promise());
    this.$deferred.resolve(css);

    var promise = this.dataProvider.get();
    var self = this;
    promise.done(function (css) {
        ok(css.indexOf(self.config.id) > -1, 'IE font hack should be applied');
    });
});
