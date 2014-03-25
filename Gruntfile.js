/*global module*/
/*jshint node: true*/

var WRAPPER_HEADER = 'var Crocodoc = (function ($) {\n\n',
    WRAPPER_FOOTER = '\n\nreturn Crocodoc;\n})(jQuery);';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-rewrite');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-image-embed');

    var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            options: {
                hostname: '*',
                port: 9000,
                keepalive: true,
                open: true
            },
            rules: [
                {from: '^/examples/remember-page/(.*)$', to: '/examples/remember-page/index.html'}
            ],
            development: {
                options: {
                    middleware: function (connect, options) {
                        var middlewares = [];

                        // RewriteRules support
                        middlewares.push(rewriteRulesSnippet);

                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        var directory = options.directory || options.base[options.base.length - 1];
                        options.base.forEach(function (base) {
                            // Serve static files.
                            middlewares.push(connect.static(base));
                        });

                        // Make directory browse-able.
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                }
            }
        },
        cssmin: {
            minify: {
                files: [{
                    'dist/crocodoc.viewer.min.css': ['<%= concat.css.dest %>']
                }]
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                preserveComments: 'some'
            },
            dist: {
                files: [{
                    'dist/crocodoc.viewer.min.js': ['<%= concat.js.dest %>']
                }]
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.description %> - v<%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> Box */\n\n',
            },
            js: {
                // also use the jQuery wrapper for js files
                options: {
                    banner: '<%= concat.options.banner %>' + WRAPPER_HEADER,
                    footer: WRAPPER_FOOTER
                },
                src: [
                    'src/js/core/crocodoc.js',
                    'src/js/core/scope.js',
                    'src/js/core/event-target.js',
                    'src/js/core/viewer.js',
                    'src/js/utilities/*.js',
                    'src/js/components/*.js',
                ],
                dest: 'dist/crocodoc.viewer.js'
            },
            css: {
                src: [
                    'src/css/viewer.css',
                    'src/css/presentation.css',
                    'src/css/theme.css',
                    'src/css/logo.css'
                ],
                dest: 'dist/crocodoc.viewer.css'
            },
            'css-no-logo': {
                src: [
                    'src/css/viewer.css',
                    'src/css/presentation.css',
                    'src/css/theme.css'
                ],
                dest: 'dist/crocodoc.viewer.css'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            files: ['Gruntfile.js', 'src/js/**/*.js', 'test/js/**/*.js']
        },
        qunit: {
            files: ['test/index.html']
        },
        jsdoc : {
            dist : {
                src: ['src/js/**/*.js', 'test/js/**/*.js'],
                options: {
                    destination: 'doc',
                    configure: 'jsdoc-conf.json'
                }
            }
        },
        imageEmbed: {
            dist: {
                src: ['dist/crocodoc.viewer.css'],
                dest: 'dist/crocodoc.viewer.css',
                options: {
                    deleteAfterEncoding: false,
                    baseDir: './'
                }
            }
        }
    });

    var useLogo = !grunt.option('no-logo');
    var defaultTasks = ['test', 'concat:js'];
    if (useLogo) {
        defaultTasks.push('concat:css', 'imageEmbed');
    } else {
        defaultTasks.push('concat:css-no-logo');
    }

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('doc', ['test', 'jsdoc']);
    grunt.registerTask('default', defaultTasks);
    grunt.registerTask('build', ['default', 'cssmin', 'uglify']);
    grunt.registerTask('serve', ['default', 'configureRewriteRules', 'connect:development']);
};
