import { defineClass, proxyMethodsTo } from '../shared/util';
import World from '../shared/world';
import NetworkServer from './network_server';
import EventManager from '../shared/event_manager';

var worldMethods = ['getEntity', 'add', 'remove', 'set', 'get', 'createEntity'];

export default = defineClass(function(){}, {
  initialize: function(params) {
    this.world = new World();
    this.params = params;

    proxyMethodsTo.call(this, worldMethods, this.world);
    // proxyMethodsTo.call(this, ['on', 'off', 'trigger'], this.root);

    this.network = new NetworkServer(this.world);

    this.eventManager = new EventManager(this);
    proxyMethodsTo.call(this, ['on', 'off', 'trigger'], this.eventManager);

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
