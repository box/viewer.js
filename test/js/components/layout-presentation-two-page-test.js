module('Component - layout-presentation-two-page', {
    setup: function () {
        this.utilities = {
            common: Crocodoc.getUtility('common')
        };
        this.config = {
            layout: 'not correct'
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.mixins = {
            'layout-presentation': {
                init: function () {},
                calculatePreviousPage: function () {},
                calculateNextPage: function () {}
            }
        };

        this.component = Crocodoc.getComponentForTest('layout-presentation-two-page', this.scope, this.mixins);
    }
});

test('init() should set the proper layout in config and initialize a presentation layout when called', function () {
    var initSpy = this.spy(this.mixins['layout-presentation'], 'init');
    this.component.init();
    equal(this.config.layout, 'presentation-two-page', 'the config has been set');
    ok(initSpy.calledOn(this.component), 'init was called with the proper config on the proper context');
});

test('calculatePreviousPage() should return the correct page number when called', function () {
    var page = 8;
    this.component.state = { currentPage: page };
    equal(this.component.calculatePreviousPage(), page - 2, 'the page was correct');
});

test('calculateNextPage() should return the correct page number when called', function () {
    var page = 8;
    this.component.state = { currentPage: page };
    equal(this.component.calculateNextPage(), page + 2, 'the page was correct');
});
