/**
 * @fileoverview Support utility for feature detection / browser support
 * @author lakenen
 */

Crocodoc.addUtility('support', function () {

    'use strict';
    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];

    /**
     * Helper function to get the proper vendor property name
     * (`transition` => `WebkitTransition`)
     * @param {string} prop The property name to test for
     * @returns {string|boolean} The vendor-prefixed property name or false if the property is not supported
     */
    function getVendorCSSPropertyName(prop) {
        var testDiv = document.createElement('div'),
            prop_, i, vendorProp;

        // Handle unprefixed versions (FF16+, for example)
        if (prop in testDiv.style) {
            return prop;
        }

        prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

        if (prop in testDiv.style) {
            return prop;
        }

        for (i = 0; i < prefixes.length; ++i) {
            vendorProp = prefixes[i] + prop_;
            if (vendorProp in testDiv.style) {
                if (vendorProp.indexOf('ms') === 0) {
                    vendorProp = '-' + vendorProp;
                }
                return uncamel(vendorProp);
            }
        }

        return false;
    }

    /**
     * Converts a camelcase string to a dasherized string.
     * (`marginLeft` => `margin-left`)
     * @param {stirng} str The camelcase string to convert
     * @returns {string} The dasherized string
     */
    function uncamel(str) {
        return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
    }

    // requestAnimationFrame based on:
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    var raf, caf;
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        raf = window.requestAnimationFrame;
        caf = window.cancelAnimationFrame;
        for (var x = 0; x < vendors.length && !raf; ++x) {
            raf = window[vendors[x] + 'RequestAnimationFrame'];
            caf = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!raf) {
            raf = function(callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
            caf = function(id) {
                clearTimeout(id);
            };
        }
    }());


    return {
        svg: document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1'),
        csstransform: getVendorCSSPropertyName('transform'),
        csstransition: getVendorCSSPropertyName('transition'),
        csszoom: getVendorCSSPropertyName('zoom'),

        /**
         * Request an animation frame with the given arguments
         * @returns {int} The frame id
         */
        requestAnimationFrame: function () {
            return raf.apply(window, arguments);
        },

        /**
         * Cancel the animation frame with the given id
         * @returns {void}
         */
        cancelAnimationFrame: function () {
            caf.apply(window, arguments);
        }
    };
});
