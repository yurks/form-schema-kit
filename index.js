'use strict'
var defaults = require('./defaults')
var initialize = require('./initialize')
var initializeFields = require('./field')

var formValidate = require('./form/validate')
var formData = require('./form/get-data')

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
