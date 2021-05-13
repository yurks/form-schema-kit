'use strict'
var each = require('wsk-utils/var/object/each')
var formTraverse = require('./traverse')
var fieldGetValue = require('../field/get-value')

var arrayParser = function (_i, value, name, out) {
  out.push({ name: name, value: value })
}
var objectParser = function (_i, value, name, out) {
  out[name] = out[name] || []
  out[name].push(value)
}
var stringParser = function (_i, value, name, out) {
  out.push(encodeURIComponent(name) + '=' + encodeURIComponent(value))
}

module.exports = function (type, page_id, mode) {
  var _this = this
  var out, parser
  if (type === Object) {
    parser = objectParser
    out = {}
  } else if (type === String) {
    parser = stringParser
    out = []
  } else {
    parser = arrayParser
    out = []
  }
  formTraverse.call(this, function (i, field) {
    if (!field.local) {
      var values = fieldGetValue.call(_this, field, mode)
      if (values.length === 0 && _this.fieldtypes.checkbox !== field.field_type) {
        values = ['']
      }
      each(values, parser, field.name, out)
    }
  }, page_id == null ? -Infinity : -page_id)

  return type === String ? out.join('&') : out
}
