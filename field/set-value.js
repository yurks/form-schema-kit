'use strict'
var sanitizeFieldValue = require('./sanitize-value')
var fieldGetOptions = require('./get-options')
var fieldIsDepended = require('./is-depended')
var each = require('wsk-utils/var/object/each')
var isObject = require('wsk-utils/var/is/object')
var trim = require('wsk-utils/var/string/trim')

module.exports = function (field, value, as_is) { // careful with as_is
  var fieldtypes = this.fieldtypes
  var rootValues = this.values
  var rootDependencyState = this.dependency_state

  rootValues[field.name] = []
  rootDependencyState[field.name] = []

  var values = sanitizeFieldValue(value)

  if (as_is || field.field_type === fieldtypes.custom) {
    rootValues[field.name] = values
    rootDependencyState[field.name] = values
    return
  }
  var options = fieldGetOptions.call(this, field)
  var is_hidden = false

  // noinspection FallThroughInSwitchStatementJS
  switch (field.field_type) {
    case fieldtypes.hidden:
      is_hidden = true
      // depended hidden field could have multiple values
      if (fieldIsDepended.call(this, field) || (options && options.length)) {
        each(values, function (i, val) {
          each(options, function (j, opt) {
            // eslint-disable-next-line eqeqeq
            if ((isObject(opt) ? opt.value : opt) == val) { // jshint ignore:line
              rootValues[field.name].push((isObject(opt) ? opt.id : opt))
              rootDependencyState[field.name].push(opt)
              return false
            }
          })
        })
        break
      } // jshint ignore:line
    // eslint-disable-next-line
    case fieldtypes.text:
    case fieldtypes.textarea:
      var val = sanitizeFieldValue(values[0]) + ''
      if (!is_hidden) {
        val = trim(val)
      }
      if (val) {
        rootValues[field.name].push(val)
        rootDependencyState[field.name].push(val)
      }
      break

      // pay attention: for this field types fieldValueSet should receive options id, not actual values.
    case fieldtypes.select:
    case fieldtypes.checkbox:
    case fieldtypes.radio:
      if (options && options.length) {
        var founded = false
        each(values, function (i, value) {
          founded = false
          each(options, function (j, option) {
            // eslint-disable-next-line eqeqeq
            if (value == option.id) { // jshint ignore:line
              founded = j
              return false // break;
            }
          })
          if (founded !== false) {
            rootValues[field.name].push(options[founded].id)
            rootDependencyState[field.name].push(options[founded])
            // store only one value for Select and Radio
            if (field.field_type !== fieldtypes.checkbox) {
              return false // break;
            }
          }
        })

        // if value still not set for single-option Select and Radio, set it.
        if (field.field_type !== fieldtypes.checkbox && founded === false && options.length === 1 && options[0]) {
          if (field.appear !== 'always') {
            rootValues[field.name][0] = options[0].id
            rootDependencyState[field.name].push(options[0])
          }
        }
      }
      break
  }
}
