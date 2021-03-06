import ComponentManager from './component_manager';
import EventManager from './event_manager';
import StateManager from './state_manager';
import Actor from './actor';
import { defineWrapper, proxyMethodsTo } from './util';

var Entity = function(params) {
  this.componentManager = new ComponentManager(this);
  proxyMethodsTo.call(this, ['addComponent', 'addComponents'], this.componentManager);

  this.eventManager = new EventManager(this);
  proxyMethodsTo.call(this, ['on', 'off'], this.eventManager);

  this.stateManager = new StateManager(this);
  proxyMethodsTo.call(this, ['get', 'set', 'sync', 'getRawState'], this.stateManager);

  var self = this;
  this.on('didAddToWorld', function(world) {
    self.world_ = world;
    self.componentManager.setup();
  });

  // this.on('didRemoveFromWorld', function() {
  //   self.componentManager.destroy();
  //   self.world_ = null;
  // });
};

Entity.prototype.trigger = function() {
  this.eventManager.trigger.apply(this.eventManager, arguments);
  this.componentManager.trigger.apply(this.componentManager, arguments);
  
  if (this.actor) {
    this.actor.trigger.apply(this.actor, arguments);
  }
};

Entity.prototype.remove = function() {
  if (this.world_) {
    this.world_.remove(this);
  }
};

Entity.prototype.createEntity = function() {
  if (this.world_) {
    this.world_.createEntity.apply(this.world_, arguments);
  }
};

Entity.prototype.triggerNetwork = function(eventName, obj) {
  if (this.world_) {
    var args = [obj, true];
    this.getWorld().trigger(eventName, args);
  }
};

Entity.prototype.getWorld = function() {
  return this.world_;
};

Entity.prototype.guid = function() {
  return 'type' + this.constructor.classTypeId + '_instance' + this.get('id');
};

Entity.prototype.destroy = function() {

};

Entity.define = function(details) {
  var constructor = details.initialize || function() {};
  delete details.initialize;

  var components = details.components || [];
  delete details.components;

  var events = details.events || {};
  delete details.events;

  var syncsAs = details.syncsAs || {};
  delete details.syncsAs;

  var wrappedConstructor = function(params) {
    params = params || {};
    
    this.addComponents(components);
    
    params.id = params.id || this.uid;
    this.sync(params);

    if (syncsAs) {
      this.actor = new Actor(this, {
        typeName: syncsAs
      });
    }

    var self = this;
    for (var key in events) {
      if (events.hasOwnProperty(key)) {
        this.on(key, function() {
          self[events[key]].apply(self, arguments);
        });
      }
    }

    this.trigger('willInitialize');
    constructor.apply(this, arguments);
    this.trigger('didInitialize');
  }

  var wrapped = defineWrapper(Entity, wrappedConstructor, details);

  if (syncsAs) {
    Actor.byName[syncsAs] = wrapped;
  }

  wrapped.components = {
    add: function(klass, options) {
      options = 'undefined' !== typeof options ? options : {};
      components.push([klass, options.params || {}, options.guard]);
    }
  };
  
  return wrapped;
};

export default = Entity;
