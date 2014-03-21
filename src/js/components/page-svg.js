/**
 * @fileoverview page-svg component
 * @author clakenen
 */

/**
 * page-svg component
 */
Crocodoc.addComponent('page-svg', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    // @NOTE: MAX_DATA_URLS is the maximum allowed number of data-urls in svg
    // content before we give up and stop rendering them
    var MAX_DATA_URLS = 1000,
        SVG_MIME_TYPE = 'image/svg+xml',
        HTML_TEMPLATE = '<style>html, body { width:100%; height: 100%; margin: 0; overflow: hidden; }</style>',
        PROXY_SCRIPT_TEMPLATE = '<script type="text/javascript" src="data:text/javascript;base64,{{encodedScript}}"></script>',
        SVG_CONTAINER_TEMPLATE = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><script><![CDATA[('+proxySVG+')()]]></script></svg>',

        // Embed the svg in an iframe (initialized to about:blank), and inject
        // the SVG directly to the iframe window using document.write()
        // @NOTE: this breaks images in Safari because [?]
        EMBED_STRATEGY_DOCUMENT_WRITE = 1,

        // Embed the svg with a data-url
        // @NOTE: ff allows direct script access to objects embedded with a data url,
        //        and this method prevents a throbbing spinner because document.write
        //        causes a spinner in ff
        // @NOTE: NOT CURRENTLY USED - this breaks images in firefox because:
        //        https://bugzilla.mozilla.org/show_bug.cgi?id=922433
        EMBED_STRATEGY_DATA_URL = 2,

        // Embed the svg directly in html via inline svg.
        // @NOTE: NOT CURRENTLY USED -  seems to be slow everywhere, but I'm keeping
        //        this here because it's very little extra code, and inline SVG might
        //        be better some day?
        EMBED_STRATEGY_INLINE_SVG = 3,

        // Embed the svg directly with an object tag; don't replace linked resources
        // @NOTE: NOT CURRENTLY USED - this is only here for testing purposes, because
        //        it works in every browser; it doesn't support query string params
        //        and causes a spinner
        EMBED_STRATEGY_BASIC_OBJECT = 4,

        // Embed the svg directly with an img tag; don't replace linked resources
        // @NOTE: NOT CURRENTLY USED - this is only here for testing purposes
        EMBED_STRATEGY_BASIC_IMG = 5,

        // Embed a proxy svg script as an object tag via data:url, which exposes a
        // loadSVG method on its contentWindow, then call the loadSVG method directly
        // with the svg text as the argument
        // @NOTE: only works in firefox because of its security policy on data:uri
        EMBED_STRATEGY_DATA_URL_PROXY = 6,

        // Embed in a way similar to the EMBED_STRATEGY_DATA_URL_PROXY, but in this
        // method we use an iframe initialized to about:blank and document.write()
        // the proxy script before calling loadSVG on the iframe's contentWindow
        // @NOTE: this is a workaround for the image issue with EMBED_STRATEGY_DOCUMENT_WRITE
        //        in safari; it also works in firefox, but causes a spinner because of
        //        document.write()
        EMBED_STRATEGY_IFRAME_PROXY = 7,

        // Embed in an img tag via data:url, downloading stylesheet separately, and
        // injecting it into the data:url of SVG text before embedding
        // @NOTE: this method seems to be more performant on IE
        EMBED_STRATEGY_DATA_URL_IMG = 8;

    var util = scope.getUtility('common'),
        ajax    = scope.getUtility('ajax'),
        browser = scope.getUtility('browser'),
        subpx = scope.getUtility('subpx'),
        DOMParser = window.DOMParser;

    var $svg, $svgLayer,
        $loadSVGTextPromise,
        request,
        config,
        baseURL,
        queryString,
        svgSrc,
        svgText,
        destroyed = false,
        unloaded = false,
        svgLoaded = false,
        viewerConfig = scope.getConfig(),
        removeOnUnload = browser.mobile || browser.ielt10,
        embedStrategy = browser.ie ? EMBED_STRATEGY_DATA_URL_IMG :
                        browser.firefox ? EMBED_STRATEGY_DATA_URL_IMG :
                        browser.safari ? EMBED_STRATEGY_IFRAME_PROXY :
                        EMBED_STRATEGY_DOCUMENT_WRITE;

    /**
     * Create and return a jQuery object for the SVG element
     * @returns {Object} The SVG $element
     * @private
     */
    function createSVGEl() {
        switch (embedStrategy) {
            case EMBED_STRATEGY_DOCUMENT_WRITE:
            case EMBED_STRATEGY_IFRAME_PROXY:
                return $('<iframe>');

            case EMBED_STRATEGY_DATA_URL_PROXY:
            case EMBED_STRATEGY_DATA_URL:
                return $('<object>').attr({
                    type: SVG_MIME_TYPE,
                    data: 'data:'+SVG_MIME_TYPE+';base64,' + window.btoa(SVG_CONTAINER_TEMPLATE)
                });

            case EMBED_STRATEGY_INLINE_SVG:
                // just return a div with 100% w/h and the svg will be inserted on load
                return $('<div style="width:100%; height:100%;">');

            case EMBED_STRATEGY_BASIC_OBJECT:
                return $('<object>');

            case EMBED_STRATEGY_BASIC_IMG:
            case EMBED_STRATEGY_DATA_URL_IMG:
                return $('<img>');

            // no default
        }
    }

    /**
     * Create the svg element if it hasn't been created,
     * insert the SVG into the DOM if necessary
     * @returns {void}
     * @private
     */
    function prepareSVGContainer() {
        if (!$svg || $svg.length === 0) {
            svgLoaded = false;
            $svg = createSVGEl();
        }
        if ($svg.parent().length === 0) {
            $svg.appendTo($svgLayer);
        }
    }

    /**
     * Process SVG text and return the embeddable result
     * @param   {string} text The original SVG text
     * @returns {string}      The processed SVG text
     */
    function processSVGText(text) {
        var query = queryString.replace('&', '&#38;'),
            dataUrlCount,
            stylesheetHTML;

        dataUrlCount = util.countInStr(text, 'xlink:href="data:image');
        // remove data:urls from the SVG content if the number exceeds MAX_DATA_URLS
        if (dataUrlCount > MAX_DATA_URLS) {
            // remove all data:url images that are smaller than 5KB
            text = text.replace(/<image[\s\w-_="]*xlink:href="data:image\/[^"]{0,5120}"[^>]*>/ig, '');
        }

        // @TODO: remove this, because we no longer use any external assets in this way
        // modify external asset urls for absolute path
        text = text.replace(/href="([^"#:]*)"/g, function (match, group) {
            return 'href="' + baseURL + group + query + '"';
        });

        // CSS text
        stylesheetHTML = '<style>' + viewerConfig.cssText + '</style>';

        // If using Firefox with no subpx support, add "text-rendering" CSS.
        // @NOTE(plai): We are not adding this to Chrome because Chrome supports "textLength"
        // on tspans and because the "text-rendering" property slows Chrome down significantly.
        // In Firefox, we're waiting on this bug: https://bugzilla.mozilla.org/show_bug.cgi?id=890692
        // @TODO: Use feature detection instead (textLength)
        if (browser.firefox && !subpx.isSubpxSupported()) {
            stylesheetHTML += '<style>text { text-rendering: geometricPrecision; }</style>';
        }

        // inline the CSS!
        text = text.replace(/<xhtml:link[^>]*>/, stylesheetHTML);

        return text;
    }

    /**
     * Load svg text if necessary
     * @returns {$.Promise}
     * @private
     */
    function loadSVGText() {
        // already load(ed|ing)?
        if ($loadSVGTextPromise) {
            return $loadSVGTextPromise;
        }
        var url = svgSrc + queryString,
            $deferred = $.Deferred();

        if (!$svg) {
            $deferred.reject({
                error: 'Error creating SVG element',
                status: 200,
                resource: url
            });
            return;
        }

        request = ajax.request(url, {
            success: function () {
                if (destroyed) {
                    return;
                }
                // we need to replace & characters in the query string, because they are invalid in SVG
                var text = this.responseText;

                // if the response comes back empty,
                if (!text) {
                    $deferred.reject({
                        error: 'Response was empty',
                        status: 200,
                        resource: url
                    });
                    return;
                }

                text = processSVGText(text);

                svgText = text;

                $deferred.resolve();
            },
            fail: function () {
                if (destroyed) {
                    return;
                }
                svgText = null;
                $deferred.reject({
                    error: this.statusText,
                    status: this.status,
                    resource: url
                });
            }
        });

        $loadSVGTextPromise = $deferred.promise();
        return $loadSVGTextPromise;
    }


    /**
     * Embed the SVG into the page
     * @returns {void}
     * @private
     */
    function embedSVG() {
        var domParser,
            svgDoc,
            svgEl,
            html,
            dataURLPrefix,
            contentDocument = $svg[0].contentDocument,
            contentWindow = $svg[0].contentWindow ||
                             // @NOTE: supports older versions of ff
                            contentDocument && contentDocument.defaultView;

        switch (embedStrategy) {
            case EMBED_STRATEGY_DOCUMENT_WRITE:
                // @NOTE: IE 9 fix. This line in the file is causing the page not to render in IE 9.
                // The link is not needed here anymore because we are including the stylesheet separately.
                if (browser.ie && browser.version < 10) {
                    svgText = svgText.replace(/<xhtml:link.*/,'');
                }
                html = HTML_TEMPLATE + svgText;
                contentDocument.open();
                contentDocument.write(html);
                contentDocument.close();
                svgEl = contentDocument.getElementsByTagName('svg')[0];
                break;

            case EMBED_STRATEGY_IFRAME_PROXY:
                html = HTML_TEMPLATE +
                       util.template(PROXY_SCRIPT_TEMPLATE, { encodedScript: window.btoa('('+proxySVG+')()') });
                contentDocument.open();
                contentDocument.write(html);
                contentDocument.close();
                if (contentDocument.readyState === 'complete') {
                    contentWindow.loadSVG(svgText);
                    if (!removeOnUnload) {
                        svgText = null;
                    }
                } else {
                    contentWindow.onload = function () {
                        this.loadSVG(svgText);
                        if (!removeOnUnload) {
                            svgText = null;
                        }
                    };
                }
                // NOTE: return is necessary here because we are waiting for a callback
                // before unsetting svgText
                return;

            case EMBED_STRATEGY_DATA_URL:
                domParser = new DOMParser();
                svgDoc = domParser.parseFromString(svgText, SVG_MIME_TYPE);
                svgEl = contentDocument.importNode(svgDoc.documentElement, true);
                contentDocument.documentElement.appendChild(svgEl);
                break;

            case EMBED_STRATEGY_DATA_URL_PROXY:
                contentWindow.loadSVG(svgText);
                svgEl = contentDocument.querySelector('svg');
                break;

            case EMBED_STRATEGY_INLINE_SVG:
                domParser = new DOMParser();
                svgDoc = domParser.parseFromString(svgText, SVG_MIME_TYPE);
                svgEl = document.importNode(svgDoc.documentElement, true);
                $svg.append(svgEl);
                break;

            case EMBED_STRATEGY_BASIC_OBJECT:
                $svg.attr({
                    type: SVG_MIME_TYPE,
                    data: svgSrc + queryString
                });
                svgEl = $svg[0];
                break;

            case EMBED_STRATEGY_BASIC_IMG:
                svgEl = $svg[0];
                svgEl.src = svgSrc + queryString;
                break;

            case EMBED_STRATEGY_DATA_URL_IMG:
                svgEl = $svg[0];
                dataURLPrefix = 'data:' + SVG_MIME_TYPE;
                if (!browser.ie && window.btoa) {
                    svgEl.src = dataURLPrefix + ';base64,' + window.btoa(svgText);
                } else {
                    svgEl.src = dataURLPrefix + ',' + encodeURIComponent(svgText);
                }
                break;

            // no default
        }
        if (!removeOnUnload) {
            svgText = null;
        }

        // make sure the svg width/height are explicity set to 100%
        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');
    }

    /**
     * Creates a global method for loading svg text into the proxy svg object
     * @NOTE: this function should never be called directly in this context;
     * it's converted to a string and encoded into the proxy svg data:url
     * @returns {void}
     * @private
     */
    function proxySVG() {
        window.loadSVG = function (svgText) {
            var domParser = new window.DOMParser(),
                svgDoc = domParser.parseFromString(svgText, 'image/svg+xml'),
                svgEl = document.importNode(svgDoc.documentElement, true);
            // make sure the svg width/height are explicity set to 100%
            svgEl.setAttribute('width', '100%');
            svgEl.setAttribute('height', '100%');

            if (document.body) {
                document.body.appendChild(svgEl);
            } else {
                document.documentElement.appendChild(svgEl);
            }
        };
    }

    /**
     * Function to call when loading is complete (success or not)
     * @param   {*} error Error param; if truthy, assume there was an error
     * @returns {void}
     * @private
     */
    function completeLoad(error) {
        if (error) {
            scope.broadcast('asseterror', error);
            svgLoaded = false;
            $loadSVGTextPromise = null;
        } else {
            if ($svg.parent().length === 0) {
                $svg.appendTo($svgLayer);
            }
            $svg.show();
            svgLoaded = true;
        }
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------


    return {
        /**
         * Initialize the page-svg component
         * @param {jQuery} $el The element to load SVG layer into
         * @param  {Object} conf Configuration object
         * @returns {void}
         */
        init: function ($el, conf) {
            $svgLayer = $el;
            config = conf;
            baseURL = config.url;
            svgSrc = config.svgSrc;
            queryString = config.queryString || '';
            embedStrategy = viewerConfig.embedStrategy || embedStrategy;
        },

        /**
         * Destroy the page-svg component
         * @returns {void}
         */
        destroy: function () {
            destroyed = true;
            this.unload();
            $svgLayer.empty();
        },

        /**
         * Prepare the SVG object to be loaded and start loading SVG text
         * @returns {void}
         */
        preload: function () {
            prepareSVGContainer();
            loadSVGText();
        },

        /**
         * Load the SVG and call callback when complete.
         * If there was an error, callback's first argument will be
         * an error message, and falsy otherwise.
         * @returns {$.Deferred}    A jQuery Deferred object
         */
        load: function () {
            unloaded = false;
            var $deferred = $.Deferred();

            if (svgLoaded) {
                completeLoad();
                $deferred.resolve();
            } else {
                prepareSVGContainer();
                if (embedStrategy === EMBED_STRATEGY_BASIC_OBJECT ||
                    embedStrategy === EMBED_STRATEGY_BASIC_IMG)
                {
                    // don't load the SVG text, just embed the object with
                    // the source pointed at the correct location
                    embedSVG();
                    completeLoad();
                    $deferred.resolve();
                } else {
                    loadSVGText()
                        .then(function loadSVGTextSuccess() {
                            if (destroyed || unloaded) {
                                return;
                            }
                            embedSVG();
                            completeLoad();
                            $deferred.resolve();
                        })
                        .fail(function loadSVGTextFail(error) {
                            completeLoad(error);
                            $deferred.reject(error);
                        })
                        .always(function loadSVGAlways() {
                            request = null;
                        });
                }
            }
            return $deferred;
        },

        /**
         * Unload (or hide) the SVG object
         * @returns {void}
         */
        unload: function () {
            unloaded = true;
            // stop loading the page if it hasn't finished yet
            if (request && request.abort) {
                request.abort();
                request = null;
                $loadSVGTextPromise = null;
            }
            if (removeOnUnload) {
                if ($svg) {
                    $svg.remove();
                    $svg = null;
                }
                svgLoaded = false;
            } else if (svgLoaded) {
                // @NOTE: still consider SVG to be loaded here,
                // since we're merely hiding the DOM element
                $svg.hide();
            }
        }
    };
});
