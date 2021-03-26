'use strict'

var noop = require('wsk-utils/var/noop')
var each = require('wsk-utils/var/object/each')
var extend = require('wsk-utils/var/object/extend')
var isArray = require('wsk-utils/var/is/object/array')
var isFunction = require('wsk-utils/var/is/function')
var isUndefined = require('wsk-utils/var/is/undefined')

var initFieldValueDefault = require('./field/value-default')
var initFieldBase = require('./field/base')
var initFieldCreate = require('./field/create')
var initFieldMultiply = require('./field/multiply')
var initFieldLive = require('./field/live')
var initFieldDependCombine = require('./field/depend-combine')
var initFieldDependency = require('./field/dependency')
var initFieldFinal = require('./field/final')
var pagesInit = require('./pages')

// initialize fields and pages
var _getArray = function (o, prop) {
  return o && o[prop] && o[prop].length && o[prop].slice ? o[prop].slice(0) : false // slice - to avoid modifying raw fields
}

module.exports = function ($instance, formRaw, rootFields, rootPages, rootDependency, fieldTypes) {
  fieldTypes = fieldTypes || $instance.fieldtypes
  var call = $instance.call || noop
  var setting = call('settings.get') || noop
  var settingSetDefault = call('settings.setDefault')

  var questions = isArray(formRaw) ? formRaw.slice() : (_getArray(formRaw.form, 'questions') || [])
  if (!questions.length) {
    if (!setting('allow_empty')) {
      return
    }
    questions = [{ name: 'fsk%allowed%empty', field_type: fieldTypes.hidden, local: true }]
  }
  var fieldsSettings = setting('fields') || {}

  // apply fields_hotfix for fields if present
  var fieldsHotfix = setting('fields_hotfix')
  if (!isUndefined(fieldsHotfix) && isFunction(fieldsHotfix.apply)) {
    fieldsHotfix.apply(questions)
  }

  // base init fields
  each(questions, function (i, question) {
    initFieldBase(question, rootFields, fieldsSettings, fieldTypes)
  })

  var zipSettings
  each(rootFields, function (i, field) {
    initFieldMultiply(field, rootFields, fieldsSettings)
    // only one zip instance per form
    if (!zipSettings) {
      zipSettings = fieldsSettings[field.name] && fieldsSettings[field.name].zip
      if (!zipSettings && zipSettings !== false) {
        zipSettings = rootFields[field.name].zip
      }
      if (zipSettings) {
        settingSetDefault('zip', extend({ zip: field.name }, zipSettings))
      }
    }
  })
  each(rootFields, function (i, field) {
    if (field.x) {
      delete rootFields[field.name]
    }
  })

  $instance._fields_values = setting('values') || {}
  $instance._fields_values_override = setting('values_override') // TODO: manual
  $instance._fields_values_user = setting('values_user') || null
  $instance._fields_preselect_user = setting('preselect') || null // TODO: manual
  // if we have user values (from url) and this instance is child form
  if (($instance._fields_values_user || $instance._fields_preselect_user) && $instance.parent && !$instance._fields_values_override) {
    // then we want to set user values for result-forms only if parent results instance is top and it's not followed by session (called with new clean public key)
    if ($instance.parent.parent || $instance.parent.session.followed) {
      $instance._fields_values_user = null
      $instance._fields_preselect_user = null
    }
  }

  each(rootFields, function (i, field) {
    initFieldValueDefault(field, fieldTypes, $instance)
  })

  // create fields from fieldsSettings with create: true property
  each(fieldsSettings, function (field_name, field) {
    initFieldCreate(field, field_name, rootFields, $instance)
  })

  var fields_live_update = setting('fields_live_update') // TODO: manual
  each(rootFields, function (i, field) {
    initFieldLive(field, fields_live_update, fieldTypes, $instance)
  })

  pagesInit(setting('pages') || _getArray(formRaw, 'pages') || _getArray(formRaw.form, 'pages'), rootFields, rootPages, setting('pages_auto_generate'), setting('pages_auto_generate_label'), setting('pages_auto_generate_position'))

  each(rootFields, function (i, field) {
    initFieldDependCombine(field, rootFields, rootPages, fieldTypes)
  })

  each(rootFields, function (i, field) {
    initFieldDependency(field, rootFields, rootPages, rootDependency)
  })

  each(rootFields, function (i, field) {
    initFieldFinal(field, fieldTypes, formRaw.campaign)
  })
}
