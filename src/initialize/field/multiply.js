'use strict'
var extend = require('wsk-utils/var/object/extend')

module.exports = function (field, rootFields, fields_object) {
  var field_name
  var newField
  var multiply_suffix
  var j = 0
  for (; j < field.multiply || 0; j += 1) {
    multiply_suffix = '{' + j + '}' + '[' + j + ']'
    field_name = field.name + multiply_suffix
    newField = extend({}, field, {
      required: j ? false : field.required,
      stored_values: j ? null : field.stored_values
    }, fields_object[field_name], {
      name: field_name,
      $orig: field.name,
      $index: j,
      multiply: field.multiply
    })
    delete newField.x

    if ((rootFields[field.depends_on] || {}).multiply) {
      newField.depends_on += multiply_suffix
    }
    rootFields[field_name] = newField

    if (!j) {
      rootFields[field.name].x = true
    }
  }
}
