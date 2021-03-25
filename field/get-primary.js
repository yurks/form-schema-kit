'use strict'

module.exports = function (field) {
  return field && field.depends_on && this.fields[field.depends_on]
}
