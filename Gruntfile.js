module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      files: ['lib/**/*.js'],
      tasks: ['dev']
    },

    pkg: grunt.file.readJSON('package.json'),
    transpile: {
      client: {
        type: "amd",
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['**/*.js'],
          dest: 'dist/client/'
        }]
      },

      server: {
        type: "cjs", // or "amd" or "yui"
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['**/*.js'],
          dest: 'dist/server/'
        }]
      }
    },

    requirejs: {
      dev: {
        options: {
          baseUrl: "dist/client",
          name: "index",
          optimize: 'none',
          out: "dist/multiverse-client.js"
        }
      },

      prod: {
        options: {
          baseUrl: "dist/client",
          name: "index",
          out: "dist/multiverse-client.min.js"
        }
      }
    },

    'closure-compiler': {
      prod: {
        js: 'dist/multiverse-client.js',
        jsOutputFile: "dist/multiverse-client.min.js",
        maxBuffer: 500,
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    },

    compress: {
      prod: {
        options: {
          mode: 'gzip'
        },
        files: [
          { expand: true, src: ['dist/*.min.js'], ext: '.gz.js'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-closure-compiler');

  grunt.registerTask('dev', ['transpile:client', 'transpile:server', 'requirejs:dev']);
  grunt.registerTask('closure', ['transpile:client', 'transpile:server', 'requirejs:dev', 'closure-compiler:prod']);
  grunt.registerTask('prod', ['transpile:client', 'transpile:server', 'requirejs:prod', 'compress:prod']);
};