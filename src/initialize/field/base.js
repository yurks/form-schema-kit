'use strict'
var extend = require('wsk-utils/var/object/extend')

module.exports = function (question, rootFields, fields_object, fieldTypes) {
  var field_name = question.name
  var fieldDef = fields_object[field_name]
  var field = rootFields[field_name] = question

  // allow override field_type for any except hidden
  var field_type = field.field_type !== fieldTypes.hidden && fieldDef && fieldDef.field_type ? fieldDef.field_type : field.field_type

  if (fieldDef && !fieldDef.create) {
    rootFields[field_name] = extend(true, {}, field, fieldDef, { name: field_name, field_type: field_type })
  }
}
