'use strict'
var fieldSetValue = require('./set-value')
var fieldValidate = require('./validate')
var fieldGetOptions = require('./get-options')
var fieldDynamicType = require('./get-dynamic-type')

module.exports = function (field, values, as_is) {
  fieldSetValue.call(this, field, values, as_is)

  var options = fieldGetOptions.call(this, field)
  if (options) {
    field.$options = options
  }
  field.$type = (fieldDynamicType.call(this, field) || ((field.field_type === this.fieldtypes.text) && field.data_type || field.field_type)).toLowerCase()

  fieldValidate.call(this, field)
}
