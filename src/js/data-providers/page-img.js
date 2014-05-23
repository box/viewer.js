/**
 * @fileoverview A standard data provider for page-img
 * @author lakenen
 */
Crocodoc.addDataProvider('page-img', function(scope) {
    'use strict';

    var util = scope.getUtility('common'),
        config = scope.getConfig();

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Retrieve the page image asset from the server
         * @param {number} pageNum The page number for which to request the page image
         * @returns {$.Promise}    A promise with an additional abort() method that will abort the XHR request.
         */
        get: function(pageNum) {
            var img,
                retries = Crocodoc.ASSET_REQUEST_RETRIES,
                loaded = false,
                imgPath = util.template(config.template.img, { page: pageNum }),
                url = config.url + imgPath + config.queryString,
                $deferred = $.Deferred();

            img = new Image();
            // add load and error handlers
            img.onload = function () {
                loaded = true;
                $deferred.resolve(img);
            };
            img.onerror = function () {
                if (retries > 0) {
                    retries--;
                    img.setAttribute('src', null);
                    img.setAttribute('src', url);
                } else {
                    img = null;
                    loaded = false;
                    $deferred.reject({
                        error: 'image failed to load',
                        resource: url
                    });
                }
            };
            // load the image
            img.setAttribute('src', url);

            return $deferred.promise({
                abort: function () {
                    if (!loaded) {
                        img.setAttribute('src', null);
                    }
                }
            });
        }
    };
});
