'use strict';

var riemann = require('riemann');

/*
 * Config object should contain:
 * host, port, transport, flush, packet
 */
function Riemann(startupTime, config, emitter) {
  this.config = config.riemann;

  // Create client for events
  var riemannClient = riemann.createClient({
    host: this.config.host,
    port: this.config.port
  });

  if (this.config.flush) {
    emitter.on('flush', function(timestamp, metrics) {
      console.log(metrics);
    });
  }

  if (this.config.packet) {
    emitter.on('packet', function(packet, rinfo) {
      console.log(packet.toString('utf8'));
    });
  }

  emitter.on('status', function(callback) {
    console.log('status...');
  });
};

module.exports = Riemann;
