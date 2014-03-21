/**
 * @fileoverview page-text component
 * @author clakenen
 */

/**
 * page-text component
 */
Crocodoc.addComponent('page-text', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var CSS_CLASS_PAGE_TEXT = 'crocodoc-page-text',
        MAX_TEXT_BOXES = 256;

    var browser = scope.getUtility('browser'),
        subpx   = scope.getUtility('subpx'),
        ajax    = scope.getUtility('ajax'),
        util    = scope.getUtility('common');

    var destroyed = false,
        loaded = false,
        $textLayer,
        request,
        $loadTextLayerHTMLPromise,
        textSrc,
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
    function completeLoad(text) {
        var doc, textEl;

        if (!text || loaded) {
            return;
        }

        loaded = true;

        // in the text layer, divs are only used for text boxes, so
        // they should provide an accurate count
        var numTextBoxes = util.countInStr(text, '<div');
        // too many textboxes... don't load this page for performance reasons
        if (numTextBoxes > MAX_TEXT_BOXES) {
            return;
        }

        // remove reference to the styles
        // @TODO: stylesheet should not be referenced in text layer html
        text = text.replace(/<link rel="stylesheet".*/, '');

        // create a document to parse the html text
        doc = document.implementation.createHTMLDocument('');
        doc.getElementsByTagName('body')[0].innerHTML = text;
        text = null;

        // select just the element we want (CSS_CLASS_PAGE_TEXT)
        textEl = document.importNode(doc.querySelector('.' + CSS_CLASS_PAGE_TEXT), true);
        $textLayer.attr('class', textEl.getAttribute('class'));
        $textLayer.html(textEl.innerHTML);
        subpx.fix($textLayer);
    }

    /**
     * Handle failure loading HTML text
     * @returns {void}
     * @private
     */
    function handleHTMLTextFail(error) {
        scope.broadcast('asseterror', error);
    }

    /**
     * Load text html if necessary and insert it into the element
     * @returns {$.Promise}
     * @private
     */
    function loadTextLayerHTML() {
        // already load(ed|ing)?
        if ($loadTextLayerHTMLPromise) {
            return $loadTextLayerHTMLPromise;
        }
        var $deferred = $.Deferred();

        request = ajax.request(textSrc, {
            success: function () {
                if (destroyed) {
                    return;
                }

                request = null;
                if (this.responseText.length === 0) {
                    handleHTMLTextFail({
                        error: 'empty response',
                        status: this.status,
                        resource: textSrc
                    });
                }

                // always reslove, because text layer failure shouldn't
                // prevent a page from being viewed
                $deferred.resolve(this.responseText);
            },
            fail: function () {
                if (destroyed) {
                    return;
                }

                request = null;
                handleHTMLTextFail({
                    error: this.statusText,
                    status: this.status,
                    resource: textSrc
                });

                // always reslove, because text layer failure shouldn't
                // prevent a page from being viewed
                $deferred.resolve();
            }
        });

        $loadTextLayerHTMLPromise = $deferred.promise();
        return $loadTextLayerHTMLPromise;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the page-text component
         * @param {jQuery} $el The jQuery element to load the text layer into
         * @param  {Object} config Configuration options
         * @returns {void}
         */
        init: function ($el, config) {
            $textLayer = $el;
            textSrc = config.textSrc + config.queryString;
        },

        /**
         * Destroy the page-text component
         * @returns {void}
         */
        destroy: function () {
            destroyed = true;
            $textLayer.empty();
        },

        /**
         * Start loading HTML text
         * @returns {void}
         */
        preload: function () {
            if (shouldUseTextLayer()) {
                loadTextLayerHTML();
            }
        },

        /**
         * Load the html text for the text layer and insert it into the element
         * if text layer is enabled and is not loading/has not already been loaded
         * @returns {$.Promise} A promise to load the text layer or false if the
         * text layer should not be loaded
         */
        load: function () {
            if (shouldUseTextLayer()) {
                return loadTextLayerHTML()
                    .then(completeLoad);
            }
            return false;
        },

        /**
         * Stop loading the text layer (no need to actually remove it)
         * @returns {void}
         */
        unload: function () {
            if (request && request.abort) {
                request.abort();
                request = null;
                $loadTextLayerHTMLPromise = null;
            }
        },

        /**
         * Enable text selection
         * @returns {void}
         */
        enable: function () {
            $textLayer.css('display', '');
        },

        /**
         * Disable text selection
         * @returns {void}
         */
        disable: function () {
            $textLayer.css('display', 'none');
        }
    };
});
