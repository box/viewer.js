module('Component - resizer', {
    setup: function () {
        var self = this;
        this.utilities = {
            common: Crocodoc.getUtilityForTest('common')
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('resizer', this.scope);
    },
    teardown: function () {
        this.component.destroy();
    }
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

asyncTest('module should fire "resize" event with the proper data when element is resized', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        },
        module = this.component,
        $el = $('<div>').css({
            position: 'absolute',
            width: 0,
            height: 0
        }).appendTo(document.body);

    module.init($el);

    this.scope.broadcast = function (name, d) {
        equal(name, 'resize', 'resize event fired');
        equal(d.width, data.width, 'width is correct');
        equal(d.height, data.height, 'height is correct');
        QUnit.start();
    };

    $el.css(data);
});

test('onmessage() should trigger a resize message when called', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        },
        $el = $('<div>').css(data).appendTo(document.body);
    this.component.init($el);
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('resize', sinon.match(data));
    this.component.onmessage('layoutchange');
});
