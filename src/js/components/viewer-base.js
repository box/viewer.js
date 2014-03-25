/**
 * @fileoverview viewer-base component
 * @author clakenen
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
        CSS_CLASS_PAGES          = CSS_CLASS_PREFIX + 'pages',
        CSS_CLASS_VIEWPORT       = CSS_CLASS_PREFIX + 'viewport',
        CSS_CLASS_LOGO           = CSS_CLASS_PREFIX + 'viewer-logo',
        CSS_CLASS_DRAGGABLE      = CSS_CLASS_PREFIX + 'draggable',
        CSS_CLASS_DRAGGING       = CSS_CLASS_PREFIX + 'dragging',
        CSS_CLASS_TEXT_SELECTED  = CSS_CLASS_PREFIX + 'text-selected',
        CSS_CLASS_MOBILE         = CSS_CLASS_PREFIX + 'mobile',
        CSS_CLASS_IELT9          = CSS_CLASS_PREFIX + 'ielt9',
        CSS_CLASS_SUPPORTS_SVG   = CSS_CLASS_PREFIX + 'supports-svg',
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
                '<div class="' + CSS_CLASS_PAGES + '">' +
                '</div>' +
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
        ajax = scope.getUtility('ajax'),
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
        destroyed = false;

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
        config.$viewport = $el.find('.'+CSS_CLASS_VIEWPORT);
        config.$doc = $el.find('.'+CSS_CLASS_DOC);
        config.$pagesWrapper = $el.find('.'+CSS_CLASS_PAGES);
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
        config.$pages = $(skeleton).appendTo(config.$pagesWrapper);
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
            svgSrc,
            imgSrc,
            textSrc,
            cssSrc,
            start = config.pageStart - 1,
            end = config.pageEnd,
            url = util.makeAbsolute(config.url),
            status = config.conversionIsComplete ? Crocodoc.PAGE_STATUS_NOT_LOADED : Crocodoc.PAGE_STATUS_CONVERTING,
            links = sortPageLinks();

        //initialize pages
        for (i = start; i < end; i++) {
            svgSrc = url + util.template(config.template.svg, {page: i + 1});
            textSrc = url + util.template(config.template.html, {page: i + 1});
            imgSrc = url + util.template(config.template.img, {page: i + 1});
            cssSrc = url + config.template.css;
            page = scope.createComponent('page');
            page.init(config.$pages.eq(i - start), {
                index: i,
                url: url,
                imgSrc: imgSrc,
                svgSrc: svgSrc,
                textSrc: textSrc,
                cssSrc: cssSrc,
                status: status,
                queryString: config.queryString,
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
     * Handler for linkclicked messages
     * @returns {void}
     * @private
     */
    function handleLinkClicked(data) {
        if (data.uri) {
            window.open(data.uri);
        } else if (data.destination) {
            api.scrollTo(data.destination.pagenum);
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
     * Load the given resource via AJAX request, and retry if necessary
     * @param {boolean} retry Whether to retry if the resource fails to load
     * @returns {$.Promise}
     * @private
     */
    function loadResource(url, retry) {
        var $deferred = $.Deferred();

        function retryOrFail(error) {
            scope.broadcast('asseterror', error);
            if (retry) {
                // don't retry next time
                loadResource(url, false)
                    .then(function (responseText) {
                        $deferred.resolve(responseText);
                    })
                    .fail(function (err) {
                        $deferred.reject(err);
                    });
            } else {
                $deferred.reject(error);
            }
        }

        ajax.request(url, {
            success: function () {
                if (destroyed) {
                    return;
                }
                if (!this.responseText) {
                    retryOrFail({
                        error: 'empty response',
                        status: this.status,
                        resource: url
                    });
                    return;
                }
                $deferred.resolve(this.responseText);
            },
            fail: function () {
                if (destroyed) {
                    return;
                }
                retryOrFail({
                    error: this.statusText,
                    status: this.status,
                    resource: url
                });
            }
        });
        return $deferred.promise();
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
            'linkclicked',
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
                case 'linkclicked':
                    handleLinkClicked(data);
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

            destroyed = true;
        },

        /**
         * Set the layout to the given mode, destroying and cleaning up the current
         * layout if there is one
         * @param  {string} mode The layout mode
         * @returns {Layout} The layout object
         */
        setLayout: function (mode) {
            var lastPage = config.page,
                lastZoom = config.zoom || 1,
                // create a layout component with the new layout config
                newLayout;

            // if there is already a layout, save some state
            if (layout) {
                // ignore this if we already have the specified layout
                if (mode === config.layout) {
                    return layout;
                }
                lastPage = layout.state.currentPage;
                lastZoom = layout.state.zoomState;
            }

            newLayout = scope.createComponent('layout-' + mode);
            if (!newLayout) {
                throw new Error('Invalid layout ' +  mode);
            }

            // remove and destroy the existing layout component
            // @NOTE: this must be done after we decide if the
            // new layout exists!
            if (layout) {
                scope.destroyComponent(layout);
            }

            config.layout = mode;

            layout = newLayout;
            layout.init();
            layout.setZoom(lastZoom.zoomMode || lastZoom.zoom || lastZoom);
            layout.scrollTo(lastPage);

            config.currentLayout = layout;

            return layout;
        },

        /**
         * Load the metadata and css for this document
         * @returns {void}
         */
        loadAssets: function () {
            var absolutePath = util.makeAbsolute(config.url),
                stylesheetURL = absolutePath + config.template.css,
                metadataURL = absolutePath + config.template.json,
                $loadStylesheetPromise,
                $loadMetadataPromise;

            validateQueryParams();
            stylesheetURL += config.queryString;
            metadataURL += config.queryString;

            $loadMetadataPromise = loadResource(metadataURL, true);
            $loadMetadataPromise.then(function handleMetadataResponse(responseText) {
                config.metadata = $.parseJSON(responseText);
                validateConfig();
            });

            // don't load the stylesheet for IE < 9
            if (browser.ielt9) {
                stylesheetEl = util.insertCSS('');
                config.stylesheet = stylesheetEl.styleSheet;
                $loadStylesheetPromise = $.when();
            } else {
                $loadStylesheetPromise = loadResource(stylesheetURL, true);
                $loadStylesheetPromise.then(function handleStylesheetResponse(responseText) {
                    config.cssText = responseText;
                    stylesheetEl = util.insertCSS(responseText);
                    config.stylesheet = stylesheetEl.sheet;
                });
            }

            // when both metatadata and stylesheet are done or if either fails...
            $.when($loadMetadataPromise, $loadStylesheetPromise)
                .fail(function (error) {
                    scope.broadcast('fail', error);
                })
                .then(completeInit);
        }
    };
});
