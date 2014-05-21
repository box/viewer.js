/**
 * @fileoverview ajax utility definition
 * @author lakenen
 */

Crocodoc.addUtility('ajax', function (framework) {

    'use strict';

    var util = framework.getUtility('common'),
        urlUtil = framework.getUtility('url');

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

    /**
     * Get a XHR object
     * @returns {XMLHttpRequest} An XHR object
     * @private
     */
    function getXMLHttpRequest() {
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        } else {
            try {
                return new ActiveXObject('MSXML2.XMLHTTP.3.0');
            }
            catch(ex) {
                return null;
            }
        }
    }

    /**
    * Returns true if a request made to a local file has a status equals zero (0)
    * and if it has a response text
    * @param   {string}  url The URL
    * @param   {Object}  request The request object
    */
    function isRequestToLocalFileOk(url, request) {
        return urlUtil.parse(url).protocol === 'file:' &&
               request.status === 0 &&
               request.responseText !== '';
    }

    return {
        /**
         * Make a raw AJAX request
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
                req = getXMLHttpRequest();

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

            if (urlUtil.isCrossDomain(url) && !('withCredentials' in req)) {
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
            } else if (req) {
                req.open(method, url, true);
                req.onreadystatechange = function () {
                    var status;
                    if (req.readyState === 4) { // DONE
                        // remove the onreadystatechange handler,
                        // because it could be called again
                        // @NOTE: we replace it with a noop function, because
                        // IE8 will throw an error if the value is not of type
                        // 'function' when using ActiveXObject
                        req.onreadystatechange = function () {};

                        try {
                            status = req.status;
                        } catch (e) {
                            // NOTE: IE (9?) throws an error when the request is aborted
                            ajaxFail();
                            return;
                        }

                        if (status === 200 || isRequestToLocalFileOk(url, req)) {
                            ajaxSuccess();
                        } else {
                            ajaxFail();
                        }
                    }
                };
                req.send();
            } else {
                req = {
                    status: 0,
                    statusText: 'AJAX not supported'
                };
                ajaxFail();
            }

            return req;
        },

        /**
         * Fetch an asset, retrying if necessary
         * @param {string} url      A url for the desired asset
         * @param {number} retries  The number of times to retry if the request fails
         * @returns {$.Promise}     A promise with an additional abort() method that will abort the XHR request.
         */
        fetch: function (url, retries) {
            var req,
                aborted = false,
                ajax = framework.getUtility('ajax'),
                $deferred = $.Deferred();

            /**
             * If there are retries remaining, make another attempt, otherwise
             * give up and reject the deferred
             * @param   {Object} error The error object
             * @returns {void}
             * @private
             */
            function retryOrFail(error) {
                if (retries > 0) {
                    // if we have retries remaining, make another request
                    retries--;
                    req = request();
                } else {
                    // finally give up
                    $deferred.reject(error);
                }
            }

            /**
             * Make an AJAX request for the asset
             * @returns {XMLHttpRequest|XDomainRequest} Request object
             * @private
             */
            function request() {
                return ajax.request(url, {
                    success: function () {
                        if (!aborted) {
                            if (this.responseText) {
                                $deferred.resolve(this.responseText);
                            } else {
                                // the response was empty, so consider this a
                                // failed request
                                retryOrFail({
                                    error: 'empty response',
                                    status: this.status,
                                    resource: url
                                });
                            }
                        }
                    },
                    fail: function () {
                        if (!aborted) {
                            retryOrFail({
                                error: this.statusText,
                                status: this.status,
                                resource: url
                            });
                        }
                    }
                });
            }

            req = request();
            return $deferred.promise({
                abort: function() {
                    aborted = true;
                    req.abort();
                }
            });
        }
    };
});
