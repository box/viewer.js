var url = 'https://view-api.box.com/1/sessions/5a34f299b35947b5ac1e0b4d83553392/assets';
// Create a viewer for the thumbnails
var thumbnails = Crocodoc.createViewer('.thumbnails', {
    url: url,
    // Disable links and text selection, because they are not needed in thumbnails
    enableTextSelection: false,
    enableLinks: false,
    // This is kind of a hack at this point, but I basically just manually found
    // the zoom level that worked to have two pages side-by-side (and reduced
    // the minimum zoom level to accommodate)
    minZoom: 0.17,
    zoom: 0.17,
    layout: Crocodoc.LAYOUT_VERTICAL
});
// Keep a reference to the currently fully-visible pages so we can auto-scroll
// the thumbnails when necessary
var visibleThumbnails = [];
thumbnails.on('ready', function () {
    // wait for the thumbnails to be ready before loading the presentation
    presentation.load();
});
// Update the visible thumbnails when it's zoomed or page changes
thumbnails.on('zoom', function (event) {
    visibleThumbnails = event.data.fullyVisiblePages;
});
thumbnails.on('pagefocus', function (event) {
    visibleThumbnails = event.data.fullyVisiblePages;
});

thumbnails.load();

// Create a viewer for the presentation slides (the large view)
var presentation = Crocodoc.createViewer('.presentation', {
    url: url,
    layout: Crocodoc.LAYOUT_PRESENTATION
});


// Bind 'ready' and 'pagefocus' event handlers to update the page controls
presentation.on('ready', function (event) {
    updatePageControls(event.data.page, event.data.numPages);
});
presentation.on('pagefocus', function (event) {
    updatePageControls(event.data.page, event.data.numPages);
});

// Bind 'zoom' event to update the zoom controls
presentation.on('zoom', function (event) {
    $('.zoom-in').prop('disabled', !event.data.canZoomIn);
    $('.zoom-out').prop('disabled', !event.data.canZoomOut);
});

function updatePageControls(currentPage, numPages) {
    $('.page').get(0).textContent = currentPage + ' / ' + numPages;
    $('.scroll-previous').prop('disabled', currentPage === 1);
    $('.scroll-next').prop('disabled', currentPage === numPages);

    // scroll to the thumbnail if it's not fully visible
    if ($.inArray(currentPage, visibleThumbnails) === -1) {
        thumbnails.scrollTo(currentPage);
    }

    // remove the current-thumbnail class from the old thumbnail and add it to
    // the newly-focused one
    $('.thumbnails .crocodoc-page')
        .removeClass('current-thumbnail')
        .eq(currentPage - 1)
        .addClass('current-thumbnail');
}

// Bind click events for controlling the viewer
$('.scroll-previous').on('click', function () {
    presentation.scrollTo(Crocodoc.SCROLL_PREVIOUS);
});
$('.scroll-next').on('click', function () {
    presentation.scrollTo(Crocodoc.SCROLL_NEXT);
});
// Delegate clicks on .crocodoc-page elements in the thumbnails viewer to scroll
// to the proper page
$('.thumbnails').on('click', '.crocodoc-page', function () {
    var pageNum = $(this).index()+1;
    presentation.scrollTo(pageNum);
});

// Bind some key events to flip through slides easily
$(window).on('keydown', function (ev) {
    if (ev.keyCode === 37) {
        presentation.scrollTo(Crocodoc.SCROLL_PREVIOUS);
    } else if (ev.keyCode === 39) {
        presentation.scrollTo(Crocodoc.SCROLL_NEXT);
    } else {
        return;
    }
    ev.preventDefault();
});
