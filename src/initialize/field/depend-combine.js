'use strict'

var each = require('wsk-utils/var/object/each')
var formFieldProcess = require('./process')
var random = require('wsk-utils/var/string/random')
var isFunction = require('wsk-utils/var/is/function')

module.exports = function (field, rootFields, rootPages, fieldTypes) {
  // combine depended fields if needed (field.depend_combine: true)
  if (field.depends_on && field.children) {
    var field_primary = rootFields[field.depends_on]
    var field_secondary = field

    if (!field_primary || !field_secondary) {
      return // continue;
    }
    if (!field_primary.depend_combine || !field_primary.options || !field_primary.options.length) {
      return // continue;
    }

    if (field_primary.depend_combine === true && field_secondary.field_type === fieldTypes.checkbox) {
      var options = field_secondary.options = []
      var optionsFilter = field_primary.depend_combine_filter
      each(field_primary.options, function (a, value_main) {
        var opts = []
        each(field_secondary.children[value_main.id], function (b, value_children) {
          if (isFunction(optionsFilter) && optionsFilter(value_children) === false) {
            return
          }
          value_children.id = value_main.id + ':' +value_children.id
          opts.push(value_children)
        })
        if (opts.length > 0) {
          options.push({ label: value_main.label, id: 'fsk_' + random() })
          options.push.apply(options, opts)
        }
      })
      delete field_secondary.children;
      delete field_secondary.depends_on;
      formFieldProcess('delete', rootFields, rootPages, field_primary)
      if (field_secondary.options.length === 0) {
        formFieldProcess('delete', rootFields, rootPages, field_secondary)
      }
      return
    }

    var field_fake = {
      label: field_secondary.label,
      name: field_primary.name + '2' + field_secondary.name,
      field_type: fieldTypes.select,
      placeholder: field_secondary.placeholder,
      required: field_primary.required || field_secondary.required,
      local: true,
      options: []
    }

    var children1 = {}
    var children2 = {}
    var pv = field_primary.stored_values && field_primary.stored_values.toString()
    var sv = field_secondary.stored_values && field_secondary.stored_values.toString()

    each(field_primary.options, function (a, value_main) {
      field_fake.options.push({ label: value_main.label })

      each(field_secondary.children[value_main.id], function (b, value_children) {
        var id = value_main.id + ':' + value_children.id
        if (pv && sv && value_main.id === pv && value_children.id === sv) {
          field_fake.stored_values = [id]
        }
        field_fake.options.push({ label: value_children.label, value: id, id: id })
        children1[id] = [
          { label: value_main.label, value: value_main.value, id: value_main.id }
        ]
        children2[id] = [
          { label: value_children.label, value: value_children.value, id: value_children.id }
        ]
      })
    })
    formFieldProcess('replace', rootFields, rootPages, { name: field_primary.name, label: field_primary.label, field_type: fieldTypes.hidden, depends_on: field_fake.name, children: children1 })
    formFieldProcess('replace', rootFields, rootPages, { name: field_secondary.name, label: field_secondary.label, field_type: fieldTypes.hidden, depends_on: field_fake.name, children: children2 })
    formFieldProcess('add', rootFields, rootPages, field_fake, field_primary.name)
  }
}
