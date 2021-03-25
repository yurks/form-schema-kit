'use strict'
var each = require('wsk-utils/var/object/each')
var isNumber = require('wsk-utils/var/is/number')
var isArray = require('wsk-utils/var/is/object/array')

var _fieldsTraverseInPage = function (i, page, cb, data, withSkipped) {
  if (withSkipped !== false || !page.$skipped) {
    each(page.fields, cb, data)
    if (isArray(page.sub)) {
      each(page.sub, _fieldsTraverseInPage, cb, data, withSkipped)
    }
  }
}

var _fieldsTraverseNotSkipped = function (i, page, cb, data) {
  if (page.$skipped !== true) {
    _fieldsTraverseInPage(i, page, cb, data, false)
  }
}

module.exports = function (cb, page_id, data) {
  var with_skipped = true
  if (page_id === -Infinity || page_id === Infinity || page_id == null) {
    with_skipped = page_id >= 0
    page_id = null
  } else if (isNumber(page_id)) {
    if (1 / page_id < 0) {
      with_skipped = false
      page_id = Math.abs(page_id)
    }
    page_id = ~~page_id
  }

  if (page_id !== null) {
    if (this.pages[page_id]) {
      if (with_skipped) {
        _fieldsTraverseInPage(page_id, this.pages[page_id], cb, data)
      } else {
        _fieldsTraverseNotSkipped(page_id, this.pages[page_id], cb, data)
      }
    }
  } else if (with_skipped) {
    each(this.fields, cb, data)
  } else {
    each(this.pages, _fieldsTraverseNotSkipped, cb, data)
  }
}
