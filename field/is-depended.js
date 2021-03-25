'use strict'
var fieldGetPrimary = require('./get-primary')

module.exports = function (field) {
  return !!fieldGetPrimary.call(this, field)
}
