module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      files: ['js/**/*.js'],
      tasks: ['default']
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
          out: "dist/plurality-client.js"
        }
      },

      prod: {
        options: {
          baseUrl: "dist/client",
          name: "index",
          out: "dist/plurality-client.min.js"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['transpile:client', 'transpile:server', 'requirejs:dev', 'requirejs:prod']);
};