'use strict'
var fieldIsDisappear = require('./is-disappear')

module.exports = function (field) { // careful with as_is
  var fieldtypes = this.fieldtypes

  if (field.appear === 'label') {
    return fieldtypes.custom
  }

  var appear_as_value = field.depend_visible === 'single' || field.appear === 'single'
  // todo: readme field.appear, field.depend_visible (deprecate)
  if (fieldIsDisappear.call(this, field) && (appear_as_value || !field.appear)) {
    return appear_as_value ? fieldtypes.custom : fieldtypes.hidden
  }
}
