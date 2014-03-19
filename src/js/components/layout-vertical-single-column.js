/**
 * @fileoverview layout-vertical-single-column component definition
 * @author clakenen
 */

/**
 * The vertical-single-column layout
 */
Crocodoc.addComponent('layout-' + Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN, ['layout-' + Crocodoc.LAYOUT_VERTICAL], function (scope, vertical) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var util = scope.getUtility('common');

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return util.extend({}, vertical, {
        /**
         * Initialize the vertical-single-column layout component
         * @returns {void}
         */
        init: function () {
            var config = scope.getConfig();
            config.layout = Crocodoc.LAYOUT_VERTICAL_SINGLE_COLUMN;
            vertical.init.call(this);
        }
    });
});
