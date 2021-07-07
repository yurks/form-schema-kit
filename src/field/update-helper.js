'use strict'
var fieldSetValue = require('./set-value')
var fieldValidate = require('./validate')
var fieldGetOptions = require('./get-options')
var fieldDynamicType = require('./get-dynamic-type')
var fieldGetValue = require('./get-value')

module.exports = function (field, values, as_is) {
  fieldSetValue.call(this, field, values, as_is)

  var options = fieldGetOptions.call(this, field)
  if (options !== field.$options) {
    field.$options = options
  }

  var type = (fieldDynamicType.call(this, field) || ((field.field_type === this.fieldtypes.text) && field.data_type || field.field_type)).toLowerCase();
  if (type !== field.$type) {
    field.$type = type
  }

  fieldValidate.call(this, field)

  var value = fieldGetValue.call(this, field, 'label').join(field.multiline ? '<br>' : ', ');
  if (value !== field.$value) {
    field.$value = value
  }
}
