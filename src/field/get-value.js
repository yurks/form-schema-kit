'use strict'
var each = require('wsk-utils/var/object/each')
var isObject = require('wsk-utils/var/is/object')

module.exports = function (field, mode) {
  var output = []
  var fieldtypes = this.fieldtypes
  var rootDependencyState = this.dependency_state

  switch (mode || '') {
    case 'label':
    case 'id':
    case 'fields':
      break
    default:
      mode = 'value'
  }

  each(rootDependencyState[field.name], function (i, v) {
    switch (field.field_type) {
      case fieldtypes.select:
      case fieldtypes.checkbox:
      case fieldtypes.radio:
        output.push(v[mode])
        break

      default:
        if (mode !== 'label' && mode !== 'fields') {
          mode = 'value'
        }
        if (isObject(v)) {
          output.push(v[mode])
        } else {
          output.push(v)
        }
    }
  })

  return output
}
