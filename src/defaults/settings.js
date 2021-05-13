'use strict'

var extend = require('wsk-utils/var/object/extend')
var isString = require('wsk-utils/var/is/string')
var isObject = require('wsk-utils/var/is/object')
var isUndefined = require('wsk-utils/var/is/undefined')

var _setSetting = function (_root, settings, value, type) {
  _root[type] = _root[type] || {}
  if (isObject(settings)) {
    extend(_root[type], settings)
  } else if (isString(settings)) {
    _root[type][settings] = value
  }
}

var _getSetting = function (_root, setting, type, object_extend) {
  if (_root[type]) {
    var value = _root[type][setting]
    if (!isUndefined(value)) {
      if (object_extend) {
        if (isObject(value) && !value.length) {
          object_extend.push(value)
          return // continue
        } else {
          object_extend.length = 0
        }
      }
      return _root.$pluginGet ? _root.$pluginGet(setting, value) : value
    }
  }
}

var allowed_settings = ['base', 'address', 'dom', 'general', 'def', 'app']

module.exports = function settings (app_defaults) {
  var get = function (setting, what) {
    var object_extend
    var output
    if (isString(what)) {
      return _root[what] && _root[what][setting]
    }
    if (what === true) {
      object_extend = []
    }
    for (var i = 0; i < allowed_settings.length; i += 1) {
      output = _getSetting(_root, setting, allowed_settings[i], object_extend)
      if (!isUndefined(output)) {
        break
      }
    }

    switch (object_extend ? object_extend.length : 0) {
      case 0:
        return output
      case 1:
        return object_extend[0]
      default:
        object_extend.push({}, true)
        object_extend.reverse()
        return extend.apply(this, object_extend)
    }
  }

  var base = {}
  var address = {}
  var _root = {
    base: base,
    address: address,
    app: app_defaults || {},

    get: function (setting, what) {
      return get(setting, what)
    },

    set: function (settings, value) {
      return _setSetting(_root, settings, value, 'general')
    },

    setDefault: function (settings, value) {
      return _setSetting(_root, settings, value, 'def')
    }
  }

  return _root
}
