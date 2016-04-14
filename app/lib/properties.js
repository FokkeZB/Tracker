/**
 * Wrapper for Ti.App.Properties to add events, caching and defaults via config.json
 */

var $ = module.exports = _.extend({

  set: set,
  get: get,

  setString: setString,
  getString: getString

}, Backbone.Events);

// PRIVATE VARIABLES

var _cache = [];

// PRIVATE FUNCTIONS

function set(key, val) {

  if (!Alloy.CFG.settings[key]) {
    throw new Error('Unknown setting: ' + key);
  }

  return _set(Alloy.CFG.settings[key].type, key, val);
}

function get(key, def) {

  if (!Alloy.CFG.settings[key]) {
    throw new Error('Unknown setting: ' + key);
  }

  return _get(Alloy.CFG.settings[key].type, key, (arguments.length === 2) ? val : Alloy.CFG.settings[key].def);
}

function setString(key, val) {
  return _set('string', key, val);
}

function getString(key, def) {
  return _get('string', key, def);
}

function _set(type, key, val) {
  var fn = 'set' + type[0].toUpperCase() + type.substr(1);

  Ti.App.Properties[fn](key, val);

  _cache[key] = val;

  $.trigger('change:' + key, val);
}

function _get(type, key, def) {

  if (!_.has(_cache, key)) {
    var fn = 'get' + type[0].toUpperCase() + type.substr(1);

    if (Ti.App.Properties.hasProperty(key)) {
      return (_cache[key] = Ti.App.Properties[fn](key));

    } else {
      return def;
    }
  }

  return _cache[key];
}
