'use strict'

var formFieldProcess = require('./process')

module.exports = function (field, rootFields, rootPages, rootDependency) {
  var field_name = field.name

  var depends_on = field.depends_on
  if (depends_on) {
    // depends_on cannot point to itself and depends_on should point to existing field
    if (depends_on !== field_name && rootFields[depends_on]) {
      if (!rootDependency[depends_on]) {
        rootDependency[depends_on] = []
      }
      rootDependency[depends_on].push(field_name)
    } else {
      // depends_on field is absent - try to make simple field with all possible values
      if (field.children && field.children.all) {
        field.options = field.children.all
        field.children = undefined
        field.depends_on = undefined
      } else {
        formFieldProcess('delete', rootFields, rootPages, field)
      }
    }
  }
}
