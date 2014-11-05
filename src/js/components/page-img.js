/**
 * @fileoverview page-img component
 * @author lakenen
 */

/**
 * page-img component used to display raster image instead of SVG content for
 * browsers that do not support SVG
 */
Crocodoc.addComponent('page-img', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var browser = scope.getUtility('browser'),
        dom = scope.getUtility('dom');

    var imgEl, containerEl,
        loadImgPromise,
        page,
        imageLoaded = false,
        removeOnUnload = browser.mobile;

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the page-img component
         * @param  {Element} el     The element to insert the image into
         * @param  {number} pageNum The page number
         * @returns {void}
         */
        init: function (el, pageNum) {
            containerEl = el;
            page = pageNum;
        },

        /**
         * Destroy the page-img component
         * @returns {void}
         */
        destroy: function () {
            removeOnUnload = true;
            this.unload();
            dom.empty(containerEl);
        },

        /**
         * Prepare the element for loading
         * @returns {void}
         */
        prepare: function () { /* noop */ },

        /**
         * Preload the image
         * @returns {void}
         */
        preload: function () {
            if (!loadImgPromise) {
                loadImgPromise = scope.get('page-img', page);
            }
        },

        /**
         * Load the image
         * @returns {promise}    A Promise to load the page image
         */
        load: function () {
            this.preload();

            loadImgPromise.done(function loadImgSuccess(img) {
                if (!imageLoaded) {
                    imageLoaded = true;
                    imgEl = img;
                    dom.appendTo(containerEl, imgEl);
                }
                dom.show(imgEl);
            });

            loadImgPromise.fail(function loadImgFail(error) {
                imageLoaded = false;
                if (error) {
                    scope.broadcast('asseterror', error);
                }
            });

            return loadImgPromise;
        },

        /**
         * Unload (or hide) the img
         * @returns {void}
         */
        unload: function () {
            if (loadImgPromise) {
                loadImgPromise.abort();
                loadImgPromise = null;
            }
            if (removeOnUnload) {
                if (imgEl) {
                    dom.remove(imgEl);
                    imgEl = null;
                }
                imageLoaded = false;
            } else if (imgEl) {
                dom.hide(imgEl);
            }
        }
    };
});
