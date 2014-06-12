/**
 * @fileoverview Resizer component used to watch an element and fire
 * an event when the object's width or height changes
 * @author lakenen
 */

/**
 * resizer component definition
 */
Crocodoc.addComponent('resizer', function (scope) {

    'use strict';

    var support = scope.getUtility('support');

    // shorter way of defining
    // 'fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange'
    var FULLSCREENCHANGE_EVENT = ['', ' webkit', ' moz', ' ']
        .join('fullscreenchange') +
        // @NOTE: IE 11 uses upper-camel-case for this, which is apparently necessary
        'MSFullscreenChange';

    var $window = $(window),
        $document = $(document),
        element,
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

        messages: [
            'layoutchange'
        ],

        /**
         * Handle framework messages
         * @returns {void}
         */
        onmessage: function () {
            // force trigger resize when layout changes
            // @NOTE: we do this because the clientWidth/Height
            // could be different based on the layout (and whether
            // or not the new layout changes scrollbars)
            currentOffsetHeight = null;
            checkResize();
        },

        /**
         * Initialize the Resizer component with an element to watch
         * @param  {HTMLElement} el The element to watch
         * @returns {void}
         */
        init: function (el) {
            element = $(el).get(0);

            // use the documentElement for viewport dimensions
            // if we are using the window as the viewport
            if (element === window) {
                element = document.documentElement;
                $window.on('resize', checkResize);
                // @NOTE: we don't need to loop with
                // requestAnimationFrame in this case,
                // because we can rely on window.resize
                // events if the window is our viewport
                checkResize();
            } else {
                loop();
            }
           $document.on(FULLSCREENCHANGE_EVENT, broadcast);
        },

        /**
         * Destroy the Resizer component
         * @returns {void}
         */
        destroy: function () {
            $document.off(FULLSCREENCHANGE_EVENT, broadcast);
            $window.off('resize', checkResize);
            support.cancelAnimationFrame(resizeFrameID);
        }
    };
});
