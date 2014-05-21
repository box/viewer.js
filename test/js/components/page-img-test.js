module('Component - page-img', {
    setup: function () {
        var self = this;
        this.utilities = {
            browser: {}
        };
        this.scope = Crocodoc.getScopeForTest(this);

        this.component = Crocodoc.getComponentForTest('page-img', this.scope);
        this.$el = $('<div>');
        this.pageNum = 3;
    }
});

test('preload() should make a request for the image when called', function () {
    this.mock(this.scope)
        .expects('get')
        .withArgs('page-img', this.pageNum)
        .returns($.when());

    this.component.init(this.$el, this.pageNum);
    this.component.preload();
});

test('load() should preload the image when called', function () {
    this.stub(this.scope, 'get')
        .withArgs('page-img', this.pageNum)
        .returns($.when());

    var spy = this.spy(this.component, 'preload');

    this.component.init(this.$el, this.pageNum);
    this.component.load();

    ok(spy.called, 'image should be preloaded');
});

test('load() should embed the image when the image successfully loads', function () {
    var img = new Image();
    this.stub(this.scope, 'get')
        .withArgs('page-img', this.pageNum)
        .returns($.Deferred().resolve(img).promise());

    this.component.init(this.$el, this.pageNum);
    this.component.load();

    ok(this.$el.find('img').length > 0, 'image should be embedded');
});

test('load() should broadcast an asseterror message when the image fails to load', function () {
    var error = { message: 'not found' };
    var mock = this.mock(this.scope);
    mock.expects('get')
        .withArgs('page-img', this.pageNum)
        .returns($.Deferred().reject(error).promise());

    mock.expects('broadcast')
        .withArgs('asseterror', error);

    this.component.init(this.$el, this.pageNum);
    this.component.load();
});

test('destroy() should unload the img and empty the element when called', function () {
    var img = new Image();
    this.stub(this.scope, 'get')
        .withArgs('page-img', this.pageNum)
        .returns($.Deferred().resolve(img).promise({ abort: function () {} }));

    var spy = this.spy(this.component, 'unload');

    this.component.init(this.$el, this.pageNum);
    this.component.load();

    this.component.destroy();
    ok(this.$el.html() === '', 'the element should be emptied');
    ok(spy.called, 'the img component should be unloaded');
});

test('unload() should abort the request if there is one when called', function () {
    var pageNum = 3,
        $deferred = $.Deferred().resolve(new Image());

    var spy = this.spy();

    this.stub(this.scope, 'get')
        .withArgs('page-img', pageNum)
        .returns($deferred.promise({ abort: spy }));

    this.component.init(this.$el, pageNum);
    this.component.load();
    this.component.unload();

    ok(spy.called, 'request should be aborted');
});
