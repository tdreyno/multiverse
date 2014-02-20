"use strict";
var defineClass = require("./util").defineClass;
var proxyMethodsTo = require("./util").proxyMethodsTo;
var Actor = require("./actor")["default"];
var World = require("./world")["default"];
var WorldRenderer = require("./world_renderer")["default"];
var NetworkClient = require("./network/network_client")["default"];
var NetworkServer = require("./network/network_server")["default"];
var EventManager = require("./event_manager")["default"];
var KeyHandler = require("./key_handler")["default"];
var THREE = require("./vendor/three")["default"];
var connect = require("../../node_modules/socket.io-client/dist/socket.io").connect;

var worldMethods = ['getEntity', 'add', 'remove', 'set', 'get', 'createEntity'];

var Game = defineClass(function(){}, {
  initialize: function(params) {
    this.world = new World();

    this.eventManager = new EventManager(this);
    proxyMethodsTo.call(this, ['on', 'off'], this.eventManager);

    if ('undefined' !== typeof global) {
      this.backend = new GameServer(this, this.world, params);
    } else {
      this.backend = new GameClient(this, this.world, params);
    }

    proxyMethodsTo.call(this, worldMethods, this.backend);
    proxyMethodsTo.call(this, ['onEntity', 'onWorld'], this.backend);
  },

  start: function() {
    this.backend.start();
  },

  trigger: function(eventName, data) {
    this.eventManager.trigger.apply(this.eventManager, arguments);
    this.world.trigger.apply(this.world, arguments);
  }
});

var NOOP = function() {};

var GameServer = defineClass(function(){}, {
  initialize: function(root, world, params) {
    this.root = root;
    this.world = world;
    this.params = params;

    proxyMethodsTo.call(this, worldMethods, this.world);
    proxyMethodsTo.call(this, ['on', 'off', 'trigger'], this.root);

    this.network = new NetworkServer(this.world);

    var self = this;
    this.on('socket:connection', function(socket) {
      self.network.addConnection(socket);
      self.network.pushCurrentState(socket.id);

      socket.emit('server:connectionAccepted', {
        id: socket.id
      });

      socket.on('client:networkReady', function() {
        self.network.pushCurrentState(socket.id);

        self.trigger('connection', [socket.id]);

        socket.emit('server:gameReady');
      });

      socket.on('clientEvent', function(message) {
        self.trigger('client:' + message.eventName, [message.data]);
      });

      socket.on('disconnect', function() {
        self.network.removeConnection(socket);
        self.trigger('disconnection', [socket.id]);
      });
    })
  },

  onEntity: NOOP,
  onWorld: NOOP,

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
  initialize: function(root, world, params) {
    this.root = root;
    this.world = world;
    this.params = params;

    proxyMethodsTo.call(this, worldMethods, this.world);
    proxyMethodsTo.call(this, ['on', 'off', 'trigger'], this.root);

    this.setupRenderer();

    var self = this;
    new KeyHandler(function(keyCode, keyValue) {
      self.trigger('inputChange', [{ code: keyCode, state: keyValue }]);
    });
  },

  start: function() {
    var self = this;
    window.socket = connect();

    socket.on('server:connectionAccepted', function(data) {
      self.set('currentPlayerId', data.id);

      new NetworkClient(self.world, socket, Actor.byName);

      socket.emit('client:networkReady');
    });

    socket.on('server:gameReady', function() {
      self.trigger('ready');
      self.startGameLoop();
    });
  },

  startGameLoop: function() {
    var clock = new THREE.Clock();
    var self = this;

    function onFrame() {
      requestAnimationFrame(onFrame);
      var delta = clock.getDelta();
      self.world.tick(delta);
      self.renderer.render(delta);
    }

    onFrame();
  },

  setupRenderer: function() {
    this.renderer = new WorldRenderer(this.world);
    proxyMethodsTo.call(this, ['onEntity', 'onWorld'], this.renderer);

    if (this.params.renderer) {
      this.renderer.onWorld(this.params.renderer);
    }

    var self = this;
    window.addEventListener('resize', function() {
      self.renderer.resize();
    }, false);
  }
});

exports["default"] = Game;