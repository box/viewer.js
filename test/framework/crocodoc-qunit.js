/*global Crocodoc*/

/**
 * Get a scope for testing
 * @param   {object} [testContext] Optional map of utilities and components to use
 *                                 in getUtility and createComponent respectively
 * @returns {object}               The scope
 */
Crocodoc.getScopeForTest = function (testContext) {
    testContext = testContext || {};
    testContext.utilities = testContext.utilities || {};
    testContext.components = testContext.components || {};
    testContext.config = testContext.config || {};
    return {
        getUtility: function (name) {
            return testContext.utilities[name] || (testContext.utilities[name] = {});
        },
        createComponent: function (name) {
            return testContext.components[name] || (testContext.components[name] = {});
        },
        getConfig: function () {
            return testContext.config;
        },
        destroyComponent: function () {},
        broadcast: function () {},
        destroy: function () {}
    };
};

/**
 * Get a module for testing
 * @param   {string} name     The module name
 * @param   {object} scope    The scope to pass in
 * @param   {object} [mixins] Optional map of mixins to use instead of creating instances of any dependencies
 * @returns {object?}         The module or null
 */
Crocodoc.getComponentForTest = function (name, scope, mixins) {
    mixins = mixins || {};
    var module = Crocodoc.components[name];
    if (module) {
        var args = [], mixinName;
        for (var i = 0; i < module.mixins.length; ++i) {
            mixinName = module.mixins[i];
            args.push(mixins[mixinName] || Crocodoc.getComponentForTest(mixinName, scope));
        }
        args.unshift(scope);
        return module.creator.apply(module.creator, args);
    }
    return null;
};
