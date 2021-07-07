'use strict'
var trackInitialize = require('./src/track')
var trackLeadId = require('./src/track/leadid')

module.exports = function(options, done) {
  var track = trackInitialize()
  trackLeadId.attach(track, options)
  return track.wait(done)
}
