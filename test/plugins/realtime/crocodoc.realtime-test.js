module('Plugin support - Crocodoc.Realtime', {
    setup: function () {
        this.eventSourceIntance = {
            addEventListener: function () {},
            removeEventListener: function () {},
            close: function () {}
        };
        this.Realtime = Crocodoc.Realtime;
        this.EventSource = sinon.stub().returns(this.eventSourceIntance);
    },
    teardown: function () {
        if (this.realtime) {
            this.realtime.destroy();
        }
    }
});

test('constructor should throw an error if EventSource is not available', function () {
    var self = this;
    throws(function () {
        self.realtime = new self.Realtime('', null);
    }, 'constructor should throw an error');
});

test('constructor should create an instance of EventSource with the given url when called', function () {
    var url = 'test';
    this.realtime = new this.Realtime(url, this.EventSource);
    ok(this.EventSource.calledWith(url), 'EventSource should be created with the given url');
});

test('on() should register a new event listener when called', function () {
    var name = 'myevent',
        handler = function () {};
    this.mock(this.eventSourceIntance)
        .expects('addEventListener')
        .withArgs(name, handler, false);

    this.realtime = new this.Realtime('', this.EventSource);
    this.realtime.on(name, handler);
});

test('off() should remove the specified event listener when called', function () {
    var name = 'myevent',
        handler = function () {};
    this.mock(this.eventSourceIntance)
        .expects('removeEventListener')
        .withArgs(name, handler);

    this.realtime = new this.Realtime('', this.EventSource);
    this.realtime.off(name, handler);
});
