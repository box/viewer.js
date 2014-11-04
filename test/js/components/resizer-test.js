module('Component - resizer', {
    setup: function () {
        var self = this;
        this.utilities = {
            common: Crocodoc.getUtilityForTest('common'),
            dom: Crocodoc.getUtilityForTest('dom')
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('resizer', this.scope);
        this.el = this.utilities.dom.create('div');
        this.utilities.dom.appendTo(document.body, this.el);
    },
    teardown: function () {
        this.component.destroy();
        this.utilities.dom.remove(this.el);
    }
});

test('module should fire "resize" event with the proper data when initialized', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        };

    this.utilities.dom.css(this.el, data);

    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('resize', sinon.match(data));
    this.component.init(this.el);
});

asyncTest('module should fire "resize" event with the proper data when element is resized', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        },
        module = this.component;

    this.utilities.dom.css(this.el, {
        width: 0,
        height: 0
    });
    module.init(this.el);
    this.scope.broadcast = function (name, d) {
        equal(name, 'resize', 'resize event fired');
        equal(d.width, data.width, 'width is correct');
        equal(d.height, data.height, 'height is correct');
        QUnit.start();
    };

    this.utilities.dom.css(this.el, data);
});

test('onmessage() should trigger a resize message when called', function () {
    var w = 100, h = 200,
        data = {
            width: w,
            height: h
        };
    this.utilities.dom.css(this.el, data);
    this.component.init(this.el);
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('resize', sinon.match(data));
    this.component.onmessage('layoutchange');
});
