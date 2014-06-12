# Realtime Plugin

Enables realtime page-streaming functionality for Box View conversions in viewer.js. This plugin will automatically load pages as necessary when they finish converting.

## Contents
* [Dependencies](#dependencies)
* [Usage](#usage)
* [Options](#options)
* [Events](#events)


## Dependencies

The realtime plugin depends on the [EventSource polyfill](https://github.com/Yaffle/EventSource). You can also get a copy of the polyfill on npm:

```
npm install event-source-polyfill
```

Just include `eventsource.js` in your app along with `realtime.js`.


## Usage

Include `realtime.js` in your page, and load the plugin as follows:

Example:
```js
var viewer = Crocodoc.createViewer('.viewer', {
    // ...
    plugins: {
        // the Box View realtime URL received when requesting a session
        realtime: {
            url: 'https://view-api.box.com/sse/<uuid>'
        }
    }
});
```


## Options

The following configuration options are available:

**url**

The URL to the Box View realtime endpoint associated with the viewing session. This would be available in the View API session response.


## Events

The following events will be fired on the viewer object:

* `realtimeupdate` - fired when a new realtime update arrives. Event properties:
    * `page` - the page that has become available
* `realtimeerror` - fired when the an error occurs with realtime. Event properties:
    * `error` - the error details
* `realtimecomplete` - fired when the conversion is complete (we have been notified of all pages being available)

Example:
```js
viewer.on('realtimeupdate', function (event) {
    // some magic function that updates a conversion progress bar
    updateConversionProgress(event.data.page);
});

viewer.on('realtimecomplete', function () {
    alert('the document is finished converting!');
});
```
