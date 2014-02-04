"use strict";
var defineClass = require("./util").defineClass;
var proxyMethodsTo = require("./util").proxyMethodsTo;
var Actor = require("./actor")["default"];
var World = require("./world")["default"];
var WorldRenderer = require("./world_renderer")["default"];
var NetworkClient = require("./network/network_client")["default"];
var NetworkServer = require("./network/network_server")["default"];
var THREE = require("./vendor/three")["default"];

var worldMethods = ['getEntity', 'trigger', 'add', 'remove', 'createEntity'];

var Game = defineClass(function(){}, {
  initialize: function(params) {
    var world = new World();

    if ('undefined' !== typeof global) {
      this.backend = new GameServer(world, params);
    } else {
      this.backend = new GameClient(world, params);
    }

    proxyMethodsTo.call(this, worldMethods, this.backend);
    proxyMethodsTo.call(this, ['onEntity', 'onWorld'], this.backend);
  },

  start: function() {
    this.backend.start();
  }
});

var NOOP = function() {};

var GameServer = defineClass(function(){}, {
  initialize: function(world, params) {
    this.world = world;
    this.params = params;

    proxyMethodsTo.call(this, worldMethods, this.world);

    this.network = new NetworkServer(this.world);
    this.setupWebServer();
  },

  onEntity: NOOP,
  onWorld: NOOP,

  setupWebServer: function() {
    var express = require('express');
    var http = require('http');
    var app = express();
    var httpServer = http.createServer(app);
    var socketio = require('socket.io').listen(httpServer);

    app.configure(function() {
      app.use(express.static(__dirname + '/public'));
    });

    httpServer.listen(7777);

    socketio.enable('browser client minification');
    socketio.enable('browser client etag');
    socketio.enable('browser client gzip');
    socketio.set('log level', 2);

    socketio.sockets.on('connection', function(socket) {
      network.addConnection(socket);
      network.pushCurrentState(socket.id);

      var p = new Player({
        id: socket.id,
        position: [0,0,0],
        velocity: [0,0,0],
        rotation: 0
      });

      socket.emit('welcome', {
        id: socket.id
      });

      socket.on('ready', function() {
        network.pushCurrentState(socket.id);
        world.add(p);
      });

      socket.on('playerInput', function(input) {
        p.trigger('playerInput', input);
      });

      socket.on('disconnect', function() {
        network.removeConnection(socket);

        var removePlayer = world.getEntity(Player, socket.id);

        if (removePlayer) {
          world.remove(removePlayer);
        }
      });
    });
  },
  
  start: function() {
    this.startGameLoop();
  },

  startGameLoop: function() {
    var previousTime = new Date().getTime();
    var time = previousTime;
    var delta = 0;

    var self = this;
    setInterval(function() {
      previousTime = time;
      time = new Date().getTime();
      delta = (time - previousTime) * 0.001;
   
      self.world.tick(delta);
      self.network.sync(delta);
    }, 32);
  }
});

var GameClient = defineClass(function(){}, {
  initialize: function(world, params) {
    this.world = world;
    this.params = params;

    proxyMethodsTo.call(this, worldMethods, this.world);
    // new NetworkClient(world, socket, Actor.byName);

    this.setupRenderer();

// new KeyboardHandler(function(keyCode, keyValue) {
//   world.trigger('inputChange', [{ code: keyCode, state: keyValue }]);
// });
  },

  start: function() {
    var self = this;
    window.socket = io.connect();

    socket.on('welcome', function(data) {
      world.set('currentPlayerId', data.id);

      new NetworkClient(world, socket, Actor.byName);

      world.createEntity(Camera, {
        id: 'singleton',
        position: [8192, 400, 8192],
        target: [0, 0, 0],
        player: data.id
      });

      socket.emit('ready');
    });

    this.startGameLoop();
  },

  startGameLoop: function() {
    var clock = new THREE.Clock();
    function onFrame() {
      requestAnimationFrame(onFrame);
      var delta = clock.getDelta();
      world.tick(delta);
      worldRenderer.render(delta);
    }
  },

  setupRenderer: function() {
    this.renderer = new WorldRenderer(this.world);
    proxyMethodsTo.call(this, ['onEntity', 'onWorld'], this.renderer);

    if (true || (this.params.renderer && this.params.renderer === 'threejs')) {
      this.renderer.onWorld(ThreeJSCoreRenderer);
    }

    var self = this;
    window.addEventListener('resize', function() {
      self.renderer.resize();
    }, false);
  }
});