var ComponentManager = function(entity) {
  this.entity = entity;
  this.componentDefinitions = [];
  this.components = {};
  this.componentGuards = {};
};

ComponentManager.prototype.getActiveComponents = function() {
  this.checkGuards();

  var activeList = [];

  for (var key in this.components) {
    if (this.components.hasOwnProperty(key)) {
      var component = this.components[key];

      if (component.isActive()) {
        activeList.push(component);
      }
    }
  }

  return activeList;
};

ComponentManager.prototype.checkGuards = function() {
  for (var key in this.components) {
    if (this.components.hasOwnProperty(key)) {
      var component = this.components[key];
      var componentGuard = this.componentGuards[key];
      var guardResult = 'function' === typeof componentGuard ? componentGuard.call(component) : componentGuard;

      if (component.isActive() && !guardResult) {
        component.disable();
      } else if (!component.isActive() && guardResult) {
        component.enable();
      }
    }
  }
};

ComponentManager.prototype.onActiveComponents = function(method, args) {
  var active = this.getActiveComponents();

  for (var i = 0; i < active.length; i++) {
    active[i][method].apply(active[i], args);
  }
};

ComponentManager.prototype.addComponent = function(component, options, guard) {
  this.componentDefinitions.push(Array.prototype.slice.call(this, arguments));
};

ComponentManager.prototype.addComponents = function(components) {
  this.componentDefinitions = this.componentDefinitions.concat(components);
};

ComponentManager.prototype.setupComponent = function(component, guard) {
  this.components[component.uid] = component;
  this.componentGuards[component.uid] = 'undefined' !== typeof guard ? guard : true;
};

ComponentManager.prototype.setup = function() {
  for (var i = 0; i < this.componentDefinitions.length; i++) {
    var def = this.componentDefinitions[i];
    this.setupComponent(
      new def[0](this.entity, def[1]),
      def[2]
    );
  }

  this.checkGuards();
};

ComponentManager.prototype.destroy = function() {
  for (var key in this.components) {
    if (this.components.hasOwnProperty(key)) {
      this.components[key].destroy();
    }
  }

  this.components = {};
  this.componentGuards = {};
};

ComponentManager.prototype.trigger = function(eventName, eventData) {
  var args = [eventName].concat(eventData || []);
  this.onActiveComponents('receivedMessage', args);
};

export default = ComponentManager;
