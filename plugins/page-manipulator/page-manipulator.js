Crocodoc.addDataProvider('page-manipulator', function (scope) {

    // page manipulator data provider looks for special plugin config
    var util = scope.getUtility('common'),
        config = scope.getConfig().plugins['page-manipulator'],
        pages = [],
        pageLinks = {},
        $metadataPromise;

    /**
     * Find the index of the first instance of the given page number
     * @param   {int} page Page number of the page to find
     * @returns {int}      The index of the page or -1 if not found
     */
    function getPageIndex(page) {
        if (page < 0) {
            page = pages.length + page;
        }
        var i, l;
        for (i = 0, l = pages.length; i < l; ++i) {
            if (pages[i].page === page) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Initialize objects to keep track of where pages and links are
     * @param   {Object} data The metadata object
     * @returns {void}
     */
    function initializePages(data) {
        var n,
            exceptions = data.dimensions.exceptions
            links = data.links;

        for (n = 1; n <= data.numpages; ++n) {
            pages.push({
                page: n,
                dimensions: exceptions[n] || null
            });
        }

        // store link info so we can fix it later
        util.each(links, function (i, link) {
            var page = links[i].pagenum;
            if (!pageLinks[page]) {
                pageLinks[page] = [];
            }
            pageLinks[page].push(links[i]);
        });
    }

    /**
     * Add/remove/modify pages according to the config
     * @returns {void}
     */
    function manipulatePages() {
        // insert/replace pages as specified in the config
        util.each(config.pages || [], function (i, page) {
            var index = getPageIndex(page.after || page.before || page.replace || page.remove);
            if (index === -1) {
                index = pages.length - 1;
            }
            if (page.after) {
                index++;
            }
            if (index > pages.length) {
                index = pages.length;
            }
            if (typeof page.replace !== 'undefined') {
                pages.splice(index, 1, page);
            } else if (typeof page.remove !== 'undefined') {
                pages.splice(index, 1);
            } else {
                pages.splice(index, 0, page);
            }
        });
    }

    /**
     * Update metadata (modifies data)
     * @param {Object} data The metadata object
     * @returns {void}
     */
    function updateMetadata(data) {
        var links = [],
            exceptions = {};

        // fix links and dimensions
        util.each(pages, function (i, page) {
            var currentPageLinks = page.links ||
                (typeof page.page !== 'undefined' && pageLinks[page.page] || []);

            currentPageLinks = util.map(currentPageLinks, function (link) {
                // clone the link so when we modify destination it doesn't mess
                // up duplicate instances of this page if they exist
                link = util.extend(true, {}, link, {
                    pagenum: i + 1
                });
                // fix link destination (find the first page that matches...)
                if (link.destination && !link.destination.absolute) {
                    link.destination.pagenum = getPageIndex(link.destination.pagenum) + 1;
                }
                return link;
            });
            links = links.concat(currentPageLinks);

            // replace the correct dimensions if necessary
            if (page.dimensions) {
                exceptions[i + 1] = page.dimensions;
            }
        });

        // update metadata
        data.links = links;
        data.numpages = pages.length;
        data.dimensions.exceptions = exceptions;
    }

    /**
     * Rewrite the metadata so the viewer knows which pages to load/when
     * @param   {Object} data The metadata object
     * @returns {Object}      The modified metadata object
     */
    function rewriteMetadata(data) {
        initializePages(data);
        manipulatePages();
        updateMetadata(data);
        return data;
    }

    return {
        get: function (type, key) {
            var $p,
                dp = scope.getDataProvider(type);

            switch (type) {
                case 'metadata':
                    // rewrite metadata response to alter the page structure
                    $p = dp.get(type);
                    $metadataPromise = $p;
                    return $p.then(rewriteMetadata).promise({
                        abort: $p.abort
                    });

                case 'page-svg':
                case 'page-text':
                case 'page-img':
                    // need to wait for metadata in order to manipulate page info
                    $p = { abort: function () {} };
                    return $.when($metadataPromise).then(function () {
                        var page = pages[key - 1];

                        // if they are requesting a specific page that already exists
                        // (i.e., not a custom page), just get that page
                        if (page.page) {
                            $p = dp.get(type, page.page);
                            return $p;
                        }

                        // inject the custom page content into what is normally the "text" layer
                        if (type === 'page-text') {
                            return '<div class="crocodoc-page-custom crocodoc-page-text">' + (page.content || '') + '</div>';
                        }

                        // page-img and page-svg are empty for custom pages
                        if (type === 'page-img') {
                            return new Image();
                        }
                        if (type === 'page-svg') {
                            return '<svg></svg>';
                        }
                    }).promise({
                        abort: $p.abort
                    });
            }
        },

        destroy: function () {
            if ($metadataPromise) {
                $metadataPromise.abort();
            }
            $metadataPromise = config = pages = pageLinks = null;
        }
    };
});


Crocodoc.addPlugin('page-manipulator', function (scope) {
    var util = scope.getUtility('common');
    return {
        init: function () {
            // use the page-manip data provider in the viewer config
            util.extend(true, scope.getConfig(), {
                dataProviders: {
                    metadata: 'page-manipulator',
                    'page-svg': 'page-manipulator',
                    'page-text': 'page-manipulator',
                    'page-img': 'page-manipulator'
                }
            });
        }
    }
});
