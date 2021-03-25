'use strict'
var fieldGetOptions = require('./get-options')
var fieldIsDepended = require('./is-depended')

module.exports = function (field) {
  var options
  var fieldtypes = this.fieldtypes
  switch (field.field_type) {
    case fieldtypes.select:
    case fieldtypes.checkbox:
    case fieldtypes.radio:
      options = fieldGetOptions.call(this, field)
      if (!(options && options.length) || (fieldtypes.checkbox !== field.field_type && options && options.length === 1)) {
        return true
      }
      break
    case fieldtypes.text:
    case fieldtypes.textarea:
      if (fieldIsDepended.call(this, field)) {
        options = fieldGetOptions.call(this, field)
        if (!(options && options.length)) {
          return true
        }
      }
      break
  }
  return false
}
