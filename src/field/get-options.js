'use strict'
var fieldIsDepended = require('./is-depended')

module.exports = function (field) {
  return fieldIsDepended.call(this, field) ? field.options_depended || [] : field.options
}
