'use strict'
var sanitizeFieldValue = require('./sanitize-value')
var fieldIsDepended = require('./is-depended')
var fieldGetOptions = require('./get-options')
var isArray = require('wsk-utils/var/is/object/array')
var each = require('wsk-utils/var/object/each')

module.exports = function (field) {
  var output

  if (!(field.preselect && fieldIsDepended.call(this, field))) {
    output = sanitizeFieldValue(field.stored_values)
  } else {
    output = []
  }

  if (field.preselect) {
    var options = fieldGetOptions.call(this, field)
    if (isArray(options) && options.length > 0) {
      var single_value = field.field_type !== this.fieldtypes.checkbox
      options = options.slice(0)
      var mode = field.preselect.toString().split(':')
      var preselect_mode = mode.shift()
      var preselect_value = mode.join(':')

      switch (preselect_mode) {
        case 'all':
          each(options, function (i, option) {
            output.push(option.id)
          })
          break
        case 'first':
          output.push(options.shift().id)
          break
        case 'last':
          output.push(options.pop().id)
          break
        case 'eq':
          each(preselect_value.split(','), function (i, pos) {
            if (!isNaN(pos)) {
              var _option = options.slice(~~pos).shift()
              if (_option) {
                output.push(_option.id)
              }
            }
          })
          break

          // TODO: manual
        case 'value':
        case 'label':
        case 'id':
          if (preselect_value || (field.preselect_pattern && field.preselect_pattern instanceof RegExp)) {
            each(options, function (i, option) {
              if (preselect_value ? preselect_value === option[preselect_mode] : field.preselect_pattern.test(option[preselect_mode])) {
                output.push(option.id)
                if (single_value) {
                  return false
                }
              }
            })
          }
          break
      }
      if (single_value && output.length) {
        output = [output.shift()]
      }
    }
  }
  return output
}
