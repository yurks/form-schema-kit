'use strict';

var timer = require('wsk-utils/var/timer');
var each = require('wsk-utils/var/object/each');

module.exports = function() {

  var trackers = {};
  var trackers_ininializedCallback = null;

  var waitForInitialized = function(done) {
    if (done) {
      trackers_ininializedCallback = done;
    }
    if (!trackers_ininializedCallback) {
      return;
    }
    var total = 0, initialized = 0;
    each(trackers, function(i, tracker) {
      total+=1;
      if (tracker !== false) {
        initialized+=1;
      }
    });
    if (total === initialized) {
      trackers_ininializedCallback(trackers);
      trackers_ininializedCallback = null;
    }
  };

  var addToInitializationQueue = function(tracker, initialized) {
    trackers[tracker.name] = initialized ? tracker : false;
    waitForInitialized();
  };

  var _root = {
    wait: function(done) {
      waitForInitialized(function(trackers) {
        Object.assign(_root, trackers)
        if (done) {
          timer.set(function() {
            done(trackers)
          }, 1);
        }
      });
      return _root
    },
    queue: addToInitializationQueue,
    initFields: function(element) {
      each(trackers, function(i, tracker) {
        if (tracker.initFields) {
          tracker.initFields(element)
        }
      });
    },

    getData: function(element) {
      var data = [];
      each(trackers, function(i, tracker) {
        if (tracker.extend) {
          tracker.extend(data)
        }
      });
      return data
    }
  }

  return _root

};
