/*jshint evil:true*/

module('Utility - common', {
    setup: function () {
        this.util = Crocodoc.getUtility('common');
    }
});

QUnit.cases([
    { list: [1, 2, 5, 7, 10], x: 5, result: 2 },
    { list: [1, 2, 5, 7, 10], x: 0, result: 0 },
    { list: [1, 2, 5, 7, 10], x: 100, result: 5 },
    { list: [{ a: 1 },{ a: 5 },{ a: 13 },{ a: 100 },{ a: 101 }], x: 100, prop: 'a', result: 3 },
    { list: [{ a: 1 },{ a: 5 },{ a: 13 },{ a: 100 },{ a: 101 }], x: 1, prop: 'a', result: 0 }
]).test('bisectLeft() should return the correct index when called', function (params) {
    equal(this.util.bisectLeft(params.list, params.x, params.prop), params.result);
});

QUnit.cases([
    { list: [1, 2, 5, 7, 10], x: 5, result: 3 },
    { list: [1, 2, 5, 7, 10], x: 0, result: 0 },
    { list: [1, 2, 5, 7, 10], x: 100, result: 5 },
    { list: [{ b: 1 },{ b: 5 },{ b: 13 },{ b: 100 },{ b: 101 }], x: 100, prop: 'b', result: 4 },
    { list: [{ b: 1 },{ b: 5 },{ b: 13 },{ b: 100 },{ b: 101 }], x: 1, prop: 'b', result: 1 }
]).test('bisectRight() should return the correct index when called', function (params) {
    equal(this.util.bisectRight(params.list, params.x, params.prop), params.result);
});

QUnit.cases([
    { x: 5, a: 5, b: 10, result: 5 },
    { x: 1, a: 5, b: 10, result: 5 },
    { x: 8, a: 5, b: 10, result: 8 },
    { x: 15, a: 5, b: 10, result: 10 }
]).test('clamp() should return the correct value when called', function (params) {
    equal(this.util.clamp(params.x, params.a, params.b), params.result);
});

QUnit.cases([
    { val: 2, result: false },
    { val: 'function () {}', result: false },
    { val: function () {}, result: true },
    { val: new Function(), result: true },
    { val: ({}).toString, result: true }
]).test('isFn() should return the correct value when called', function (params) {
    equal(this.util.isFn(params.val), params.result);
});

QUnit.cases([
    { arr: [1, 3], val: 2, result: -1 },
    { arr: [2, 3], val: 2, result: 0 },
    { arr: [1, 2, 3], val: 2, result: 1 },
    { arr: [1, 2, 'c'], val: 'c', result: 2 },
    { arr: [1, 2, 'c'], val: '1', result: -1 }
]).test('inArray() should return the correct result when called', function (params) {
    equal(this.util.inArray(params.val, params.arr), params.result);
});

QUnit.cases([
    { low: 10, high: 20, max: 15, result: { min: 5, max: 15 } },
    { low: 10, high: 20, max: 20, result: { min: 10, max: 20 } },
    { low: 0, high: 50, max: 20, result: { min: 0, max: 20 } },
    { low: 10, high: 50, max: 20, result: { min: 0, max: 20 } },
    { low: 10, high: 50, max: 60, result: { min: 10, max: 50 } },
    { low: -10, high: 50, max: 60, result: { min: 0, max: 60 } },
]).test('constrainRange() should return the expected range object when called', function (params) {
    deepEqual(this.util.constrainRange(params.low, params.high, params.max), params.result);
});

test('throttle() should return a function that calls the provided function only as often as requested when called', function () {
    var wait = 100,
        clock = sinon.useFakeTimers(),
        spy = sinon.spy(),
        throttledFn = this.util.throttle(wait, spy);

    throttledFn();
    throttledFn();
    clock.tick(wait);
    throttledFn();
    clock.tick(wait);

    ok(spy.calledTwice);
    clock.restore();
});

function getStyle(el, prop) {
    var styles = getComputedStyle && getComputedStyle(el) || el.currentStyle;
    return styles[prop];
}

test('insertCSS() should insert the given CSS string when called', function () {
    var str = 'body { background-color: rgb(255, 0, 0) !important; }',
        stylesheetEl = this.util.insertCSS(str);

    // test if the style has been applied
    equal(getStyle(document.body, 'backgroundColor'), 'rgb(255, 0, 0)');
    stylesheetEl.parentNode.removeChild(stylesheetEl);
});

// assumes insertCSS works properly
test('appendCSSRule() should append the given CSS rule when called', function () {
    var stylesheetEl = this.util.insertCSS(''),
        sheet = stylesheetEl.styleSheet || stylesheetEl.sheet,
        selector = 'body',
        rule = 'background-color: rgb(255, 0, 0) !important;';

    this.util.appendCSSRule(sheet, selector, rule);
    equal(getStyle(document.body, 'backgroundColor'), 'rgb(255, 0, 0)');
    stylesheetEl.parentNode.removeChild(stylesheetEl);
});

// assumes insertCSS and appendCSSRule works properly
test('deleteCSSRule() should delete the given CSS rule when called', function () {
    var stylesheetEl = this.util.insertCSS(''),
        sheet = stylesheetEl.styleSheet || stylesheetEl.sheet,
        selector = 'body',
        rule = 'background-color: rgb(255, 0, 0) !important;';

    // make sure the background color is not already red...
    notEqual(getStyle(document.body, 'backgroundColor'), 'rgb(255, 0, 0)');

    var index = this.util.appendCSSRule(sheet, selector, rule);

    equal(getStyle(document.body, 'backgroundColor'), 'rgb(255, 0, 0)');

    this.util.deleteCSSRule(sheet, index);

    notEqual(getStyle(document.body, 'backgroundColor'), 'rgb(255, 0, 0)');


    stylesheetEl.parentNode.removeChild(stylesheetEl);
});
