module('Data Provider: page-svg', {
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
                svg: 'page-{{page}}.svg'
            },
            queryString: '',
            cssText: ''
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.dataProvider = Crocodoc.getComponentForTest('data-provider-page-svg', this.scope);
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
    propEqual(this.dataProvider.get('page-svg', 1), $.Deferred().promise({abort:function(){}}));
});

test('get() should return a cached promise when called a second time', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    equal(this.dataProvider.get('page-svg', 1), this.dataProvider.get('page-svg', 1));
});

test('abort() should call abort on the promise returned from ajax.fetch when called on the returned promise', function() {
    this.stub(this.utilities.ajax, 'fetch').returns(this.promise);
    this.mock(this.promise).expects('abort').once();

    var promise = this.dataProvider.get('page-svg', 2);
    promise.abort();
});

test('getURL() should return the correct URL to the svg file when called', function() {
    this.utilities.common.template = Crocodoc.getUtility('common').template;
    this.config.url = 'http://beep.boop/bop/';
    equal(this.dataProvider.getURL(3), this.config.url + 'page-3.svg', 'the URL should be correct');
});

test('get() should apply the subpx hack if the browser is firefox and subpixel rendering is not supported', function () {
    var svgText = '<svg>\n<xhtml:link href="stylesheet.css" type="text/css" rel="stylesheet" />\n</svg>';

    this.stub(this.scope, 'get').withArgs('stylesheet').returns(this.$deferred.promise());
    this.stub(this.utilities.ajax, 'fetch').returns(this.$deferred.promise());

    this.utilities.browser.firefox = true;
    this.stub(this.utilities.subpx, 'isSubpxSupported').returns(false);

    this.$deferred.resolve(svgText);

    var promise = this.dataProvider.get('page-svg', 3);
    promise.done(function (text) {
        ok(text.indexOf('<style>text { text-rendering: geometricPrecision; }</style>') > -1, 'should have subpx hack');
    });
});

test('get() should replace the link tag with the stylesheet correctly for a self-closing tag', function () {
    var svgText = '<svg><xhtml:link href="stylesheet.css" type="text/css" rel="stylesheet" /></svg>',
        cssText = '.this-is-css { color: red; }';

    this.stub(this.scope, 'get').withArgs('stylesheet').returns($.Deferred().resolve(cssText).promise());
    this.stub(this.utilities.ajax, 'fetch').returns(this.$deferred.promise());

    this.$deferred.resolve(svgText);

    var promise = this.dataProvider.get('page-svg', 3);
    promise.done(function (text) {
        ok(text.indexOf('<style>' + cssText + '</style>') > -1, 'should have cssText');
    });
});

test('get() should replace the link tag with the stylesheet correctly for a non-self-closing tag', function () {
    var svgText = '<svg><xhtml:link href="stylesheet.css" type="text/css" rel="stylesheet"></xhtml:link></svg>',
        cssText = '.this-is-css { color: red; }';

    this.stub(this.scope, 'get').withArgs('stylesheet').returns($.Deferred().resolve(cssText).promise());
    this.stub(this.utilities.ajax, 'fetch').returns(this.$deferred.promise());

    this.$deferred.resolve(svgText);

    var promise = this.dataProvider.get('page-svg', 3);
    promise.done(function (text) {
        ok(text.indexOf('<style>' + cssText + '</style>') > -1, 'should have cssText');
    });
});
