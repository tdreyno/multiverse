var NetworkClient = function(world, socket, typeLookup) {
  this.world = world;
  this.socket = socket;
  this.typeLookup = typeLookup;

  var self = this;
  this.socket.on('actor:operations', function(data) {
    self.onOperations(data);
  });
};

NetworkClient.prototype.onOperations = function(data) {
  for (var i = 0; i < data.length; i++) {
    this.onOperation(data[i]);
  }
};

NetworkClient.prototype.onOperation = function(data) {
  if (data.op === 'event') {
    console.log('Received Network Event', data.type, data.params);
    this.world.trigger(data.type, [data.params]);
    return;
  }
  
  var typeConstructor = this.typeLookup[data.type];

  if (!typeConstructor) {
    console.log('Unhandled network operation', data);
    return;
  }

  if (data.op === 'create') {
    console.log('Creating entity', data.type, data.params);
    var e = new typeConstructor(data.params);
    this.world.add(e);
  } else if (data.op === 'update') {
    var e = this.world.getEntity(typeConstructor, data.params.id);

    if (!e) {
      console.log('Unmatched entity to update', data);
      return;
    }

    // console.log('Syncing entity', data.type, data.params);
    e.sync(data.params);
  } else if (data.op === 'remove') {
    var e = this.world.getEntity(typeConstructor, data.params.id);
    
    if (!e) {
      console.log('Unmatched entity to remove', data);
      return;
    }

    this.world.remove(e);
  }
};

export default = NetworkClient;
