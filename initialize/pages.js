'use strict'
var isString = require('wsk-utils/var/is/string')
var isObject = require('wsk-utils/var/is/object')
var isArray = require('wsk-utils/var/is/object/array')
var each = require('wsk-utils/var/object/each')
var extend = require('wsk-utils/var/object/extend')
var random = require('wsk-utils/var/string/random')

module.exports = function (pages_array, rootFields, rootPages, pages_auto_generate, pages_auto_generate_label, pages_auto_generate_position) {
  // base init pages
  var fields_temp = extend({}, rootFields)

  // pages_auto_generate, pages_auto_generate_label and pages_auto_generate_position is deprecated
  var auto_page_enabled = pages_auto_generate !== false
  var auto_page_settings = { label: pages_auto_generate_label || '', classname: 'auto' }
  var auto_page_position = pages_auto_generate_position === 'first' ? 0 : -1

  var pagesInit = function (pages_array, auto_page) {
    var pages = []

    var _pagesExecuteBy = function (i, by, field) {
      if (isString(by)) {
        if (by.charAt(0) === '!') {
          by = by.slice(1)
          return !(field[by] === false)
        } else {
          var index = by.indexOf('=')
          if (index > 0) {
            return !(by.slice(index + 1) === field[by.slice(0, index)])
          }
        }
        if (by in field) {
          return !(field[by] === true)
        }
      }
    }

    var _pagesArrayProcess = function (i, page, pages, parentPages) {
      var pageFields = page.fields
      var pageFilter = page.filter
      var pageFieldBy = page.by || undefined // todo: manual
      if (pageFieldBy) {
        pageFieldBy = isArray(pageFieldBy) ? pageFieldBy : [pageFieldBy]
      }
      if (!isObject(pageFields) && !pageFieldBy) {
        if (pageFields === 'auto') {
          extend(auto_page_settings, page)
          if (parentPages) {
            auto_page_position = parentPages.concat(pages.length)
          } else {
            auto_page_position = pages.length
          }
        } else {
          auto_page_enabled = pageFields !== 'auto-skip'
        }
        return // continue;
      }

      var fields_in_page = []
      each(pageFieldBy ? fields_temp : pageFields, function (j, _field) {
        var field_name = isString(_field) ? _field : _field.name
        var field = fields_temp[field_name]
        if (field) {
          if (pageFieldBy && (each(pageFieldBy, _pagesExecuteBy, field) !== false)) {
            return // continue;
          }

          if ((auto_page && !auto_page_enabled) || (pageFilter && isString(pageFilter) && !rootFields[field_name][pageFilter])) {
            delete rootFields[field_name]
          } else {
            fields_in_page.push(rootFields[field_name])
            if (page.repeatable) {
              delete rootFields[field_name]
            }
          }
          delete fields_temp[field_name]
        }
      })
      if (isArray(page.sub)) {
        each(page.sub, _pagesArrayProcess, (page.sub = []), parentPages ? parentPages.concat(pages.length) : [pages.length])
      }
      if (fields_in_page.length) {
        pages.push(extend({}, page, { hash: random(), fields: page.repeatable ? [] : fields_in_page, _fieldsOrig: !page.repeatable ? null : fields_in_page }))
      }
    }

    each(pages_array, _pagesArrayProcess, pages)

    if (!auto_page) {
      auto_page_settings.fields = fields_temp
      var p = pagesInit([auto_page_settings], true).pop(); var pagesStore = pages
      if (p) {
        if (isArray(auto_page_position)) {
          while (auto_page_position.length > 1) {
            pagesStore = pages[auto_page_position.shift()]
            pagesStore = pagesStore && pagesStore.sub
          }
        }
        if (pagesStore) {
          pagesStore.splice(auto_page_position < 0 ? pages.length : auto_page_position, 0, p)
        }
      }
    }
    return pages
  }
  var pages = pagesInit(pages_array || [])
  rootPages.push.apply(rootPages, pages)
}
