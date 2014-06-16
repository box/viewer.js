module('Component - page-svg', {
    setup: function () {
        var self = this;
        this.svgText = '<svg></svg>';
        this.utilities = {
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
        this.$el = $('<div>').appendTo(document.documentElement);
    },
    teardown: function () {
        this.$el.remove();
    }
});

test('destroy() should unload the svg and empty the element when called', function () {
    this.mock(this.component)
        .expects('unload');

    this.component.init(this.$el, 1);
    this.component.destroy();
    ok(this.$el.html() === '', 'the element has been emptied');
});

test('preload() should create and insert the SVG object into the container element and make a data provider request when called', function () {
    var pageNum = 3,
        initalHTML = this.$el.html();

    this.mock(this.scope)
        .expects('get')
        .withArgs('page-svg', pageNum);

    this.component.init(this.$el, pageNum);
    this.component.preload();
    ok(this.$el.html() !== initalHTML, 'the element has been inserted');
});

test('load() should embed the SVG when the load succeeds', function () {
    var pageNum = 3,
        $deferred = $.Deferred().resolve(this.svgText);

    this.mock(this.scope)
        .expects('get')
        .withArgs('page-svg', pageNum)
        .returns($deferred.promise({ abort: function () {} }));

    this.component.init(this.$el, pageNum);
    this.component.load();
    ok(this.$el.find('iframe').length > 0, 'the SVG has been embedded');
});

test('load() should broadcast an asseterror when the load fails', function () {
    var pageNum = 3,
        error = { error: 'fail' },
        $deferred = $.Deferred().reject(error),
        mock = this.mock(this.scope);

    mock.expects('get')
        .withArgs('page-svg', pageNum)
        .returns($deferred.promise({ abort: function () {} }));

    mock.expects('broadcast')
        .withArgs('asseterror', error);

    this.component.init(this.$el, pageNum);
    this.component.load();
});

test('unload() should abort the request if there is one when called', function () {
    var pageNum = 3,
        $deferred = $.Deferred();

    var spy = this.spy();

    this.stub(this.scope, 'get')
        .withArgs('page-svg', pageNum)
        .returns($deferred.promise({ abort: spy }));

    this.component.init(this.$el, pageNum);
    this.component.load();
    this.component.unload();

    ok(spy.called, 'request should be aborted');
});
