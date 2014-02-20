"use strict";
var grunt = require('grunt');

function start() {
  var basedir = process.cwd();

  grunt.initConfig({
    watch: {
      dev: {
        files: [basedir + '/game/**/*.js'],
        tasks: ['dev'],
        options: {
          spawn: false
        }
      },

      express: {
        files:  [basedir + '/dist/server/**/*.js' ],
        tasks:  ['express:dev:stop'],
        options: {
          spawn: false
        }
      }
    },

    transpile: {
      client: {
        type: "amd",
        files: [{
          expand: true,
          cwd: basedir + '/',
          src: ['game/**/*.js'],
          dest: basedir + '/dist/client/'
        }]
      },

      server: {
        type: "cjs", // or "amd" or "yui"
        files: [{
          expand: true,
          cwd: basedir + '/',
          src: ['game/**/*.js'],
          dest: basedir + '/dist/server/'
        }]
      }
    },

    express: {
      options: {
        background: true,
        delay: 200,
      },
      dev: {
        options: {
          script: __dirname + '/server/core.js'
        }
      }
    },

    concurrent: {
      dev: {
        tasks: ['watch:express'] //'watch:dev', 
      }
    }
  });

  grunt.loadTasks(__dirname + '/../../node_modules/grunt-es6-module-transpiler/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-contrib-watch/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-express-server/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-contrib-concat/tasks');
  grunt.loadTasks(__dirname + '/../../node_modules/grunt-concurrent/tasks');

  grunt.registerTask('dev', ['transpile:client', 'transpile:server']);
  grunt.registerTask('server', ['dev', 'watch:dev']);

  var mode = process.argv[2];

  // if (mode === 'server') {
  // var task = grunt.task._tasks[mode];
  // grunt.task.init([task]);
    grunt.task.run('server');
  // }

  grunt.task.start();
}

exports.start = start;