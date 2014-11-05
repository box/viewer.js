/**
 * @fileOverview Subpixel rendering fix for browsers that do not support subpixel rendering
 * @author lakenen
 */

Crocodoc.addUtility('subpx', function (framework) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var CSS_CLASS_SUBPX_FIX = 'crocodoc-subpx-fix',
        TEST_SPAN_TEMPLATE = '<span style="font:{{size}}px serif; color:transparent; white-space:nowrap;">' +
            (new Array(100)).join('A') + '</span>'; // repeat 'A' character;

    var util = framework.getUtility('common'),
        browser = framework.getUtility('browser'),
        dom = framework.getUtility('dom');

    /**
     * Return true if subpixel rendering is supported
     * @returns {Boolean}
     * @private
     */
    function isSubpixelRenderingSupported() {
        var span, fontsize1, fontsize2, width1, width2;

        // Test if subpixel rendering is supported
        // IE6-8 will never support subpixel rendering, so this is the easiest test
        if (browser.ielt9) {
            return false;
        } else {
            //span #1 - desired font-size: 12.5px
            span = dom.html(util.template(TEST_SPAN_TEMPLATE, { size: 12.5 }));
            dom.appendTo(document.documentElement, span);
            fontsize1 = dom.css(span, 'font-size');
            width1 = dom.css(span, 'width');
            dom.remove(span);

            //span #2 - desired font-size: 12.6px
            span = dom.html(util.template(TEST_SPAN_TEMPLATE, { size: 12.6 }));
            dom.appendTo(document.documentElement, span);
            fontsize2 = dom.css(span, 'font-size');
            width2 = dom.css(span, 'width');
            dom.remove(span);

            // is not mobile device?
            // @NOTE(plai): Mobile WebKit supports subpixel rendering even though the browser fails the following tests.
            // @NOTE(plai): When modifying these tests, make sure that these tests will work even when the browser zoom is changed.
            // @TODO(plai): Find a better way of testing for mobile Safari.
            if (!browser.ios) {

                //font sizes are the same? (Chrome and Safari will fail this)
                if (fontsize1 === fontsize2) {
                    return false;
                }

                //widths are the same? (Firefox on Windows without GPU will fail this)
                if (width1 === width2) {
                    return false;
                }
            }
        }

        return true;
    }

    var subpixelRenderingIsSupported = isSubpixelRenderingSupported();

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Apply the subpixel rendering fix to the given element if necessary.
         * @NOTE: Fix is only applied if the "zoom" CSS property exists
         *        (ie., this fix is never applied in Firefox)
         * @param   {Element} el The element
         * @returns {Element} The element
         */
        fix: function (el) {
            var wrap;
            if (!subpixelRenderingIsSupported) {
                if (document.body.style.zoom !== undefined) {
                    wrap = dom.create('div');
                    dom.addClass(wrap, CSS_CLASS_SUBPX_FIX);
                    dom.html(wrap, el.innerHTML);
                    dom.html(el, wrap.outerHTML);
                }
            }
            return el;
        },

        /**
         * Is sub-pixel text rendering supported?
         * @param   {void}
         * @returns {boolean} true if sub-pixel tex rendering is supported
         */
        isSubpxSupported: function() {
            return subpixelRenderingIsSupported;
        }
    };
});
