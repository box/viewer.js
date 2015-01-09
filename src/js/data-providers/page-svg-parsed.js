/**
 * @fileoverview A standard data provider for page-svg
 * @author nsilva
 * @author lakenen
 */
Crocodoc.addDataProvider('page-svg-parsed', function(scope) {
    'use strict';

    var util = scope.getUtility('common'),
        ajax = scope.getUtility('ajax'),
        config = scope.getConfig(),
        destroyed = false,
        cache = {};

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Retrieve a SVG asset from the server
         * @param {string} objectType The type of data being requested
         * @param {number} pageNum The page number for which to request the SVG
         * @returns {$.Promise}    A promise with an additional abort() method that will abort the XHR request.
         */
        get: function(objectType, pageNum) {
            var url = this.getURL(pageNum),
                aborted = false,
                $deferred, req;

            if (!cache[pageNum]) {
                $deferred = new $.Deferred();
                req = ajax.request(url, {
                    responseType: 'document',
                    success: function () {
                        if (!aborted) {
                            var doc = this.rawRequest.response;
                            var link = doc.querySelector('link');
                            if (link) {
                                link.parentNode.removeChild(link);
                            }
                            $deferred.resolve(doc);
                        }
                    },
                    fail: function () {
                        if (!aborted) {
                            $deferred.reject({
                                error: this.statusText,
                                status: this.status,
                                resource: url
                            });
                        }
                    }
                });

                cache[pageNum] = $deferred.promise({
                    abort: function () {
                        aborted = true;
                        req.abort();
                    }
                });
            }

            return cache[pageNum];
        },

        /**
         * Build and return the URL to the SVG asset for the specified page
         * @param   {number} pageNum The page number
         * @returns {string}         The URL
         */
        getURL: function (pageNum) {
            var svgPath = util.template(config.template.svg, { page: pageNum });
            return config.url + svgPath + config.queryString;
        },

        /**
         * Cleanup the data-provider
         * @returns {void}
         */
        destroy: function () {
            destroyed = true;
            util = ajax = config = cache = null;
        }
    };
});
