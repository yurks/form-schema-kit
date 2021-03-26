'use strict'
var fieldGetOptions = require('./get-options')

module.exports = function (field) {
  var fieldtypes = this.fieldtypes

  var required = !!field.required
  if (required) {
    switch (field.field_type) {
      case fieldtypes.select:
      case fieldtypes.checkbox:
      case fieldtypes.radio:
        var options = fieldGetOptions.call(this, field)
        if (!(options && options.length > 0)) {
          return false
        }
        break
      case fieldtypes.hidden:
        return false
    }
  }

  return required
}
