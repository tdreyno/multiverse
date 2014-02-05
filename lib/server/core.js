var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);
var socketio = require('socket.io').listen(httpServer);
var path = require('path');

var basedir = process.cwd();

app.configure(function() {
  app.use(express.static(basedir + '/public'));
  app.use('/game', express.static(basedir + '/dist/client/game'));
});

app.get('/multiverse/game.js', function(req, res) {
  res.sendfile(path.resolve(__dirname + '/../../multiverse-client-with-require.js'));
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
    id: socket.id
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
