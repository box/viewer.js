module('Famework - Scope', {
    setup: function () {
        this.framework = Crocodoc;
        this.scope = new Crocodoc.Scope(this.framework);
    },
    teardown: function () {
        this.scope.destroy();
    }
});

test('createComponent() should call framework.createComponent() with the component name and `this` as arguments when called for an existing component', function () {
    var componentName = 'component 1',
        testComponent = function () {};

    this.framework.addComponent(componentName, testComponent);
    this.mock(this.framework)
        .expects('createComponent')
        .withArgs(componentName, this.scope);
    this.scope.createComponent(componentName);
});

test('destroyComponent() should call the destroy() method on the instance when called with a component instance that implements destroy()', function () {
    var componentName = 'component 1',
        testComponent = function () {
            return {
                destroy: function () {}
            };
        };

    this.framework.addComponent(componentName, testComponent);
    var component = this.scope.createComponent(componentName);
    this.mock(component)
        .expects('destroy');
    this.scope.destroyComponent(component);
});

test('destroy() should call the destroy() method on any component instance that implements destroy() when called', function () {
    var component1, component2,
        componentName1 = 'component 1',
        componentName2 = 'component 2',
        testComponent1 = function () {
            return {
                destroy: function () {}
            };
        },
        testComponent2 = function () {
            return {
                destroy: function () {}
            };
        };

    this.framework.addComponent(componentName1, testComponent1);
    this.framework.addComponent(componentName2, testComponent2);
    component1 = this.scope.createComponent(componentName1);
    component2 = this.scope.createComponent(componentName2);
    this.mock(component1)
        .expects('destroy');
    this.mock(component2)
        .expects('destroy');
    this.scope.destroy();
});

test('broadcast() should only call the onmessage() method on component instance when called with a message that the component has registered interest in', function () {
    var component, componentMock,
        data = { some: 'data' },
        componentName = 'component 1',
        testComponent = function () {
            return {
                messages: ['test'],
                onmessage: function () {}
            };
        };

    this.framework.addComponent(componentName, testComponent);
    component = this.scope.createComponent(componentName);
    componentMock = this.mock(component);
    componentMock.expects('onmessage')
        .withArgs('test', data);
    this.scope.broadcast('test', data);

    componentMock.expects('onmessage').never();
    this.scope.broadcast('test 2');
});

test('getUtility() should call framework.getUtility() when called', function () {
    var utilName = 'some utility';
    this.mock(this.framework)
        .expects('getUtility')
        .withArgs(utilName);
    this.scope.getUtility(utilName);
});
