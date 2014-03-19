module('Framework - EventTarget', {
    setup: function() {
        this.eventTarget = new Crocodoc.EventTarget();
    }
});

test('fire() should call the registered event handler for the event when called with a custom event', function() {
    this.eventTarget.on('myevent', this.mock());
    this.eventTarget.fire('myevent');
});

test('fire() should call all registered event handlers for the event when called with a custom event', function() {
    this.eventTarget.on('myevent', this.mock());
    this.eventTarget.on('myevent', this.mock());
    this.eventTarget.fire('myevent');
});

test('fire() should only call the event handlers registered for the event when called with a custom event', function() {
    this.eventTarget.on('myevent1', this.mock());
    this.eventTarget.on('myevent2', this.mock().never());
    this.eventTarget.fire('myevent1');
});

test('fire() should call the event handler with a custom event object for custom event when called with a custom event object', function() {
    var handler = this.mock().withArgs({
        type: 'myevent',
        data: undefined
    });

    this.eventTarget.on('myevent', handler);
    this.eventTarget.fire('myevent');
});

test('fire() should call the event handler with a custom event object and extra data for custom event when called with extra data', function() {
    var handler = this.mock().withArgs({
        type: 'myevent',
        data: {
            foo: 'bar',
            time: 'now'
        }
    });

    this.eventTarget.on('myevent', handler);
    this.eventTarget.fire('myevent', {
        foo: 'bar',
        time: 'now'
    });
});

test('fire() should not call the event handler for custom event when off() is called for that event handler', function() {
    var handler = sinon.spy();
    this.eventTarget.on('myevent', handler);

    this.eventTarget.off('myevent', handler);

    this.eventTarget.fire('myevent');
    ok(handler.notCalled);
});

test('registered event handler should be called only once when attached with one()', function () {
    this.eventTarget.one('myevent', this.mock().once());
    this.eventTarget.fire('myevent');
    this.eventTarget.fire('myevent');
});

test('registered event handler should be removed when attached with one() and off() is called for that handler', function () {
    var handler = this.mock().never();
    this.eventTarget.one('myevent', handler);
    this.eventTarget.off('myevent', handler);
    this.eventTarget.fire('myevent');
});

test('off() should remove all event handlers for a given type when called without a handler', function () {
    var handler1 = this.mock().never();
    var handler2 = this.mock().never();
    this.eventTarget.on('myevent', handler1);
    this.eventTarget.on('myevent', handler2);
    this.eventTarget.off('myevent');
    this.eventTarget.fire('myevent');
});

test('Event handler should be called even after another event handler for the same type removes itself', function() {

    var handler1 = function () {
            // this handler removes itself
            this.off('myevent', handler1);
        },
        handler2 = sinon.spy();

    this.eventTarget.on('myevent', handler1);
    this.eventTarget.on('myevent', handler2);

    this.eventTarget.fire('myevent');
    ok(handler2.called);
});

