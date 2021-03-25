'use strict'

var isString = require('wsk-utils/var/is/string')
var random = require('wsk-utils/var/string/random')

var FIELD_TCPA = 'leadid_tcpa_disclosure'
var FIELD_SELECT_PLACEHOLDER = '-please select-'
var FILED_TEXT_MAXLENGTH = 255

module.exports = function (field, fieldTypes, formCampaignForTcpa) {
  if (field.name === FIELD_TCPA) {
    field.id = field.name
    if (formCampaignForTcpa) {
      field.id += '_' + formCampaignForTcpa
    }
    field.id += '_' + random()
  } else {
    field.id = 'fsk_' + random()
  }

  // set default placeholder for select fields
  if (field.field_type === fieldTypes.select && !isString(field.placeholder)) {
    field.placeholder = FIELD_SELECT_PLACEHOLDER
  }

  if (field.maxlength) {
    field.maxlength = ~~field.maxlength
  }
  if (field.minlength) {
    field.minlength = ~~field.minlength
  }

  if (field.field_type === fieldTypes.text && !field.maxlength) {
    field.maxlength = FILED_TEXT_MAXLENGTH
  }

  if (field.field_type === fieldTypes.checkbox) {
    // single checkbox
    if (!field.depends_on && (!field.options || !field.options.length)) {
      field.options = [
        { label: field.label, value: '1', id: '1' }
      ]
      field.label = ''
    }
    if (field.controls === false) {
      field.preselect = 'all'
    }
  }
}
