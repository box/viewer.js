# Viewer.js

A viewer for documents converted with the [Box View API](http://developers.box.com/view/).

## Contents
* [Quick Start](#quick-start)
    - [Loading a Simple Viewer](#loading-a-simple-viewer)
* [Logos](#logos)
* [Documentation](#documentation)
    - [Library Methods](#library-methods)
    - [Viewer Config](#viewer-config)
    - [Viewer Methods](#viewer-methods)
    - [Event Handling](#event-handling)
    - [Setting the Layout Mode](#setting-the-layout-mode)
    - [Plugins](#plugins)
* [Browser Support](#browser-support)
* [Contributing](#contributing)
* [Getting Started with the Code](#getting-started-with-the-code)
    - [Grunt](#grunt)
    - [Logo Options](#logo-options)
* [Change Log](#change-log)
* [Copyright and License](#copyright-and-license)

## Quick Start

### Loading a Simple Viewer

`Crocodoc.createViewer(element, config)`

Example
```html
<link rel="stylesheet" href="crocodoc.viewer.min.css">
<script type="text/javascript" src="jquery.min.js">
<script type="text/javascript" src="crocodoc.viewer.min.js">
<div class="viewer" style="height: 100%"></div>
<script type="text/javascript">
    var viewer = Crocodoc.createViewer('.viewer', {
        url: 'https://view-api.box.com/1/sessions/<session_id>/assets/'
    });
    viewer.load();
</script>
```


## Logos

As per section 2.6 of our agreement of our [API terms](http://developers.box.com/box-view-terms/), we require that all apps using Box View with the Standard tier conspicuously display a Box logo when displaying Box View documents. An [approved logo](src/images/logo.png) is included within this repository. If your Box View plan permits custom branding of the viewer, please refer to [Logo Options](#logo-options) for instructions on how to build the viewer without the Box logo or with a custom logo.


## Documentation

### Library Methods

**Crocodoc.createViewer(element, config)**

Create and return a viewer instance initialized with the given parameters.

* `element` the DOM element to initialize the viewer into
    - `string`: a query selector
    - `Element`: a DOM Element
    - `Object`: a jQuery object
* `config` the configuration object


**Crocodoc.addPlugin(pluginName, creatorFn)**

Register a new plugin with the framework. See [Plugins](#plugins) for more details.

* `pluginName` the name of the plugin
* `creatorFn` a function that creates and returns an instance of the plugin (which should be an object) when called


### Viewer Config

The only required config parameter is `url`. All others are optional.

**url (required)**

The base URL where the document assets are located. Viewer.js will look for document assets (including `info.json`, `stylesheet.css`, etc) in this path.


**layout**

The layout mode to use. Default `Crocodoc.LAYOUT_VERTICAL`. See [Setting the Layout Mode](#setting-the-layout-mode) for available layouts.


**zoom**

The initial zoom level to use. Default `Crocodoc.ZOOM_AUTO`. Possible values are:
* `Crocodoc.ZOOM_FIT_WIDTH` - zooms to fit the width of the (largest) page within the viewport
* `Crocodoc.ZOOM_FIT_HEIGHT` - zooms to fit the height of the (largest) page within the viewport
* `Crocodoc.ZOOM_AUTO` - zooms to best fit the document within the viewport


**page**

The initial page number to scroll to immediately when the document loads. Default: `1`.


**enableTextSelection**

If true, text selection will be enabled for this document. Default: `true`. *Note: text selection is not supported in IE 8 see [Browser Support](#browser-support) for more information.*


**enableLinks**

If true, embedded hyperlinks will be enabled for this document. Default: `true`.


**enableDragging**

If true, click-and-drag scrolling will be enabled for this document. Default: `false`. **NOTE: text selection is not fully supported when dragging is enabled. It is recommended that you disable text selection if you plan to enable dragging.**


**plugins**

Specify a map of plugin names to their configs. Plugin names specified in this object will be loaded when the viewer is initialized. See [Plugins](#plugins) for more details.

Example:
```js
{
    plugins: {
        // my-plugin will be initialized with the following config
        'my-plugin': {
            foo: 1,
            bar: 2
        }
    }
}
```


**queryParams**

Optional query string parameters to append to each asset request (eg., `info.json` or `page-1.svg`). Can be an object or string. Default: `null`.

Examples:
```js
// as a string
{
    queryParams: 'hello=world&foo=bar'
}

// as an object
{
    queryParams: {
        hello: 'world',
        foo: ['bar', 'baz']
    }
}
```


### Viewer Methods

**destroy()**

Removes and cleans up the viewer instance.


**on(name, handler)**

Binds an event handler for the specified event name fired by the viewer object. Events are described below.


**off(name[, handler])**

Unbinds an event handler for the specified event name and handler fired by the viewer object. If `handler` is not given, unbinds all event handlers on this viewer object with the given name.


**scrollTo(page)**

Scrolls to the specified page. The `page` argument may be one of the following:
* `(number)` - scroll the the specified page number
* `Crocodoc.SCROLL_PREVIOUS` - scroll to the previous page
* `Crocodoc.SCROLL_NEXT` - scroll to the next page

Examples
```js
// scroll to page 2
viewer.scrollTo(2);

// scroll to the next page
viewer.scrollTo(Crocodoc.SCROLL_NEXT);
```


**zoom(val)**

Sets the zoom level of the document. Possible values:
* `Crocodoc.ZOOM_FIT_WIDTH` - zooms to fit the width of the (largest) page within the viewport
* `Crocodoc.ZOOM_FIT_HEIGHT` - zooms to fit the height of the (largest) page within the viewport
* `Crocodoc.ZOOM_AUTO` - zooms to best fit the document within the viewport
* `Crocodoc.ZOOM_IN` - zooms in
* `Crocodoc.ZOOM_OUT` - zooms out

Examples
```js
// zoom in
viewer.zoom(Crocodoc.ZOOM_IN);

// zoom to fit width
viewer.zoom(Crocodoc.ZOOM_FIT_WIDTH);
```


**setLayout(mode)**

Set the layout mode. See [Setting the Layout Mode](#setting-the-layout-mode) for available layouts.

Examples
```js
viewer.setLayout(Crocodoc.LAYOUT_PRESENTATION);
```


### Event Handling

The viewer object fires several different events. You can add and remove event listeners using the `on` and `off` methods.

Example
```js
// ready event fires when the document metadata has loaded
// and the viewer is ready to be interacted with
viewer.on('ready', function (ev) {
    console.log('the viewer is ready, and the document has ' + ev.data.numPages + ' pages');
});
```


**Viewer Events**

* `asseterror` Triggered if any asset fails to load. Event properties:
    * `error` - the error message
    * `resource` - the url of the resource that failed to load
    * `status` - the http status code
* `destroy` Triggered when the document viewer is purposely destroyed with the destroy method.
* `fail` Triggered if the document fails to load. Event properties:
    * `error` - the error details
* `ready` Triggered as soon as a document becomes viewable. Event properties:
    * `page` - the current page
    * `numPages` - total number of pages in the document
* `resize` Triggered when the viewer is resized. Event properties:
    * `width` - the viewport width
    * `height` - the viewport height
* `scrollstart` Triggered when the user starts scrolling. Event properties:
    * `scrollTop` - the scrollTop position of the viewport
    * `scrollLeft` - the scrollLeft position of the viewport
* `scrollend` Triggered when the user stops scrolling (or when the content stops moving if there is a momentum effect). Event properties:
    * `scrollTop` - the scrollTop position of the viewport
    * `scrollLeft` - the scrollLeft position of the viewport
* `zoom` Triggered when the zoom value changes. Event properties:
    * `zoom` - current zoom value
    * `zoomMode` - current zoom mode (string or null)
    * `canZoomOut` - whether the viewer is able to zoom out (boolean)
    * `canZoomIn` - whether the viewer is able to zoom in (boolean)

**Page Events**

* `pagefocus` Triggered whenever a new page is scrolled into view. Event properties:
    * `page` - page number
* `pageload` Triggered whenever a page is loaded. Event properties:
    * `page` - page number
* `pageunload` Triggered whenever a page is unloaded to improve performance. Event properties:
    * `page` - page number
* `pagefail` Triggered if a page fails to load. Event properties:
    * `error` - the error details
    * `page` - page number of the failed page


### Setting the Layout Mode

You can set a layout initially via the configuation object:

```js
var viewer = Crocodoc.createViewer('.viewer', {
    url: 'https://view-api.box.com/1/sessions/<session_id>/assets/',
    layout: Crocodoc.LAYOUT_HORIZONTAL
});
```

Or via the `setLayout` method:

```js
viewer.setLayout(Crocodoc.LAYOUT_PRESENTATION);
```

The currently supported layouts are:
* `Crocodoc.LAYOUT_VERTICAL` Pages are scrolled vertically and arranged into one or more columns depending upon the current zoom.
* `Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN` Pages are scrolled vertically and arranged into a single column even when zoomed out.
* `Crocodoc.LAYOUT_HORIZONTAL` Pages within the viewer are horizontally and arranged into a single row.
* `Crocodoc.LAYOUT_PRESENTATION` One page is shown at a time with no scrolling. Custom transitions may be used to switch between pages.

NOTE: `.crocodoc-page` and `.crocodoc-page-inner` classes can be used to style pages, but there are some important restrictions:
* `.crocodoc-page`: padding should be used to adjust page spacing (never use margin for this)
* `.crocodoc-page`: background should be transparent, unless you want the background to also appear as a border (based on the padding size) - use `.crocodoc-page-inner` for changing the background of pages


### Plugins

Plugins are reusable components that can hook into viewer.js instances to add functionality. Plugins are initialized when a viewer instance is created and have their own configuration options.

[//]: # (TODO: expand this section)

Example:
```js
// add a plugin that tracks how long a user was on each page
Crocodoc.addPlugin('analytics', function (scope) {
    var currentPage,
        startTime,
        config;

    function track(page) {
        var elapsed,
            now = Date.now();
        if (currentPage) {
            elapsed = now - startTime;
            if (typeof config.ontrack === 'function') {
                config.ontrack(currentPage, elapsed / 1000);
            }
        }
        startTime = now;
        currentPage = page;
    }

    return {
        // the messages property tells the viewer which messages this 
        // plugin is interested in
        messages: ['pagefocus'],

        // this onmessage method is called when a message listed above 
        // is broadcast within the viewer instance
        onmessage: function (name, data) {
            // in this case, we are only listening for one message type,
            // so we don't need to do any checking against the name value
            track(data.page);
        },

        // init is called when the viewer is initialized, and the plugin
        // config is passed as a parameter
        init: function (pluginConfig) {
            config = pluginConfig;
        }
    };
});

// When creating the viewer, just include analytics in the plugins config
var viewer = Crocodoc.createViewer('.viewer', {
    url: '/path/to/assets',
    plugins: {
        // config for the analytics plugin
        analytics: {
            ontrack: function (page, seconds) {
                console.log(seconds + 's spent on page ' + page);
            }
        }
    }
});
```


## Browser Support

Viewer.js is supported in all modern desktop and mobile browsers. It will fall back to raster images in older browsers that do not support SVG.

*NOTE: raster fallback requires that `.png` representations have already been generated for the converted document.*

[//]: # (TODO: expand this section)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).


## Getting Started with the Code

To install the development dependencies, you'll need [node](http://nodejs.org/) and [npm](https://npmjs.org/). Most node installs come with npm pre-packaged.

Once you have npm, you'll need to install grunt-cli:
```
npm install -g grunt-cli
```

Then go to the viewer.js directory and run:
```
npm install
```

That's it! You should be setup with dev dependencies and ready to go. 

### Grunt

* `grunt test` - runs `jshint` and `qunit` tests against the code
* `grunt doc` - runs `test` and `jsdoc` to generate documentation in `doc/`
* `grunt` (alias for `grunt default`) - runs `test` and `concat` to build the following files:
    - `dist/crocodoc.viewer.js`
    - `dist/crocodoc.viewer.css`
* `grunt build` - runs `default` as well as `cssmin` and `uglify` to build the following compressed files (in addition to the files built in `grunt default`):
    - `dist/crocodoc.viewer.min.js`
    - `dist/crocodoc.viewer.min.css`
* `grunt serve` - runs a static webserver for viewing examples and qunit tests
    - defaults to port 9000
    - examples: `http://localhost:9000/examples`
    - tests: `http://localhost:9000/test`

### Logo Options

There is an additional option that can be specified when running grunt tasks: `--no-logo`. If this flag is added, logos will not be embedded into the resulting CSS file (`dist/crocodoc.viewer(.min).css`).

If you would like to replace the Box logo with your own, you can simply replace `src/images/logo.png` and `src/images/logo@2x.png` with your own logos. Running `grunt` or `grunt build` will embed the images into the resulting CSS files.

**NOTE:** Make sure you are allowed to remove logos before building with this option. For more information, see [Logos](#logos) above.


For more information about the code, see the [JS architecture overview](src/js/README.md).


## Change Log

See [CHANGELOG.md](CHANGELOG.md).


## Copyright and License

Copyright 2014 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
