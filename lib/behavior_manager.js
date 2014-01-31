import AddDelta from '../behaviors/add_delta_behavior';

var BehaviorManager = function(entity) {
  this.entity = entity;
  this.behaviorDefinitions = [];
  this.behaviors = {};
  this.behaviorGuards = {};
};

BehaviorManager.prototype.getActiveBehaviors = function() {
  this.checkGuards();

  var activeList = [];

  for (var key in this.behaviors) {
    if (this.behaviors.hasOwnProperty(key)) {
      var behavior = this.behaviors[key];

      if (behavior.isActive()) {
        activeList.push(behavior);
      }
    }
  }

  return activeList;
};

BehaviorManager.prototype.checkGuards = function() {
  for (var key in this.behaviors) {
    if (this.behaviors.hasOwnProperty(key)) {
      var behavior = this.behaviors[key];
      var behaviorGuard = this.behaviorGuards[key];
      var guardResult = 'function' === typeof behaviorGuard ? behaviorGuard.call(behavior) : behaviorGuard;

      if (behavior.isActive() && !guardResult) {
        behavior.disable();
      } else if (!behavior.isActive() && guardResult) {
        behavior.enable();
      }
    }
  }
};

BehaviorManager.prototype.onActiveBehaviors = function(method, args) {
  var active = this.getActiveBehaviors();

  for (var i = 0; i < active.length; i++) {
    active[i][method].apply(active[i], args);
  }
};

BehaviorManager.prototype.addBehavior = function(behavior, options, guard) {
  this.behaviorDefinitions.push(Array.prototype.slice.call(this, arguments));
};

BehaviorManager.prototype.addBehaviors = function(behaviors) {
  this.behaviorDefinitions = this.behaviorDefinitions.concat(behaviors);
};

BehaviorManager.prototype.setupBehavior = function(behavior, guard) {
  this.behaviors[behavior.uid] = behavior;
  this.behaviorGuards[behavior.uid] = 'undefined' !== typeof guard ? guard : true;
};

BehaviorManager.prototype.setup = function() {
  for (var i = 0; i < this.behaviorDefinitions.length; i++) {
    var def = this.behaviorDefinitions[i];
    this.setupBehavior(
      new def[0](this.entity, def[1]),
      def[2]
    );
  }

  this.checkGuards();
};

BehaviorManager.prototype.destroy = function() {
  for (var key in this.behaviors) {
    if (this.behaviors.hasOwnProperty(key)) {
      this.behaviors[key].destroy();
    }
  }

  this.behaviors = {};
  this.behaviorGuards = {};
};

BehaviorManager.prototype.trigger = function(eventName, eventData) {
  var args = [eventName].concat(eventData || []);
  this.onActiveBehaviors('receivedMessage', args);
};

export default = BehaviorManager;
