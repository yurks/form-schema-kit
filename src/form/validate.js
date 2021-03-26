'use strict'
var formTraverse = require('./traverse')

module.exports = function (page_id) {
  var invalid_fields_count = 0

  formTraverse.call(this, function (i, field) {
    if (!field.$valid) {
      field.$valid_once = true
      invalid_fields_count += 1
    }
  }, page_id == null ? -Infinity : -page_id)

  return invalid_fields_count === 0
}
