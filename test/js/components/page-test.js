module('Component - page', {
    setup: function () {
        var self = this;
        this.components = {
            'page-text': {
                init: function () {},
                preload: function () {},
                load: function () {},
                enable: function () {},
                disable: function () {},
                unload: function () {}
            },
            'page-links': {
                init: function () {},
            },
            'page-svg': {
                init: function () {},
                load: function () {},
                preload: function () {},
                unload: function () {},
                prepare: function () {}
            }
        };
        //@TODO: write tests for when SVG is not supported
        this.utilities = {
            support: {
                svg: true
            }
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('page', this.scope);
    }
});

test('init() should create and init PageText, PageSVG, and PageLinks components when called', function () {
    var mockScope = this.mock(this.scope),
        mockPageText = this.mock(this.components['page-text']),
        mockPageSVG = this.mock(this.components['page-svg']),
        mockPageLinks = this.mock(this.components['page-links']),
        config = { links: [{}], enableLinks: true, index: 3 };

    mockScope.expects('createComponent')
        .returns(this.components['page-text'])
        .withArgs('page-text');
    mockScope.expects('createComponent')
        .returns(this.components['page-svg'])
        .withArgs('page-svg');
    mockScope.expects('createComponent')
        .returns(this.components['page-links'])
        .withArgs('page-links');

    mockPageText.expects('init')
        .withArgs(sinon.match.object, config.index + 1);
    mockPageSVG.expects('init')
        .withArgs(sinon.match.object, config.index + 1);
    mockPageLinks.expects('init')
        .withArgs(sinon.match.object, config.links);

    this.component.init($(), config);
});

test('onmessage() should call enableTextSelection() when called with message "textenabledchange", {enabled:true}', function () {
    this.mock(this.component)
        .expects('enableTextSelection');
    this.component.onmessage('textenabledchange', { enabled: true });
});

test('onmessage() should call disableTextSelection() when called with message "textenabledchange", {enabled:false}', function () {
    this.mock(this.component)
        .expects('disableTextSelection');
    this.component.onmessage('textenabledchange', { enabled: false });
});

test('preload() should preload svg and text when status is PAGE_STATUS_NOT_LOADED', function () {
    this.component.init($(), {
        status: PAGE_STATUS_NOT_LOADED
    });

    this.mock(this.components['page-svg'])
        .expects('preload');
    this.mock(this.components['page-text'])
        .expects('preload');
    this.component.preload();
});

test('preload() should not preload svg and text when status is not PAGE_STATUS_NOT_LOADED', function () {
    this.component.init($(), {
        status: PAGE_STATUS_CONVERTING
    });

    this.mock(this.components['page-svg'])
        .expects('preload')
        .never();
    this.mock(this.components['page-text'])
        .expects('preload')
        .never();
    this.component.preload();
});

test('load() should not call pageSVG.load() when page is in an error state', function () {
    this.component.init($(), {
        status: PAGE_STATUS_ERROR
    });

    this.mock(this.components['page-svg'])
        .expects('load')
        .never();
    this.component.load();
});

test('load() should not call pageSVG.load() when page is converting', function () {
    this.component.init($(), {
        status: PAGE_STATUS_CONVERTING
    });

    this.mock(this.components['page-svg'])
        .expects('load')
        .never();
    this.component.load();
});

test('load() should call pageSVG.load() when page is not loaded', function () {
    this.component.init($(), {
        status: PAGE_STATUS_NOT_LOADED
    });

    this.mock(this.components['page-svg'])
        .expects('load');
    this.component.load();
});

test('load() should broadcast "pageload" message when page is loaded', function () {
    this.component.init($(), {
        status: PAGE_STATUS_NOT_LOADED,
        index: 0
    });

    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('pageload', sinon.match.has('page', 1));
    this.component.load();
});

test('load() should call pageText.load() when called and the page should be loaded', function () {
    this.component.init($(), {
        status: PAGE_STATUS_NOT_LOADED,
        index: 0
    });

    this.mock(this.components['page-text'])
        .expects('load');
    this.component.load();
});

test('load() should broadcast pagefail when the page fails to load', function () {
    var error = { error: 'my error message' },
        index = 4;

    this.component.init($(), {
        index: index,
        status: PAGE_STATUS_NOT_LOADED
    });

    var $promise = $.Deferred().reject(error).promise();
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('pagefail', { page: index + 1, error: sinon.match(error) });

    this.mock(this.components['page-svg'])
        .expects('load')
        .returns($promise);

    this.component.load();
});

test('unload() should unload svg and text layers only when called when status is PAGE_STATUS_LOADED', function () {
    var mock = this.mock(this.components['page-svg']);
    this.component.init($(), {
        status: PAGE_STATUS_LOADED,
        index: 0
    });

    this.mock(this.components['page-svg'])
        .expects('unload');
    this.mock(this.components['page-text'])
        .expects('unload');

    this.component.unload();
});

test('unload() should broadcast "pageunload" only when called when status is PAGE_STATUS_LOADED', function () {
    var mock = this.mock(this.scope);
    this.component.init($(), {
        status: PAGE_STATUS_LOADED,
        index: 0
    });

    mock.expects('broadcast')
        .withArgs('pageunload', sinon.match.has('page', 1));

    this.component.unload();

    // status should now be PAGE_STATUS_NOT_LOADED

    mock.expects('broadcast')
        .never();

    this.component.unload();
});

test('enableTextSelection() should call pageText.enable() when called', function () {
    this.component.init($(), {});
    this.mock(this.components['page-text'])
        .expects('enable');
    this.component.enableTextSelection();
});

test('enableTextSelection() should call pageText.load() when called and the page is visible', function () {
    this.component.init($(), { index: 0 });
    this.component.onmessage('pagefocus', { page: 1 });
    this.mock(this.components['page-text'])
        .expects('load');
    this.component.enableTextSelection();
});

test('disableTextSelection() should call pageText.disable() when called', function () {
    this.component.init($(), {});
    this.mock(this.components['page-text'])
        .expects('disable');
    this.component.disableTextSelection();
});
