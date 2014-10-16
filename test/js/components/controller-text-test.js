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
        this.config.$viewport = $('<div>');

        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('controller-text', this.scope);
    }
});

test('init() should request the text file and setting it as $doc', function () {
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('page-text').returns($.Deferred().resolve('<table class="crocodoc-text"></table>').promise());

    this.component.init();

    ok(stub.called, 'requested page text');
    equal(this.config.$viewport.find('.crocodoc-text').length, 1, 'inserted page text into viewport');
});
