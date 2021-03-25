'use strict'
var fieldUpdateHelper = require('./update-helper')
var fieldUpdateDepended = require('./update-depended')
var each = require('wsk-utils/var/object/each')

var fieldUpdateAllDepended = function (field) {
  var _this = this
  each(_this.dependency[field.name], function (i, field) {
    var field_depended = _this.fields[field]
    if (field_depended) {
      fieldUpdateDepended.call(_this, field_depended)
      fieldUpdateAllDepended.call(_this, field_depended)
    }
  })
}

module.exports = function (field, values) {
  fieldUpdateHelper.call(this, field, values)
  fieldUpdateAllDepended.call(this, field)
}
