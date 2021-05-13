'use strict'
var fieldIsDisappear = require('./is-disappear')
var fieldIsRequired = require('./is-required')
var each = require('wsk-utils/var/object/each')
var isFunction = require('wsk-utils/var/is/function')
var isBoolean = require('wsk-utils/var/is/boolean')
var isUndefined = require('wsk-utils/var/is/undefined')
var isString = require('wsk-utils/var/is/string')
var isArray = require('wsk-utils/var/is/object/array')

var _prepareRegexp = function (pattern) {
  if (isString(pattern)) {
    // don't forget to sanitize backslashes (\\) in string pattern
    try {
      // eslint-disable-next-line no-new-func
      pattern = (new Function('return ' + pattern))() // jshint ignore:line
    } catch (e) {}
  }
  if (pattern instanceof RegExp) {
    return pattern
  }
}

var _formFieldSubValidator = function (rules, value, valueLabel) {
  var _this = this
  var out
  each(rules, function (i, p) {
    if (p.fields) {
      each(p.fields, function (field_name, patterns) {
        patterns = isArray(patterns) ? patterns : [patterns]
        each(patterns, function (i, p2) {
          var pattern = _prepareRegexp(p2.pattern || p2)
          if (pattern) {
            if (p2.pattern) {
              p2.pattern = pattern
            } else {
              patterns[i] = pattern
            }

            p2.$live = true

            each(p.mode === 'label' ? valueLabel : value, function (j, v) {
              out = out || {}
              out[field_name] = out[field_name] || []
              if (p.pattern.test(v)) {
                out[field_name].push(p2)
              }
            })
          }
        })
      })
    }
  })

  each(out, function (field_name, _rules) {
    var fld = _this.fields[field_name]
    if (fld) {
      fld.validation = fld.validation || []
      fld.validation = fld.validation.filter(function (rule) {
        return !rule.$live
      }).concat(_rules)
      formFieldValidator.call(_this, fld, true)
    }
  })
}

var formFieldValidator = function (field, value, valueLabel) {
  var fieldtypes = this.fieldtypes

  var validated = true
  var validation_error = ''
  var validation_type = ''
  var skip = field.validation === false
  var val = ''

  if (!skip && fieldIsDisappear.call(this, field)) {
    skip = true
  }

  if (!skip && isFunction(field.validation)) {
    var result = field.validation.call(this, field, value)
    if (result && !isUndefined(result.validated)) {
      validated = !!result.validated
      validation_error = result.message
      skip = true
    } else {
      validated = result !== false
      // skip next validations only if true or false returned.
      // otherwise, will operates like default
      skip = isBoolean(result)
    }
  }

  // validate if field value is not empty
  if (!skip && fieldIsRequired.call(this, field)) {
    if (!(value && value.length !== 0)) {
      validated = false
      validation_error = field.validation_message || 'Field is required.'
      validation_type = 'required'
      skip = true
    }
  }

  if (!skip && field.minlength) {
    val = (value && value[0] && value[0].length || 0)
    if (val < field.minlength) {
      validated = false
      validation_error = field.validation_message || '' + (field.minlength - val) + ' characters remain to reach a minimum length.'
      validation_type = 'minlength'
      skip = true
    }
  }

  if (field.field_type !== fieldtypes.hidden && field.validation) {
    var patterns = isString(field.validation) || field.validation instanceof RegExp || field.validation.pattern ? [field.validation] : field.validation.length ? field.validation : []

    each(patterns, function (i, p) {
      var pattern = _prepareRegexp(p.pattern || p)
      if (pattern) {
        if (p.pattern) {
          p.pattern = pattern
        } else {
          patterns[i] = pattern
        }
      }
    })

    _formFieldSubValidator.call(this, patterns, value, valueLabel)

    if (!skip) {
      each(patterns, function (i, p) {
        var pattern = _prepareRegexp(p.pattern || p)

        if (pattern && !p.fields) {
          each(value, function (j, v) {
            validated = pattern.test(v)
            validation_error = p.message
            if (!validated) {
              if (p.type) {
                validation_type = p.type
              }
              return false // break;
            }
          })
        }

        if (!validated) {
          return false // break;
        }
      })
    }
  }

  return { validated: validated, validation_error: validation_error, validation_type: validation_type }
}

module.exports = formFieldValidator
