import { proxyMethodsTo, isServer } from './util';

var Actor = function(entity, params) {
  this.entity = entity;

  params = params || {}

  this.role = params.role || (isServer() ? Actor.Role.AUTHORITY : Actor.Role.SIMULATED);
  this.remoteRole = params.remoteRole || (isServer() ? Actor.Role.SIMULATED : Actor.Role.AUTHORITY);
  this.typeName = params.typeName || ('unknownType_' + this.constructor.classTypeId);

  this.isDirty = false;

  proxyMethodsTo.call(this, ['get', 'set', 'sync', 'getRawState'], this.entity);
};

Actor.prototype.becameDirty = function() {
  this.isDirty = true;
};

Actor.prototype.becameClean = function() {
  this.isDirty = false;
};

Actor.prototype.shouldSync = function() {
  return ((this.role === Actor.Role.AUTHORITY) &&
          (this.remoteRole !== Actor.Role.NONE));
};

Actor.prototype.trigger = function(eventName, data) {
  if (eventName === 'stateChange') {
    if (this.shouldSync()) {
      this.becameDirty();
    }
  }
};

// Actor.prototype.tearOff = function() {
// };

Actor.Role = {
  NONE: 1,
  AUTHORITY: 2,
  AUTONOMOUS: 3,
  SIMULATED: 4
};

Actor.byName = {};

export default = Actor;
