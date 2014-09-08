/**
 * @fileoverview Dragger component used to click-to-drag the document when enabled
 * @author lakenen
 */

/**
 * Dragger component definition
 */
Crocodoc.addComponent('dragger', function (scope) {

    'use strict';

    var element,
        dom = scope.getUtility('dom'),
        downScrollPosition,
        downMousePosition;

    /**
     * Handle mousemove events
     * @param   {Event} event The event object
     * @returns {void}
     */
    function handleMousemove(event) {
        element.scrollTop = downScrollPosition.y - (event.clientY - downMousePosition.y);
        element.scrollLeft = downScrollPosition.x - (event.clientX - downMousePosition.x);
        event.preventDefault();
    }

    /**
     * Handle mouseup events
     * @param   {Event} event The event object
     * @returns {void}
     */
    function handleMouseup(event) {
        scope.broadcast('dragend');
        dom.off(document, 'mousemove', handleMousemove);
        dom.off(document, 'mouseup', handleMouseup);
        event.preventDefault();
    }

    /**
     * Handle mousedown events
     * @param   {Event} event The event object
     * @returns {void}
     */
    function handleMousedown(event) {
        scope.broadcast('dragstart');
        downScrollPosition = {
            x: element.scrollLeft,
            y: element.scrollTop
        };
        downMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        dom.on(document, 'mousemove', handleMousemove);
        dom.on(document, 'mouseup', handleMouseup);
        event.preventDefault();
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the scroller component
         * @param   {Element} el The Element
         * @returns {void}
         */
        init: function (el) {
            element = el;
            dom.on(element, 'mousedown', handleMousedown);
        },

        /**
         * Destroy the scroller component
         * @returns {void}
         */
        destroy: function () {
            dom.off(element, 'mousedown', handleMousedown);
            dom.off(element, 'mousemove', handleMousemove);
            dom.off(document, 'mouseup', handleMouseup);
        }
    };
});
