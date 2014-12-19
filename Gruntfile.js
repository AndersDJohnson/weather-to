module.exports = function (grunt) {


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
        options: {
          force: true,
          jshintrc: true
        },
        files: {
          src: ['public/js/**/*.js']
        }
      },
      build: {
        options: {
          force: false,
          jshintrc: true
        },
        files: {
          src: ['public/js/**/*.js']
        }
      }
    },

    less: {
      dev: {
        files: [
          {
            expand: true,
            cwd: 'public/less',
            src: [
              '**/*.less',
              '!**/_*.less',
            ],
            dest: 'public/css',
            ext: '.css',
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
          '!public/bower_components/**'
        ],
        tasks: ['jshint:dev', 'less:dev']
      }
    }

  });

  require('load-grunt-tasks')(grunt);

};
