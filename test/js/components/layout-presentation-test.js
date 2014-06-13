module('Component - layout-presentation', {
    setup: function () {
        this.utilities = {
            common: Crocodoc.getUtility('common'),
            browser: {
                mobile: false
            }
        };
        this.config = {};
        this.scope = Crocodoc.getScopeForTest(this);
        this.mixins = {
            'layout-base': {
                calculateZoomValue: function () {},
                init: function () {},
                updateCurrentPage: function () {},
                updatePageMargins: function () {},
                updatePageClasses: function () {},
                extend: function (obj) {
                    return Crocodoc.getUtility('common').extend({}, this, obj);
                }
            }
        };

        this.component = Crocodoc.getComponentForTest('layout-presentation', this.scope, this.mixins);
    }
});

test('init() should update page margins and classes and init a base layout when called', function () {
    var initSpy = this.spy(this.mixins['layout-base'], 'init');
    var mock = this.mock(this.component);
    mock.expects('updatePageMargins');
    mock.expects('updatePageClasses');
    this.component.init();
    ok(initSpy.calledOn(this.component), 'init was called with the proper config on the proper context');
});

QUnit.cases([
    { fitWidth: 1.1, fitHeight: 2,  value: 1.1 },
    { fitWidth: 2.8, fitHeight: 1.2, value: 1.2 }
]).test('calculateZoomAutoValue() should return the correct zoom auto value when called', function (params) {
    var stub = this.stub(this.component, 'calculateZoomValue');
    stub.withArgs(Crocodoc.ZOOM_FIT_WIDTH).returns(params.fitWidth);
    stub.withArgs(Crocodoc.ZOOM_FIT_HEIGHT).returns(params.fitHeight);
    equal(this.component.calculateZoomAutoValue(), params.value, 'value is correct');
});

test('calculatePreviousPage() should return the correct page number when called', function () {
    var page = 8;
    this.component.state = { currentPage: page };
    equal(this.component.calculatePreviousPage(), page - 1, 'the page was correct');
});

test('calculateNextPage() should return the correct page number when called', function () {
    var page = 8;
    this.component.state = { currentPage: page };
    equal(this.component.calculateNextPage(), page + 1, 'the page was correct');
});
