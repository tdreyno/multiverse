import BehaviorManager from './behavior_manager';
import EventManager from './event_manager';
import StateManager from './state_manager';
import Actor from './actor';
import { defineWrapper, proxyMethodsTo } from './util';

var Entity = function(params) {
  this.behaviorManager = new BehaviorManager(this);
  proxyMethodsTo.call(this, ['addBehavior', 'addBehaviors'], this.behaviorManager);

  this.eventManager = new EventManager(this);
  proxyMethodsTo.call(this, ['on', 'off'], this.eventManager);

  this.stateManager = new StateManager(this);
  proxyMethodsTo.call(this, ['get', 'set', 'sync', 'getRawState'], this.stateManager);

  var self = this;
  this.on('didAddToWorld', function(world) {
    self.world_ = world;
    self.behaviorManager.setup();
  });

  // this.on('didRemoveFromWorld', function() {
  //   self.behaviorManager.destroy();
  //   self.world_ = null;
  // });
};

Entity.prototype.trigger = function() {
  this.eventManager.trigger.apply(this.eventManager, arguments);
  this.behaviorManager.trigger.apply(this.behaviorManager, arguments);
  
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

  var behaviors = details.behaviors || [];
  delete details.behaviors;

  var events = details.events || {};
  delete details.events;

  var actorParams = details.actor || {};
  delete details.actor;

  var wrappedConstructor = function(params) {
    params = params || {};
    
    this.addBehaviors(behaviors);
    
    params.id = params.id || this.uid;
    this.sync(params);

    this.actor = new Actor(this, actorParams);

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

  if (actorParams && actorParams.typeName) {
    Actor.byName[actorParams.typeName] = wrapped;
  }
  
  return wrapped;
};

export default = Entity;
