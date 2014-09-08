/**
 * @fileoverview layout-presentation component definition
 * @author lakenen
 */

/**
 *The presentation layout
 */
Crocodoc.addComponent('layout-' + LAYOUT_PRESENTATION, ['layout-paged'], function (scope, paged) {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    var util = scope.getUtility('common'),
        dom = scope.getUtility('dom');

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return paged.extend({
        /**
         * Initialize the presentation layout component
         * @returns {void}
         */
        init: function () {
            paged.init.call(this);
            this.updatePageMargins();
            this.updatePageClasses();
        },

        /**
         * Destroy the component
         * @returns {void}
         */
        destroy: function () {
            paged.destroy.call(this);
            dom.css(this.pageEls, { margin: '', left: '' })
            dom.removeClass(this.pageEls, PRESENTATION_CSS_CLASSES);
        },

        /**
         * Calculate the numeric value for zoom 'auto' for this layout mode
         * @returns {float} The zoom value
         */
        calculateZoomAutoValue: function () {
            var fitWidth = this.calculateZoomValue(ZOOM_FIT_WIDTH),
                fitHeight = this.calculateZoomValue(ZOOM_FIT_HEIGHT);
            return Math.min(fitWidth, fitHeight);
        },

        /**
         * Calculate which page is currently the "focused" page.
         * In presentation mode, it's just the state's current page.
         * @returns {int} The current page
         */
        calculateCurrentPage: function () {
            return this.state.currentPage;
        },

        /**
         * Calculates the next page
         * @returns {int} The next page number
         */
        calculateNextPage: function () {
            return this.state.currentPage + 1;
        },

        /**
         * Calculates the previous page
         * @returns {int} The previous page number
         */
        calculatePreviousPage: function () {
            return this.state.currentPage - 1;
        },

        /**
         * Calculates the current range of pages that are visible
         * @returns {Object} Range object with min and max values
         */
        calculateVisibleRange: function () {
            var index = this.state.currentPage - 1;
            return util.constrainRange(index, index, this.numPages);
        },

        /**
         * Calculates the current range of pages that are fully visible
         * @NOTE: this can be incorrect for presentations that are zoomed in
         * past the size of the viewport... I'll fix it if it becomes an issue
         * @returns {Object} Range object with min and max values
         */
        calculateFullyVisibleRange: function () {
            return this.calculateVisibleRange();
        },

        /**
         * Set the current page and updatePageClasses
         * @param {int} page The page number
         */
        setCurrentPage: function (page) {
            var index = util.clamp(page - 1, 0, this.numPages),
                precedingPageEl,
                currentPageEl;

            paged.setCurrentPage.call(this, page);

            // update CSS classes
            precedingPageEl = dom.find('.' + CSS_CLASS_PRECEDING_PAGE, this.docEl);
            dom.removeClass(precedingPageEl, CSS_CLASS_PRECEDING_PAGE);

            precedingPageEl = dom.find('.' + CSS_CLASS_CURRENT_PAGE, this.docEl);
            currentPageEl = this.pageEls[index];

            if (precedingPageEl !== currentPageEl) {
                dom.addClass(precedingPageEl, CSS_CLASS_PRECEDING_PAGE);
                dom.removeClass(precedingPageEl, CSS_CLASS_CURRENT_PAGE);
                dom.addClass(currentPageEl, CSS_CLASS_CURRENT_PAGE);
            }

            this.updateVisiblePages(true);
            this.updatePageClasses(index);
        },

        /**
         * Scroll to the given page number
         * @param   {int} page The page number to scroll to
         * @returns {void}
         */
        scrollToPage: function (page) {
            this.setCurrentPage(page);
        },

        /**
         * Updates the layout elements (pages, doc, etc) CSS
         * appropriately for the current zoom level
         * @returns {void}
         */
        updateLayout: function () {
            var state = this.state,
                zoomState = state.zoomState,
                zoom = zoomState.zoom,
                page = this.currentPage || 1,
                currentPage = state.pages[page - 1],
                secondPage = this.twoPageMode ? state.pages[page] : currentPage,
                viewportWidth = state.viewportDimensions.clientWidth,
                viewportHeight = state.viewportDimensions.clientHeight,
                secondPageWidth,
                currentPageWidth,
                currentPageHeight,
                zoomedWidth, zoomedHeight,
                docWidth, docHeight,
                isScrollable;

            secondPageWidth = secondPage.actualWidth;
            currentPageWidth = currentPage.actualWidth + (this.twoPageMode ? secondPageWidth : 0);
            currentPageHeight = currentPage.actualHeight;

            zoomedWidth = Math.floor((currentPageWidth + currentPage.paddingLeft + secondPage.paddingRight) * zoom);
            zoomedHeight = Math.floor((currentPage.totalActualHeight) * zoom);

            docWidth = Math.max(zoomedWidth, viewportWidth);
            docHeight = Math.max(zoomedHeight, viewportHeight);

            dom.css(this.docEl, {
                width: docWidth,
                height: docHeight
            });

            this.updatePageMargins();

            isScrollable = docWidth > viewportWidth || docHeight > viewportHeight;
            dom.toggleClass(this.el, 'crocodoc-scrollable', isScrollable);
        },

        /**
         * Update page margins for the viewport size and zoom level
         * @returns {void}
         */
        updatePageMargins: function () {
            var i, len, page, pageEl,
                width, height, left, top, paddingH,
                state = this.state,
                viewportWidth = state.viewportDimensions.clientWidth,
                viewportHeight = state.viewportDimensions.clientHeight;
            // update pages so they are centered (preserving margins)
            for (i = 0, len = this.pageEls.length; i < len; ++i) {
                pageEl = this.pageEls[i];
                page = state.pages[i];

                if (this.twoPageMode) {
                    paddingH = (i % 2 === 1) ? page.paddingRight : page.paddingLeft;
                } else {
                    paddingH = page.paddingRight + page.paddingLeft;
                }
                width = (page.actualWidth + paddingH) * state.zoomState.zoom;
                height = (page.actualHeight + page.paddingTop + page.paddingBottom) * state.zoomState.zoom;

                if (this.twoPageMode) {
                    left = Math.max(0, (viewportWidth - width * 2) / 2);
                    if (i % 2 === 1) {
                        left += width;
                    }
                } else {
                    left = (viewportWidth - width) / 2;
                }
                top = (viewportHeight - height) / 2;
                left = Math.max(left, 0);
                top = Math.max(top, 0);
                dom.css(pageEl, {
                    marginLeft: left,
                    marginTop: top
                });
            }
        },

        /**
         * Update page classes for presentation mode transitions
         * @returns {void}
         */
        updatePageClasses: function () {
            var pageEls = this.pageEls,
                index = this.state.currentPage - 1,
                next = index + 1,
                prev = index - 1,
                buffer = 20;

            // @TODO: optimize this a bit
            // add/removeClass is expensive, so try using hasClass
            dom.removeClass(pageEls, PRESENTATION_CSS_CLASSES);
            if (this.twoPageMode) {
                next = index + 2;
                prev = index - 2;
                dom.addClass(pageEls.slice(Math.max(prev, 0), index), CSS_CLASS_PAGE_PREV);
                dom.addClass(pageEls.slice(next, next + 2), CSS_CLASS_PAGE_NEXT);
            } else {
                if (prev >= 0) {
                    dom.addClass(pageEls[prev], CSS_CLASS_PAGE_PREV);
                }
                if (next < this.numPages) {
                    dom.addClass(pageEls[next], CSS_CLASS_PAGE_NEXT);
                }
            }
            dom.addClass(pageEls.slice(0, index), CSS_CLASS_PAGE_BEFORE);
            dom.addClass(pageEls.slice(Math.max(0, index - buffer), index), CSS_CLASS_PAGE_BEFORE_BUFFER);
            dom.addClass(pageEls.slice(next), CSS_CLASS_PAGE_AFTER);
            dom.addClass(pageEls.slice(next, Math.min(this.numPages, next + buffer)), CSS_CLASS_PAGE_AFTER_BUFFER);
        }
    });
});
