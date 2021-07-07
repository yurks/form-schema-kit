
var noop = require('wsk-utils/var/noop');

var window = require('wsk-utils/dom/window');
var document = require('wsk-utils/dom/document');
var isFunction = require('wsk-utils/var/is/function');
var createScript = require('wsk-utils/dom/element/create/script');
var domGet = require('wsk-utils/dom/element/get');
var domMake = require('wsk-utils/dom/element/make');
var domAppend = require('wsk-utils/dom/element/append');

var _root = {
  name: 'leadId',

  id: null,
  element: null,

  lck: null,

  _cb: null,

  attach: function($instance, options) {
    var leadid_campaign = options && options.leadid_campaign;
    var leadid_token = options && options.leadid_token;
    var leadid_reset = options && options.leadid_reset;

    var token = leadid_token || '',
      lead_ck = leadid_campaign || '';

    if (lead_ck) {
      _root.lck = lead_ck;
    } else {
      return;
    }

    var addTracker = $instance && $instance.queue || noop;
    addTracker(_root);

    if (_root._cb) {
      addTracker(_root, true);
      return;
    }

    window.aceLeadIdCallback = _root._cb = function(id) {
      _root.id = id;
      addTracker(_root, true);
    };

    _root.element = domGet('#leadid_token');
    if (!_root.element) {
      _root.element = domMake('<input id="leadid_token" name="universal_leadid" value="' + token + '" type="hidden" style="display:none!important;">');
      domAppend(_root.element, document.body);
    }

    var query_string = '?snippet_version=2';
    query_string += '&callback=aceLeadIdCallback';
    if (!token && leadid_reset === true) {
      query_string += '&f=reset';
    }
    createScript({id: 'LeadiDscript_campaign', src:'//create.lidstatic.com/campaign/' + _root.lck + '.js' + query_string}, true);
  },

  initFields: function(context) {
    var LeadiD = window.LeadiD;
    if (LeadiD && LeadiD.formcapture && isFunction(LeadiD.formcapture.init)) {
      try {
        LeadiD.formcapture.init(context);
      } catch(e) {}
    }
  },

  getToken: function() {
    if (!_root.id) {
      if (_root.element) {
        _root.id = _root.element.value;
      }
    }
    return _root.id;
  },

  extend: function(data) {
    var value = _root.getToken();
    if (value) {
      data.push({name: 'leadid_token', value: value});
    }
  }
};

module.exports = _root;
