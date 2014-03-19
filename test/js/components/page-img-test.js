module('Component - page-img', {
    setup: function () {
        var self = this;
        this.utilities = {
            browser: {}
        };
        this.scope = Crocodoc.getScopeForTest(this);

        this.component = Crocodoc.getComponentForTest('page-img', this.scope);
        this.$el = $('<div>');
        this.$deferred = {
            resolve: sinon.spy(),
            reject: sinon.spy()
        };
        this.config =  {
            imgSrc: 'fail.png'
        };
        this.component.init(this.$el, this.config);

        this.oldImage = window.Image;
        this.image = new Image();
        window.Image = function Image() {
            return self.image;
        };
    },
    teardown: function () {
        window.Image = this.oldImage;
    }
});

test('load() should create and append an Image when called for the first time', function () {
    this.component.load();
    ok(this.$el.find('img').length > 0, 'Image exists in $el');
});

test('load() should resolve the $.Deferred object when called for the first time and the image loads', function () {
    this.stub($, 'Deferred').returns(this.$deferred);
    var event = document.createEvent('Event');
    event.initEvent('load', true, false);

    this.component.load();
    this.image.dispatchEvent(event);

    ok(this.$deferred.resolve.calledOnce, '$deferred was resolved');
});

test('load() should reject the $.Deferred object when called for the first time and the image fails to load', function () {
    this.stub($, 'Deferred').returns(this.$deferred);
    var event = document.createEvent('Event');
    event.initEvent('error', true, false);

    this.component.load();
    this.image.dispatchEvent(event);

    ok(this.$deferred.reject.calledOnce, '$deferred was rejected');
});

test('load() should immediately resolve the $.Deferred object and not create another Image when called after the page successfully loads', function () {
    this.stub($, 'Deferred').returns(this.$deferred);
    var imageSpy = this.spy(window, 'Image');
    var event = document.createEvent('Event');
    event.initEvent('load', true, false);

    this.component.load();
    this.image.dispatchEvent(event);

    this.component.load();

    ok(imageSpy.calledOnce, 'Image created only once');
    ok(this.$deferred.resolve.calledTwice, '$deferred was resolved twice');
});

// @TODO: add a few more tests (for unload)
