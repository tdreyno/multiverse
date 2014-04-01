export default = function(changeCallback) {
  var _callback = (typeof(changeCallback) == "function") ? changeCallback : function() {};

  var keys = [];
  for(var i = 0; i < 200; i++){
    keys[i] = false;
  }

  var keyDown = function(event){
    var code = event.keyCode;
    if(!keys[code]){
      keys[code] = true;
      _callback(code, true);
    }
  }

  var keyUp = function(event){
    var code = event.keyCode;
    if(keys[code]){
      keys[code] = false;
      _callback(code, false);
    }
  }

  document.addEventListener('keydown', keyDown, false);
  document.addEventListener('keyup', keyUp, false);

  return {
    key : function(code){
      return keys[code];
    }
  }
};
