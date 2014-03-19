/**
 * @fileoverview ajax utility definition
 * @author clakenen
 */

Crocodoc.addUtility('ajax', function (framework) {

    'use strict';

    var util = framework.getUtility('common');

    /**
     * Creates a request object to call the success/fail handlers on
     * @param {XMLHttpRequest} req The request object to wrap
     * @returns {Object} The request object
     * @private
     */
    function createRequestWrapper(req) {
        var status,
            statusText,
            responseText;
        try {
            status = req.status;
            statusText = req.statusText;
            responseText = req.responseText;
        } catch (e) {
            status = 0;
            statusText = '';
            responseText = null;
        }
        return {
            status: status,
            statusText: statusText,
            responseText: responseText
        };
    }

    return {
        /**
         * Basic AJAX request
         * @param   {string}     url               request URL
         * @param   {Object}     [options]         AJAX request options
         * @param   {string}     [options.method]  request method, eg. 'GET', 'POST' (defaults to 'GET')
         * @param   {Function}   [options.success] success callback function
         * @param   {Function}   [options.fail]    fail callback function
         * @returns {XMLHttpRequest|XDomainRequest} Request object
         */
        request: function (url, options) {
            options = options || {};
            var method = options.method || 'GET',
                req = new window.XMLHttpRequest();

            /**
             * Function to call on successful AJAX request
             * @returns {void}
             * @private
             */
            function ajaxSuccess() {
                if (util.isFn(options.success)) {
                    options.success.call(createRequestWrapper(req));
                }
            }

            /**
             * Function to call on failed AJAX request
             * @returns {void}
             * @private
             */
            function ajaxFail() {
                if (util.isFn(options.fail)) {
                    options.fail.call(createRequestWrapper(req));
                }
            }

            if (util.isCrossDomain(url) && !('withCredentials' in req)) {
                if ('XDomainRequest' in window) {
                    req = new window.XDomainRequest();
                    try {
                        req.open(method, url);
                        req.onload = ajaxSuccess;
                        // NOTE: IE (8/9) requires onerror, ontimeout, and onprogress
                        // to be defined when making XDR to https servers
                        req.onerror = ajaxFail;
                        req.ontimeout = ajaxFail;
                        req.onprogress = function () {};
                        req.send();
                    } catch (e) {
                        req = {
                            status: 0,
                            statusText: e.message
                        };
                        ajaxFail();
                    }
                } else {
                    // CORS is not supported!
                    req = {
                        status: 0,
                        statusText: 'CORS not supported'
                    };
                    ajaxFail();
                }
            } else {
                req.open(method, url, true);
                req.onreadystatechange = function () {
                    if (this.readyState === 4) { // DONE
                        // remove the onreadystatechange handler,
                        // because it could be called again
                        req.onreadystatechange = null;

                        try {
                            if (this.status === 200) {
                                ajaxSuccess();
                            } else {
                                ajaxFail();
                            }
                        } catch (e) {
                            // NOTE: IE (9?) throws an error when the request is aborted
                            ajaxFail();
                        }
                    }
                };
                req.send();
            }

            return req;
        }
    };
});
