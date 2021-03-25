'use strict'
var isString = require('wsk-utils/var/is/string')
var isNumber = require('wsk-utils/var/is/number')
var isArray = require('wsk-utils/var/is/object/array')

module.exports = function (value) {
  return isArray(value) ? value.slice(0) : isString(value) && value ? [value] : isNumber(value) && isFinite(value) ? [value.toString()] : []
}
