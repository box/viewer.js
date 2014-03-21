/**
 * @fileoverview Resizer component used to watch an element and fire
 * an event when the object's width or height changes
 * @author clakenen
 */

/**
 * resizer component definition
 */
Crocodoc.addComponent('resizer', function (scope) {

    'use strict';

    var support = scope.getUtility('support');

    // shorter way of defining
    // 'webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange'
    var FULLSCREENCHANGE_EVENT = ['webkit',' moz', ' ms', ' ', ''].join('fullscreenchange');

    var element,
        currentClientWidth,
        currentClientHeight,
        currentOffsetWidth,
        currentOffsetHeight,
        resizeFrameID;

    /**
     * Fire the resize event with the proper data
     * @returns {void}
     * @private
     */
    function broadcast() {
        scope.broadcast('resize', {
            // shortcuts for offsetWidth/height
            width: currentOffsetWidth,
            height: currentOffsetHeight,
            // client width is width of the inner, visible area
            clientWidth: currentClientWidth,
            clientHeight: currentClientHeight,
            // offset width is the width of the element, including border,
            // padding, and scrollbars
            offsetWidth: currentOffsetWidth,
            offsetHeight: currentOffsetHeight
        });
    }

    /**
     * Check if the element has resized every animation frame
     * @returns {void}
     * @private
     */
    function loop() {
        support.cancelAnimationFrame(resizeFrameID);
        checkResize();
        resizeFrameID = support.requestAnimationFrame(loop, element);
    }

    /**
     * Check if the element has resized, and broadcast the resize event if so
     * @returns {void}
     * @private
     */
    function checkResize () {
        var newOffsetHeight = element.offsetHeight,
            newOffsetWidth = element.offsetWidth;
        //on touch devices, the offset height is sometimes zero as content is loaded
        if (newOffsetHeight) {
            if (newOffsetHeight !== currentOffsetHeight || newOffsetWidth !== currentOffsetWidth) {
                currentOffsetHeight = newOffsetHeight;
                currentOffsetWidth = newOffsetWidth;
                currentClientHeight = element.clientHeight;
                currentClientWidth = element.clientWidth;
                broadcast();
            }
        }
    }

    return {
        /**
         * Initialize the Resizer component with an element to watch
         * @param  {HTMLElement} el The element to watch
         * @returns {void}
         */
        init: function (el) {
            element = $(el).get(0);
           $(document).on(FULLSCREENCHANGE_EVENT, broadcast);
            loop();
        },

        /**
         * Destroy the Resizer component
         * @returns {void}
         */
        destroy: function () {
           $(document).off(FULLSCREENCHANGE_EVENT, broadcast);
            support.cancelAnimationFrame(resizeFrameID);
        }
    };
});
