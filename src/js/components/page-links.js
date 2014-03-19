/**
 * @fileoverview page-link component
 * @author clakenen
 */

/**
 * page-links component definition
 */
Crocodoc.addComponent('page-links', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var CSS_CLASS_PAGE_LINK = 'crocodoc-page-link';

    var $el;

    /**
     * Create a link element given link data
     * @param   {Object} link The link data
     * @returns {void}
     * @private
     */
    function createLink(link) {
        var $link = $('<a>').addClass(CSS_CLASS_PAGE_LINK),
            left = link.bbox[0],
            top = link.bbox[1],
            attr = {};
        $link.css({
            left: left + 'pt',
            top: top + 'pt',
            width: link.bbox[2] - left + 'pt',
            height: link.bbox[3] - top + 'pt'
        });
        if (link.uri) {
            if (/^http|^mailto/.test(link.uri)) {
                attr.href = encodeURI(link.uri);
                attr.target = '_blank';
            } else {
                // don't embed this link... we don't trust the protocol
                return;
            }
        } else if (link.destination) {
            attr.href = '#page-' + link.destination.pagenum;
        }
        $link.attr(attr);
        $link.data('link', link);
        $link.appendTo($el);
    }

    /**
     * Handle link clicks
     * @param   {Event} ev The event object
     * @returns {void}
     * @private
     */
    function handleClick(ev) {
        var $link = $(ev.target),
            data = $link.data('link');
        if (data) {
            scope.broadcast('linkclicked', data);
        }
        ev.preventDefault();
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the page-links component
         * @param  {Array} links Links configuration array
         * @returns {void}
         */
        init: function (el, links) {
            $el = $(el);
            this.createLinks(links);
            $el.on('click', '.'+CSS_CLASS_PAGE_LINK, handleClick);
        },

        /**
         * Destroy the page-links component
         * @returns {void}
         */
        destroy: function () {
            $el.empty().off('click');
        },

        /**
         * Create and insert link elements into the element
         * @param   {Array} links Array of link data
         * @returns {void}
         */
        createLinks: function (links) {
            var i, len;
            for (i = 0, len = links.length; i < len; ++i) {
                createLink(links[i]);
            }
        }
    };
});
