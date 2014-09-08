/**
 * @fileoverview page-link component
 * @author lakenen
 */

/**
 * page-links component definition
 */
Crocodoc.addComponent('page-links', function (scope) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var containerEl,
        util = scope.getUtility('common'),
        browser = scope.getUtility('browser'),
        dom = scope.getUtility('dom'),
        linkId = 0,
        spanEls = [],
        linkData = [];

    /**
     * Create a link element given link data
     * @param   {Object} link The link data
     * @returns {void}
     * @private
     */
    function createLink(link) {
        var linkEl = dom.create('a'),
            left = link.bbox[0],
            top = link.bbox[1],
            attr = {};

        dom.addClass(linkEl, CSS_CLASS_PAGE_LINK);
        if (browser.ie) {
            // @NOTE: IE doesn't allow override of ctrl+click on anchor tags,
            // but there is a workaround to add a child element (which triggers
            // the onclick event first)
            var spanEl = dom.create('span');
            dom.appendTo(linkEl, spanEl)
            dom.on(spanEl, 'click', handleClick);
        }

        dom.css(linkEl, {
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

        dom.attr(linkEl, attr);
        dom.data(linkEl, 'link', linkId);
        linkData[linkId++] = link;
        dom.appendTo(containerEl, linkEl);
    }

    /**
     * Handle link clicks
     * @param   {Event} event The event object
     * @returns {void}
     * @private
     */
    function handleClick(event) {
        var targetEl = browser.ie ? event.target.parentNode : event.target,
            linkEl = targetEl,
            data = linkData[dom.data(linkEl, 'link')];

        if (data) {
            scope.broadcast('linkclick', data);
        }
        event.preventDefault();
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Initialize the page-links component
         * @param  {Array} links Links configuration array
         * @returns {void}
         * @TODO (possible): make a links data-provider instead of passing
         * them in as an argument?
         */
        init: function (el, links) {
            containerEl = el;
            this.createLinks(links);
            if (!browser.ie) {
                // @NOTE: event handlers are individually bound in IE, because
                // the ctrl+click workaround fails when using event delegation
                dom.on(el, 'click', '.' + CSS_CLASS_PAGE_LINK, handleClick);
            }
        },

        /**
         * Destroy the page-links component
         * @returns {void}
         */
        destroy: function () {
            util.each(spanEls, function (s) {
                dom.off(s, 'click', handleClick);
            });
            dom.empty(containerEl)
            dom.off(containerEl, 'click', handleClick);
            containerEl = browser = spanEls = linkData = null;
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
