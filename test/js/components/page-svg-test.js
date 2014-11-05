module('Component - page-svg', {
    setup: function () {
        var self = this,
            dom = Crocodoc.getUtilityForTest('dom');
        this.svgText = '<svg></svg>';
        this.utilities = {
            dom: dom,
            common: {
                isFn: function () {},
                ajax: function () {}
            },
            ajax: {
                request: function () {}
            }
        };
        this.config =  {
            embedStrategy: 1 //EMBED_STRATEGY_IFRAME_INNERHTML
        };
        this.scope = Crocodoc.getScopeForTest(this);

        this.component = Crocodoc.getComponentForTest('page-svg', this.scope);
        this.el = dom.create('div');
        dom.appendTo(document.documentElement, this.el);
        this.promise = Crocodoc.getUtilityForTest('promise');
    },
    teardown: function () {
        this.utilities.dom.remove(this.el);
    }
});

test('destroy() should unload the svg and empty the element when called', function () {
    this.mock(this.component)
        .expects('unload');

    this.component.init(this.el, 1);
    this.component.destroy();
    ok(this.el.innerHTML === '', 'the element has been emptied');
});

test('preload() should create and insert the SVG object into the container element and make a data provider request when called', function () {
    var pageNum = 3,
        initalHTML = this.el.innerHTML;

    this.mock(this.scope)
        .expects('get')
        .withArgs('page-svg', pageNum);

    this.component.init(this.el, pageNum);
    this.component.preload();
    ok(this.el.innerHTML !== initalHTML, 'the element has been inserted');
});

test('load() should embed the SVG when the load succeeds', function () {
    var pageNum = 3,
        deferred = this.promise.deferred();

    this.mock(this.scope)
        .expects('get')
        .withArgs('page-svg', pageNum)
        .returns(deferred.resolve(this.svgText).promise({ abort: function () {} }));

    this.component.init(this.el, pageNum);
    this.component.load();
    ok(this.utilities.dom.find('iframe', this.el), 'the SVG has been embedded');
});

test('load() should broadcast an asseterror when the load fails', function () {
    var pageNum = 3,
        error = { error: 'fail' },
        deferred = this.promise.deferred(),
        mock = this.mock(this.scope);

    mock.expects('get')
        .withArgs('page-svg', pageNum)
        .returns(deferred.reject(error).promise({ abort: function () {} }));

    mock.expects('broadcast')
        .withArgs('asseterror', error);

    this.component.init(this.el, pageNum);
    this.component.load();
});

test('unload() should abort the request if there is one when called', function () {
    var pageNum = 3,
        deferred = this.promise.deferred();

    var spy = this.spy();

    this.stub(this.scope, 'get')
        .withArgs('page-svg', pageNum)
        .returns(deferred.promise({ abort: spy }));

    this.component.init(this.el, pageNum);
    this.component.load();
    this.component.unload();

    ok(spy.called, 'request should be aborted');
});
