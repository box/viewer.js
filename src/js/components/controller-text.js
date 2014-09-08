/**
 * @fileoverview controller-text component
 * @author lakenen
 */

Crocodoc.addComponent('controller-text', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var dom = scope.getUtility('dom'),
        promise;

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        /**
         * Initialize the controller
         * @returns {void}
         */
        init: function () {
            var config = scope.getConfig();

            // we can just load the text immediately
            promise = scope.get('page-text', 1);
            promise.then(function (html) {
                dom.html(config.viewportEl, html);
                config.docEl = dom.find(CSS_CLASS_DOC, config.viewportEl);
            });
        },

        /**
         * Destroy the viewer-base component
         * @returns {void}
         */
        destroy: function () {
            promise.abort();
        }
    };
});
