module('Component - layout-vertical-single-column', {
    setup: function () {
        this.utilities = {
            common: Crocodoc.getUtility('common')
        };
        this.config = {
            layout: 'not correct'
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.mixins = {
            'layout-vertical': {
                init: function () {}
            }
        };

        this.component = Crocodoc.getComponentForTest('layout-vertical-single-column', this.scope, this.mixins);
    }
});

test('init() should set the proper layout in config and initialize a vertical layout when called', function () {
    var initSpy = this.spy(this.mixins['layout-vertical'], 'init');
    this.component.init();
    equal(this.config.layout, 'vertical-single-column', 'the config has been set');
    ok(initSpy.calledOn(this.component), 'init was called with the proper config on the proper context');
});
