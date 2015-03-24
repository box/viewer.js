module('Component - controller-text', {
    setup: function () {
        var self = this;

        this.metadata = {
            type: 'text'
        };

        this.components = {
        };

        this.utilities = {
        };

        this.config = $.extend(true, {}, Crocodoc.Viewer.defaults);
        this.config.$el = $('<div>');
        this.config.$viewport = $('<div>').appendTo(this.config.$el);
        this.config.$doc = $('<div>').appendTo(this.config.$viewport);

        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('controller-text', this.scope);
    }
});

test('init() should request the text file and setting it as $doc', function () {
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('page-text').returns($.Deferred().resolve('<table class="crocodoc-text"></table>').promise());

    this.component.init();

    ok(stub.called, 'requested page text');
    equal(this.config.$el.find('.crocodoc-text').length, 1, 'inserted page text into viewport');
});


test('init() should work with useWindowAsViewport', function () {
    this.config.$viewport = $(window);
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('page-text').returns($.Deferred().resolve('<table class="crocodoc-text"></table>').promise());

    this.component.init();

    ok(stub.called, 'requested page text');
    equal(this.config.$el.find('.crocodoc-text').length, 1, 'inserted page text into viewport');
});
