'use strict'
var fieldTypes = require('./field-types')
var fieldMaskTokens = require('./field-mask-tokens')

module.exports = function (o) {
  o.fieldtypes = fieldTypes()
  o.fieldMaskTokens = fieldMaskTokens()
  return o
}
