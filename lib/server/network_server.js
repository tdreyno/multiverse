var NetworkServer = function(world) {
  this.world = world;
  this.connections = {};
  this.pendingOperations = [];

  var self = this;
  this.world.on('addToWorld', function(e) {
    self.addOperation('create', e.actor.typeName, e.getRawState());
  });

  this.world.on('removeFromWorld', function(e) {
    self.addOperation('remove', e.actor.typeName, { id: e.get('id') });
  });

  this.world.on('worldEvent', function(e) {
    if (e.isNetworkEvent) {
      self.addOperation('event', e.eventName, e.data);
    }
  });
};

NetworkServer.prototype.addConnection = function(socket) {
  this.connections[socket.id] = socket;
  // Do stuff?
};

NetworkServer.prototype.removeConnection = function(socket) {
  delete this.connections[socket.id];
  // Do stuff?
};

NetworkServer.prototype.pushCurrentState = function(id) {
  var creationOps = [];

  for (var key in this.world.entities) {
    if (this.world.entities.hasOwnProperty(key)) {
      var e = this.world.entities[key];
      if (e.actor.shouldSync()) {
        creationOps.push(this.makeOperation('create', e.actor.typeName, e.getRawState()));
      }
    }
  }

  if (creationOps.length > 0) {
    this.connections[id].emit('actor:operations', creationOps);
  }
};

NetworkServer.prototype.sync = function() {
  for (var key in this.world.entities) {
    if (this.world.entities.hasOwnProperty(key)) {
      var e = this.world.entities[key];
      if (e.actor.isDirty) {
        this.addOperation('update', e.actor.typeName, e.getRawState());
      }
    }
  }

  if (this.pendingOperations.length > 0) {
    this.broadcast('actor:operations', this.pendingOperations);
    this.pendingOperations.length = 0;

    for (var key in this.world.entities) {
      if (this.world.entities.hasOwnProperty(key)) {
        var e = this.world.entities[key];
        if (e.actor.isDirty) {
          e.actor.becameClean();
        }
      }
    }
  }
};

NetworkServer.prototype.broadcast = function(eventName, params) {
  // console.log('broadcast', eventName, params);
  for (var id in this.connections) {
    if (this.connections.hasOwnProperty(id)) {
      this.connections[id].emit(eventName, params);
    }
  }
};

NetworkServer.prototype.makeOperation = function(op, type, params) {
  return { op: op, type: type, params: params };
};

NetworkServer.prototype.addOperation = function(op, type, params) {
  this.pendingOperations.push(this.makeOperation.apply(this, arguments));
};

export default = NetworkServer;
