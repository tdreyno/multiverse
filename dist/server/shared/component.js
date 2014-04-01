"use strict";
var defineWrapper = require("./util").defineWrapper;
var proxyMethodsTo = require("./util").proxyMethodsTo;

var Component = function(entity, options) {
  this.entity = entity;
  this.options_ = options;
  this.enabled_ = true;

  proxyMethodsTo.call(this, ['on', 'off', 'trigger', 'getWorld', 'get', 'set', 'getRawState', 'createEntity', 'triggerNetwork'], this.entity);
};

Component.prototype.isActive = function() {
  return this.enabled_;
};

Component.prototype.enable = function() {
  this.enabled_ = true;
  this.initialize();
};

Component.prototype.disable = function() {
  this.enabled_ = false;
  this.destroy();
};

Component.prototype.receivedMessage = function(eventName, data) {
  this.onMessage(eventName, data);

  var events = this.constructor.eventMap;
  for (var key in events) {
    if (events.hasOwnProperty(key) && (eventName === key)) {
      this[events[key]](data);
    }
  }
};

Component.prototype.onMessage = function(eventName, data) {
};

Component.prototype.getOption = function(name) {
  var ref = this.options_[name];

  if ('function' === typeof ref) {
    return ref.call(this);
  } else {
    return ref;
  }
};

Component.prototype.destroy = function() {

};

Component.define = function(details) {
  var constructor = details.initialize || function() {};
  // delete details.initialize;

  var events = details.events || {};
  delete details.events;

  var klass = defineWrapper(Component, constructor, details);

  klass.eventMap = events;

  return klass;
};

exports["default"] = Component;