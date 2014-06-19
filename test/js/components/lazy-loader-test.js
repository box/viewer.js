module('Component - lazy-loader', {
    setup: function () {
        this.utilities = {
            common: Crocodoc.getUtility('common')
        };
        this.scope = Crocodoc.getScopeForTest(this);

        this.pageComponent = {
            errorCount: 0,
            preload: function () {},
            load: function () {},
            unload: function () {},
            fail: function () {}
        };

        this.pages = [];
        this.component = Crocodoc.getComponentForTest('lazy-loader', this.scope);
        this.clock = sinon.useFakeTimers();
    },
    teardown: function () {
        this.clock.restore();
        this.component.destroy();
    }
});

test('destroy() should call cancelAllLoading() when called', function () {
    this.mock(this.component)
        .expects('cancelAllLoading');
    this.component.destroy();
});

test('loadNecessaryPages() should call queuePageToLoad() with the current page index when called', function () {
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.component.updateLayoutState({
        page: 2,
        visiblePages: [2]
    });
    this.stub(this.component, 'loadVisiblePages');
    this.stub(this.component, 'loadPagesInRange');
    this.mock(this.component)
        .expects('queuePageToLoad')
        .withArgs(1);
    this.component.loadNecessaryPages();
    this.clock.tick(100);
});

test('loadNecessaryPages() should call loadVisiblePages() when called', function () {
    this.component.init(this.pages);
    this.stub(this.component, 'queuePageToLoad');
    this.stub(this.component, 'loadPagesInRange');
    this.mock(this.component)
        .expects('loadVisiblePages');
    this.component.loadNecessaryPages();
    this.clock.tick(100);
});

test('loadNecessaryPages() should call loadPagesInRange() when called', function () {
    this.component.init(this.pages);
    this.stub(this.component, 'queuePageToLoad');
    this.stub(this.component, 'loadVisiblePages');
    this.mock(this.component)
        .expects('loadPagesInRange')
        .withArgs(sinon.match.number);
    this.component.loadNecessaryPages();
    this.clock.tick(100);
});

test('queuePageToLoad() should call preload() on a page when called with a valid page index that should load', function () {
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.mock(this.pageComponent)
        .expects('preload');
    this.component.queuePageToLoad(0);
});

test('queuePageToLoad() should not call preload() on a page when called with an invalid page index', function () {
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.mock(this.pageComponent)
        .expects('preload')
        .never();
    this.component.queuePageToLoad(1);
});

test('queuePageToLoad() should eventually lead to a call to loadPage() when called with a valid page that should load', function () {
    var index = 0,
        $deferred = $.Deferred();

    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.mock(this.component)
        .expects('loadPage')
        .withArgs(index);
    this.component.queuePageToLoad(index);
    this.clock.tick(100);
});

test('queuePageToLoad() should not lead to a call to loadPage() when call is proceded by a call to cancelAllLoading()', function () {
    var index = 0;
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.mock(this.component)
        .expects('loadPage')
        .withArgs(index)
        .never();
    this.component.queuePageToLoad(index);
    this.component.cancelAllLoading();
    this.clock.tick(10000);
});

test('loadVisiblePages() should call queuePageToLoad() for all visible pages when called', function () {
    var index, visiblePages = [2, 3];
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.component.updateLayoutState({
        page: 2,
        visiblePages: visiblePages
    });
    var spy = this.spy(this.component, 'queuePageToLoad');
    this.component.loadVisiblePages();
    for (var i = 0; i < visiblePages.length; ++i) {
        index = visiblePages[i] - 1;
        ok(spy.calledWith(index), 'queuePageToLoad() was called with '+ index);
    }
});

test('loadPagesInRange() should load pages in the given range, not including the current page when called with a range', function () {
    var range = 1;
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.component.updateLayoutState({
        page: 3,
        visiblePages: []
    });
    var spy = this.spy(this.component, 'queuePageToLoad');
    this.component.loadPagesInRange(range);
    ok(spy.neverCalledWith(0), 'queuePageToLoad() was not called with '+ 0);
    ok(spy.calledWith(1), 'queuePageToLoad() was called with '+ 1);
    ok(spy.neverCalledWith(2), 'queuePageToLoad() was not called with '+ 2);
    ok(spy.calledWith(3), 'queuePageToLoad() was called with '+ 3);
    ok(spy.neverCalledWith(4), 'queuePageToLoad() was not called with '+ 4);
});

test('unloadUnnecessaryPages() should unload pages outside the page load range range when called', function () {
    for (var i = 0; i < 100; i++) {
        this.pages.push(this.pageComponent);
    }
    this.component.init(this.pages);
    this.component.updateLayoutState({
        page: 50,
        visiblePages: [50, 51]
    });
    var spy = this.spy(this.component, 'unloadPage');
    this.component.unloadUnnecessaryPages();
    ok(spy.calledWith(0), 'unloadPage() was called with '+ 0);
    ok(spy.neverCalledWith(50), 'unloadPage() was not called with '+ 50);
    ok(spy.neverCalledWith(51), 'unloadPage() was not called with '+ 51);
    ok(spy.neverCalledWith(52), 'unloadPage() was not called with '+ 52);
    ok(spy.calledWith(99), 'unloadPage() was called with '+ 99);
});


test('loadPage() should be called as many times as queuePageToLoad()', function () {
    var $deferred = $.Deferred();

    this.pages.push(this.pageComponent);
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.stub(this.pageComponent, 'load').returns($deferred);
    $deferred.resolve();

    var loadPageSpy = this.spy(this.component, 'loadPage');
    this.component.queuePageToLoad(0);
    this.component.queuePageToLoad(1);
    this.clock.tick(300);
    ok(loadPageSpy.calledWith(0), 'called with first page');
    ok(loadPageSpy.calledWith(1), 'called with second page');
    ok(loadPageSpy.calledTwice, 'called exactly twice');
});

test('loadPage() should call the callback function immediately when called with an invalid page', function () {
    var spy = sinon.spy();
    var $deferred = $.Deferred();
    this.stub(this.pageComponent, 'load').returns($deferred);
    $deferred.resolve();

    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.component.loadPage(2, spy);
    ok(spy.calledOnce, 'callback function was called');
});

test('loadVisiblePages() should queue all visible pages to load when called', function () {
    var stub = this.stub(this.component, 'queuePageToLoad'),
        data = { page: 5, visiblePages: [1, 2, 3, 4, 5, 6, 7]};
    this.component.updateLayoutState(data);
    this.component.loadVisiblePages();
    for (var i = 0; i < data.visiblePages.length; ++i) {
        ok(stub.calledWith(data.visiblePages[i] - 1));
    }
});

test('handleReady() should load visible pages when called', function () {
    this.component.init(this.pages);

    this.mock(this.component)
        .expects('loadVisiblePages');
    this.component.handleReady();
});

test('handleReady() should load necessary pages after a timeout when called', function () {
    this.clock = sinon.useFakeTimers();
    this.component.init(this.pages);

    this.mock(this.component)
        .expects('loadNecessaryPages');
    this.component.handleReady();
    this.clock.tick(1000);
    this.clock.restore();
});

test('handleZoom() should load necessary pages and update layout state when called', function () {
    this.component.init(this.pages);
    this.component.handleReady();

    var mock = this.mock(this.component),
        data = { page: 2, visiblePages: [2] };

    mock.expects('loadNecessaryPages');
    mock.expects('updateLayoutState').withArgs(data);
    this.component.handleZoom(data);
});

test('handleScroll() should call cancel page loading when called', function () {
    var mock = this.mock(this.component);
    mock.expects('cancelAllLoading');
    this.component.handleScroll();
});

test('handleScrollEnd() should load necessary pages and unload unnecessary ones when called', function () {
    this.component.init(this.pages);
    this.component.handleReady();

    var mock = this.mock(this.component);
    mock.expects('loadNecessaryPages');
    mock.expects('unloadUnnecessaryPages');
    this.component.handleScrollEnd();
});

test('handlePageFocus() should call update the layout state, cancel any page loading, and then (eventually) load necessary pages when called', function () {
    this.component.init(this.pages);
    this.component.handleReady();

    var mock = this.mock(this.component);
    var data = { page: 1, visiblePages: [1] };
    mock.expects('updateLayoutState').withArgs(data);
    mock.expects('cancelAllLoading');
    mock.expects('loadNecessaryPages');
    this.component.handlePageFocus(data);
    this.clock.tick(200);
});

test('unloadPage() should call page.unload() when called with a valid page index', function () {
    this.pages.push(this.pageComponent);
    this.component.init(this.pages);
    this.mock(this.pageComponent)
        .expects('unload');
    this.component.unloadPage(0);
});

test('handlePageAvailable() should queue the appropriate pages to load when called with data.page', function () {
    this.component.init(this.pages);
    this.component.handleReady();

    var page = 4;
    for (var i = 0; i < 10; i++) {
        this.pages.push(this.pageComponent);
    }
    this.component.init(this.pages);
    this.mock(this.component)
        .expects('queuePageToLoad')
        .withArgs(page - 1);
    this.component.handlePageAvailable({ page: page });
});

test('handlePageAvailable() should queue the appropriate pages to load when called with data.upto', function () {
    this.component.init(this.pages);
    this.component.handleReady();

    var page = 3;
    for (var i = 0; i < 10; i++) {
        this.pages.push(this.pageComponent);
    }
    this.component.init(this.pages);
    var spy = this.spy(this.component, 'queuePageToLoad');
    this.component.handlePageAvailable({ upto: page });
    ok(spy.calledWith(0));
    ok(spy.calledWith(1));
    ok(spy.calledWith(2));
});

test('handlePageAvailable() should queue the appropriate pages to load when called with data.all', function () {
    this.component.init(this.pages);
    this.component.handleReady();

    var page = 3;
    for (var i = 0; i < 10; i++) {
        this.pages.push(this.pageComponent);
    }
    this.component.init(this.pages);
    var spy = this.spy(this.component, 'queuePageToLoad');
    this.component.handlePageAvailable({ all: true });
    ok(spy.calledWith(0));
    ok(spy.calledWith(1));
    ok(spy.calledWith(2));
});
