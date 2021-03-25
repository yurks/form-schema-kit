'use strict'
var each = require('wsk-utils/var/object/each')
var initializeFieldValue = require('./initialize-value')
var fieldUpdate = require('./update')

var initializeField = function (fieldName, field, _this) {
  initializeFieldValue.call(_this, field)
  field.update = function (values) {
    return fieldUpdate.call(_this, field, values)
  }
}

module.exports = function () {
  each(this.fields, initializeField, this)
}
