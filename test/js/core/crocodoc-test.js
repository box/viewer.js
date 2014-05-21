
module('Framework - Utilities');

test('getUtility() should call the creator function with the framework as an argument when called for an existing utility', function() {
    Crocodoc.addUtility('utility 1', this.mock().withArgs(Crocodoc));
    Crocodoc.getUtility('utility 1');
});

test('getUtility() should return the object that is returned from the creator function when called for an existing utility', function() {
    var testService = {};

    Crocodoc.addUtility('utility 2', this.stub().returns(testService));

    equal(Crocodoc.getUtility('utility 2'), testService, 'constructed utility returned');
});

test('getUtility() should return the same object for each call when called for the same utility multiple times', function() {
    Crocodoc.addUtility('utility 3', this.mock().once().returns({}));

    var first = Crocodoc.getUtility('utility 3');
    var second = Crocodoc.getUtility('utility 3');
    equal(first, second, 'same utility returned');
});

test('getUtility() should return null when called for a non-existing utility', function() {
    var utility = Crocodoc.getUtility('non-existing');
    equal(utility, null, 'null returned');
});

module('Framework - Components');

test('createComponent() should call the creator function with the passed scope as an argument when called for an existing module', function () {
    var testScope = {};
    Crocodoc.addComponent('module 1', this.mock().withArgs(testScope));
    Crocodoc.createComponent('module 1', testScope);
});

test('createComponent() should call the creator function with the correct mixin components as arguments when called for an existing module that has requested mixins', function () {
    var testScope = {}, base1 = { foo: 'bar' }, base2 = { bar: 'foo' };
    Crocodoc.addComponent('module base1', function () { return base1; });
    Crocodoc.addComponent('module base2', function () { return base2; });
    Crocodoc.addComponent('module 1', ['module base1','module base2'], this.mock().withArgs(testScope, base1, base2));
    Crocodoc.createComponent('module 1', testScope);
});

test('addComponent() should throw an error when called with a module name and mixins list that contains a circular dependency', function () {
    Crocodoc.addComponent('base1', ['base2'], function () {});
    throws(
        function () {
            Crocodoc.addComponent('base2', ['base1'], function () {});
        },
        'Exception was thrown'
    );
});

test('createComponent() should return null when called for a non-existing module', function() {
    var module = Crocodoc.createComponent('non-existing', {});
    equal(module, null, 'null returned');
});

test('addDataProvider() should call addComponent when a model name and creator function are passed in', function() {
    this.mock(Crocodoc).expects('addComponent');
    Crocodoc.addDataProvider('my-data-provider', function () {});
});

module('Framework - createViewer', {
    setup: function () {
        this.scope = {
            createComponent: function () {

            }
        };
        this.viewerAPI = {
            init: function () {}
        };
        this.scopeStub = sinon.stub(Crocodoc, 'Scope').returns(this.scope);
    },
    teardown: function () {
        this.scopeStub.restore();
    }
});

test('createViewer() should return a new instance of Crocodoc.Viewer when called', function () {
    var el = $(), options = {};

    this.mock(Crocodoc)
        .expects('Viewer')
        .withArgs(el, options)
        .returns(this.viewerAPI);
    var instance = Crocodoc.createViewer(el, options);
    ok(this.viewerAPI === instance, 'returned the viewer instance');
});
