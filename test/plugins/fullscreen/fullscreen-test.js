module('Plugin - fullscreen', {
    setup: function () {
        this.viewerAPI = {
            fire: function () {}
        };
        this.utilities = {
            dom: Crocodoc.getUtilityForTest('dom'),
            common: Crocodoc.getUtilityForTest('common')
        };
        this.config = {
            api: this.viewerAPI,
            el: document.body
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.plugin = Crocodoc.getPluginForTest('fullscreen', this.scope);
    }
});

test('init() should extend the viewer API with the proper methods when called', function () {
    this.plugin.init();
    equal(typeof this.viewerAPI.enterFullscreen, 'function', 'enterFullscreen');
    equal(typeof this.viewerAPI.exitFullscreen, 'function', 'exitFullscreen');
    equal(typeof this.viewerAPI.isFullscreen, 'function', 'isFullscreen');
    equal(typeof this.viewerAPI.isFullscreenSupported, 'function', 'isFullscreenSupported');
});

test('init() should use documentElement as the fullscreen element when viewer is using window as viewport', function () {
    var spy = this.spy(window, '$');
    this.config.useWindowAsViewport = true;
    this.plugin.init({
        useFakeFullscreen: true
    });

    this.viewerAPI.enterFullscreen();
    this.viewerAPI.exitFullscreen();
    ok(spy.calledWith(document.documentElement), 'documentElement should be used');
});

test('enterFullscreen() should call the proper function on the context of the element when called', function () {
    var el = {
        requestFullscreen: this.spy()
    };
    this.plugin.init({
        element: el
    });

    this.viewerAPI.enterFullscreen();
    ok(el.requestFullscreen.calledOn(el), 'requestFullscreen should be called on el');
});

test('exitFullscreen() should call the proper function on the context of the document when called', function () {
    document.cancelFullScreen = this.spy();
    this.plugin.init();

    this.viewerAPI.exitFullscreen();
    ok(document.cancelFullScreen.calledOn(document), 'cancelFullScreen should be called on document');
});

test('enterFullscreen should enter fake fullscreen mode when called and native fullscreen is not supported', function () {
    var el = {},
        spy = this.spy();
    this.stub(window, '$').returns({
        addClass: spy,
        on: this.stub(),
        off: this.stub(),
        0: el
    });
    this.plugin.init({
        element: el,
        useFakeFullscreen: true
    });

    this.viewerAPI.enterFullscreen();
    ok(spy.calledWith('crocodoc-fakefullscreen'), 'should add class .crocodoc-fakefullscreen');
});

test('exitFullscreen should exit fake fullscreen mode when called and native fullscreen is not supported', function () {
    var el = {},
        spy = this.spy();
    this.stub(window, '$').returns({
        addClass: function () {},
        removeClass: spy,
        on: this.stub(),
        off: this.stub(),
        0: el
    });

    // all these properties are tested against before falling into fake fullscreen mode
    document.cancelFullScreen =
    document.exitFullscreen =
    document.mozCancelFullScreen =
    document.webkitCancelFullScreen =
    document.msExitFullscreen = null;

    this.plugin.init({
        element: el,
        useFakeFullscreen: true
    });

    this.viewerAPI.enterFullscreen();
    this.viewerAPI.exitFullscreen();
    ok(spy.calledWith('crocodoc-fakefullscreen'), 'should remove class .crocodoc-fakefullscreen');
});

test('destroy() should exit fullscreen mode when called', function () {
    this.plugin.init();
    var spy = this.spy(this.viewerAPI, 'exitFullscreen');
    this.plugin.destroy();
    ok(spy.called, 'should exit fullscreen');
});
