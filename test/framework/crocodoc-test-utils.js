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
    testContext.dataProviders = testContext.dataProviders || {};
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
        getDataProvider: function () {
            return testContext.dataProviders[name] || (testContext.dataProviders[name] = {});
        },
        get: function() {},
        destroyComponent: function () {},
        broadcast: function () {},
        destroy: function () {},
        ready: function () {}
    };
};


/**
 * Get a framework for testing
 * @param   {object} [testContext] Optional map of utilities use in getUtility
 * @returns {object}               The framework
 */
Crocodoc.getFrameworkForTest = function (testContext) {
    testContext = testContext || {};
    testContext.utilities = testContext.utilities || {};
    return {
        getUtility: function (name) {
            return testContext.utilities[name] || (testContext.utilities[name] = {});
        }
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

/**
 * Get a utility for testing
 * @param   {string} name        The utility name
 * @param   {object} [framework] A mock framework
 * @returns {object?}            The utility or null
 */
Crocodoc.getUtilityForTest = function (name, framework) {
    var util = Crocodoc.utilities[name];
    if (util) {
        return util.creator(framework || Crocodoc);
    }
    return null;
};

/**
 * Get a plugin for testing
 * @param   {string} name     The plugin name
 * @param   {object} scope    The scope to pass in
 * @returns {object?}         The plugin or null
 */
Crocodoc.getPluginForTest = function (name, scope) {
    return this.getComponentForTest('plugin-' + name, scope);
};
