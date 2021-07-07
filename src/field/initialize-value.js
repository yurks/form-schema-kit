'use strict'
var fieldUpdateDepended = require('./update-depended')
var fieldGetDefaultValues = require('./get-value-default')
var fieldGetPrimary = require('./get-primary')
var fieldGetValue = require('./get-value')
var fieldUpdateHelper = require('./update-helper')
var each = require('wsk-utils/var/object/each')
var extend = require('wsk-utils/var/object/extend')

var fieldInitializeValues = function (field, initial) {
  if (initial !== false) {
    initial = initial || {}
  }

  if (initial) {
    if (initial[field.name]) {
      return false
    }
    initial[field.name] = true
  }

  var primary = fieldGetPrimary.call(this, field)
  if (primary) {
    if (initial) {
      fieldInitializeValues.call(this, primary, initial)
    }
    // generating values for text fields and depended_options for others
    fieldUpdateDepended.call(this, field)
  } else {
    fieldUpdateHelper.call(this, field, fieldGetDefaultValues.call(this, field))
  }

  var values = fieldGetValue.call(this, field, 'id');

  each(field.$options, function(i, opt) {
    if (values.indexOf(opt.id) >= 0) {
      field.$options[i] = extend({}, opt, { predefined: true })
    }
  })
  
  if (values[0]) {
    if (field.predefined == null) {
      field.predefined = true
    }
  } else {
    field.predefined = false
  }
}

module.exports = fieldInitializeValues
