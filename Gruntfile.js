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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dev', ['transpile:client', 'transpile:server', 'requirejs:dev']);
  grunt.registerTask('prod', ['transpile:client', 'transpile:server', 'requirejs:prod', 'compress:prod']);
};