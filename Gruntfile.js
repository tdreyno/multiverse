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
          src: ['vendor/**/*.js', 'shared/**/*.js', 'client/**/*.js', 'multiverse.js'],
          dest: 'dist/client/'
        }]
      },

      server: {
        type: "cjs", // or "amd" or "yui"
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['vendor/**/*.js', 'shared/**/*.js', 'server/**/*.js', 'cli.js', 'server.js'],
          dest: 'dist/server/'
        }]
      }
    },

    requirejs: {
      dev: {
        options: {
          baseUrl: "dist/client",
          name: "multiverse",
          optimize: 'none',
          out: "dist/multiverse-client.js"
        }
      },

      prod: {
        options: {
          baseUrl: "dist/client",
          name: "multiverse",
          out: "dist/multiverse-client.min.js"
        }
      }
    },
    
    concat: {
      dev: {
        src: ['node_modules/requirejs/require.js', 'dist/multiverse-client.js', 'lib/server/suffix.js'],
        dest: 'dist/multiverse-client-with-require.js',
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('dev', ['transpile:client', 'transpile:server', 'requirejs:dev', 'concat:dev']);
  grunt.registerTask('prod', ['transpile:client', 'transpile:server', 'requirejs:prod', 'compress:prod']);
};