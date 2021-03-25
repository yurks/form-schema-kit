'use strict'
var extend = require('wsk-utils/var/object/extend')

module.exports = function (field, field_name, rootFields, $instance) {
  if (!rootFields[field_name] && field.create && field.field_type) {
    if (!(field.create.call && !field.create.call($instance))) {
      rootFields[field_name] = extend({}, field, { name: field_name })
      delete rootFields[field_name].create
    }
  }
}
