/**
 * @fileoverview Crocodoc.Deferred definition
 * @author lakenen
 */

(function () {

    'use strict';
    Crocodoc.Deferred = function () {
        return $.Deferred.apply($, arguments);
    };

    Crocodoc.Deferred.when = function () {
        return $.when.apply($, arguments);
    };

})();
