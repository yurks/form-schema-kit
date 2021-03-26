'use strict'
var isString = require('wsk-utils/var/is/string')
var isObject = require('wsk-utils/var/is/object')
var isArray = require('wsk-utils/var/is/object/array')
var each = require('wsk-utils/var/object/each')

module.exports = function (act, rootFields, rootPages, field, add_before_name) {
  var field_name = act === 'delete' && isString(field) ? field : isObject(field) ? field.name : null

  if (!field_name || !act || (act === 'add' ? rootFields[field_name] : !rootFields[field_name])) {
    return
  }

  var name_to_process = field_name

  if (act === 'add') {
    if (add_before_name) {
      name_to_process = add_before_name
    } else { // add to top of first page
      each(rootPages[0].fields, function (i, field) {
        name_to_process = field.name
        return false // break;
      })
    }
  }

  if (name_to_process) {
    var _processPageFields = function (j, page_field, page) {
      if (page_field.name === name_to_process) {
        if (act === 'delete') {
          delete rootFields[field_name]
          page.fields.splice(j, 1)
        } else {
          rootFields[field_name] = field
          page.fields.splice(j, act === 'add' ? 0 : 1, rootFields[field_name])
        }
        return false // break;
      }
    }

    var _processPage = function (i, page) {
      var done = each(page.fields, _processPageFields, page) === false
      if (!done && isArray(page.sub)) {
        done = each(page.sub, _processPage) === false
      }
      if (done) {
        return false // break;
      }
    }

    each(rootPages, _processPage)
  }
}
