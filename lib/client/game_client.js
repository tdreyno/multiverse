import { defineClass, proxyMethodsTo } from '../shared/util';
import EventManager from '../shared/event_manager';
import Actor from '../shared/actor';
import World from '../shared/world';
import WorldRenderer from './world_renderer';
import NetworkClient from './network_client';
import KeyHandler from './key_handler';
import THREE from '../vendor/three';
import { connect } from '../../../node_modules/socket.io-client/dist/socket.io';

var worldMethods = ['getEntity', 'add', 'remove', 'set', 'get', 'createEntity'];

export default = defineClass(function(){}, {
  initialize: function(params) {
    this.world = new World();
    this.params = params;

    proxyMethodsTo.call(this, worldMethods, this.world);

    this.eventManager = new EventManager(this);
    proxyMethodsTo.call(this, ['on', 'off'], this.eventManager);

    this.setupRenderer();

    var self = this;
    new KeyHandler(function(keyCode, keyValue) {
      self.trigger('inputChange', [{ code: keyCode, state: keyValue }]);
    });
  },

  trigger: function(eventName, data) {
    this.eventManager.trigger.apply(this.eventManager, arguments);
    this.world.trigger.apply(this.world, arguments);
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

    var self = this;
    window.addEventListener('resize', function() {
      self.renderer.resize();
    }, false);
  }
});
