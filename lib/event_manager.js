import { EventEmitter } from '../vendor/EventEmitter';

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

export default = EventManager;
