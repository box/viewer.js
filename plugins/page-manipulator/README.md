# Page Manipulator Plugin

Enables manipulation of page positions and content within a viewer instance. Pages can be added (with custom HTML content), removed, replaced, reordered, resized, and page links can be modified.

## Contents
* [Usage](#usage)
* [Options](#options)

## Usage

Include `page-manipulator.js` and `page-manipulator.css` in your page, and load the plugin as follows:

Examples:
```js
var viewer = Crocodoc.createViewer('.viewer', {
    // ...
    plugins: {
        // the Box View realtime URL received when requesting a session
        'page-manipulator': {
            pages: [
                // replace page 1 with a page that contains the specified html content
                { replace: 1, content: '<h1>Hello, world!</h1>' },
                // remove page 2
                { remove: 2 },
                // insert page 2 after page 5
                { after: 5, page: 2 },
                // replace the last page with page 1
                { replace: -1, page: 1 },
                // resize page 3 and turn it into a big link
                {
                    replace: 3,
                    page: 3,
                    dimensions: { width: 500, height: 400 },
                    links: [
                        { uri: 'https://developers.box.com/view/', bbox: [0, 0, 500, 400] }
                    ]
                }
            ]
        }
    }
});
```


## Options

The following configuration options are available:

**pages**
An array of objects representing desired page manipulations.

**pages[].before**
A page number before which to insert whatever is specified in this manipulator object. If negative, will select the page that many pages from the end.

**pages[].after**
A page number after which to insert whatever is specified in this manipulator object. If negative, will select the page that many pages from the end.

**pages[].replace**
A page number to replace with whatever is specified in this manipulator object. If negative, will select the page that many pages from the end.

**pages[].remove**
A page number to remove. If negative, will select the page that many pages from the end.

**pages[].page**
The original page number of an existing page to use. For example, this option can be used to duplicate a given page multiple times or (in combination with the `remove` option) to re-order a page.

**pages[].content**
A string of HTML content to inject into the page.

**pages[].dimensions**
An object with `width` and `height` properties that specify the width and height of this page in pt.

**pages[].links**
An array of link objects that contain the following properties:

* **destination** (object) - an optional object that represents the destination of a link
    - **destination.pagenum** (int) - the page number to link to (this will be adjusted as necessary to point to the location of the first instance of the given page number after manipulations)
    - **destination.absolute** (bool) -  if true, use this as the absolute destination of the link (don't modify the destination after pages have been manipulated)
* **bbox** (array) - an array of 4 numbers that represent [x0, y0, x1, y1] of the bounding box for the link
* **uri** (string) - an optional URL to link to
