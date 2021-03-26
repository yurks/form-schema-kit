'use strict'
var each = require('wsk-utils/var/object/each')
var isUndefined = require('wsk-utils/var/is/undefined')
var isObject = require('wsk-utils/var/is/object')
var isArray = require('wsk-utils/var/is/object/array')
var fieldValueSanitize = require('../../field/sanitize-value')

var findFieldOptionId = function (options, user_value, is_children) {
  var founded
  if (user_value && options) {
    user_value = user_value.toLowerCase()
    if (is_children) {
      each(options, function (i, option) {
        founded = findFieldOptionId(option, user_value)
        if (founded) {
          return false // break;
        }
      })
    } else {
      each(options, function (i, option) {
        if (option.id.toLowerCase() === user_value || option.label.toLowerCase() === user_value) {
          founded = options[i].id
          return false // break;
        }
      })
    }
  }
  // noinspection JSUnusedAssignment
  return founded
}

module.exports = function (field, fieldTypes, $instance) {
  var fields_values = $instance._fields_values
  var fields_values_override = $instance._fields_values_override
  var fields_values_user = $instance._fields_values_user
  var fields_preselect_user = $instance._fields_preselect_user

  // field.stored_values will be replaced by values settings, if it was DEFINED
  // so, null, '', [] and so on will replace existing stored_values
  var stored_values = fields_values[field.name]
  var user_values = fields_values_user && (fields_values_user[field.name] || (field.$orig && fields_values_user[field.$orig])) || undefined
  var user_preselects = fields_preselect_user && (fields_preselect_user[field.name] || (field.$orig && fields_preselect_user[field.$orig])) || undefined

  if (field.multiply) {
    user_values = fields_values_user && fields_values_user[field.$orig]
    user_preselects = fields_preselect_user && fields_preselect_user[field.$orig]
  }
  if (isArray(user_values)) {
    user_values = user_values[field.$index || 0]
  }
  if (isArray(user_preselects)) {
    user_preselects = user_preselects[field.$index || 0]
  }

  if (field && !isUndefined(stored_values)) {
    field.stored_values = isObject(stored_values) ? stored_values : [stored_values]
  }

  if (fields_values_user && !isUndefined(user_values)) {
    // user values will override stored_values
    if (
    // if instance is top form (default functionality)
      !$instance.parent ||
            fields_values_override ||
            // or if instance is child form and this field doesn't contain any stored_values (added functionality for task#16247)
            !fieldValueSanitize(field.stored_values).shift()
    ) {
      if (field.field_type === fieldTypes.select || field.field_type === fieldTypes.checkbox || field.field_type === fieldTypes.radio) {
        field.stored_values = findFieldOptionId(field.children || field.options, user_values, field.depends_on)
      } else {
        field.stored_values = user_values
      }
      field.predefined = 'user'
    }
  } else if (field.stored_values && field.field_type === fieldTypes.select && field.stored_values.length > 1) {
    field.predefined = false
  }
  if (user_preselects && !isUndefined(user_preselects)) {
    if (
      !$instance.parent ||
            fields_values_override ||
            !field.preselect
    ) {
      if (field.field_type === fieldTypes.select || field.field_type === fieldTypes.checkbox || field.field_type === fieldTypes.radio) {
        field.preselect = user_preselects
        field.predefined = 'user'
      }
    }
  }
}
