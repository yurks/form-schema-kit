'use strict'

module.exports = function () {
  return {
    9: { pattern: /[0-9]/ },
    0: { pattern: /[*0-9]/ },
    a: { pattern: /[A-Za-z]/ },
    '*': { pattern: /[A-Za-z0-9]/ }
  }
}
