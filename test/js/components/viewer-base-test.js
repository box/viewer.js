module('Component - viewer-base', {
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
            layout: {
                state: {
                    currentPage: 2,
                    zoomState: {
                        zoom: 1.5
                    }
                },
                init: function () {},
                setZoom: function () {},
                scrollTo: function () {},
                scrollBy: function () {},
                focus: function () {},
                updatePageStates: function () {}
            },
            'lazy-loader': {
                init: function () {}
            },
            scroller: {
                init: function () {},
                destroy: function () {},
                on: function () {}
            },
            resizer: {
                init: function () {},
                destroy: function () {},
                on: function () {}
            },
            page: {
                init: function () {}
            }
        };

        this.utilities = {
            common: {
                insertCSS: function () { return { sheet: {} }; },
                makeAbsolute: function () {},
                getSelectedNode: function () {},
                isFn: sinon.stub().returns(true),
                extend: $.extend,
                clamp: sinon.stub().returnsArg(0),
                template: sinon.stub().returnsArg(0),
                calculatePtSize: sinon.stub().returns(1.33)
            },
            ajax: {
                request: function () {}
            }
        };

        this.viewerAPI = {
            setLayout: function () {},
            disableLinks: function () {},
            fire: function () {}
        };

        this.config = $.extend(true, {
                $el: $('<div>'),
                api: this.viewerAPI,
                url: '/some/url'
            }, Crocodoc.Viewer.defaults);

        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('viewer-base', this.scope);
    }
});

test('loadAssets() should make an AJAX request when config.url is set', function () {
    var spy = this.spy(this.utilities.ajax, 'request');
    this.stub(this.utilities.common, 'makeAbsolute').returnsArg(0);

    this.component.init();
    this.component.loadAssets();
    ok(spy.calledWith(this.config.url + 'info.json', sinon.match.object), 'ajax request was made');
});

test('loadAssets() should broadcast an asseterror message when loading metadata or stylesheet fails', function () {
    var err = '404 not found';
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('fail', { statusText: err });

    var broadcastSpy = this.spy(this.scope, 'broadcast');

    this.component.init();
    this.component.loadAssets();

    ok(broadcastSpy.calledWith('asseterror', sinon.match({ error: sinon.match(err) })), 'asseterror was broadcast');
});

test('loadAssets() should fire a fail event when loading metadata or stylesheet fails', function () {
    var err = '404 not found';
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('fail', { statusText: err });

    var broadcastSpy = this.spy(this.scope, 'broadcast');

    this.component.init();
    this.component.loadAssets();

    ok(broadcastSpy.calledWith('fail', sinon.match({ error: sinon.match(err) })), 'fail was broadcast');
});

test('loadAssets() should create and init a lazy-loader component when called', function () {
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(this.metadata)
        });

    this.mock(this.components['lazy-loader'])
        .expects('init')
        .withArgs(sinon.match.array);

    this.component.init();
    this.component.loadAssets();
});

test('loadAssets() should create and init a scroller component when called', function () {
    this.stub(this.component, 'setLayout');
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(this.metadata)
        });

    this.mock(this.components.scroller)
        .expects('init')
        .withArgs(sinon.match.object);

    this.component.init();
    this.component.loadAssets();
});

test('loadAssets() should create and init a resizer component when called', function () {
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(this.metadata)
        });

    this.mock(this.components.resizer)
        .expects('init')
        .withArgs(sinon.match.object);

    this.component.init();
    this.component.loadAssets();
});

test('loadAssets() should set the appropriate layout when called', function () {
    this.config.layout = Crocodoc.LAYOUT_PRESENTATION;

    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(this.metadata)
        });

    this.mock(this.viewerAPI)
        .expects('setLayout')
        .withArgs(this.config.layout);

    this.component.init();
    this.component.loadAssets();
});

test('loadAssets() should create and init `numpages` page components with appropriate status when called', function () {
    var metadata = {
        numpages: 5,
        dimensions: {
            width: 100,
            height: 100
        }
    };
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(metadata)
        });

    this.component.init();

    var createComponentSpy = this.spy(this.scope, 'createComponent');
    this.mock(this.components.page)
        .expects('init')
        .withArgs(sinon.match.object, sinon.match({
            status: Crocodoc.PAGE_STATUS_NOT_LOADED
        }))
        .exactly(metadata.numpages);

    this.component.loadAssets();

    ok(createComponentSpy.withArgs('page').callCount === metadata.numpages, 'created correct number of page components');
});

test('loadAssets() should init page components with appropriate status when called and the conversion is not complete', function () {
    this.config.conversionIsComplete = false;

    var metadata = {
        numpages: 5,
        dimensions: {
            width: 100,
            height: 100
        }
    };
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(metadata)
        });

    this.component.init();

    this.mock(this.components.page)
        .expects('init')
        .withArgs(sinon.match.object, sinon.match({
            status: Crocodoc.PAGE_STATUS_CONVERTING
        }))
        .exactly(metadata.numpages);

    this.component.loadAssets();
});

test('loadAssets() should broadcast "ready" when called', function () {
    this.stub(this.utilities.ajax, 'request')
        .yieldsToOn('success', {
            responseText: JSON.stringify(this.metadata)
        });

    this.component.init();
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('ready', sinon.match.object);

    this.component.loadAssets();
});

test('destroy() should remove all Crocodoc-namespaced CSS classes from and empty the container element when called', function () {
    var $el = this.config.$el;
    this.component.init();
    this.component.destroy();
    ok($el.html().length === 0, 'HTML was emptied');
    ok($el.attr('class').indexOf('crocodoc') < 0, 'namespaced CSS classes were removed');
});

test('setLayout() should create and init a layout component instance when called with a valid layout type', function () {
    var layout = Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN;
    this.mock(this.scope)
        .expects('createComponent')
        .withArgs('layout-'+layout)
        .returns(this.components.layout);
    this.mock(this.components.layout)
        .expects('init');
    this.component.init();
    this.component.setLayout(layout);
});

test('setLayout() should remove a layout and scrollTo/zoomTo previous scroll/zoom when called with a valid layout type after a layout has already been set', function () {
    this.stub(this.scope, 'createComponent').returns(this.components.layout);
    this.component.init();
    this.component.setLayout(Crocodoc.LAYOUT_VERTICAL);

    this.mock(this.scope)
        .expects('destroyComponent')
        .withArgs(this.components.layout);
    this.mock(this.components.layout)
        .expects('setZoom')
        .withArgs(this.components.layout.state.zoomState.zoom);
    this.mock(this.components.layout)
        .expects('scrollTo')
        .withArgs(this.components.layout.state.currentPage);
    this.component.setLayout(Crocodoc.LAYOUT_HORIZONTAL);
});

test('setLayout() should not remove a previous layout or create a new one when called with the same layout mode', function () {
    this.component.init();

    this.mock(this.scope)
        .expects('createComponent')
        .once()
        .returns(this.components.layout);
    this.component.setLayout(Crocodoc.LAYOUT_VERTICAL);

    this.mock(this.scope)
        .expects('destroyComponent')
        .never();
    this.component.setLayout(Crocodoc.LAYOUT_VERTICAL);
});

test('onmessage() should call fire() when called with all subscribed messages except scroll, afterscroll, and linkclicked', function () {
    this.component.init($('<div>'), { });
    var spy = this.spy(this.viewerAPI, 'fire');
    for (var i = 0; i < this.component.messages.length; ++i) {
        var m = this.component.messages[i];
        this.component.onmessage(m, {});
        if (m === 'scroll' || m === 'afterscroll' || m === 'linkclicked') {
            ok(spy.neverCalledWith(m), 'fire was not called with '+m);
        } else {
            ok(spy.calledWith(m), 'fire was called with '+m);
        }
    }
});
