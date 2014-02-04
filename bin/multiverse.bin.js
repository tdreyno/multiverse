#!/usr/bin/env node

'use strict';

process.title = 'multiverse';

var basedir = process.cwd();

var grunt = require('grunt');

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
          multiverse: __dirname + '/../dist/multiverse-client'
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
      script: __dirname + '/dist/server/core.js'
    }
  }
});

grunt.loadNpmTasks('grunt-contrib-requirejs');
grunt.loadNpmTasks('grunt-es6-module-transpiler');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-nodemon');

grunt.registerTask('dev', ['transpile:client', 'transpile:server', 'requirejs:dev']);
grunt.registerTask('server', ['dev', 'watch', 'nodemon:dev']);
// grunt.registerTask('closure', ['transpile:client', 'transpile:server', 'requirejs:dev', 'closure-compiler:prod']);
// grunt.registerTask('prod', ['transpile:client', 'transpile:server', 'requirejs:prod', 'compress:prod']);

var mode = process.argv[2];

// if (mode === 'server') {
// var task = grunt.task._tasks[mode];
// grunt.task.init([task]);
  grunt.task.run('server');
// }

grunt.task.start();

