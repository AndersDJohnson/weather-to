/* eslint-env node */

var fs = require('fs');

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);


  var rev = Date.now();

  var favicons = fs.readFileSync('./public/favicons.html');

  var ngAnnotateFiles = [
    '**/*.js',
    // parse errors
    '!bower_components/jquery/**',
    '!bower_components/bootstrap/grunt/change-version.js',
    '!bower_components/moment/{src,locale,templates}/**/*.js'
  ];

  grunt.registerTask('dev', [
    'template:dev',
    'less:dev'
  ]);

  grunt.registerTask('buildDev', [
    'ngAnnotate:dev',
    'bowerRequirejs:main',
    'dev'
  ]);

  grunt.registerTask('build', [
    'clean:build',
    'copy:build',
    'template:build',
    'htmlmin:build',
    'cssmin:build',
    // 'cssmin:buildVendor',
    'ngAnnotate:build',
    'requirejs:build',
    'concat:build',
    'uglify:build',
    // 'uglify:buildVendor',
  ]);

  grunt.registerTask('postinstall', [
    'bowerRequirejs:main',
    'ngAnnotate:dev',
    'less:dev',
    'build'
  ]);


  grunt.initConfig({

    bowerRequirejs: {
      main: {
        rjsConfig: 'public/js/requireConfig.js',
        options: {
          // baseUrl: './public',
          exclude: [
            'font-awesome'
          ],
          'exclude-dev': true
        }
      }
    },

    connect: {
      dev: {
        options: {
          base: 'public',
          port: 8000,
          keepalive: true
        }
      },
      build: {
        options: {
          base: 'build',
          port: 8001,
          keepalive: true
        }
      },
    },

    clean: {
      build: {
        options: {
          force: true
        },
        files: [
          {
            src: ['build']
          }
        ]
      }
    },

    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'public',
            src: [
              '**/*',
              '!**/*.tmpl.html',
              '!js/**',
              '!less/**',
              '!data/**'
            ],
            dest: 'build'
          }
        ]
      }
    },

    template: {
      dev: {
        options: {
          data: {
            dev: true,
            favicons: favicons,
            rev: rev
          }
        },
        files: [
          {
            'public/index.html': ['public/index.tmpl.html']
          }
        ]
      },
      build: {
        options: {
          data: {
            dev: false,
            favicons: favicons,
            rev: rev
          }
        },
        files: [
          {
            'build/index.html': ['public/index.tmpl.html']
          }
        ]
      }
    },

    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [
          {
            expand: true,
            cwd: 'build',
            src: [
              '**/*.html',
              '!bower_components/**'
            ],
            dest: 'build'
          }
        ]
      }
    },

    cssmin: {
      build: {
        options: {
          // sourceMap: true
        },
        files: [
          {
            expand: true,
            cwd: 'build',
            src: [
              '**/*.css',
              '!bower_components/**'
            ],
            dest: 'build',
            ext: '.min.css',
            extDot: 'last'
          }
        ]
      },
      buildVendor: {
        options: {
          // sourceMap: true
        },
        files: [
          {
            expand: true,
            cwd: 'build',
            src: [
              'bower_components/**/*.css'
            ],
            dest: 'build'
          }
        ]
      }
    },

    uglify: {
      build: {
        options: {
          sourceMap: true
        },
        files: [
          {
            expand: true,
            cwd: 'build',
            src: [
              '**/*.js',
              '!bower_components/**'
            ],
            dest: 'build',
            ext: '.min.js',
            extDot: 'last'
          }
        ]
      },
      buildVendor: {
        options: {
          sourceMap: true
        },
        files: [
          {
            expand: true,
            cwd: 'build',
            src: [
              'bower_components/**/*.js',
              '!bower_components/jquery/**' // parse error
            ],
            dest: 'build'
          }
        ]
      }
    },

    /**
     * https://github.com/jrburke/r.js/blob/master/build/example.build.js
     */
    requirejs: {
      build: {
        options: {
          baseUrl: 'public/js',
          mainConfigFile: 'public/js/requireConfig.js',
          dir: 'build/js',
          skipDirOptimize: false,
          removeCombined: false,
          optimize: 'none',
          optimizeCss: 'none',
          modules: [
            {
              name: 'index'
            }
          ]
        }
      }
    },

    ngAnnotate: {
      dev: {
        files: [
          {
            expand: true,
            cwd: 'public',
            src: ngAnnotateFiles,
            dest: 'public'
          }
        ]
      },
      build: {
        files: [
          {
            expand: true,
            cwd: 'build',
            src: ngAnnotateFiles,
            dest: 'build'
          }
        ]
      }
    },

    concat: {
      build: {
        options: {
          sourceMap: true
        },
        files: [
          {
            src: [
              'public/bower_components/requirejs/require.js',
              'build/js/requireConfig.js',
              'build/js/index.js'
            ],
            dest: 'build/js/index-build.js',
          }
        ]
      }
    },

    less: {
      dev: {
        options: {
          sourceMap: true,
          sourceMapBasepath: 'public',
          sourceMapRootpath: '/'
        },
        files: [
          {
            expand: true,
            cwd: 'public/less',
            src: [
              '**/*.less',
              '!**/_*.less',
            ],
            dest: 'public/css',
            ext: '.less.css',
            extDot: 'last'
          }
        ]
      }
    },

    watch: {
      dev: {
        options: {
          livereload: true
        },
        files: [
          'public/**',
          '!public/css/**/*.less.css',
          '!public/bower_components/**'
        ],
        tasks: ['dev']
      }
    }

  });


};
