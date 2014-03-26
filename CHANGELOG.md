# Change Log #

Viewer.js uses [semantic versioning](http://semver.org/) for its version numbers.

* **0.4.1**
  * Fix a bug with asset preloading
* **0.4.0**
  * Add [plugins](README.md#plugins)
  * Add presentation transition examples
  * Improve lazy-loading and preloading of assets
  * Fix an issue with layout (page position calculation)
  * Fix a CORS issue in IE8/9
  * Simplified viewer API
  * Fix an issue with enabling text selection after initializing a viewer with `enableTextSelection: false`
  * Fix zooming issues in IE7
  * Fix AJAX issue in IE9
  * Fix a page loading bug in IE9 and most mobile devices
  * Many other minor bug fixes
* **0.3.2**
  * Fix an issue with `setLayout()`
  * Add preloading of SVG content
  * Add `fullyVisiblePages` property of `zoom` and `pagefocus` event data
* **0.3.1**
  * Fix an issue with stylesheet loading in IE 10
  * Fix pageavailable methods to queue and broadcast appropriately if received before viewer is ready
  * Add `jQuery.noConflict()` support
* **0.3.0**
  * Rename `ready` option to `conversionIsComplete`
  * Improve zoom performance and simplify zooming
  * Fix an issue with images in Firefox
  * Add dragging support (via `enableDragging`)
  * Add support for string values to `queryParams` option
  * Improve performance on edge-case documents
  * Fix an issue with text highlight color
* **0.2.0**
  * Add examples directory for demos and sample code
  * Add scrollstart and scrollend events
  * Add CORS support for IE 8/9
  * Add CONTRIBUTING.md, CHANGELOG.md, and LICENSE
  * Fix several bugs related to SVG embeds
  * Fix links in IE <= 9
  * Improve rendering performance of complicated documents
  * Remove pageerror event in favor of pagefail and asseterror
  * Auto-retry certain asset requests if they fail
* **0.1.3**
  * Add grunt to replace build.sh
  * Improve memory usage and scrolling performance
  * Fix several bugs with layout, SVG embedding
* **0.1.2**
  * Add support for png fallback in browsers that do not support SVG
  * Add basic support for IE 7 and 8
  * Fix regression that caused pages not to load in Firefox ~20
  * Improve scrolling and page rendering performance
  * Improve error handling for page load errors
  * Fix numerous minor bugs
* **0.1.1**
  * Fix image loading issues in Firefox and Safari
* **0.1.0**
  * Initial alpha release
