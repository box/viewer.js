/**
 * @fileoverview A standard data provider for metadata
 * @author lakenen
 */
Crocodoc.addDataProvider('metadata', function(scope) {
    'use strict';

    var ajax = scope.getUtility('ajax'),
        config = scope.getConfig();

    /**
     * Process metadata json and return the result
     * @param   {string} json The original JSON text
     * @returns {string}      The processed JSON text
     * @private
     */
    function processJSONContent(json) {
        var metadata = $.parseJSON(json);

        return metadata;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        /**
         * Retrieve the info.json asset from the server
         *
         * @param {string} modelName The name of the requested model (metadata)
         * @returns {$.Promise}      A promise with an additional abort() method that will abort the XHR request.
         */
        get: function() {
            var jsonPath = config.template.json,
                url = config.url + jsonPath + config.queryString,
                $promise = ajax.fetch(url, Crocodoc.ASSET_REQUEST_RETRIES);

            // @NOTE: promise.then() creates a new promise, which does not copy
            // custom properties, so we need to create a futher promise and add
            // an object with the abort method as the new target
            return $promise.then(processJSONContent).promise({
                abort: $promise.abort
            });
        }
    };
});
