'use strict'
var fieldUpdateHelper = require('./update-helper')
var fieldGetDefaultValue = require('./get-value-default')
var fieldIsDepended = require('./is-depended')
var each = require('wsk-utils/var/object/each')
var isString = require('wsk-utils/var/is/string')
var isArray = require('wsk-utils/var/is/object/array')

var _get_option_by_case_insensitive_key = function (o, k) {
  var _k
  for (_k in o) {
    if (Object.prototype.hasOwnProperty.call(o, _k)) {
      if (_k.toLowerCase() === k.toLowerCase()) {
        return o[_k]
      }
    }
  }
}

var _cb_each_rootDependencyState_options_sub = function (i, o, id) {
  var check_value = isString(o) ? o : (o && o.id)
  if (check_value === id) {
    return false // break;
  }
}

var _cb_each_rootDependencyState_options = function (i, _o, field) {
  // add option into existing options if not present yet
  var check_value = isString(_o) ? _o : (_o && _o.id)
  if (check_value && each(field._opts, _cb_each_rootDependencyState_options_sub, check_value) !== false) {
    field._opts.push(_o)
  }
}

var _cb_each_rootDependencyState = function (i, value, field) {
  var _options

  if (field.children) {
    if (field.live && typeof value === 'string') {
      _options = _get_option_by_case_insensitive_key(field.children, value)
    } else {
      _options = field.children[value && value.id || value]
    }
  }

  if (isArray(field._opts)) { // field has a multiple values (Checkbox)
    each(_options, _cb_each_rootDependencyState_options, field)
  } else {
    if (_options) {
      if (isString(_options)) {
        field._opts = [_options]
      } else if (isArray(_options)) {
        field._opts = _options.slice(0)
      }
    }
  }
}

// init depended fields (reset/set values and options_depended)
module.exports = function (field) {
  var fieldtypes = this.fieldtypes
  var rootDependencyState = this.dependency_state

  if (!fieldIsDepended.call(this, field)) {
    return false
  }

  if (!rootDependencyState[field.depends_on] || !rootDependencyState[field.depends_on].length) {
    _cb_each_rootDependencyState(0, '', field)
  } else {
    each(rootDependencyState[field.depends_on], _cb_each_rootDependencyState, field)
  }

  var options = field.options_depended = field._opts
  delete field._opts

  // don't we want to use instance.values here? No, we don't.
  // we will try to set depended field DEFAULT value from real stored_values.
  var value; var defaultValue = fieldGetDefaultValue.call(this, field)
  if (options) {
    switch (field.field_type) {
      case fieldtypes.hidden:
      case fieldtypes.text:
      case fieldtypes.textarea:
        value = []
        each(options, function (i, opt) {
          if (isString(opt)) {
            value.push(opt)
          } else {
            // in case opt is {id: null, label: null, value: null}, task#61231: visibility dependency for text fields
            if (opt.id === null) {
              value = value.concat(defaultValue)
            } else {
              value.push(opt.value)
            }
          }
        })
        break
    }
  }

  fieldUpdateHelper.call(this, field, value || defaultValue)
}
