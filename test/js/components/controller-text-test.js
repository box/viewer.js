module('Component - controller-text', {
    setup: function () {
        var self = this;

        this.metadata = {
            type: 'text'
        };

        this.components = {
        };

        this.utilities = {
            dom: Crocodoc.getUtilityForTest('dom')
        };

        this.config = $.extend(true, {}, Crocodoc.Viewer.defaults);
        this.config.viewportEl = this.utilities.dom.create('div');

        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('controller-text', this.scope);
    }
});

test('init() should request the text file and setting it as docEl', function () {
    var stub = this.stub(this.scope, 'get');
    var promise = Crocodoc.getUtilityForTest('promise');
    stub.withArgs('page-text').returns(promise.deferred().resolve('<table class="crocodoc-text"></table>').promise());

    this.component.init();

    ok(stub.called, 'requested page text');
    ok(this.utilities.dom.find('.crocodoc-text', this.config.viewportEl), 'inserted page text into viewport');
});
