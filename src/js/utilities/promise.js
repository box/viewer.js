/**
 * @fileoverview promise utility definition
 * @author lakenen
 */

Crocodoc.addUtility('promise', function (framework) {
    'use strict';

    var Deferred = framework.Deferred,
        util = framework.getUtility('common');

    return {
        empty: function () {
            return new Deferred().resolve().promise({
                abort: util.noop
            });
        },
        deferred: function () {
            return new Deferred();
        },
        when: function () {
            return Deferred.when.apply(Deferred, arguments);
        }
    };
});
