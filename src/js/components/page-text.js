/**
 * @fileoverview page-text component
 * @author lakenen
 */

/**
 * page-text component
 */
Crocodoc.addComponent('page-text', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var browser = scope.getUtility('browser'),
        dom = scope.getUtility('dom'),
        subpx   = scope.getUtility('subpx');

    var destroyed = false,
        loaded = false,
        containerEl,
        $loadTextPromise,
        page,
        viewerConfig = scope.getConfig();

    /**
     * Return true if we should use the text layer, false otherwise
     * @returns {bool}
     * @private
     */
    function shouldUseTextLayer() {
        return viewerConfig.enableTextSelection && !browser.ielt9;
    }

    /**
     * Handle success loading HTML text
     * @param {string} text The HTML text
     * @returns {void}
     * @private
     */
    function loadTextLayerHTMLSuccess(text) {
        var doc, textEl;

        if (!text || loaded || destroyed) {
            return;
        }

        loaded = true;

        // create a document to parse the html text
        doc = document.implementation.createHTMLDocument('');
        doc.getElementsByTagName('body')[0].innerHTML = text;
        text = null;

        // select just the element we want (CSS_CLASS_PAGE_TEXT)
        textEl = document.importNode(doc.querySelector('.' + CSS_CLASS_PAGE_TEXT), true);
        dom.attr(containerEl, { 'class': textEl.getAttribute('class') });
        dom.html(containerEl, textEl.innerHTML);
        subpx.fix(containerEl);
    }

    function loadTextLayerHTMLFail(error) {
        if (error) {
            scope.broadcast('asseterror', error);
        }
    }

    /**
     * Load text html if necessary and insert it into the element
     * @returns {$.Promise}
     * @private
     */
    function loadTextLayerHTML() {
        // already load(ed|ing)?
        if (!$loadTextPromise) {
            if (shouldUseTextLayer()) {
                $loadTextPromise = scope.get('page-text', page);
            } else {
                $loadTextPromise = $.Deferred().resolve().promise({
                    abort: function () {}
                });
            }
        }

        return $loadTextPromise;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the page-text component
         * @param {Element} el The element to load the text layer into
         * @returns {void}
         */
        init: function (el, pageNum) {
            containerEl = el;
            page = pageNum;
        },

        /**
         * Destroy the page-text component
         * @returns {void}
         */
        destroy: function () {
            destroyed = true;
            this.unload();
            dom.empty(containerEl);
        },

        /**
         * Start loading HTML text
         * @returns {void}
         */
        preload: function () {
            loadTextLayerHTML();
        },

        /**
         * Load the html text for the text layer and insert it into the element
         * if text layer is enabled and is not loading/has not already been loaded
         * @returns {$.Promise} A promise to load the text layer
         */
        load: function () {
            return loadTextLayerHTML()
                .done(loadTextLayerHTMLSuccess)
                .fail(loadTextLayerHTMLFail);
        },

        /**
         * Stop loading the text layer (no need to actually remove it)
         * @returns {void}
         */
        unload: function () {
            if ($loadTextPromise && $loadTextPromise.state() !== 'resolved') {
                $loadTextPromise.abort();
                $loadTextPromise = null;
            }
        },

        /**
         * Enable text selection
         * @returns {void}
         */
        enable: function () {
            dom.show(containerEl);
            // we created an empty promise if text selection was previously disabled,
            // so we can scrap it so a new promise will be created next time this
            // page is requested
            if ($loadTextPromise && !loaded) {
                $loadTextPromise = null;
            }
        },

        /**
         * Disable text selection
         * @returns {void}
         */
        disable: function () {
            dom.hide(containerEl);
        }
    };
});
