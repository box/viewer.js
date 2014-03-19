# Javascript Code Structure

The Crocodoc Viewer uses a modular code structure consisting of the [core framework](#core), [components](#components), [utilities](#utilities), and [plugins](#plugins).

## Core

Core files are used to define the `Crocodoc` namespace and core functionality and defaults on top of it.

**`core/crocodoc.js`**
* Defines the `Crocodoc` namespace and constants.
* Defines API for creating viewer instances.
    - `createViewer`: create a viewer instance
* Defines API for creating and retrieving components, Utilities, and plugins.
    - `addComponent`: register a new named component
    - `createComponent`: create an instance of a nambed component with a given scope
    - `addUtility`: register a new named utility
    - `getUtility`: create (if not already created) and return an instance of the named utility
    - `addPlugin`: register a new named plugin

**`core/event-target.js`**
* Defines `Crocodoc.EventTarget`, which is used as a mixin to other objects to turn them into Event targets.

**`core/scope.js`**
* Defines `Crocodoc.Scope`, which is used as a channel for broadcasting messages between components and creating/destroying other component instances within the scope of a single viewer instance. An instance of `Crocodoc.Scope`, which is unique to a viewer instance, must be passed to all components during instantiation.

**`core/viewer.js`**
* Defines the viewer API
* Defines the global default options for new viewer instances


## Components

Components are individual pieces of the viewer that can be instantiated and destroyed throughout the life of a viewer instance. A components's creator function is expected to return an instance of the component. They are tied to a `Crocodoc.Scope` object, through which they can broadcast messages to other components in the same scope (a scope is unique to a viewer instance). components can expose several properties and methods that will be used by the framework when appropriate:
* `messages` - (array) a list of message names that this component would like to listen for
* `onmessage()` - called when some component broadcasts one of the messages named in `messages`
* `destroy()` - called when the associated `Crocodoc.Scope` instance is destroyed, which happens when the `destroy()` method is called on the associated viewer instance

*Note: many components implement an `init()` method; unlike plugins, this method is* not *invoked automatically by the framework.*

### _When should I use components?_
**When you are adding built-in functionality to viewer.js. This is most likely NOT the case. In most cases you'll want a [plugin](#plugins).**

Example:
```js
// Crocodoc.addComponent takes a name and creator function,
// which should return an instance of the component when called.
Crocodoc.addComponent('my-component', function (scope) {
    // the public API of this component
    return {
        // register interest in the `ready` message
        messages: ['ready'],

        // handle messages
        onmessage: function (messageName, messageData) {
            if (messageName === 'ready') {
                alert('Document loaded with ' + messageData.numPages + ' pages!');
            }
        },

        // destroy is called automatically when the viewer is destroyed
        destroy: function () {
            // there's nothing to cleanup in this component, but this 
            // would be a good place to do so otherwise
            console.log('goodbye cruel world');
        }
    };
});
```


## Utilities

Utilities are reusable pieces of functionality that are instantiated the first time they are used (in the life of a page, ie., global to the `Crocodoc` namespace, and not just a single viewer instance). They can be requested by calling `getUtility(name)` on the scope object (or on the `Crocodoc` namespace if called within another utility). A utility's creator function is expected to return an object with properties and methods specific to that utility.

### _When should I use utilities?_
**When you are adding reusable methods or properties that should not be associated with a specific viewer instance.**

Example:
```js
// Crocodoc.addUtility takes a name and creator function, 
// which should return the utility when called.
Crocodoc.addUtility('math', function () {
    // optional initialization code for this utility would go here

    // let's create some additional math functions
    return {
        sum: function () {
            return [].reduce.call(arguments, function (a, b) {
                return a + b;
            });
        },
        mean: function () {
            if (arguments.length > 0) {
                return this.sum.apply(this, arguments) / arguments.length;
            }
        }
    };
});

// The first time a utility is used, its creator function will be called.
// The return value is then cached and becomes the utility.
var myUtil = Crocodoc.getUtility('math');
myUtil.sum(1, 2, 3);
// 6

// Each additional call to getUtility will return the exact same object
var myUtil2 = Crocodoc.getUtility('math');
myUtil === myUtil2
// true
```


## Plugins

Plugins are external modules that behave like privileged components. Much like components, they are passed the `Crocodoc.Scope` object associated with a viewer instance when loaded. They can expose the same properties and methods as components, in addition to an `init()` method, which is invoked automatically when the the viewer is initialized.

### _When should I use plugins?_
**When you need to add application-specific functionality to viewer instances. Plugins are external to the main viewer.js codebase, and should not be included in this repo.**

[//]: # (TODO: elaborate on contributing plugins)

Example:
```js
// The plugin interface is very similar to the component interface, in that you pass a name and a creator function.
Crocodoc.addPlugin('my-plugin', function (scope) {

    // the public API of this component
    return {
        // register interest in the `ready` message
        messages: ['ready'],

        // handle messages
        onmessage: function (messageName, messageData) {
            if (messageName === 'ready') {
                alert('Document loaded with ' + messageData.numPages + ' pages!');
            }
        },

        // init is called with the plugin's config when the viewer is loaded
        init: function (pluginConfig) {
            console.log(pluginConfig);
        },

        // destroy is called automatically when the viewer is destroyed
        destroy: function () {
            // there's nothing to cleanup in this plugin, but this
            // would be a good place to do so otherwise
            console.log('goodbye cruel world');
        }
    };
});

// to use the plugin, simply add it to the plugins config when instantiating a viewer
var viewer = Crocodoc.createViewer('.viewer', {
    url: '/some/url/to/assets',
    plugins: {
        'my-plugin': { /* your plugin config here */ }
    }
});
```
