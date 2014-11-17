/*global module*/
/*jshint node: true*/

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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-publish');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-editor');

    var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

    // Middleware snippet for grunt-connect to make CORS testing a bit easier
    var accessControlSnippet = function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', '*');
        return next();
    };

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
                        middlewares.push(rewriteRulesSnippet, accessControlSnippet);

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
                    'build/crocodoc.viewer.min.css': ['<%= concat.css.dest %>']
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
                    'build/crocodoc.viewer.min.js': ['<%= concat.js.dest %>']
                }]
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! Crocodoc Viewer - v<%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> Box */\n\n',
            },
            js: {
                options: {
                    banner: ''
                },
                src: [
                    'src/js/core/constants.js',
                    'src/js/core/crocodoc.js',
                    'src/js/core/scope.js',
                    'src/js/core/event-target.js',
                    'src/js/core/viewer.js',
                    'src/js/data-providers/*.js',
                    'src/js/utilities/*.js',
                    'src/js/components/*.js'
                ],
                dest: 'build/crocodoc.viewer.js'
            },
            css: {
                src: [
                    'src/css/viewer.css',
                    'src/css/theme.css',
                    'src/css/text.css',
                    'src/css/logo.css'
                ],
                dest: 'build/crocodoc.viewer.css'
            },
            'css-no-logo': {
                src: [
                    'src/css/viewer.css',
                    'src/css/theme.css',
                    'src/css/text.css'
                ],
                dest: 'build/crocodoc.viewer.css'
            },
            wrapjs: {
                src: ['src/js/wrap.js'],
                dest: 'build/crocodoc.viewer.js',
                options: {
                    process: function (content) {
                        return content.replace('//__crocodoc_viewer__', grunt.file.read('build/crocodoc.viewer.js'));
                    }
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            files: ['Gruntfile.js', 'src/js/**/*.js', 'test/js/**/*.js', 'test/plugins/**/*.js']
        },
        qunit: {
            viewer: ['test/index.html'],
            plugins: ['test/plugins/index.html']
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
                src: ['build/crocodoc.viewer.css'],
                dest: 'build/crocodoc.viewer.css',
                options: {
                    deleteAfterEncoding: false,
                    baseDir: '../src/images/'
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: ['pkg'],
                commit: false,
                createTag: false,
                push: false
            }
        },
        gitlog: {
            changelog: {
                options: {
                    from: 'v<%= pkg.version %>'
                }
            }
        },
        replace: {
            changelog: {
                src: ['CHANGELOG.md'],
                overwrite: true,
                replacements: [{ from: '----\n', to: '----\n<%= changelog.formatted %>' }]
            }
        },
        gitcommit: {
            release: {
                options: {
                    message: 'v<%= pkg.version %>',
                    // the tests will be run already in the release task, so no
                    // need to run them again in the git pre-commit hook
                    noVerify: true
                },
                files: [{ src: ['.'] }]
            }
        },
        gittag: {
            release: {
                options: {
                    tag: 'v<%= pkg.version %>',
                    message: 'Crocodoc Viewer v<%= pkg.version %>'
                }
            }
        },
        publish: {
            src: ['./']
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['*'],
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            }
        },
        // this task allows us to run the connect and realtime servers in parallel
        parallel: {
            examples: {
                options: { grunt: true },
                tasks: [
                    'connect:development',
                    'realtime-example'
                ]
            }
        },
        editor: {
            changelog: {
                src: ['CHANGELOG.md']
            }
        }
    });

    var useLogo = !grunt.option('no-logo');
    var buildTasks = ['concat:js', 'concat:wrapjs'];
    if (useLogo) {
        buildTasks.push('concat:css', 'imageEmbed');
    } else {
        buildTasks.push('concat:css-no-logo');
    }

    grunt.registerTask('build-setup', buildTasks);

    // task to run the realtime example sse server
    grunt.registerTask('realtime-example', function () {
        this.async();
        require('./examples/realtime/server')(9001);
    });

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('doc', ['test', 'jsdoc']);
    grunt.registerTask('default', ['test', 'build-setup']);
    grunt.registerTask('build-minify', ['build-setup', 'cssmin', 'uglify']);
    grunt.registerTask('build', ['default', 'build-minify']);
    grunt.registerTask('serve', ['default', 'configureRewriteRules', 'parallel:examples']);

    grunt.registerTask('changelog', function () {
        var logs = grunt.config('gitlog.changelog.result');
        var formatted = '* **' + grunt.config('pkg.version') + '**\n';
        var issuesURL = grunt.config('pkg.bugs.url');
        formatted += logs.map(function (l) {
            return '  * ' + l.subject.replace(/#(\d+)/, '[#$1](' + issuesURL + '/$1)');
        }).join('\n');
        grunt.config('changelog.formatted', formatted + '\n');
    });

    grunt.registerTask('publish-reminder', function () {
        grunt.log.writeln('');
        grunt.log.writeln(
            'Release '.green + ('v' + grunt.config('pkg.version')).yellow +
            ' committed and tagged.'.green
        );
        grunt.log.writeln('Don\'t forget to review and publish on github and npm!'.yellow.bold);
    });

    grunt.registerTask('release', function () {
        var type = grunt.option('type') || 'patch',
            types = ['patch', 'minor', 'major'];

        if (types.indexOf(type) === -1) {
            grunt.fail.fatal(type + ' not a valid release type');
            return;
        }

        grunt.task.run([
            'test',
            'gitlog:changelog',
            'bump:' + type,
            'changelog',
            'replace:changelog',
            'editor:changelog',
            'build-minify',
            'copy:dist',
            'gitcommit',
            'gittag',
            'publish-reminder'
            // 'publish'
        ]);
    });
};
