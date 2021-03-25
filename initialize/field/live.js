'use strict'

module.exports = function (field, fields_live_update, fieldTypes, $instance) {
  if (field.field_type === fieldTypes.text || field.field_type === fieldTypes.textarea) {
    // jshint eqnull:true
    if (fields_live_update && field.live_update == null) {
      field.live_update = fields_live_update
    }
  } else if ('live_update' in field) {
    delete field.live_update
  }
  if (field.live_update) {
    $instance.$live_update = true
  }
}
