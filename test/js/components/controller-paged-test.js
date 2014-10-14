module('Component - controller-paged', {
    setup: function () {
        var self = this;

        this.metadata = {
            numPages: 1,
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
