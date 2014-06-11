# Viewer.js Examples #

In this directory, you'll find several examples of common viewer.js use cases.

* `basic-viewer`
    - The simplest possible viewer.js example. Loads a document with default configurations.
* `page-content-flip`
    - Add additional content to each page, with a fancy card-flip transition when interacted with.
* `page-content-thumbnails`
    - Similar to `thumbnails`, but with additional interactive content added to each page via a custom plugin. 
* `presentations`
    - Various demos of presentation transitions and modes.
* `realtime`
    - An example using the realtime plugin to stream pages to the viewer as they are finished converting. This example uses a local server to simulate conversion, so you can test it out on already converted documents.
* `remember-page`
    - Store current page number in the url hash, then resume from the proper page when linked to or reloading the browser window.
* `thumbnails`
    - Two separate viewer instances are created: one for the presentation, and the other for thumbnails. When a thumbnail is clicked, the presentation view jumps to the correct page.
