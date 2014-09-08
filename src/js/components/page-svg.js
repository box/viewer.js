/**
 * @fileoverview page-svg component
 * @author lakenen
 */

/**
 * page-svg component
 */
Crocodoc.addComponent('page-svg', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var browser = scope.getUtility('browser'),
        dom = scope.getUtility('dom'),
        DOMParser = window.DOMParser;

    var svgContainerEl,
        containerEl,
        $loadSVGPromise,
        page,
        destroyed = false,
        unloaded = false,
        svgLoaded = false,
        viewerConfig = scope.getConfig(),
        removeOnUnload = browser.mobile || browser.ielt10,
        // * IE 9-10 and firefox perform better with <img> elements
        // * IE 11 crashes when using img elements for some reason
        // * Everything else is happy with iframe + innerhtml
        embedStrategy = browser.ielt11 || browser.firefox ?
                        EMBED_STRATEGY_DATA_URL_IMG :
                        EMBED_STRATEGY_IFRAME_INNERHTML;

    /**
     * Create and return a jQuery object for the SVG element
     * @returns {Object} The SVG $element
     * @private
     */
    function createSVGEl() {
        var el;

        switch (embedStrategy) {
            case EMBED_STRATEGY_IFRAME_INNERHTML:
            case EMBED_STRATEGY_IFRAME_PROXY:
                el = dom.create('iframe');
                break;

            case EMBED_STRATEGY_DATA_URL_PROXY:
            case EMBED_STRATEGY_DATA_URL:
                el = dom.create('object');
                dom.attr(el, {
                    type: SVG_MIME_TYPE,
                    data: 'data:'+SVG_MIME_TYPE+';base64,' + window.btoa(SVG_CONTAINER_TEMPLATE)
                });
                break;

            case EMBED_STRATEGY_INLINE_SVG:
                el = dom.create('div');
                break;

            case EMBED_STRATEGY_BASIC_OBJECT:
                el = dom.create('object');
                break;

            case EMBED_STRATEGY_BASIC_IMG:
            case EMBED_STRATEGY_DATA_URL_IMG:
                el = dom.create('img');
                break;

            // no default
        }
        return el;
    }

    /**
     * Create the svg element if it hasn't been created,
     * insert the SVG into the DOM if necessary
     * @returns {void}
     * @private
     */
    function prepareSVGContainer() {
        if (!svgContainerEl) {
            svgLoaded = false;
            svgContainerEl = createSVGEl();
        }
        if (!svgContainerEl.parentNode) {
            dom.appendTo(containerEl, svgContainerEl);
        }
    }

    /**
     * Load svg text if necessary
     * @returns {$.Promise}
     * @private
     */
    function loadSVGText() {
        if (svgLoaded ||
            // @NOTE: these embed strategies don't require svg text to be loaded
            embedStrategy === EMBED_STRATEGY_BASIC_OBJECT ||
            embedStrategy === EMBED_STRATEGY_BASIC_IMG)
        {
            // don't load the SVG text, just return an empty promise
            return $.Deferred().resolve().promise({
                abort: function() {}
            });
        } else {
            return scope.get('page-svg', page);
        }
    }

    /**
     * Fixes a bug in Safari where <use> elements are not supported properly
     * by replacing each <use> element with a clone of its referenced <image>
     * @param   {Document} contentDocument The SVG document
     * @returns {void}
     */
    function fixUseElements(contentDocument) {
        // find all <use> elements
        var useEls = contentDocument.querySelectorAll('use');
        [].forEach.call(useEls, function (use) {
            var id = use.getAttribute('xlink:href'),
                // clone the referenced <image> element
                image = contentDocument.querySelector(id).cloneNode(),
                parent = use.parentNode;
            // remove the id so we don't have duplicates
            image.removeAttribute('id');
            // copy over the transform
            image.setAttribute('transform', use.getAttribute('transform'));
            // replace the use with the image
            parent.replaceChild(image, use);
        });
    }

    /**
     * Embed the SVG into the page
     * @returns {void}
     * @private
     */
    function embedSVG(svgText) {
        var domParser,
            svgDoc,
            svgEl,
            html,
            dataURLPrefix,
            contentDocument = svgContainerEl.contentDocument,
            contentWindow = svgContainerEl.contentWindow ||
                             // @NOTE: supports older versions of ff
                            contentDocument && contentDocument.defaultView;

        switch (embedStrategy) {
            case EMBED_STRATEGY_IFRAME_INNERHTML:
                // @NOTE: IE 9 fix. This line in the file is causing the page not to render in IE 9.
                // The link is not needed here anymore because we are including the stylesheet separately.
                if (browser.ielt10) {
                    svgText = svgText.replace(/<xhtml:link.*/,'');
                }
                html = HTML_TEMPLATE + svgText;
                // @NOTE: documentElement.innerHTML is read-only in IE
                if (browser.ielt10) {
                    contentDocument.body.innerHTML = html;
                } else {
                    contentDocument.documentElement.innerHTML = html;
                    // @NOTE: there is a bug in Safari 6 where <use>
                    // elements don't work properly
                    if ((browser.ios || browser.safari) && browser.version < 7) {
                        fixUseElements(contentDocument);
                    }
                }
                svgEl = contentDocument.getElementsByTagName('svg')[0];
                break;

            case EMBED_STRATEGY_IFRAME_PROXY:
                contentDocument.documentElement.innerHTML = HTML_TEMPLATE;
                var head = contentDocument.getElementsByTagName('head')[0] || contentDocument.documentElement,
                    script = contentDocument.createElement('script'),
                    data = '('+proxySVG+')()'; // IIFE to create window.loadSVG
                script.type = 'text/javascript';
                try {
                    // doesn't work on ie...
                    script.appendChild(document.createTextNode(data));
                } catch(e) {
                    // IE has funky script nodes
                    script.text = data;
                }
                head.insertBefore(script, head.firstChild);
                if (contentDocument.readyState === 'complete') {
                    contentWindow.loadSVG(svgText);
                } else {
                    contentWindow.onload = function () {
                        this.loadSVG(svgText);
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
                dom.appendTo(svgContainerEl, svgEl);
                break;

            case EMBED_STRATEGY_BASIC_OBJECT:
                dom.attr(svgContainerEl, {
                    type: SVG_MIME_TYPE,
                    data: scope.getDataProvider('page-svg').getURL(page)
                });
                svgEl = svgContainerEl;
                break;

            case EMBED_STRATEGY_BASIC_IMG:
                svgEl = svgContainerEl;
                svgEl.src = scope.getDataProvider('page-svg').getURL(page);
                break;

            case EMBED_STRATEGY_DATA_URL_IMG:
                svgEl = svgContainerEl;
                dataURLPrefix = 'data:' + SVG_MIME_TYPE;
                if (!browser.ie && window.btoa) {
                    svgEl.src = dataURLPrefix + ';base64,' + window.btoa(svgText);
                } else {
                    svgEl.src = dataURLPrefix + ',' + encodeURIComponent(svgText);
                }
                break;

            // no default
        }

        // make sure the svg width/height are explicity set to 100%
        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');
    }

    /**
     * handle SVG load success
     * @param   {string} text The SVG text
     * @returns {void}
     */
    function loadSVGSuccess(text) {
        if (!destroyed && !unloaded) {
            if (!svgLoaded && text) {
                embedSVG(text);
                svgLoaded = true;
                if (!removeOnUnload) {
                    // cleanup the promise (abort will remove the svg text from
                    // the in-memory cache as well)
                    $loadSVGPromise.abort();
                    $loadSVGPromise = null;
                }
            }
            // always insert and show the svg el when load was successful
            if (!svgContainerEl.parentNode) {
                dom.appendTo(containerEl, svgContainerEl);
            }
            dom.show(svgContainerEl);
        }
    }

    /**
     * Handle SVG load failure
     * @param   {*} error The error
     * @returns {void}
     */
    function loadSVGFail(error) {
        scope.broadcast('asseterror', error);
        svgLoaded = false;
        if ($loadSVGPromise) {
            $loadSVGPromise.abort();
        }
        // don't set the promise to null, because when it fails it should fail
        // for good...
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------


    return {
        /**
         * Initialize the page-svg component
         * @param {Element} el The element to load SVG layer into
         * @param  {number} pageNum The page number
         * @returns {void}
         */
        init: function (el, pageNum) {
            containerEl = el;
            page = pageNum;
            embedStrategy = viewerConfig.embedStrategy || embedStrategy;
        },

        /**
         * Destroy the page-svg component
         * @returns {void}
         */
        destroy: function () {
            destroyed = true;
            removeOnUnload = true;
            this.unload();
            dom.empty(containerEl);
        },

        /**
         * Prepare the element for loading
         * @returns {void}
         */
        prepare: function () {
            prepareSVGContainer();
        },

        /**
         * Prepare the SVG object to be loaded and start loading SVG text
         * @returns {void}
         */
        preload: function () {
            this.prepare();

            if (!$loadSVGPromise) {
                $loadSVGPromise = loadSVGText();
            }
        },

        /**
         * Load the SVG and call callback when complete.
         * If there was an error, callback's first argument will be
         * an error message, and falsy otherwise.
         * @returns {$.Promise}    A jQuery promise object
         */
        load: function () {
            unloaded = false;
            this.preload();
            $loadSVGPromise
                .done(loadSVGSuccess)
                .fail(loadSVGFail);
            return $loadSVGPromise;
        },

        /**
         * Unload (or hide) the SVG object
         * @returns {void}
         */
        unload: function () {
            unloaded = true;
            // stop loading the page if it hasn't finished yet
            if ($loadSVGPromise && $loadSVGPromise.state() !== 'resolved') {
                $loadSVGPromise.abort();
                $loadSVGPromise = null;
            }

            // remove the svg element if necessary
            if (removeOnUnload) {
                if (svgContainerEl) {
                    dom.remove(svgContainerEl);
                    svgContainerEl = null;
                }
                svgLoaded = false;
            } else if (svgContainerEl) {
                // just hide the svg element
                dom.hide(svgContainerEl);
            }
        }
    };
});
