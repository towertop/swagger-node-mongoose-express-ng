/*global module:false,require:false,console:false
*/
var util = require('util');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      api: {
        src: 'api/**/*.js'
      },
      spa: {
        src: 'app/**/*.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      api: {
        files: ['api/**/*.*'],
        tasks: ['jshint:api']
      },
      spa: {
        files: ['app/**/*.*'],
        tasks: [
          'jshint:spa', 
          'useminPrepare:dev', 
          'copy:generated', 
          'copy:devAndDist'
        ],
        options: {
          livereload: true
        }
      }
    },
    useminPrepare: {
      options: {
        dest: 'public',
        root: 'app',
        flow: {
          dev: {
            steps: {
              js: [{
                name: 'copy',
                createConfig: function (context, block) {
                  var old = context.options;
                  if (!old.generated) {
                    old.generated = {};
                  }
                  if (!old.generated.files) {
                    old.generated.files = [];
                  }
                  old.generated.files.push({
                    expand: true,
                    cwd: 'app/',
                    src: block.src,
                    dest: 'public/'
                  });
                  return old;
                }
              }],
              css: [{
                name: 'copy',
                createConfig: function (context, block) {
                  var old = context.options;
                  if (!old.generated) {
                    old.generated = {};
                  }
                  if (!old.generated.files) {
                    old.generated.files = [];
                  }
                  old.generated.files.push({
                    expand: true,
                    cwd: 'app/',
                    src: block.src,
                    dest: 'public/'
                  });
                  return old;
                }
              }]
            },
            post: {}
          },
          dist: { steps: { js: ['concat', 'uglify'], css: ['concat', 'cssmin'] }, post: {} }
        },
        blockReplacements: {
          // remove livereload block when build for deployment
          livereload: function (block) {
            if (block.src.length > 0) {
              console.log('removing <script src="//localhost:35729/livereload.js"></script>');
            }
            return '';
          }
        }
      },
      dist: {expand: true, src: ['app/*.html'], filter: 'isFile'},
      dev: 'app/*.html'
    },
    // TODO usemin 应该支持复制，一个PR
    usemin: {
      dist: {expand: true, src: ['public/*.html'], filter: 'isFile'}
    },
    copy: {
      devAndDist: {
        expand: true,
        cwd: 'app/',
        src: '*.html',
        dest: 'public/'
      }
    },
    exec: {
      // uncomment this for verbose log
      // options: {
      //   env: {
      //     DEBUG: "pipes*,swagger-tools:middleware:*"
      //   }
      // },
      swagger: 'swagger project start'
    },
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      dev: ['initAndWatch', 'exec:swagger'],
    }
  });

  grunt.registerTask('initAndWatch', ['jshint', 'useminPrepare:dev', 'copy:generated', 'copy:devAndDist', 'watch']);

  // utility task for inspecting generated grunt config by usemin
  grunt.registerTask('checkGruntConfig', 'A sample task that output grunt.config on the fly.', function() {
      grunt.log.writeln(util.inspect(grunt.config.get()));
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-concurrent');

  // Default task.
  // For Deployment
  grunt.registerTask('default', ['jshint', 'useminPrepare:dist', 'concat:generated', 'uglify:generated', 'cssmin:generated', 'copy:devAndDist', 'usemin:dist']);
  // For Development
  grunt.registerTask('dev', ['concurrent:dev']);
};