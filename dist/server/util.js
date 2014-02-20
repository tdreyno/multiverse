"use strict";
var _ = require("./vendor/underscore")._;

function proxyMethodsTo(methods, target) {
  for (var i = 0; i < methods.length; i++) {
    var method = methods[i];

    if (target[method]) {
      this[method] = _.bind(target[method], target);
    } else {
      console.log('missing bind', target, method);
    }
  }
}

// Compose API
function isClient() { return !isServer(); };

function isServer() { return 'undefined' !== typeof global; };

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function and(f, g) {
  return function() {
    return f.apply(this.arguments) && f.apply(this, arguments);
  }
}

function or(f, g) {
  return function() {
    return f.apply(this.arguments) || f.apply(this, arguments);
  }
}

function property(varName) {
  return function() {
    return this.entity.get(varName);
  }
}

function ref(varName) {
  return function() {
    var target = this.entity[varName];

    if ('function' === typeof target) {
      return target.call(this.entity);
    } else {
      return this.entity[varName];
    }
  }
}
function inherits(childCtor, parentCtor) {
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};

var wrapperIDs = 0;
var instanceIDs = 0;

function defineWrapper(baseClass, constructor, details) {
  var klass = function(params) {
    var args = Array.prototype.slice.call(arguments, 0);

    this.uid = instanceIDs++;

    // Base constructor
    this.constructor.superClass_.constructor.apply(this, args);

    // Child "initialize"
    constructor.apply(this, args);
  };

  inherits(klass, baseClass);

  for (var key in details) {
    if (details.hasOwnProperty(key)) {
      klass.prototype[key] = details[key];
    }
  }

  klass.classTypeId = wrapperIDs++;

  return klass;
};

function defineClass(base, details) {
  var constructor = details.initialize || function() {};
  delete details.initialize;

  var wrappedConstructor = function(params) {
    constructor.apply(this, arguments);
  }

  var wrapped = defineWrapper(base, wrappedConstructor, details);

  return wrapped;
};

exports.inherits = inherits;
exports.defineWrapper = defineWrapper;
exports.defineClass = defineClass;
exports.proxyMethodsTo = proxyMethodsTo;
exports.capitalize = capitalize;
exports.isClient = isClient;
exports.isServer = isServer;
exports.and = and;
exports.or = or;
exports.property = property;
exports.ref = ref;