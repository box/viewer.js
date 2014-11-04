module('Component - layout-presentation', {
    setup: function () {
        this.utilities = {
            dom: Crocodoc.getUtilityForTest('dom'),
            common: Crocodoc.getUtilityForTest('common'),
            browser: {
                mobile: false
            }
        };
        this.config = {};
        this.scope = Crocodoc.getScopeForTest(this);
        this.mixins = {
            'layout-paged': {
                calculateZoomValue: function () {},
                init: function () {},
                updateCurrentPage: function () {},
                updatePageMargins: function () {},
                updatePageClasses: function () {},
                updateVisiblePages: function () {},
                setCurrentPage: function () {},
                extend: function (obj) {
                    return Crocodoc.getUtility('common').extend({}, this, obj);
                }
            }
        };

        this.component = Crocodoc.getComponentForTest('layout-presentation', this.scope, this.mixins);
    }
});

test('init() should update page margins and classes and init a base layout when called', function () {
    var initSpy = this.spy(this.mixins['layout-paged'], 'init');
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

QUnit.cases([
    { page: 1, expectedCurrent: 1 },
    { currentPage: 1, page: 1, expectedCurrent: 1 },
    { currentPage: 1, page: 2, expectedCurrent: 2, expectedPreceding: 1 },
    { precedingPage: 1, currentPage: 2, page: 1, expectedCurrent: 1, expectedPreceding: 2 }
]).test('setCurrentPage() should update the preceding and current page classes correctly when called', function (params) {
    this.stub(this.component, 'updateVisiblePages');
    this.stub(this.component, 'updatePageClasses');

    var dom = this.utilities.dom;

    var docEl = dom.create('div'),
        pageEl = dom.create('div');

    dom.addClass(docEl, 'crocodoc-doc');
    dom.addClass(pageEl, 'crocodoc-page');

    dom.appendTo(docEl, dom.clone(pageEl));
    dom.appendTo(docEl, dom.clone(pageEl));
    dom.appendTo(docEl, dom.clone(pageEl));

    var pageEls = dom.findAll('.crocodoc-page', docEl);

    if (params.currentPage) {
        dom.addClass(pageEls[params.currentPage - 1], 'crocodoc-current-page');
    }
    if (params.precedingPage) {
        dom.addClass(pageEls[params.precedingPage - 1], 'crocodoc-preceding-page');
    }

    this.component.state = { currentPage: params.currentPage };
    this.component.docEl = docEl;
    this.component.pageEls = pageEls;

    this.component.setCurrentPage(params.page);

    if (params.expectedCurrent) {
        ok(dom.hasClass(pageEls[params.expectedCurrent - 1], 'crocodoc-current-page'), 'should have current page class');
    }
    if (params.expectedPreceding) {
        ok(dom.hasClass(pageEls[params.expectedPreceding - 1], 'crocodoc-preceding-page'), 'should have preceding page class');
        equal(dom.findAll('.crocodoc-preceding-page', docEl).length, 1, 'should only be one preceding page');
    } else {
        equal(dom.findAll('.crocodoc-preceding-page', docEl).length, 0, 'should not be a preceding page');
    }
    equal(dom.findAll('.crocodoc-current-page', docEl).length, 1, 'should only be one current page');
});
