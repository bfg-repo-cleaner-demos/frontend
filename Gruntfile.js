/* global module: false */
module.exports = function (grunt) {
    var isDev = grunt.option('dev') || process.env.GRUNT_ISDEV === '1',
        jasmineSpec = grunt.option('spec') || '*',
        env = grunt.option('env') || 'code',
        screenshotsDir = './screenshots',
        timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss/'),
        staticTargetDir = 'static/target/';

    if (isDev) {
        grunt.log.subhead('Running Grunt in DEV mode');
    }

    // Project configuration.
    grunt.initConfig({

        /***********************************************************************
         * Compile
         **********************************************************************/

        sass: {
            compile: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/stylesheets',
                    src: ['*.scss', '!_*'],
                    dest: staticTargetDir + 'stylesheets/',
                    rename: function(dest, src) {
                        return dest + src.replace('scss', 'css');
                    }
                }],
                options: {
                    style: (isDev) ? 'expanded' : 'compressed',
                    sourcemap: false,
                    noCache: (isDev) ? false : true,
                    quiet: (isDev) ? false : true,
                    loadPath: [
                        'common/app/assets/stylesheets/components/sass-mq',
                        'common/app/assets/stylesheets/components/pasteup/sass/layout',
                        'common/app/assets/stylesheets/components/normalize-scss'
                    ]
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: "common/app/assets/javascripts",
                    name: "bootstraps/app",
                    out: staticTargetDir + "javascripts/bootstraps/app.js",
                    paths: {
                        "bean": "components/bean/bean",
                        "bonzo": "components/bonzo/src/bonzo",
                        "domReady": "components/domready/ready",
                        "EventEmitter": "components/eventEmitter/EventEmitter",
                        "qwery": "components/qwery/mobile/qwery-mobile",
                        "reqwest": "components/reqwest/src/reqwest",
                        "domwrite": "components/dom-write/dom-write",
                        "swipe": "components/swipe/swipe",
                        "swipeview": "components/swipeview/src/swipeview"
                    },
                    "wrap" : {
                        "startFile": "common/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js",
                        "endFile": "common/app/assets/javascripts/bootstraps/go.js"
                    },
                    optimize: (isDev) ? 'none' : 'uglify2',
                    useSourceUrl: (isDev) ? true : false,
                    preserveLicenseComments: false
                }
            }
        },

        // Create JSON web font files from fonts. See https://github.com/ahume/grunt-webfontjson
        webfontjson: {
            WebAgateSansWoff: {
                options: {
                    "filename": staticTargetDir + "fonts/WebAgateSans.woff.js",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "AgateSans",
                            "file": "resources/fonts/AgateSans-Regular.woff",
                            "format": "woff"
                        }
                    ]
                }
            },
            WebAgateSansTtf: {
                options: {
                    "filename": staticTargetDir + "fonts/WebAgateSans.ttf.js",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "AgateSans",
                            "file": "resources/fonts/AgateSans-Regular.ttf",
                            "format": "ttf"
                        }
                    ]
                }
            },
            WebEgyptianWoff: {
                options: {
                    "filename": staticTargetDir + "fonts/WebEgyptian.woff.js",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "EgyptianText",
                            "file": "resources/fonts/EgyptianText-Regular.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-style": "italic",
                            "file": "resources/fonts/EgyptianText-RegularItalic.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-weight": "700",
                            "file": "resources/fonts/EgyptianText-Medium.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "200",
                            "file": "resources/fonts/EgyptianHeadline-Light.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "400",
                            "file": "resources/fonts/EgyptianHeadline-Regular.woff",
                            "format": "woff"
                        },
                        // This weight contains only a certain set of chars
                        // since it is used only in one place (section names)
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "900",
                            "file": "resources/fonts/EgyptianHeadline-Semibold-redux.woff",
                            "format": "woff"
                        }
                    ]
                }
            },
            WebEgyptianTtf: {
                options: {
                    "filename": staticTargetDir + "fonts/WebEgyptian.ttf.js",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "AgateSans",
                            "file": "resources/fonts/AgateSans-Regular.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "file": "resources/fonts/EgyptianText-Regular.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-style": "italic",
                            "file": "resources/fonts/EgyptianText-RegularItalic.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-weight": "700",
                            "file": "resources/fonts/EgyptianText-Medium.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "200",
                            "file": "resources/fonts/EgyptianHeadline-Light.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "400",
                            "file": "resources/fonts/EgyptianHeadline-Regular.ttf",
                            "format": "ttf"
                        },
                        // This weight contains only a certain set of chars
                        // since it is used only in one place (section names)
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "900",
                            "file": "resources/fonts/EgyptianHeadline-Semibold-redux.ttf",
                            "format": "ttf"
                        }
                    ]
                }
            }
        },

        shell: {
            spriteGeneration: {
                command: [
                    'cd tools/sprites/',
                    'node spricon.js global-icon-config.json'
                ].join('&&'),

                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            }
        },

        imagemin: {
            files: {
                expand: true,
                cwd: staticTargetDir + 'images/',
                src: ['**/*.{png,gif,jpg}', '!favicons/windows_tile_144_b.png'],
                dest: staticTargetDir + 'images'
            }
        },

        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/javascripts',
                    src: ['**/*'],
                    dest: staticTargetDir + 'javascripts'
                }]
            },
            images: {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/images',
                    src: ['**/*'],
                    dest: staticTargetDir + 'images'
                }]
            },
            flash: {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/flash',
                    src: ['**/*.swf'],
                    dest: staticTargetDir + 'flash'
                }]
            },
            headCss: {
                files: [{
                    expand: true,
                    cwd: 'static/target/stylesheets',
                    src: ['**/head*.css'],
                    dest: 'common/conf/assets'
                }]
            },
            hooks: {
                files: [{
                    expand: true,
                    cwd: 'git-hooks',
                    src: ['*'],
                    dest: '.git/hooks/'
                }]
            }
        },

        hash: {
            options: {
                // assets.map must go where Play can find it from resources at runtime.
                // Everything else goes into frontend-static bundling.
                mapping: 'common/conf/assets/assets.map',
                srcBasePath: staticTargetDir,
                destBasePath: staticTargetDir,
                flatten: false,
                hashLength: (isDev) ? 0 : 32
            },
            files: {
                expand: true,
                cwd: staticTargetDir,
                src: '**/*',
                filter: 'isFile',
                dest: staticTargetDir,
                rename: function(dest, src) {
                    // remove .. when hash length is 0
                    return dest + src.split('/').slice(0, -1).join('/');
                }
            }
        },


        /***********************************************************************
         * Test
         **********************************************************************/

        jasmine: {
            options: {
                template: require('grunt-template-jasmine-requirejs'),
                keepRunner: true,
                vendor: [
                    'common/test/assets/javascripts/components/sinon/lib/sinon.js',
                    'common/test/assets/javascripts/components/sinon/lib/sinon/spy.js',
                    'common/test/assets/javascripts/components/sinon/lib/sinon/stub.js',
                    'common/test/assets/javascripts/components/sinon/lib/sinon/util/*.js',
                    'common/test/assets/javascripts/components/jasmine-sinon/lib/jasmine-sinon.js',
                    'common/test/assets/javascripts/components/seedrandom/index.js'
                ],
                helpers: 'common/test/assets/javascripts/setup.js',
                outfile: 'common-spec-runner.html',
                templateOptions: {
                    requireConfig: {
                        baseUrl: 'common/app/assets/javascripts/',
                        paths: {
                            common:       'common',
                            analytics:    'modules/analytics',
                            bonzo:        'components/bonzo/src/bonzo',
                            qwery:        'components/qwery/mobile/qwery-mobile',
                            bean:         'components/bean/bean',
                            reqwest:      'components/reqwest/src/reqwest',
                            domwrite:     'components/dom-write/dom-write',
                            EventEmitter: 'components/eventEmitter/EventEmitter',
                            swipe:        'components/swipe/swipe',
                            swipeview:    'components/swipeview/src/swipeview',
                            moment:       'components/moment/moment',
                            omniture:     '../../../app/public/javascripts/vendor/omniture',
                            fixtures:     '../../../test/assets/javascripts/fixtures',
                            helpers:      '../../../test/assets/javascripts/helpers'
                        }
                    }
                }
            },
            common: {
                options: {
                    specs: grunt.file.expand(
                         'common/test/assets/javascripts/spec/' + jasmineSpec + '.spec.js', [
                            // works, but slow
                            '!common/test/assets/javascripts/spec/Autoupdate.spec.js',
                            '!common/test/assets/javascripts/spec/DocumentWrite.spec.js',
                            '!common/test/assets/javascripts/spec/Fonts.spec.js',
                            // needs fixture data
                            '!common/test/assets/javascripts/spec/LightboxGallery.spec.js',
                            '!common/test/assets/javascripts/spec/MatchNav.spec.js',
                            '!common/test/assets/javascripts/spec/MoreMatches.spec.js',
                            '!common/test/assets/javascripts/spec/OmnitureLib.spec.js',
                            '!common/test/assets/javascripts/spec/ProfileNav.spec.js'
                        ]
                    )
                }
            },
            facia: {
                options: {
                    specs: [
                        'common/test/assets/javascripts/spec/facia/' + jasmineSpec + '.spec.js'
                    ]
                }
            },
            discussion: {
                options: {
                    specs: grunt.file.expand(
                        'common/test/assets/javascripts/spec/discussion/' + jasmineSpec + '.spec.js', [
                            '!common/test/assets/javascripts/spec/discussion/CommentBox.spec.js'
                        ]
                    )
                }
            },
            admin: {
                options: {
                    specs: 'admin/public/javascripts/spec/**/' + jasmineSpec + 'Spec.js',
                    vendor: [
                        'admin/public/javascripts/components/jquery/jquery.js',
                        'admin/public/javascripts/components/js_humanized_time_span/humanized_time_span.js'
                    ],
                    helpers: 'admin/public/javascripts/spec/setup.js',
                    outfile: 'admin-spec-runner.html',
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'admin/public/javascripts/',
                            paths: {
                                Common:       'common',
                                TagSearch:    'modules/TagSearch',
                                AutoComplete: 'modules/AutoComplete',
                                tagEntry:     'modules/tagEntry',
                                ItemSearch:   'modules/ItemSearch',
                                EventEmitter: 'components/eventEmitter/EventEmitter',
                                Reqwest:      'components/reqwest/reqwest',
                                knockout:     'components/knockout/build/output/knockout-latest'
                            }
                        }
                    }
                }
            }
        },

        // Lint Javascript sources
        jshint: {
            options: require('./resources/jshint_conf'),
            self: [
                'Gruntfile.js'
            ],
            common: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/javascripts/',
                    src: ['**/*.js', '!components/**', '!common.js']
                }]
            }
        },

        // Much of the CasperJS setup borrowed from smlgbl/grunt-casperjs-extra
        env: {
            casperjs: {
                ENVIRONMENT : (process.env.ENVIRONMENT) ? process.env.ENVIRONMENT : (isDev) ? "dev" : "code",
                PHANTOMJS_EXECUTABLE : "node_modules/casperjs/node_modules/.bin/phantomjs",
                extend: {
                    PATH: {
                        value: 'node_modules/.bin',
                        delimiter: ':'
                    }
                }
            }
        },

        casperjsLogFile: 'results.xml',
        casperjs: {
            options: {
                // Pre-prod environments have self-signed SSL certs
                ignoreSslErrors: 'yes',
                includes: ['integration-tests/casper/tests/shared.js'],
                xunit: 'integration-tests/target/casper/<%= casperjsLogFile %>',
                loglevel: 'debug',
                direct: true
            },
            screenshot: {
                src: ['tools/screenshots/screenshot.js']
            },
            all: {
                src: ['integration-tests/casper/tests/**/*.spec.js']
            },
            admin: {
                src: ['integration-tests/casper/tests/admin/*.spec.js']
            },
            common : {
                src: ['integration-tests/casper/tests/**/*.spec.js']
            },
            discussion: {
                src: ['integration-tests/casper/tests/discussion/*.spec.js']
            },
            gallery: {
                src: ['integration-tests/casper/tests/gallery/*.spec.js']
            },
            article: {
                src: []
            },
            applications: {
                src: ['integration-tests/casper/tests/applications/*.spec.js']
            },
            facia: {
                src: ['integration-tests/casper/tests/facia/*.spec.js']
            },
            corenavigation: {
                src: ['integration-tests/casper/tests/core-navigation/*.js']
            },
            allexceptadmin: {
                src: ['integration-tests/casper/tests/!(*admin)/*.spec.js']
            }
        },


        /*
         * Analyse
         */
        cssmetrics: {
            common: {
                src: [staticTargetDir + 'stylesheets/**/*.css'],
                options: {
                    quiet: false,
                    maxRules: 4096, //IE max rules
                    maxFileSize: 1048576 //1mb in bytes
                }
            }
        },

        /*
         * Miscellaneous
         */
        mkdir: {
            screenshots: {
                options: {
                    create: [screenshotsDir]
                }
            },
            fontsTarget: {
                options: {
                    create: [staticTargetDir + 'fonts']
                }
            }
        },

        s3: {
            options: {
                bucket: 'aws-frontend-store',
                access: 'public-read'
            },
            upload: {
                upload: [{
                    src: screenshotsDir + '/*.png',
                    dest: env.toUpperCase() + '/screenshots/' + timestampDir
                }]
            }
        },

        // Clean stuff up
        clean: {
            js: [staticTargetDir + 'javascripts'],
            css: [staticTargetDir + 'stylesheets'],
            images: [staticTargetDir + 'images'],
            flash: [staticTargetDir + 'flash'],
            fonts: [staticTargetDir + 'fonts'],
            // Clean any pre-commit hooks in .git/hooks directory
            hooks: ['.git/hooks/pre-commit'],
            assets: ['common/conf/assets'],
            screenshots: [screenshotsDir]
        },

        // Recompile on change
        watch: {
            js: {
                files: ['common/app/{assets, public}/javascript/**/*.js'],
                tasks: ['compile:js'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['common/app/assets/stylesheets/**/*.scss'],
                tasks: ['compile:css'],
                options: {
                    spawn: false
                }
            },
            images: {
                files: ['common/app/{assets, public}/images/**/*'],
                tasks: ['compile:images']
            },
            flash: {
                files: ['common/app/public/flash/**/*'],
                tasks: ['compile:flash']
            },
            fonts: {
                files: ['resources/fonts/**/*'],
                tasks: ['compile:fonts']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-css-metrics');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webfontjson');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-hash');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['compile', 'test', 'analyse']);

    // Compile tasks
    grunt.registerTask('compile:images', ['clean:images', 'copy:images', 'shell:spriteGeneration', 'imagemin']);
    grunt.registerTask('compile:css', ['clean:css', 'sass:compile']);
    grunt.registerTask('compile:js', ['clean:js', 'copy:js', 'requirejs:compile']);
    grunt.registerTask('compile:fonts', ['clean:fonts', 'mkdir:fontsTarget', 'webfontjson']);
    grunt.registerTask('compile:flash', ['clean:flash', 'copy:flash']);
    grunt.registerTask('compile', [
        'compile:images',
        'compile:css',
        'compile:js',
        'compile:fonts',
        'compile:flash',
        // below should not run in dev
        'clean:assets',
        'copy:headCss',
        'hash'
    ]);

    // Test tasks
    grunt.registerTask('test:integration', function(app) {
        app = app || 'allexceptadmin';
        grunt.config('casperjsLogFile', app + '.xml');
        grunt.task.run(['env:casperjs', 'casperjs:' + app]);
    });
    grunt.registerTask('test:unit', function(app) {
        grunt.task.run(['jasmine' + (app ? ':' + app : '')]);
    });
    grunt.registerTask('test', ['jshint:common', 'test:unit', 'test:integration']);

    // Analyse tasks
    grunt.registerTask('analyse:css', ['compile:css', 'cssmetrics:common']);
    grunt.registerTask('analyse', ['analyse:css']);

    // Miscellaneous task
    grunt.registerTask('hookmeup', ['clean:hooks', 'copy:hooks']);
    grunt.registerTask('snap', ['clean:screenshots', 'mkdir:screenshots', 'env:casperjs', 'casperjs:screenshot', 's3:upload']);
};
