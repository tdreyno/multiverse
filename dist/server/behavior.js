"use strict";
var defineWrapper = require("./util").defineWrapper;
var proxyMethodsTo = require("./util").proxyMethodsTo;

var Behavior = function(entity, options) {
  this.entity = entity;
  this.options_ = options;
  this.enabled_ = true;

  proxyMethodsTo.call(this, ['on', 'off', 'trigger', 'getWorld', 'get', 'set', 'getRawState', 'createEntity'], this.entity);
};

Behavior.prototype.isActive = function() {
  return this.enabled_;
};

Behavior.prototype.enable = function() {
  this.enabled_ = true;
  this.initialize();
};

Behavior.prototype.disable = function() {
  this.enabled_ = false;
  this.destroy();
};

Behavior.prototype.receivedMessage = function(eventName, data) {
  this.onMessage(eventName, data);

  var events = this.constructor.eventMap;
  for (var key in events) {
    if (events.hasOwnProperty(key) && (eventName === key)) {
      this[events[key]](data);
    }
  }
};

Behavior.prototype.onMessage = function(eventName, data) {
};

Behavior.prototype.getOption = function(name) {
  var ref = this.options_[name];

  if ('function' === typeof ref) {
    return ref.call(this);
  } else {
    return ref;
  }
};

Behavior.prototype.destroy = function() {

};

Behavior.define = function(details) {
  var constructor = details.initialize || function() {};
  // delete details.initialize;

  var events = details.events || {};
  delete details.events;

  var klass = defineWrapper(Behavior, constructor, details);

  klass.eventMap = events;

  return klass;
};

exports["default"] = Behavior;