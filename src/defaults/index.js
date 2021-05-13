'use strict'
var settings = require('./settings')
var fieldTypes = require('./field-types')
var fieldMaskTokens = require('./field-mask-tokens')

module.exports = function (o) {
  o.settings = settings()
  o.fieldtypes = fieldTypes()
  o.fieldMaskTokens = fieldMaskTokens()
  return o
}
