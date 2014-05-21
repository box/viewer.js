
module('Utility - ajax', {
    setup: function () {
        this.util = Crocodoc.getUtility('ajax');
    }
});

// test('An ajax success should resolve the promise with a non-empty reponse', function() {
//     var promiseResolved = false;
//     var $deferred = $.Deferred();
//     this.utilities.ajax.fetch.returns($deferred.promise());
//     $deferred.resolve('some data');

//     var promise = this.dataProvider.get('page-svg', 3);
//     promise.done(function(){promiseResolved = true;});
//     ok(promiseResolved);
// });

// test('An ajax success should reject the promise with an empty reponse', function() {
//     var promiseRejected = false;
//     var responseObject = {responseText:''};
//     this.utilities.ajax.request.yieldsToOn('success',responseObject);

//     this.promise = this.dataProvider.get('page-svg', 'testdatadoesnotmatter');
//     this.promise.fail(function(){promiseRejected = true;});
//     ok(promiseRejected);
// });

// test('An ajax failure should reject the promise', function() {
//     var promiseRejected = false;
//     var responseObject = {status:'testdatadoesnotmatter', statusText:'testdatadoesnotmatter'};
//     this.utilities.ajax.request.yieldsToOn('fail',responseObject);

//     this.promise = this.dataProvider.get('page-svg', 'testdatadoesnotmatter');
//     this.promise.fail(function(){promiseRejected = true;});
//     ok(promiseRejected);
// });
