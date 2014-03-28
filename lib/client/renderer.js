import { defineWrapper, proxyMethodsTo } from '../shared/util';

var Renderer = function(entity, options) {
  this.entity = entity;
  this.options_ = options;

  proxyMethodsTo.call(this, ['get', 'getWorld'], this.entity);
};

Renderer.prototype.render = function(delta) {
};

Renderer.prototype.resize = function() {
};

Renderer.prototype.getOption = function(name) {
  var ref = this.options_[name];

  if ('function' === typeof ref) {
    return ref.call(this);
  } else {
    return ref;
  }
};

Renderer.prototype.destroy = function() {

};

Renderer.define = function(details) {
  var constructor = details.initialize || function() {};
  // delete details.initialize;

  return defineWrapper(Renderer, constructor, details);
};

export default = Renderer;
