var CSS_CLASS_TEXT_DISABLED  = 'crocodoc-text-disabled',
    CSS_CLASS_LINKS_DISABLED = 'crocodoc-links-disabled';

module('Framework - Crocodoc.Viewer', {
    setup: function () {
        var self = this;

        this.metadata = {
            numPages: 1,
            dimensions: {
                width: 100,
                height: 100
            }
        };

        this.components = {
            'viewer-base': {
                init: function () {},
                setLayout: function () {},
                loadAssets: function () {}
            },
            'layout': {
                setZoom: function () {},
                scrollTo: function () {},
                scrollBy: function () {},
                updatePageStates: function () {},
                focus: function () {}
            }
        };

        this.utilities = {
            common: {
                extend: $.extend
            },
            url: {
                makeAbsolute: function () {}
            }
        };

        this.scope = Crocodoc.getScopeForTest(this);
        this.$el = $('<div style="height:100%">').appendTo('body');
    },
    teardown: function () {
        this.$el.remove();
    }
});

test('constructor should create a scope instance when called', function () {
    this.mock(Crocodoc)
        .expects('Scope')
        .returns(this.scope);
    new Crocodoc.Viewer(this.$el, {});
});

test('constructor should create a viewer-base component instance on the scope it created when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var spy = this.spy(this.scope, 'createComponent');
    new Crocodoc.Viewer(this.$el, {});
    ok(spy.calledWith('viewer-base'));
});

test('constructor should initialize the viewer-base component instance properly when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    this.mock(this.components['viewer-base'])
        .expects('init');
    new Crocodoc.Viewer(this.$el, {});
});

test('constructor should throw an error when the container element is invalid', function () {
    var self = this;
    throws(function () {
        new Crocodoc.Viewer($(), {});
    }, 'init threw when element was invalid');
});

test('load() should load assets when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', { url: 'someurl' });

    this.mock(this.components['viewer-base'])
        .expects('loadAssets');

    viewer.load();
});

test('destroy() should broadcast a destroy message when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('destroy');

    viewer.destroy();
});

test('destroy() should destroy the scope when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    this.mock(this.scope)
        .expects('destroy');

    viewer.destroy();
});

test('setLayout() should set the specified layout when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    var layout = Crocodoc.LAYOUT_VERTICAL;
    this.mock(this.components['viewer-base'])
        .expects('setLayout')
        .withArgs(layout);

    viewer.setLayout(layout);
});

test('zoom() should set the specified zoom when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    var layout = this.components['layout'];
    this.stub(this.components['viewer-base'], 'setLayout').returns(layout);
    viewer.setLayout();

    var zoom = 'auto';
    this.mock(layout)
        .expects('setZoom')
        .withArgs(zoom);
    viewer.zoom(zoom);
});

test('scrollTo() should scroll to the specified page when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    var layout = this.components['layout'];
    this.stub(this.components['viewer-base'], 'setLayout').returns(layout);
    viewer.setLayout();

    var page = 'prev';
    this.mock(layout)
        .expects('scrollTo')
        .withArgs(page);
    viewer.scrollTo(page);
});

test('scrollBy() should scroll by the specified amount when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    var layout = this.components['layout'];
    this.stub(this.components['viewer-base'], 'setLayout').returns(layout);
    viewer.setLayout();

    var x = 100, y = 200;
    this.mock(layout)
        .expects('scrollBy')
        .withArgs(x, y);
    viewer.scrollBy(x, y);
});

test('focus() should focus the viewport when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer('body', {});

    var layout = this.components['layout'];
    this.stub(this.components['viewer-base'], 'setLayout').returns(layout);
    viewer.setLayout();

    this.mock(layout)
        .expects('focus');
    viewer.focus();
});

test('enableTextSelection() should enable text selection when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer(this.$el, {
        enableTextSelection: false
    });
    var broadcastSpy = this.spy(this.scope, 'broadcast');

    viewer.enableTextSelection();

    ok(broadcastSpy.calledWith('textenabledchange', sinon.match({ enabled: true })), 'message was broadcast');
    //also check that the css class is correct
    ok(!this.$el.hasClass(CSS_CLASS_TEXT_DISABLED), 'css class is correct');
});

test('disableTextSelection() should disable text selection when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer(this.$el, {
        enableTextSelection: true
    });
    var broadcastSpy = this.spy(this.scope, 'broadcast');

    viewer.disableTextSelection();

    ok(broadcastSpy.calledWith('textenabledchange', sinon.match({ enabled: false })), 'message was broadcast');
    //also check that the css class is correct
    ok(this.$el.hasClass(CSS_CLASS_TEXT_DISABLED), 'css class is correct');
});

test('enableLinks() should enable links when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer(this.$el, {
        enableLinks: false
    });

    viewer.enableLinks();

    //also check that the css class is correct
    ok(!this.$el.hasClass(CSS_CLASS_LINKS_DISABLED), 'css class is correct');
});

test('disableLinks() should disable links when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer(this.$el, {
        enableLinks: true
    });

    viewer.disableLinks();

    //also check that the css class is correct
    ok(this.$el.hasClass(CSS_CLASS_LINKS_DISABLED), 'css class is correct');
});

test('updateLayout() should force a layout update when called', function () {
    this.stub(Crocodoc, 'Scope').returns(this.scope);
    var viewer = new Crocodoc.Viewer(this.$el, {});

    var layout = this.components['layout'];
    this.stub(this.components['viewer-base'], 'setLayout').returns(layout);
    viewer.setLayout();

    var mock = this.mock(layout);

    mock.expects('updatePageStates')
        .withArgs(true); // force update paddings
    mock.expects('setZoom');

    viewer.updateLayout();
});
