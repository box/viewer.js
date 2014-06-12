module('Plugin - realtime', {
    setup: function () {
        this.viewerAPI = {
            fire: function () {}
        };
        this.utilities = {
            common: Crocodoc.getUtility('common'),
            support: Crocodoc.getUtility('support')
        };
        // reset initial support
        this.utilities.support.svg = true;
        // the viewer config
        this.config = {
            api: this.viewerAPI,
            $el: $('<div>'),
            conversionIsComplete: true,
            numPages: 5
        };
        var fakeRealtime = new Crocodoc.EventTarget();
        this.realtime = {
            on: function (name, handler) {
                fakeRealtime.on(name, handler);
            },
            off: function () {},
            destroy: function () {}
        };
        this.fakeRealtime = fakeRealtime;
        this.RealtimeStub = sinon.stub(Crocodoc, 'Realtime').returns(this.realtime);
        this.scope = Crocodoc.getScopeForTest(this);
        this.plugin = Crocodoc.getPluginForTest('realtime', this.scope);
    },
    teardown: function () {
        this.plugin.destroy();
        this.RealtimeStub.restore();
    }
});

test('init() should create an instance of Crocodoc.Realtime when a realtime url is present', function () {
    var url = 'http://some.url/';
    this.plugin.init({
        url: url
    });
    ok(this.RealtimeStub.calledWith(url), 'realtime should be created');
});

test('init() should set the viewer config conversionIsComplete to false when a realtime url is present', function () {
    this.plugin.init({
        url: 'http://some.url/'
    });
    equal(this.config.conversionIsComplete, false, 'conversionIsComplete should be false');
});

test('destroy() should destroy the Realtime connection when called', function () {
    var spy = this.spy(this.realtime, 'destroy');
    this.plugin.init({
        url: 'http://some.url/'
    });
    this.plugin.destroy();
    ok(spy.called, 'realtime should be destroyed');
});

test('pageavailable message should be broadcast with the correct pages when pages become available (and after viewer is ready)', function () {
    var spy = this.spy(this.scope, 'broadcast');
    this.plugin.init({
        url: 'http://some.url/'
    });

    this.fakeRealtime.fire('pageavailable.svg', '{ "pages": [1,2] }');

    ok(spy.calledWith('pageavailable', sinon.match({ page: 1 })), 'pageavailable should be broadcast');
    ok(spy.calledWith('pageavailable', sinon.match({ page: 2 })), 'pageavailable should be broadcast');

    this.fakeRealtime.fire('pageavailable.svg', '{ "pages": [3] }');

    ok(spy.calledWith('pageavailable', sinon.match({ page: 3 })), 'pageavailable should be broadcast');
});

test('pageavailable message should be broadcast with all pages when conversion is complete (and after viewer is ready)', function () {
    var spy = this.spy(this.scope, 'broadcast');
    this.plugin.init({
        url: 'http://some.url/'
    });

    this.fakeRealtime.fire('finished.svg');

    ok(spy.calledWith('pageavailable', sinon.match({ all: true })), 'pageavailable should be broadcast');
});

test('realtimeupdate event should be fired when a new page becomes available', function () {
    var spy = this.spy(this.viewerAPI, 'fire'),
        page = 3,
        data = '{ "pages": ['+page+'] }';
    this.plugin.init({
        url: 'http://some.url/'
    });

    this.fakeRealtime.fire('pageavailable.svg', data);
    ok(spy.calledWith('realtimeupdate', sinon.match({ page: page })), 'realtimeupdate should be fired');
});

test('realtimeerror event should be fired when the document fails to convert', function () {
    var spy = this.spy(this.viewerAPI, 'fire');
    this.plugin.init({
        url: 'http://some.url/'
    });

    this.fakeRealtime.fire('failed.svg');
    ok(spy.calledWith('realtimeerror'), 'realtimeerror should be fired');
});

test('realtimeerror event should be fired when a realtime error occurs', function () {
    var spy = this.spy(this.viewerAPI, 'fire'),
        error = '{ "message": "the error" }';
    this.plugin.init({
        url: 'http://some.url/'
    });

    this.fakeRealtime.fire('error', error);
    ok(spy.calledWith('realtimeerror', sinon.match({ error: 'the error' })), 'realtimeerror should be fired');
});

test('Realtime connection should be destroyed when a realtime error occurs and the event data has close:true', function () {
    var spy = this.spy(this.realtime, 'destroy');
    this.plugin.init({
        url: 'http://some.url/'
    });
    this.fakeRealtime.fire('error', '{ "message": "foo", "close": true }');
    ok(spy.called, 'realtime should be destroyed');
});

test('init should subscribe to .png channels when svg is not supported', function () {
    var spy = this.spy(this.realtime, 'on');

    this.utilities.support.svg = false;
    this.plugin.init({
        url: 'http://some.url/'
    });

    ok(spy.calledWith('pageavailable.png'), 'png channel should be subscribed to');
    ok(spy.calledWith('finished.png'), 'png channel should be subscribed to');
    ok(spy.calledWith('failed.png'), 'png channel should be subscribed to');
});
