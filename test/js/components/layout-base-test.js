module('Component - layout-base', {
    setup: function () {
        var self = this;
        this.utilities = {
            common: Crocodoc.getUtility('common'),
            support: { csstransform: true }
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.config = {
            $el: $(),
            $viewport: $('<div>'),
            $doc: $(),
            $pagesWrapper: $('<div>'),
            $pages: $(),
            page: 1,
            currentPage: 1,
            numPages: 5,
            pageScale: 1,
            minZoom: 0.01,
            maxZoom: 5,
            stylesheet: {},
            namespace: 'crocodoc-namespace-123456'
        };

        for (var i = 0; i < 10; i++) {
            this.config.$pagesWrapper.append('<div class="crocodoc-page"></div>');
        }
        this.config.$pages = this.config.$pagesWrapper.find('.crocodoc-page');
        this.component = Crocodoc.getComponentForTest('layout-base', this.scope);
    }
});

QUnit.cases([
    { name: 'resize', data: {}, method: 'handleResize' },
    { name: 'scroll', data: {}, method: 'handleScroll' },
    { name: 'scrollend', data: {}, method: 'handleScrollEnd' },
]).test('onmessage() should call the correct handler with the passed data when called', function (params) {
    this.mock(this.component)
        .expects(params.method)
        .withArgs(params.data);
    this.component.onmessage(params.name, params.data);
});

test('init() should initialize state, page states, and zoom range when called', function () {
    var mock = this.mock(this.component);
    mock.expects('initState');
    mock.expects('updatePageStates');
    mock.expects('initZoomLevels');
    this.component.init(this.config);
});

QUnit.cases([
    { value: Crocodoc.ZOOM_AUTO, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_AUTO, expected: Crocodoc.ZOOM_AUTO },
    { value: Crocodoc.ZOOM_IN, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_AUTO, expected: Crocodoc.ZOOM_AUTO },
    { value: Crocodoc.ZOOM_OUT, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_AUTO, expected: Crocodoc.ZOOM_AUTO },
    { value: Crocodoc.ZOOM_FIT_WIDTH, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_AUTO, expected: Crocodoc.ZOOM_FIT_WIDTH },
    { value: Crocodoc.ZOOM_FIT_HEIGHT, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_AUTO, expected: Crocodoc.ZOOM_FIT_HEIGHT },
    { value: Crocodoc.ZOOM_FIT_WIDTH, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_FIT_WIDTH, expected: Crocodoc.ZOOM_FIT_WIDTH },
    { value: Crocodoc.ZOOM_FIT_HEIGHT, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_FIT_HEIGHT, expected: Crocodoc.ZOOM_FIT_HEIGHT },
    { value: 2, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_AUTO, expected: Crocodoc.ZOOM_AUTO },
    { value: 2, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_FIT_HEIGHT, expected: Crocodoc.ZOOM_FIT_HEIGHT },
    { value: 2, parsedZoom: 2, zoomMode: Crocodoc.ZOOM_FIT_WIDTH, expected: Crocodoc.ZOOM_FIT_WIDTH },
    { value: 2, parsedZoom: 2, zoomMode: null, expected: null }
]).test('calculateZoomMode() should return the appropriate zoom mode when called', function (params) {
    this.stub(this.component, 'calculateZoomValue').withArgs(params.zoomMode).returns(params.parsedZoom);
    this.component.init(this.config);
    var zoomMode = this.component.calculateZoomMode(params.value, params.parsedZoom);
    equal(zoomMode, params.expected, zoomMode + ' is correct');
});

test('calculateZoomMode() should return `auto` when called with value=`in` and the next zoom level would be `auto`', function () {
    this.stub(this.component, 'calculateZoomValue').withArgs(Crocodoc.ZOOM_AUTO).returns(2);
    this.component.init(this.config);
    var zoomMode = this.component.calculateZoomMode(Crocodoc.ZOOM_IN, 2);
    equal(zoomMode, Crocodoc.ZOOM_AUTO, zoomMode + ' is correct');
});

test('calculateZoomMode() should return `auto` when called with value=`out` and the previous zoom level would be `auto`', function () {
    this.stub(this.component, 'calculateZoomValue').withArgs(Crocodoc.ZOOM_AUTO).returns(2);
    this.component.init(this.config);
    var zoomMode = this.component.calculateZoomMode(Crocodoc.ZOOM_OUT, 2);
    equal(zoomMode, Crocodoc.ZOOM_AUTO, zoomMode + ' is correct');
});

QUnit.cases([
    { value: '1.0', retVal: 1 },
    { value: 0.5, retVal: 0.5 },
    { value: Crocodoc.ZOOM_AUTO, retVal: 1.1 },
    { value: Crocodoc.ZOOM_IN, retVal: 2 },
    { value: Crocodoc.ZOOM_OUT, retVal: 0.9 },
    { value: Crocodoc.ZOOM_FIT_WIDTH, retVal: 1.3 },
    { value: 'bad', retVal: 1.3 },
    { value: 'bad', retVal: 1, currentZoom: 1 },
    { value: 'bad', retVal: 1, currentZoom: 0.1, zoomMode: Crocodoc.ZOOM_AUTO }
]).test('parseZoomValue() should return the correct zoom value when called', function (params) {
    this.stub(this.component, 'calculateZoomValue').returns(params.retVal);
    this.stub(this.component, 'calculateNextZoomLevel').returns(params.retVal);
    this.component.config = { zoom: 1.3 };
    this.component.state = {
        zoomState: {
            zoom: params.currentZoom,
            zoomMode: params.zoomMode
        }
    };
    var retVal = this.component.parseZoomValue(params.value);
    equal(retVal, params.retVal, 'value was correct ('+params.value + ':' + params.retVal + ')');
});

QUnit.cases([
    { direction: Crocodoc.ZOOM_IN, zoomLevels: [0.5, 1, 2], currentZoom: 0.5, retVal: 1 },
    { direction: Crocodoc.ZOOM_IN, zoomLevels: [0.5, 1, 2], currentZoom: 2, retVal: false },
    { direction: Crocodoc.ZOOM_OUT, zoomLevels: [0.5, 1, 2], currentZoom: 2, retVal: 1 },
    { direction: Crocodoc.ZOOM_OUT, zoomLevels: [0.5, 1, 2], currentZoom: 0.5, retVal: false }
]).test('calculateNextZoomLevel() should return the correct next zoom level when called', function (params) {
    this.stub(this.component, 'calculateZoomValue').returns(params.calculatedValue);
    this.component.init(this.config);
    this.component.state.zoomState.zoom = params.currentZoom;
    this.component.zoomLevels = params.zoomLevels;
    var retVal = this.component.calculateNextZoomLevel(params.direction);
    equal(retVal, params.retVal, 'value was correct ('+params.direction + ':' + params.retVal + ')');
});

QUnit.cases([
    { mode: '1.2', retVal: 1.2 },
    { mode: Crocodoc.ZOOM_AUTO, retVal: 2 },
    { mode: Crocodoc.ZOOM_FIT_WIDTH, retVal: 1.5 },
    { mode: Crocodoc.ZOOM_FIT_HEIGHT, retVal: 1.25 },
    { mode: null, retVal: 4 }
]).test('calculateZoomValue() should return the correct zoom value when called', function (params) {
    var testState = {
        viewportDimensions: {
            clientWidth: 120,
            clientHeight: 120
        },
        widestPage: {
            totalActualWidth: 80
        },
        tallestPage: {
            totalActualHeight: 96
        },
        zoomState: {
            zoom: 4
        }
    };
    this.stub(this.component, 'calculateZoomAutoValue').returns(params.retVal);
    this.component.init(this.config);
    this.component.state = testState;
    var retVal = this.component.calculateZoomValue(params.mode);
    equal(retVal, params.retVal, 'value was correct ('+params.mode + ':' + params.retVal + ')');
});

QUnit.cases([
    { val: 1, expected: 1 },
    { val: '2', expected: 2 },
    { val: '2.4', expected: 2 },
    { val: -1, expected: 1 },
    { val: 1000, expected: 5, numPages: 5 },
    { val: Crocodoc.SCROLL_NEXT, currentPage: 4, expected: 5, numPages: 5 },
    { val: Crocodoc.SCROLL_PREVIOUS, currentPage: 5, expected: 4, numPages: 5 },
    { val: 'bad', expected: null },
    { val: false, expected: null }
]).test('scrollTo() should scroll to the appropriate page when called', function (params) {
    this.stub(this.component, 'calculateNextPage').returns(params.currentPage + 1);
    this.stub(this.component, 'calculatePreviousPage').returns(params.currentPage - 1);
    this.config.numPages = params.numPages || this.config.numPages;

    if (params.expected === null) {
        // scrollToPage shouldn't be called
        this.mock(this.component)
            .expects('scrollToPage')
            .never();
    } else {
        this.mock(this.component)
            .expects('scrollToPage')
            .withArgs(params.expected);
    }
    this.component.init(this.config);
    this.component.state.currentPage = params.currentPage || this.component.state.currentPage;
    this.component.scrollTo(params.val);
});

test('scrollBy() scroll to the correct offset when called', function () {
    var left = 100, offsetLeft = -5,
        top = 40, offsetTop = 30;
    this.mock(this.component)
        .expects('scrollToOffset')
        .withArgs(left + offsetLeft, top + offsetTop);
    this.component.state = {
        scrollLeft: left,
        scrollTop: top
    };
    this.component.scrollBy(offsetLeft, offsetTop);
});

test('scrollToPage() should scroll to the correct offset when called', function () {
    var offset = {
        top: 40,
        left: 10
    };
    this.stub(this.component, 'calculateScrollPositionForPage').returns(offset);
    this.mock(this.component)
        .expects('scrollToOffset')
        .withArgs(offset.left, offset.top);
    this.component.scrollToPage(3);
});

test('updateCurrentPage() should set the current page when called', function () {
    var page = 3;
    this.stub(this.component, 'calculateCurrentPage').returns(page);
    this.mock(this.component)
        .expects('setCurrentPage')
        .withArgs(page);
    this.component.updateCurrentPage();
});

test('calculateScrollPositionForPage() should return the correct offset when called', function () {
    var page = 4,
        offset = {
            top: 40,
            left: 10
        };
    this.component.numPages = page;
    this.component.state = { pages: [] };
    this.component.state.pages[page - 1] = {
        y0: offset.top,
        x0: offset.left
    };
    deepEqual(this.component.calculateScrollPositionForPage(page), offset, 'the offset was correct');
});

test('scrollToOffset() scrolls to the given offset left and top when called', function () {
    var left = 10, top = 20;
    this.component.init(this.config);
    var scrollLeftSpy = this.spy(this.component.$viewport, 'scrollLeft'),
        scrollTopSpy = this.spy(this.component.$viewport, 'scrollTop');
    this.component.scrollToOffset(left, top);
    ok(scrollLeftSpy.calledWith(left), 'scrollLeft set properly');
    ok(scrollTopSpy.calledWith(top), 'scrollTop set properly');
});

test('setCurrentPage() updates the current page and visible pages and fire a pagefocus message when called with a new page number', function () {
    var page = 4;
    this.component.state = {
        currentPage: 1
    };
    this.mock(this.component)
        .expects('updateVisiblePages');
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('pagefocus', sinon.match({ page: page }));

    this.component.setCurrentPage(page);
    equal(this.component.state.currentPage, page, 'current page updated');
});

test('handleResize() should update viewport dimensions when called', function () {
    var data = { clientWidth: 1024, clientHeight: 768 };
    this.stub(this.component, 'setZoom');
    this.component.init(this.config);
    this.component.handleResize(data);
    deepEqual(data, this.component.state.viewportDimensions, 'viewport dimensions set properly');
});

test('handleResize() should zoom to the current zoom mode when called', function () {
    var mode = 'some zoom mode';
    this.mock(this.component)
        .expects('setZoom')
        .withArgs(mode);

    this.component.state = { zoomState: { zoomMode: mode }};
    this.component.handleResize();
});

test('handleScroll() should update scroll position when called', function () {
    var data = { scrollTop: 100, scrollLeft: 200 };
    this.component.init(this.config);
    this.component.handleScroll(data);
    equal(data.scrollTop, this.component.state.scrollTop, 'scroll top set properly');
    equal(data.scrollLeft, this.component.state.scrollLeft, 'scroll left set properly');
});

test('handleScrollEnd() should update the current page when called', function () {
    var CSS_CLASS_CURRENT_PAGE = 'crocodoc-current-page';
    var currentPage = 3;
    this.stub(this.component, 'updateVisiblePages');
    this.stub(this.component, 'handleScroll');
    this.config.$pages = this.config.$pagesWrapper.find('.crocodoc-page');
    var $prevPage = this.config.$pages.eq(0).addClass(CSS_CLASS_CURRENT_PAGE);
    var $currentPage = this.config.$pages.eq(currentPage - 1);
    this.component.init(this.config);
    this.component.state.currentPage = currentPage;
    this.component.handleScrollEnd();
    // check if it updated the css classes on .crocodoc-page elements properly
    ok(!$prevPage.hasClass(CSS_CLASS_CURRENT_PAGE), 'old page has correct css class');
    ok($currentPage.hasClass(CSS_CLASS_CURRENT_PAGE), 'current page has correct css class');
});

test('handleScrollEnd() should update the visible pages when called', function () {
    this.stub(this.component, 'handleScroll');
    this.component.init(this.config);
    this.mock(this.component)
        .expects('updateVisiblePages')
        .withArgs(true); // also update css classes
    this.component.handleScrollEnd();
});

test('handleScrollEnd() should handle the message as a scroll message when called', function () {
    var data = { some: 'data' };
    this.stub(this.component, 'updateVisiblePages');
    this.component.init(this.config);
    this.mock(this.component)
        .expects('handleScroll')
        .withArgs(data);
    this.component.handleScrollEnd(data);
});

QUnit.cases([
    { left: 0, top: 0, scrollLeft: 0, scrollTop: 0, shouldNotCenter: true, zoomState: { zoom: 1, prevZoom: 0.5 } },
    { left: 700, top: 700, scrollLeft: 100, scrollTop: 100, zoomState: { zoom: 1, prevZoom: 0.5 } }
    // @TODO: add more test cases
]).test('updateScrollPosition() should scroll to the correct position when called', function (params) {
    this.mock(this.component)
        .expects('scrollToOffset')
        .withArgs(params.left, params.top);

    this.component.init(this.config);
    this.component.state.viewportDimensions = {
        offsetWidth: 1000,
        offsetHeight: 1000
    };
    this.component.state.scrollLeft = params.scrollLeft;
    this.component.state.scrollTop = params.scrollTop;
    this.component.state.zoomState = params.zoomState;
    this.component.updateScrollPosition(params.shouldNotCenter);
});

test('updateVisiblePages() should update the visible pages appropriately when called', function () {
    this.stub(this.component, 'calculateVisibleRange').returns({ min: 2, max: 4 });
    this.component.init(this.config);
    this.component.updateVisiblePages();
    deepEqual(this.component.state.visiblePages, [3, 4, 5], 'visible pages are correct');
});

test('updateVisiblePages() should update the fully visible pages appropriately when called', function () {
    this.stub(this.component, 'calculateFullyVisibleRange').returns({ min: 2, max: 4 });
    this.component.init(this.config);
    this.component.updateVisiblePages();
    deepEqual(this.component.state.fullyVisiblePages, [3, 4, 5], 'fully visible pages are correct');
});

test('updateVisiblePages() should update the css classes appropriately when called with updateClasses===true', function () {
    var CSS_CLASS_PAGE_VISIBLE = 'crocodoc-page-visible';
    var range = { min: 2, max: 4 };
    this.stub(this.component, 'calculateVisibleRange').returns(range);
    var $invisible = this.config.$pages.eq(5).addClass(CSS_CLASS_PAGE_VISIBLE);
    var $visible = this.config.$pages.slice(range.min, range.max);
    this.component.init(this.config);
    this.component.updateVisiblePages(true);
    ok(!$invisible.hasClass(CSS_CLASS_PAGE_VISIBLE), 'invisible pages have correct css class');
    ok($visible.hasClass(CSS_CLASS_PAGE_VISIBLE), 'visible pages have correct css class');
});

QUnit.cases([
    { prevZoom: 0.5, zoom: 1.5, canZoomIn: true, canZoomOut: false, mode: 'something' },
    { prevZoom: 1.5, zoom: 1.5, canZoomIn: true, canZoomOut: true, mode: 'auto' },
    { prevZoom: 1, zoom: 5, canZoomIn: false, canZoomOut: false, mode: 'auto' }
]).test('setZoom() should update the zoom state appropriately when called', function (params) {
    this.stub(this.component, 'applyZoom');
    this.stub(this.component, 'updatePageStates');
    this.stub(this.component, 'updateLayout');
    this.stub(this.component, 'updateScrollPosition');
    this.stub(this.component, 'updateVisiblePages');
    this.stub(this.component, 'parseZoomValue').returns(params.zoom);
    this.stub(this.component, 'calculateZoomMode').returns(params.mode);

    var calculateNextZoomLevelStub = this.stub(this.component, 'calculateNextZoomLevel');
    calculateNextZoomLevelStub.withArgs(Crocodoc.ZOOM_IN).returns(params.canZoomIn);
    calculateNextZoomLevelStub.withArgs(Crocodoc.ZOOM_OUT).returns(params.canZoomOut);

    this.component.init(this.config);
    this.component.state.zoomState.zoom = params.prevZoom;

    this.component.setZoom(params.zoom);

    equal(this.component.state.zoomState.zoomMode, params.mode, 'mode was updated');
    equal(this.component.state.zoomState.zoom, params.zoom, 'zoom was updated');
    equal(this.component.state.zoomState.prevZoom, params.prevZoom, 'prevZoom was updated');
    equal(this.component.state.zoomState.canZoomIn, params.canZoomIn , 'canZoomIn was updated');
    equal(this.component.state.zoomState.canZoomOut, params.canZoomOut, 'canZoomOut was updated');
});

test('setZoom() should append the appropriate CSS rule to the stylesheet when called', function () {
    var zoom = 1.576,
        selector = '.' + this.config.namespace + ' .crocodoc-page-autoscale',
        scale = ''+ (zoom * this.config.pageScale);

    this.stub(this.component, 'updatePageStates');
    this.stub(this.component, 'updateLayout');
    this.stub(this.component, 'updateScrollPosition');
    this.stub(this.component, 'updateVisiblePages');
    this.stub(this.component, 'parseZoomValue').returns(zoom);
    this.stub(this.component, 'calculateZoomMode');
    this.stub(this.component, 'calculateNextZoomLevel');

    this.component.init(this.config);
    this.mock(this.utilities.common)
        .expects('appendCSSRule')
        .withArgs(this.config.stylesheet, selector, sinon.match(scale));

    this.component.setZoom(zoom);
});

test('setZoom() should remove the appropriate CSS rule from the stylesheet when called more than once', function () {
    var zoom = 1.576,
        index = 5;
    this.stub(this.component, 'updatePageStates');
    this.stub(this.component, 'updateLayout');
    this.stub(this.component, 'updateScrollPosition');
    this.stub(this.component, 'updateVisiblePages');
    this.stub(this.component, 'parseZoomValue').returns(zoom);
    this.stub(this.component, 'calculateZoomMode');
    this.stub(this.component, 'calculateNextZoomLevel');
    this.stub(this.utilities.common, 'appendCSSRule').returns(index);

    this.component.init(this.config);
    this.mock(this.utilities.common)
        .expects('deleteCSSRule')
        .withArgs(this.config.stylesheet, index);

    this.component.setZoom(zoom);
    this.component.setZoom(zoom);
});
