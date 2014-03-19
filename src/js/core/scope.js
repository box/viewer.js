/**
 * @fileoverview Scope class definition
 * @author clakenen
 */

 (function () {

    'use strict';

    /**
     * Scope class used for component scoping (creating, destroying, broadcasting messages)
     * @constructor
     */
    Crocodoc.Scope = function Scope(config) {

        var util = Crocodoc.getUtility('common');

        var instances = [];

        /**
         * Create and return an instance of the named component,
         * and add it to the list of instances in this scope
         * @param  {string} componentName The name of the component to create
         * @returns {?Object}     The component instance or null if the component doesn't exist
         */
        this.createComponent = function (componentName) {
            var instance = Crocodoc.createComponent(componentName, this);
            if (instance) {
                instance.componentName = componentName;
                instances.push(instance);
            }
            return instance;
        };

        /**
         * Remove and call the destroy method on a component instance
         * @param  {Object} instance The component instance to remove
         * @returns {void}
         */
        this.destroyComponent = function (instance) {
            var i, len;

            for (i = 0, len = instances.length; i < len; ++i) {
                if (instance === instances[i]) {
                    if (typeof instance.destroy === 'function') {
                        instance.destroy();
                    }
                    instances.splice(i, 1);
                    break;
                }
            }
        };

        /**
         * Remove and call the destroy method on all instances in this scope
         * @returns {void}
         */
        this.destroy = function () {
            var i, len, instance;

            for (i = 0, len = instances.length; i < len; ++i) {
                instance = instances[i];
                if (typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            }
            instances = [];
        };

        /**
         * Broadcast a message to all components in this scope that have registered
         * a listener for the named message type
         * @param  {string} messageName The message name
         * @param  {any} data The message data
         * @returns {void}
         */
        this.broadcast = function (messageName, data) {
            var i, len, instance, messages;
            for (i = 0, len = instances.length; i < len; ++i) {
                instance = instances[i];
                if (!instance) {
                    continue;
                }
                messages = instance.messages || [];

                if (util.inArray(messageName, messages) !== -1) {
                    if (typeof instance.onmessage === 'function') {
                        instance.onmessage.call(instance, messageName, data);
                    }
                }
            }
        };

        /**
         * Passthrough method to the framework that retrieves utilities.
         * @param {string} name The name of the utility to retrieve
         * @returns {?Object}    An object if the utility is found or null if not
         */
        this.getUtility = function (name) {
            return Crocodoc.getUtility(name);
        };

        /**
         * Get the config object associated with this scope
         * @returns {Object} The config object
         */
        this.getConfig = function () {
            return config;
        };
    };
})();
