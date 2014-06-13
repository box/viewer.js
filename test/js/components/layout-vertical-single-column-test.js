module('Component - layout-vertical-single-column', {
    setup: function () {
        this.utilities = {
            common: Crocodoc.getUtility('common')
        };
        this.config = {
            layout: Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.mixins = {
            'layout-vertical': {
                init: function () {},
                extend: function (obj) {
                    return Crocodoc.getUtility('common').extend({}, this, obj);
                }
            }
        };

        this.component = Crocodoc.getComponentForTest('layout-vertical-single-column', this.scope, this.mixins);
    }
});

test('init() should initialize a vertical layout when called', function () {
    var initSpy = this.spy(this.mixins['layout-vertical'], 'init');
    this.component.init();
    ok(initSpy.calledOn(this.component), 'init was called on the proper context');
});
