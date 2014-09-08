/**
 * @fileOverview dom utility
 * @author lakenen
 */

Crocodoc.addUtility('dom', function () {

    'use strict';

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        addClass: function (el, cls) {
            $(el).addClass(cls);
        },

        removeClass: function (el, cls) {
            $(el).removeClass(cls);
        },

        toggleClass: function (el, cls, toggle) {
            $(el).toggleClass(cls, toggle);
        },

        hasClass: function (el, cls) {
            return $(el).hasClass(cls);
        },

        appendTo: function (parent, child) {
            $(parent).append(child);
        },

        prependTo: function (parent, child) {
            $(parent).prepend(child);
        },

        data: function (el, k, v) {
            var $el = $(el);
            var args = [].slice.call(arguments, 1);
            return $el.data.apply($el, args);
        },

        attr: function (el, k, v) {
            var $el = $(el);
            var args = [].slice.call(arguments, 1);
            return $el.attr.apply($el, args);
        },

        removeAttr: function (el, a) {
            return $(el).removeAttr(a);
        },

        css: function (el, k, v) {
            var $el = $(el);
            var args = [].slice.call(arguments, 1);
            return $el.css.apply($el, args);
        },

        create: function (n) {
            return document.createElement(n);
        },

        remove: function (el) {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
            return el;
        },

        empty: function (el) {
            if (el) {
                el.innerHTML = '';
            }
        },

        find: function (s, el) {
            return (el || document).querySelector(s);
        },

        findAll: function (s, el) {
            return [].slice.call((el || document).querySelectorAll(s));
        },

        contains: function (parent, child) {
            return $.contains(parent, child);
        },

        closest: function (el, s) {
            return $(el).closest(s).get(0);
        },

        scrollTop: function (el) {
            var args = [].slice.call(arguments, 1);
            var $el = $(el);
            return $el.scrollTop.apply($el, args);
        },

        scrollLeft: function (el) {
            var args = [].slice.call(arguments, 1);
            var $el = $(el);
            return $el.scrollLeft.apply($el, args);
        },

        html: function (el, html) {
            $(el).html(html);
        },

        on: function (el, type, fn) {
            var args = [].slice.call(arguments, 1);
            var $el = $(el);
            $el.on.apply($el, args);
        },

        off: function (el, type, fn) {
            var args = [].slice.call(arguments, 1);
            var $el = $(el);
            $el.off.apply($el, args);
        },

        show: function (el) {
            $(el).show();
        },

        hide: function (el) {
            $(el).hide();
        }
    };
});
