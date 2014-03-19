/**
 * @fileoverview page-img component
 * @author clakenen
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

    var browser = scope.getUtility('browser');

    var $img, $el,
        imgSrc,
        loading = false,
        removeOnUnload = browser.mobile;

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the page-img component
         * @param  {Object} config Configuration object
         * @returns {void}
         */
        init: function (el, config) {
            $el = $(el);
            imgSrc = config.imgSrc + (config.queryString || '');
        },

        /**
         * Destroy the page-img component
         * @returns {void}
         */
        destroy: function () {
            $el.empty();
        },

        /**
         * Preload does nothing in this component -- it's here for
         * consistency with the page-svg component API
         * @returns {void}
         */
        preload: function () { /* noop */ },

        /**
         * Load the image
         * @returns {$.Deferred}    A jQuery Deferred object
         */
        load: function () {
            var $deferred = $.Deferred();
            if (!$img) {
                // image hasn't been loaded yet, so create an image
                var img = new window.Image();
                loading = true;
                // add load and error handlers
                img.onload = function () {
                    loading = false;
                    $deferred.resolve();
                };
                img.onerror = function () {
                    $img = null;
                    $deferred.reject({
                        error: 'failed to load image'
                    });
                };
                // load the image
                img.src = imgSrc;
                // insert into the DOM
                $img = $(img);
                $el.html($img);
            } else {
                if (!loading) {
                    $deferred.resolve();
                }
            }
            $img.show();
            return $deferred;
        },

        /**
         * Unload (or hide) the img
         * @returns {void}
         */
        unload: function () {
            loading = false;
            if (removeOnUnload) {
                $img.remove();
                $img = null;
            } else if ($img) {
                $img.hide();
            }
        }
    };
});
