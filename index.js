'use strict'
var defaults = require('./src/defaults')
var initialize = require('./src/initialize')
var initializeFields = require('./src/field')

var formValidate = require('./src/form/validate')
var formData = require('./src/form/get-data')

function Fsk (fields) {
  var $instance = defaults({})
  var rootFields = $instance.fields = {}
  var rootPages = $instance.pages = []
  var rootDependency = $instance.dependency = {}
  $instance.dependency_state = {}
  $instance.values = {} // todo: remove

  $instance.validate = formValidate.bind($instance)
  $instance.getData = formData.bind($instance)

  if (fields) {
    initialize($instance, fields, rootFields, rootPages, rootDependency)
    initializeFields.call($instance)
  }
  return $instance
}

module.exports = defaults(Fsk)
