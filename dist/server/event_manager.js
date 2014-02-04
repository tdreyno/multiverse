"use strict";
var EventEmitter = require("./vendor/EventEmitter")["default"];

var EventManager = function() {
  this.emitter = new EventEmitter();
};

EventManager.prototype.on = function() {
  return this.emitter.addListener.apply(this.emitter, arguments);
};

EventManager.prototype.off = function() {
  return this.emitter.removeListener.apply(this.emitter, arguments);
};

EventManager.prototype.trigger = function() {
  return this.emitter.emitEvent.apply(this.emitter, arguments);
};

exports["default"] = EventManager;