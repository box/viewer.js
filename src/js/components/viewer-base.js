/**
 * @fileoverview viewer-base component
 * @author lakenen
 */

Crocodoc.addComponent('viewer-base', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var CSS_CLASS_PREFIX         = 'crocodoc-',
        ATTR_SVG_VERSION         = 'data-svg-version',
        CSS_CLASS_VIEWER         = CSS_CLASS_PREFIX + 'viewer',
        CSS_CLASS_DOC            = CSS_CLASS_PREFIX + 'doc',
        CSS_CLASS_VIEWPORT       = CSS_CLASS_PREFIX + 'viewport',
        CSS_CLASS_LOGO           = CSS_CLASS_PREFIX + 'viewer-logo',
        CSS_CLASS_DRAGGABLE      = CSS_CLASS_PREFIX + 'draggable',
        CSS_CLASS_DRAGGING       = CSS_CLASS_PREFIX + 'dragging',
        CSS_CLASS_TEXT_SELECTED  = CSS_CLASS_PREFIX + 'text-selected',
        CSS_CLASS_MOBILE         = CSS_CLASS_PREFIX + 'mobile',
        CSS_CLASS_IELT9          = CSS_CLASS_PREFIX + 'ielt9',
        CSS_CLASS_SUPPORTS_SVG   = CSS_CLASS_PREFIX + 'supports-svg',
        CSS_CLASS_WINDOW_AS_VIEWPORT = CSS_CLASS_PREFIX + 'window-as-viewport',
        CSS_CLASS_PAGE           = CSS_CLASS_PREFIX + 'page',
        CSS_CLASS_PAGE_INNER     = CSS_CLASS_PAGE + '-inner',
        CSS_CLASS_PAGE_CONTENT   = CSS_CLASS_PAGE + '-content',
        CSS_CLASS_PAGE_SVG       = CSS_CLASS_PAGE + '-svg',
        CSS_CLASS_PAGE_TEXT      = CSS_CLASS_PAGE + '-text',
        CSS_CLASS_PAGE_LINKS     = CSS_CLASS_PAGE + '-links',
        CSS_CLASS_PAGE_AUTOSCALE = CSS_CLASS_PAGE + '-autoscale',
        CSS_CLASS_PAGE_LOADING   = CSS_CLASS_PAGE + '-loading';

    var VIEWER_HTML_TEMPLATE =
        '<div tabindex="-1" class="' + CSS_CLASS_VIEWPORT + '">' +
            '<div class="' + CSS_CLASS_DOC + '">' +
            '</div>' +
        '</div>' +
        '<div class="' + CSS_CLASS_LOGO + '"></div>';

    var PAGE_HTML_TEMPLATE =
        '<div class="' + CSS_CLASS_PAGE + ' ' + CSS_CLASS_PAGE_LOADING + '" ' +
            'style="width:{{w}}px; height:{{h}}px;" data-width="{{w}}" data-height="{{h}}">' +
            '<div class="' + CSS_CLASS_PAGE_INNER + '">' +
                '<div class="' + CSS_CLASS_PAGE_CONTENT + '">' +
                    '<div class="' + CSS_CLASS_PAGE_SVG + '"></div>' +
                    '<div class="' + CSS_CLASS_PAGE_AUTOSCALE + '">' +
                        '<div class="' + CSS_CLASS_PAGE_TEXT + '"></div>' +
                        '<div class="' + CSS_CLASS_PAGE_LINKS + '"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    // the width to consider the 100% zoom level; zoom levels are calculated based
    // on this width relative to the actual document width
    var DOCUMENT_100_PERCENT_WIDTH = 1024;

    var util = scope.getUtility('common'),
        browser = scope.getUtility('browser'),
        support = scope.getUtility('support');

    var api, // the viewer API object
        config,
        $el,
        stylesheetEl,
        lazyLoader,
        layout,
        scroller,
        resizer,
        dragger,
        $assetsPromise;

    /**
     * Add CSS classes to the element for necessary feature/support flags
     * @returns {void}
     * @private
     */
    function setCSSFlags() {
        // add SVG version number flag
        $el.attr(ATTR_SVG_VERSION, config.metadata.version || '0.0.0');

        //add CSS flags
        if (browser.mobile) {
            $el.addClass(CSS_CLASS_MOBILE);      //Mobile?
        }
        if (browser.ielt9) {
            $el.addClass(CSS_CLASS_IELT9);       //IE7 or IE8?
        }
        if (support.svg) {
            $el.addClass(CSS_CLASS_SUPPORTS_SVG);
        }
    }

    /**
     * Validates the config options
     * @returns {void}
     * @private
     */
    function validateConfig() {
        var metadata = config.metadata;
        config.numPages = metadata.numpages;
        if (!config.pageStart) {
            config.pageStart = 1;
        } else if (config.pageStart < 0) {
            config.pageStart = metadata.numpages + config.pageStart;
        }
        config.pageStart = util.clamp(config.pageStart, 1, metadata.numpages);
        if (!config.pageEnd) {
            config.pageEnd = metadata.numpages;
        } else if (config.pageEnd < 0) {
            config.pageEnd = metadata.numpages + config.pageEnd;
        }
        config.pageEnd = util.clamp(config.pageEnd, config.pageStart, metadata.numpages);
        config.numPages = config.pageEnd - config.pageStart + 1;
    }

    /**
     * Create and insert basic viewer DOM structure
     * @returns {void}
     * @private
     */
    function initViewerHTML() {
        // create viewer HTML
        $el.html(VIEWER_HTML_TEMPLATE);
        if (config.useWindowAsViewport) {
            config.$viewport = $(window);
            $el.addClass(CSS_CLASS_WINDOW_AS_VIEWPORT);
        } else {
            config.$viewport = $el.find('.' + CSS_CLASS_VIEWPORT);
        }
        config.$doc = $el.find('.' + CSS_CLASS_DOC);
    }

    /**
     * Create the html skeleton for the viewer and pages
     * @returns {void}
     * @private
     */
    function prepareDOM() {
        var i, pageNum,
            zoomLevel, maxZoom,
            ptWidth, ptHeight,
            pxWidth, pxHeight,
            pt2px = util.calculatePtSize(),
            dimensions = config.metadata.dimensions,
            skeleton = '';

        // adjust page scale if the pages are too small/big
        // it's adjusted so 100% == DOCUMENT_100_PERCENT_WIDTH px;
        config.pageScale = DOCUMENT_100_PERCENT_WIDTH / (dimensions.width * pt2px);

        // add zoom levels to accomodate the scale
        zoomLevel = config.zoomLevels[config.zoomLevels.length - 1];
        maxZoom = 3 / config.pageScale;
        while (zoomLevel < maxZoom) {
            zoomLevel += zoomLevel / 2;
            config.zoomLevels.push(zoomLevel);
        }

        dimensions.exceptions = dimensions.exceptions || {};

        // create skeleton
        for (i = config.pageStart - 1; i < config.pageEnd; i++) {
            pageNum = i + 1;
            if (pageNum in dimensions.exceptions) {
                ptWidth = dimensions.exceptions[pageNum].width;
                ptHeight = dimensions.exceptions[pageNum].height;
            } else {
                ptWidth = dimensions.width;
                ptHeight = dimensions.height;
            }
            pxWidth = ptWidth * pt2px;
            pxHeight = ptHeight * pt2px;
            pxWidth *= config.pageScale;
            pxHeight *= config.pageScale;
            skeleton += util.template(PAGE_HTML_TEMPLATE, {
                w: pxWidth,
                h: pxHeight
            });
        }

        // insert skeleton and keep a reference to the jq object
        config.$pages = $(skeleton).appendTo(config.$doc);
    }

    /**
     * Initialize all plugins specified for this viewer instance
     * @returns {void}
     * @private
     */
    function initPlugins() {
        var name,
            plugin,
            plugins = config.plugins || {};
        for (name in plugins) {
            plugin = scope.createComponent('plugin-' + name);
            if (plugin && util.isFn(plugin.init)) {
                plugin.init(config.plugins[name]);
            }
        }
    }

    /**
     * Complete intialization after document metadata has been loaded;
     * ie., bind events, init lazyloader and layout, broadcast ready message
     * @returns {void}
     * @private
     */
    function completeInit() {
        setCSSFlags();

        // create viewer skeleton
        prepareDOM();

        // setup pages
        createPages();

        initHandlers();

        // Setup lazy loader and layout manager
        lazyLoader = scope.createComponent('lazy-loader');
        lazyLoader.init(config.pages);

        // initialize scroller and resizer components
        scroller = scope.createComponent('scroller');
        scroller.init(config.$viewport);
        resizer = scope.createComponent('resizer');
        resizer.init(config.$viewport);

        // disable links if necessary
        // @NOTE: links are disabled in IE < 9
        if (!config.enableLinks || browser.ielt9) {
            api.disableLinks();
        }

        // set the initial layout
        api.setLayout(config.layout);

        // broadcast ready message
        scope.broadcast('ready', {
            page: config.page || 1,
            numPages: config.numPages
        });

        scope.ready();
    }

    /**
     * Return the expected conversion status of the given page index
     * @param   {int} pageIndex The page index
     * @returns {string}        The page status
     */
    function getPageStatus(pageIndex) {
        if (pageIndex === 0 || config.conversionIsComplete) {
            return Crocodoc.PAGE_STATUS_NOT_LOADED;
        }
        return Crocodoc.PAGE_STATUS_CONVERTING;
    }

    /**
     * Create and init all necessary page component instances
     * @returns {void}
     * @private
     */
    function createPages() {
        var i,
            pages = [],
            page,
            start = config.pageStart - 1,
            end = config.pageEnd,
            links = sortPageLinks();

        //initialize pages
        for (i = start; i < end; i++) {
            page = scope.createComponent('page');
            page.init(config.$pages.eq(i - start), {
                index: i,
                status: getPageStatus(i),
                enableLinks: config.enableLinks,
                links: links[i],
                pageScale: config.pageScale
            });
            pages.push(page);
        }
        config.pages = pages;
    }

    /**
     * Returns all links associated with the given page
     * @param  {int} page The page
     * @returns {Array}   Array of links
     * @private
     */
    function sortPageLinks() {
        var i, len, link,
            links = config.metadata.links || [],
            sorted = [];

        for (i = 0, len = config.metadata.numpages; i < len; ++i) {
            sorted[i] = [];
        }

        for (i = 0, len = links.length; i < len; ++i) {
            link = links[i];
            sorted[link.pagenum - 1].push(link);
        }

        return sorted;
    }

    /**
     * Init window and document events
     * @returns {void}
     * @private
     */
    function initHandlers() {
        $(document).on('mouseup', handleMouseUp);
    }

    /**
     * Handler for linkclick messages
     * @returns {void}
     * @private
     */
    function handleLinkClick(data) {
        var event = api.fire('linkclick', data);
        if (!event.isDefaultPrevented()) {
            if (data.uri) {
                window.open(data.uri);
            } else if (data.destination) {
                api.scrollTo(data.destination.pagenum);
            }
        }
    }

    /**
     * Handle mouseup events
     * @returns {void}
     * @private
     */
    function handleMouseUp() {
        updateSelectedPages();
    }

    /**
     * Check if text is selected on any page, and if so, add a css class to that page
     * @returns {void}
     * @TODO(clakenen): this method currently only adds the selected class to one page,
     * so we should modify it to add the class to all pages with selected text
     * @private
     */
    function updateSelectedPages() {
        var node = util.getSelectedNode();
        var $page = $(node).closest('.'+CSS_CLASS_PAGE);
        $el.find('.'+CSS_CLASS_TEXT_SELECTED).removeClass(CSS_CLASS_TEXT_SELECTED);
        if (node && $el.has(node)) {
            $page.addClass(CSS_CLASS_TEXT_SELECTED);
        }
    }

    /**
     * Enable or disable the dragger given the `isDraggable` flag
     * @param   {Boolean} isDraggable Whether or not the layout is draggable
     * @returns {void}
     * @private
     */
    function updateDragger(isDraggable) {
        if (isDraggable) {
            if (!dragger) {
                $el.addClass(CSS_CLASS_DRAGGABLE);
                dragger = scope.createComponent('dragger');
                dragger.init(config.$viewport);
            }
        } else {
            if (dragger) {
                $el.removeClass(CSS_CLASS_DRAGGABLE);
                scope.destroyComponent(dragger);
                dragger = null;
            }
        }
    }

    /**
     * Validates and normalizes queryParams config option
     * @returns {void}
     */
    function validateQueryParams() {
        var queryString;
        if (config.queryParams) {
            if (typeof config.queryParams === 'string') {
                // strip '?' if it's there, because we add it below
                queryString = config.queryParams.replace(/^\?/, '');
            } else {
                queryString = $.param(config.queryParams);
            }
        }
        config.queryString = queryString ? '?' + queryString : '';
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        messages: [
            'asseterror',
            'destroy',
            'dragend',
            'dragstart',
            'fail',
            'linkclick',
            'pagefail',
            'pagefocus',
            'pageload',
            'pageunload',
            'ready',
            'resize',
            'scrollstart',
            'scrollend',
            'zoom'
        ],

        /**
         * Handle framework messages
         * @param {string} name The name of the message
         * @param {any} data The related data for the message
         * @returns {void}
         */
        onmessage: function (name, data) {
            switch (name) {
                case 'linkclick':
                    handleLinkClick(data);
                    break;

                case 'zoom':
                    // artificially adjust the reported zoom to be accuate given the page scale
                    data.zoom *= config.pageScale;
                    data.prevZoom *= config.pageScale;
                    if (config.enableDragging) {
                        updateDragger(data.isDraggable);
                    }

                    // forward zoom event to external event handlers
                    api.fire(name, data);
                    break;

                case 'dragstart':
                    if (!$el.hasClass(CSS_CLASS_DRAGGING)) {
                        $el.addClass(CSS_CLASS_DRAGGING);
                    }
                    // forward zoom event to external event handlers
                    api.fire(name, data);
                    break;

                case 'dragend':
                    if ($el.hasClass(CSS_CLASS_DRAGGING)) {
                        $el.removeClass(CSS_CLASS_DRAGGING);
                    }
                    // forward zoom event to external event handlers
                    api.fire(name, data);
                    break;

                default:
                    // forward subscribed framework messages to external event handlers
                    api.fire(name, data);
                    break;
            }
        },

        /**
         * Initialize the viewer api
         * @returns {void}
         */
        init: function () {
            config = scope.getConfig();
            api = config.api;

            // create a unique CSS namespace for this viewer instance
            config.namespace = CSS_CLASS_VIEWER + '-' + config.id;

            // Setup container
            $el = config.$el;

            // add crocodoc viewer and namespace classes
            $el.addClass(CSS_CLASS_VIEWER);
            $el.addClass(config.namespace);

            // add a / to the end of the base url if necessary
            if (config.url) {
                if (!/\/$/.test(config.url)) {
                    config.url += '/';
                }
            } else {
                throw new Error('no URL given for viewer assets');
            }

            if (browser.ielt9) {
                config.enableTextSelection = false;
            }

            // make the url absolute
            config.url = scope.getUtility('url').makeAbsolute(config.url);

            validateQueryParams();
            initViewerHTML();
            initPlugins();
        },

        /**
         * Destroy the viewer-base component
         * @returns {void}
         */
        destroy: function () {
            // remove document event handlers
            $(document).off('mouseup', handleMouseUp);

            // empty container and remove all class names that contain "crocodoc"
            $el.empty().removeClass(function (i, cls) {
                var match = cls.match(new RegExp('crocodoc\\S+', 'g'));
                return match && match.join(' ');
            });

            // remove the stylesheet
            $(stylesheetEl).remove();

            if ($assetsPromise) {
                $assetsPromise.abort();
            }
        },

        /**
         * Set the layout to the given mode, destroying and cleaning up the current
         * layout if there is one
         * @param  {string} layoutMode The layout mode
         * @returns {Layout} The layout object
         */
        setLayout: function (layoutMode) {
            var lastPage = config.page,
                lastZoom = config.zoom || 1,
                // create a layout component with the new layout config
                newLayout;

            // if there is already a layout, save some state
            if (layout) {
                // ignore this if we already have the specified layout
                if (layoutMode === config.layout) {
                    return layout;
                }
                lastPage = layout.state.currentPage;
                lastZoom = layout.state.zoomState;
            }

            newLayout = scope.createComponent('layout-' + layoutMode);
            if (!newLayout) {
                throw new Error('Invalid layout ' +  layoutMode);
            }

            // remove and destroy the existing layout component
            // @NOTE: this must be done after we decide if the
            // new layout exists!
            if (layout) {
                scope.destroyComponent(layout);
            }


            var previousLayoutMode = config.layout;
            config.layout = layoutMode;

            layout = newLayout;
            layout.init();
            layout.setZoom(lastZoom.zoomMode || lastZoom.zoom || lastZoom);
            layout.scrollTo(lastPage);

            config.currentLayout = layout;

            scope.broadcast('layoutchange', {
                // in the context of event data, `layout` and `previousLayout`
                // are actually the name of those layouts, and not the layout
                // objects themselves
                previousLayout: previousLayoutMode,
                layout: layoutMode
            });
            return layout;
        },

        /**
         * Load the metadata and css for this document
         * @returns {void}
         */
        loadAssets: function () {
            var $loadStylesheetPromise,
                $loadMetadataPromise,
                $pageOneContentPromise,
                $pageOneTextPromise;

            $loadMetadataPromise = scope.get('metadata');
            $loadMetadataPromise.then(function handleMetadataResponse(metadata) {
                config.metadata = metadata;
                validateConfig();
            });

            // don't load the stylesheet for IE < 9
            if (browser.ielt9) {
                stylesheetEl = util.insertCSS('');
                config.stylesheet = stylesheetEl.styleSheet;
                $loadStylesheetPromise = $.when('').promise({
                    abort: function () {}
                });
            } else {
                $loadStylesheetPromise = scope.get('stylesheet');
                $loadStylesheetPromise.then(function handleStylesheetResponse(cssText) {
                    stylesheetEl = util.insertCSS(cssText);
                    config.stylesheet = stylesheetEl.sheet;
                });
            }

            // load page 1 assets immediately if necessary
            if (!config.pageStart || config.pageStart === 1) {
                if (support.svg) {
                    $pageOneContentPromise = scope.get('page-svg', 1);
                } else if (config.conversionIsComplete) {
                    // unfortunately, page-1.png is not necessarily available
                    // on View API's document.viewable event, so we can only
                    // prefetch page-1.png if conversion is complete
                    $pageOneContentPromise = scope.get('page-img', 1);
                }
                if (config.enableTextSelection) {
                    $pageOneTextPromise = scope.get('page-text', 1);
                }
            }

            // when both metatadata and stylesheet are done or if either fails...
            $assetsPromise = $.when($loadMetadataPromise, $loadStylesheetPromise)
                .fail(function (error) {
                    scope.broadcast('asseterror', error);
                    scope.broadcast('fail', error);
                })
                .then(completeInit)
                .promise({
                    abort: function () {
                        $loadMetadataPromise.abort();
                        $loadStylesheetPromise.abort();
                        if ($pageOneContentPromise) {
                            $pageOneContentPromise.abort();
                        }
                        if ($pageOneTextPromise) {
                            $pageOneTextPromise.abort();
                        }
                    }
                });
        }
    };
});
