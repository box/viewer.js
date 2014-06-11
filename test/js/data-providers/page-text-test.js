module('Data Provider: page-text', {
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
                countInStr: function () { return 0; }
            }
        };
        this.config = {
            url: '',
            template: {
                html: 'text-{{page}}.html'
            },
            queryString: ''
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.dataProvider = Crocodoc.getComponentForTest('data-provider-page-text', this.scope);
    },
    teardown: function () {
        this.scope.destroy();
    }
});

test('creator should return an object with a get function', function(){
    equal(typeof this.dataProvider, 'object');
    equal(typeof this.dataProvider.get, 'function');
});

test('get() should return a $.Promise with an abort() function', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    propEqual(this.dataProvider.get('page-text', 1), $.Deferred().promise({abort:function(){}}));
});

test('abort() should call abort on the promise returned from ajax.fetch when called on the returned promise', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    this.mock(this.promise).expects('abort').once();

    var promise = this.dataProvider.get('page-text', 2);
    promise.abort();
});

test('getURL() should return the correct URL to the svg file when called', function() {
    this.utilities.common.template = Crocodoc.getUtility('common').template;
    this.config.url = 'http://beep.boop/bop/';
    equal(this.dataProvider.getURL(3), this.config.url + 'text-3.html', 'the URL should be correct');
});

test('get() should return a promise that resolves the correct html text when called', function () {
    var htmlText = '<html></html>';

    this.stub(this.utilities.ajax, 'fetch').returns(this.$deferred.promise());

    this.$deferred.resolve(htmlText);

    var promise = this.dataProvider.get('page-text', 5);
    promise.done(function (text) {
        equal(text, htmlText, 'text should be correct');
    });
});

test('get() should result in an empty string when there are too many text boxes', function () {
    var htmlText = '<html></html>';

    this.stub(this.utilities.common, 'countInStr').returns(1000);
    this.stub(this.utilities.ajax, 'fetch').returns(this.$deferred.promise());

    this.$deferred.resolve(htmlText);

    var promise = this.dataProvider.get('page-text', 5);
    promise.done(function (text) {
        equal(text, '', 'text should be empty');
    });
});
