'use strict';

var Riemann = require('./lib/riemann');

exports.init = function(startupTime, config, events) {
  var riemannInstance = new Riemann(startupTime, config, events);
  return true;
};
