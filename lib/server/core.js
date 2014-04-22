var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);
var socketio = require('socket.io').listen(httpServer);
var sharejs = require('share').server;
var path = require('path');

var basedir = process.cwd();

app.configure(function() {
  app.use(express.static(basedir + '/public'));
  app.use('/game', express.static(basedir + '/dist/client/game'));
});

sharejs.attach(app, {
  browserChannel: { cors: "*" },
  db: { type: 'none' }
});

app.get('/multiverse/game.js', function(req, res) {
  res.sendfile(path.resolve(__dirname + '/../../multiverse-client-with-require.js'));
});

var game = require(path.resolve(process.cwd() + '/dist/server/game/server'))['default'];

httpServer.listen(process.env.PORT || 7777);

socketio.enable('browser client minification');
socketio.enable('browser client etag');
socketio.enable('browser client gzip');
socketio.set('log level', 2);

socketio.sockets.on('connection', function(socket) {
  game.trigger('socket:connection', [socket]);
});

exports = module.exports = httpServer;
