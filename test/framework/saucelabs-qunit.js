/*global QUnit*/

var testLog = [];
QUnit.done(function (results) {
    var tests = $.map(testLog, function (details) {
        return {
            name: details.name,
            result: details.result,
            expected: details.expected,
            actual: details.actual,
            source: details.source
        };
    });
    results.tests = tests;

    /*jshint camelcase: false */
    window.global_test_results = results;
});

QUnit.log(function (details) {
    // push failed tests to the log
    if (!details.result) {
        testLog.push(details);
    }
});
