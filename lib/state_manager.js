import { proxyMethodsTo } from '../core/util';
import { _ } from 'underscore';

var StateManager = function(entity) {
  this.entity = entity;
  this.state_ = {};

  proxyMethodsTo.call(this, ['trigger'], this.entity);
};

StateManager.prototype.getRawState = function() {
  return this.state_;
};

StateManager.prototype.get = function(key) {
  return this.state_[key];
};

StateManager.prototype.set = function(key, value) {
  if (!_.isEqual(this.get(key), value)) {
    this.state_[key] = value;
    this.trigger('stateChange', [{ key: key, value: value }]);
  }
};

StateManager.prototype.sync = function(data) {
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      this.set(key, data[key]);
    }
  }
};

export default = StateManager;
