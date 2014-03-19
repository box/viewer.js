module('Component - scroller', {
    setup: function () {
        var self = this;
        this.frameID = 100;
        this.utilities = {
            common: Crocodoc.getUtility('common')
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.clock = sinon.useFakeTimers();
        this.clock.tick(200);
        this.component = Crocodoc.getComponentForTest('scroller', this.scope);
        this.$el = $('<div>');
        this.component.init(this.$el);
    },
    teardown: function () {
        // disable fake timers
        this.clock.restore();
        this.component.destroy();
    }
});

test('scroller should broadcast scrollstart and scroll message when scroll event is fired', function () {
    var broadcastSpy = this.spy(this.scope, 'broadcast');
    this.$el.trigger('scroll');
    this.clock.tick(200);
    ok(broadcastSpy.calledWith('scrollstart', sinon.match.object), 'broadcasted scrollstart message');
    ok(broadcastSpy.calledWith('scroll', sinon.match.object), 'broadcasted scroll message');
});

test('scroller should not broadcast the scrollstart message more than once when scroll event is fired', function () {
    var broadcastSpy = this.spy(this.scope, 'broadcast');
    this.$el.trigger('scroll');
    this.clock.tick(100);
    this.$el.trigger('scroll');
    this.clock.tick(100);
    this.$el.trigger('scroll');
    this.clock.tick(100);
    ok(broadcastSpy.withArgs('scrollstart', sinon.match.object).calledOnce, 'broadcasted scrollstart message');
});

test('scroller should broadcast scrollend message when scroll event is fired', function () {
    this.$el.trigger('scroll');
    // ignore the expected scroll message
    this.clock.tick(200);
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('scrollend', sinon.match.object);
    this.clock.tick(200);
});

test('scroller should broadcast scroll message when touchstart event is fired', function () {
    this.$el.trigger('touchstart');
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('scroll', sinon.match.object);
    this.clock.tick(200);
});

test('scroller should broadcast scroll message when touchmove event is fired', function () {
    this.$el.trigger('touchmove');
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('scroll', sinon.match.object);
    this.clock.tick(200);
});

test('scroller should broadcast scroll messages and eventually an scrollend message when touchstart, touchmove, and touchend event is fired', function () {
    var broadcastSpy = sinon.spy(this.scope, 'broadcast');
    this.$el.trigger('touchstart');
    this.$el.trigger('touchmove');
    this.$el.trigger('touchend');
    this.clock.tick(4000);
    ok(broadcastSpy.calledWith('scroll'), 'broadcasted scroll message');
    ok(broadcastSpy.calledWith('scrollend'), 'broadcasted scrollend message');
});
