module('Component - layout-vertical', {
    setup: function () {
        this.utilities = {
            common: Crocodoc.getUtility('common'),
            browser: {
                mobile: false
            }
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.mixins = {
            'layout-base': {
                calculateZoomValue: function () {},
                init: function () {},
                handleResize: function () {},
                handleScroll: function () {},
                updateCurrentPage: function () {},
                extend: function (obj) {
                    return Crocodoc.getUtility('common').extend({}, this, obj);
                }
            }
        };
        this.config = {

        };

        this.component = Crocodoc.getComponentForTest('layout-vertical', this.scope, this.mixins);
    }
});

QUnit.cases([
    { fitWidth: 1.1, fitHeight: 2, widestWidth: 100, tallestHeight: 50, mobile: false, value: 1 },
    { fitWidth: 0.8, fitHeight: 2, widestWidth: 100, tallestHeight: 50, mobile: false, value: 0.8 },
    { fitWidth: 1.8, fitHeight: 0.8, widestWidth: 100, tallestHeight: 50, mobile: false, value: 0.8 },
    { fitWidth: 1.8, fitHeight: 1.8, widestWidth: 100, tallestHeight: 50, mobile: false, value: 1 },
    { fitWidth: 0.9, fitHeight: 0.8, widestWidth: 100, tallestHeight: 150, mobile: false, value: 0.9 },
    { fitWidth: 1.9, fitHeight: 0.8, widestWidth: 100, tallestHeight: 150, mobile: true, value: 1.9 },
]).test('calculateZoomAutoValue() should return the correct zoom auto value when called', function (params) {
    var stub = this.stub(this.component, 'calculateZoomValue');
    stub.withArgs(Crocodoc.ZOOM_FIT_WIDTH).returns(params.fitWidth);
    stub.withArgs(Crocodoc.ZOOM_FIT_HEIGHT).returns(params.fitHeight);

    this.utilities.browser.mobile = params.mobile;
    this.component.state = {
        widestPage: {
            actualWidth: params.widestWidth
        },
        tallestPage: {
            actualHeight: params.tallestHeight
        }
    };
    equal(this.component.calculateZoomAutoValue(), params.value, 'value is correct');
});

test('handleResize() should update the current page when called', function () {
    this.mock(this.component)
        .expects('updateCurrentPage');
    this.component.handleResize();
});

test('handleScroll() should update the current page when called', function () {
    this.mock(this.component)
        .expects('updateCurrentPage');
    this.component.handleScroll();
});
