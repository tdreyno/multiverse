"use strict";
var grunt = require('grunt');

function start() {
  var basedir = process.cwd();

  grunt.initConfig({
    watch: {
      files: [basedir + '/game/**/*.js'],
      tasks: ['dev']
    },

    transpile: {
      client: {
        type: "amd",
        files: [{
          expand: true,
          cwd: basedir + '/game/',
          src: ['**/*.js'],
          dest: basedir + '/dist/client/'
        }]
      },

      server: {
        type: "cjs", // or "amd" or "yui"
        files: [{
          expand: true,
          cwd: basedir + '/game/',
          src: ['**/*.js'],
          dest: basedir + '/dist/server/'
        }]
      }
    },

    requirejs: {
      dev: {
        options: {
          baseUrl: basedir + "/dist/client",
          name: "core",
          optimize: 'none',
          out: basedir + "/dist/game.js",
          paths: {
            multiverse: __dirname + '/../multiverse-client'
          }
        }
      }//,

      // prod: {
      //   options: {
      //     baseUrl: "dist/client",
      //     name: "index",
      //     out: "dist/multiverse-client.min.js"
      //   }
      // }
    },

    nodemon: {
      dev: {
        script: __dirname + '/server/core.js'
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.loadTasks(__dirname + '/../../node_modules/grunt-contrib-requirejs/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-es6-module-transpiler/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-contrib-watch/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-nodemon/tasks');

  grunt.registerTask('dev', ['transpile:client', 'transpile:server', 'requirejs:dev']);
  grunt.registerTask('server', ['dev', 'nodemon:dev']);
  // grunt.registerTask('closure', ['transpile:client', 'transpile:server', 'requirejs:dev', 'closure-compiler:prod']);
  // grunt.registerTask('prod', ['transpile:client', 'transpile:server', 'requirejs:prod', 'compress:prod']);

  var mode = process.argv[2];

  // if (mode === 'server') {
  // var task = grunt.task._tasks[mode];
  // grunt.task.init([task]);
    grunt.task.run('server');
  // }

  grunt.task.start();
}

exports.start = start;