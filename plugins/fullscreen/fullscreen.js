/**
 * @fileOverview The fullscreen plugin
 * @author lakenen
 */

Crocodoc.addPlugin('fullscreen', function (scope) {
    'use strict';

    // shorter way of defining
    // 'fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange'
    var FULLSCREENCHANGE_EVENT = ['', ' webkit', ' moz', ' ']
        .join('fullscreenchange') +
        // @NOTE: IE 11 uses upper-camel-case for this, which is apparently necessary
        'MSFullscreenChange';

    var el,
        util = scope.getUtility('common'),
        dom = scope.getUtility('dom'),
        viewerConfig = scope.getConfig(),
        viewerAPI = viewerConfig.api,
        requestFullscreen,
        cancelFullscreen,
        useFakeFullscreen = true,
        isFakeFullscreen = false;

    /**
     * Return true if full screen is active
     * @returns {boolean}
     * @private
     */
    function isFullscreen() {
        return document.fullScreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            isFakeFullscreen;
    }

    /**
     * Handle fullscreenchange events
     * @returns {void}
     * @private
     */
    function fullscreenchangeHandler() {
        viewerAPI.fire('fullscreenchange');
        if (isFullscreen()) {
            dom.addClass(el, 'crocodoc-fullscreen');
            viewerAPI.fire('fullscreenenter');
        } else {
            dom.removeClass(el, 'crocodoc-fullscreen');
            viewerAPI.fire('fullscreenexit');
        }
    }

    /**
     * Handle keydown events
     * @param   {Event} event The keydown event
     * @returns {void}
     * @private
     */
    function handleKeydown(event) {
        if (event.keyCode === 27) { // ESC
            exitFullscreen();
        }
    }

    /**
     * Enter fake fullscreen mode
     * @returns {void}
     * @private
     */
    function fakeRequestFullscreen() {
        if (useFakeFullscreen) {
            isFakeFullscreen = true;
            dom.on(window, 'keydown', handleKeydown);
            dom.addClass(el, 'crocodoc-fakefullscreen');
            fullscreenchangeHandler();
        }
    }

    /**
     * Exit fake fullscreen mode
     * @returns {void}
     * @private
     */
    function fakeCancelFullscreen() {
        isFakeFullscreen = false;
        dom.off(window, 'keydown', handleKeydown);
        dom.removeClass(el, 'crocodoc-fakefullscreen');
        fullscreenchangeHandler();
    }

    /**
     * @param {Element} element The element to make full screen
     * @returns {void}
     * @private
     */
    function enterFullscreen() {
        requestFullscreen.call(el);
    }

    /**
     * Exit full screen
     * @returns {void}
     * @private
     */
    function exitFullscreen() {
        cancelFullscreen.call(document);
    }

    /**
     * Return true if native fullscreen mode is supported
     * @returns {Boolean} Whether fullscreen mode is supported
     * @private
     */
    function isNativeFullscreenSupported() {
        return requestFullscreen !== fakeRequestFullscreen;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        /**
         * Initialize the fullscreen plugin
         * @param {Object} config Config options for the fullscreen plugin
         * @param {Element} config.element The element to use for fullscreen
         * @param {boolen} config.useFakeFullscreen Whether to use fake fullscreen mode
         * @returns {void}
         */
        init: function (config) {
            config = config || {};
            if (typeof config.useFakeFullscreen !== 'undefined') {
                useFakeFullscreen = config.useFakeFullscreen;
            }

            if (viewerConfig.useWindowAsViewport) {
                // fake fullscreen mode is redundant if the window is used as
                // the viewport, so turn it off
                useFakeFullscreen = false;
                el = document.documentElement;
            } else {
                if (config.element) {
                    if (typeof config.element === 'string') {
                        el = dom.find(config.element);
                    } else {
                        el = config.element;
                    }
                } else {
                    el = viewerConfig.el;
                }
            }

            // init browser-specific request/cancel fullscreen methods
            requestFullscreen = el.requestFullScreen ||
                                el.requestFullscreen ||
                                el.mozRequestFullScreen ||
                                el.webkitRequestFullScreen ||
                                el.msRequestFullscreen ||
                                fakeRequestFullscreen;

            // fullscreen APIs are completely insane
            cancelFullscreen =  document.cancelFullScreen ||
                                document.exitFullscreen ||
                                document.mozCancelFullScreen ||
                                document.webkitCancelFullScreen ||
                                document.msExitFullscreen ||
                                fakeCancelFullscreen;

            // add enter/exit fullscreen methods to the viewer API
            util.extend(viewerAPI, {
                enterFullscreen: enterFullscreen,
                exitFullscreen: exitFullscreen,
                isFullscreen: isFullscreen,
                isFullscreenSupported: isNativeFullscreenSupported
            });

            dom.on(document, FULLSCREENCHANGE_EVENT, fullscreenchangeHandler);
        },

        /**
         * Destroy the fullscreen plugin
         * @returns {void}
         */
        destroy: function () {
            viewerAPI.exitFullscreen();
            dom.off(document, FULLSCREENCHANGE_EVENT, fullscreenchangeHandler);
        }
    };
});
