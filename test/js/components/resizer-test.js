module('Component - resizer', {
    setup: function () {
        var self = this;
        this.frameID = 100;
        this.utilities = {
            support: {
                requestAnimationFrame: sinon.stub().callsArgAsync(0).returns(this.frameID),
                cancelAnimationFrame: function () {}
            },
            common: Crocodoc.getUtility('common')
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('resizer', this.scope);
        this.clock = sinon.useFakeTimers();
    },
    teardown: function () {
        // disable fake timers
        this.clock.restore();
        this.component.destroy();
    }
});

test('destroy() should call support.cancelAnimationFrame when called', function () {
    this.component.init($('<div>'));

    this.mock(this.utilities.support)
        .expects('cancelAnimationFrame')
        .withArgs(this.frameID);
    this.component.destroy();
});


test('module should fire "resize" event with the proper data when initialized', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        },
        $el = $('<div>').css(data).appendTo(document.body);
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('resize', sinon.match(data));
    this.component.init($el);
});

test('module should fire "resize" event with the proper data when element is resized', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        },
        module = this.component,
        $el = $('<div>').css({
            width: 0,
            height: 0
        }).appendTo(document.body);

    module.init($el);
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('resize', sinon.match(data));
    setTimeout(function () {
        $el.css(data);
    }, 1);

    this.clock.tick(1);
    $el.remove();
});
