'use strict'
var fieldGetValue = require('./get-value')
var fieldValidator = require('./validator')
var isBoolean = require('wsk-utils/var/is/boolean')
var isUndefined = require('wsk-utils/var/is/undefined')
var isString = require('wsk-utils/var/is/string')

module.exports = function (field, validator) {
  var values
  if (isUndefined(validator)) {
    values = fieldGetValue.call(this, field)
    validator = fieldValidator.call(this, field, values, fieldGetValue.call(this, field, 'label'))
  } else {
    validator = {
      validated: isBoolean(validator) ? validator !== false : false,
      validation_error: isString(validator) ? validator : '',
      validation_type: 'manual'
    }
  }
  if (!validator.validated) {
    field.$error = validator.validation_error || field.validation_message || 'Field validation error.'
    field.$validationType = validator.validation_type || 'general'
    field.$valid = false
  } else {
    if (isBoolean(field.$valid)) {
      field.$valid_once = true
    }
    if (values && values.length) {
      field.$valid_once = true
    } else {
      field.$valid_once = null
    }
    field.$error = ''
    field.$validationType = ''
    field.$valid = true
  }

  return validator.validated
}
