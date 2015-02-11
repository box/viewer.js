module('Component - controller-paged', {
    setup: function () {
        var self = this;

        this.metadata = {
            numpages: 1,
            dimensions: {
                width: 100,
                height: 100
            }
        };

        this.components = {
            'lazy-loader': {
                init: function () {}
            },
            page: {
                init: function () {}
            }
        };

        this.utilities = {
            common: {
                getSelectedNode: function () {},
                clamp: sinon.stub().returnsArg(0),
                template: sinon.stub().returnsArg(0),
                calculatePtSize: sinon.stub().returns(1.33)
            }
        };

        this.config = $.extend(true, {}, Crocodoc.Viewer.defaults);
        this.config.$el = $('<div>');
        this.config.metadata = this.metadata;

        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('controller-paged', this.scope);
    }
});

test('init() should create and init a lazy-loader component when loading metadata and stylesheet succeeds', function () {
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('metadata').returns($.Deferred().resolve(this.metadata).promise());
    stub.withArgs('stylesheet').returns($.Deferred().resolve('').promise());

    this.mock(this.components['lazy-loader'])
        .expects('init')
        .withArgs(sinon.match.array);

    this.component.init();
});


test('init() should create and init `numpages` page components with appropriate status when loading metadata and stylesheet succeeds', function () {
    var metadata = {
        numpages: 5,
        dimensions: {
            width: 100,
            height: 100
        }
    };
    this.config.metadata = metadata;
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('metadata').returns($.Deferred().resolve(metadata).promise());
    stub.withArgs('stylesheet').returns($.Deferred().resolve('').promise());

    var createComponentSpy = this.spy(this.scope, 'createComponent');
    this.mock(this.components.page)
        .expects('init')
        .withArgs(sinon.match.object, sinon.match({
            status: PAGE_STATUS_NOT_LOADED
        }))
        .exactly(metadata.numpages);

    this.component.init();
    ok(createComponentSpy.withArgs('page').callCount === metadata.numpages, 'created correct number of page components');
});

test('init() should init page components with appropriate status when called and the conversion is not complete and loading metadata and stylesheet succeeds', function () {
    var metadata = {
        numpages: 5,
        dimensions: {
            width: 100,
            height: 100
        }
    };
    this.config.metadata = metadata;
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('metadata').returns($.Deferred().resolve(metadata).promise());
    stub.withArgs('stylesheet').returns($.Deferred().resolve('').promise());

    this.config.conversionIsComplete = false;

    var mock = this.mock(this.components.page);

    mock.expects('init')
        .withArgs(sinon.match.object, sinon.match({
            status: PAGE_STATUS_NOT_LOADED
        }))
        .once();

    mock.expects('init')
        .withArgs(sinon.match.object, sinon.match({
            status: PAGE_STATUS_CONVERTING
        }))
        .exactly(metadata.numpages - 1);

    this.component.init();
});


test('init() should init page components with appropriate status when called and the conversion is not complete and loading metadata and stylesheet succeeds and autoloadFirstPage is disabled', function () {
    var metadata = {
        numpages: 5,
        dimensions: {
            width: 100,
            height: 100
        }
    };
    this.config.metadata = metadata;
    var stub = this.stub(this.scope, 'get');
    stub.withArgs('metadata').returns($.Deferred().resolve(metadata).promise());
    stub.withArgs('stylesheet').returns($.Deferred().resolve('').promise());

    this.config.conversionIsComplete = false;
    this.config.autoloadFirstPage = false;

    var mock = this.mock(this.components.page);

    mock.expects('init')
        .withArgs(sinon.match.object, sinon.match({
            status: PAGE_STATUS_CONVERTING
        }))
        .exactly(metadata.numpages);

    this.component.init();
});

test('links should be sorted properly and passed into the page components when initialized', function () {
    var metadata = {
        numpages: 5,
        links: [
            { pagenum: 1, destination: { pagenum: 2 } },
            { pagenum: 2, destination: { pagenum: 1 } },
            { pagenum: 2, destination: { pagenum: 5 } }
        ],
        dimensions: { width: 100, height: 100 }
    };
    this.config.metadata = metadata;

    var spy = this.spy(this.components.page, 'init');

    this.component.init();

    ok(spy.calledWith(sinon.match.object, sinon.match({
        index: 0,
        links: sinon.match([
            sinon.match({
                destination: { pagenum: 2 }
            })
        ])
    })), 'page links correct');
    ok(spy.calledWith(sinon.match.object, sinon.match({
        index: 1,
        links: sinon.match([
            sinon.match({
                destination: { pagenum: 1 }
            }),
            sinon.match({
                destination: { pagenum: 5 }
            })
        ])
    })), 'page links correct');
});

test('links should be sorted properly and passed into the page components when initialized and pageStart/pageEnd are used', function () {
    var metadata = {
        numpages: 5,
        links: [
            { pagenum: 1, destination: { pagenum: 2 } },
            { pagenum: 2, destination: { pagenum: 1 } },
            { pagenum: 2, destination: { pagenum: 5 } }
        ],
        dimensions: { width: 100, height: 100 }
    };
    this.config.metadata = metadata;
    this.config.pageStart = 2;
    this.config.pageEnd = 2;

    var spy = this.spy(this.components.page, 'init');

    this.component.init();

    ok(!spy.calledWith(sinon.match.object, sinon.match({
        index: 0,
    })), 'page not initialized');
    ok(spy.calledWith(sinon.match.object, sinon.match({
        index: 1,
        links: sinon.match.has('length', 0)
    })), 'page links correctly empty');
});

test('links should be sorted properly and passed into the page components when initialized and pageStart/pageEnd are used', function () {
    var metadata = {
        numpages: 5,
        links: [
            { pagenum: 2, destination: { pagenum: 5 } },
            { pagenum: 5, destination: { pagenum: 1 } }
        ],
        dimensions: { width: 100, height: 100 }
    };
    this.config.metadata = metadata;
    this.config.pageStart = 2;
    this.config.pageEnd = 5;

    var spy = this.spy(this.components.page, 'init');

    this.component.init();

    ok(spy.calledWith(sinon.match.object, sinon.match({
        index: 4,
        links: sinon.match.has('length', 0)
    })), 'page not initialized');
    ok(spy.calledWith(sinon.match.object, sinon.match({
        index: 1,
        links: sinon.match([
            sinon.match({ destination: { pagenum: 4 }})
        ])
    })), 'page links correctly adjusted');
});
