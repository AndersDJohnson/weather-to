module.exports = function (grunt) {

  var _ = grunt.util._;

  var jshintSettings = {
    "es5": false,
    "browser": true,
    "undef": true,
    "globals": {
      "require": true,
      "define": true
    }
  };

  grunt.initConfig({

    bower: {
      main: {
        rjsConfig: 'public/js/requireConfig.js',
        options: {
          // baseUrl: './public'
        }
      }
    },

    connect: {
      alive: {
        options: {
          base: "public",
          keepalive: true
        }
      }
    },

    jshint: {
      dev: {
        options: _.extend({
          force: false, // true to not fail
          devel: true,
          debug: true
        }, jshintSettings),
        files: {
          src: ['public/js/**/*.js']
        }
      },
      build: {
        options: _.extend({
          force: false
        }, jshintSettings),
        files: {
          src: ['public/js/**/*.js']
        }
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
        tasks: ['jshint:dev', 'less:dev']
      }
    }

  });

  require('load-grunt-tasks')(grunt);

};
