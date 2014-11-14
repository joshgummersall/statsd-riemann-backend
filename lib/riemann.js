'use strict';

var _ = require('underscore');
var riemann = require('riemann');

/*
 * Config object should contain:
 * host, port, transport, flush, packet
 */
function Riemann(startupTime, config, emitter) {
  this.config = config.riemann;
  this.client = riemann.createClient({
    host: this.config.host,
    port: this.config.port
  });

  // Bind some Riemann handlers
  this.client.once('connect', _.bind(this.onConnect, this));
  this.client.once('error', _.bind(this.onError, this));
  this.client.on('data', _.bind(this.onAck, this));

  // Finally, bind to StatsD eventemitter
  emitter.on('packet', _.bind(this.onPacket, this));
};

Riemann.prototype.onConnect = function() {
  if (this.config.debug) {
    console.log('Connected to Riemann client!');
  }
};

Riemann.prototype.onError = function(err) {
  if (this.config.debug) {
    console.error(err);
  } else {
    throw(err);
  }
};

Riemann.prototype.onAck = function(ack) {
  if (this.config.debug) {
    console.log('Received ACK...');
  }
};

Riemann.prototype.onPacket = function(packet, rinfo) {
  var events = this.parsePacket(packet);
  _.each(events, this.handlePacketEvent, this);
};

Riemann.prototype.parsePacket = function(packet) {
  return packet.toString().split('\n');
};

// If `parseNamespace` is set to `true`, `service` is inferred from
// first level `eventString`. Otherwise the entire `eventString` is used.
Riemann.prototype.getService = function(eventString) {
  if (this.config.parseNamespace) {
    return eventString.split('.')[0];
  } else {
    return eventString;
  }
};

// If `parseNamespace` is set to `true`, `description` is inferred from
// second level `eventString`. Otherwise the entire `eventString` is used.
Riemann.prototype.getDescription = function(eventString) {
  if (this.config.parseNamespace) {
    var eventStringParts = eventString.split('.');
    eventStringParts.shift();
    eventString = eventStringParts.join('.');
    return eventString.split(':')[0];
  } else {
    return eventString;
  }
};

Riemann.prototype.getMetric = function(eventString) {
  var eventMetric = eventString.split(':')[1];
  return eventMetric.split('|')[0];
};

Riemann.prototype.getTags = function(eventString) {
  var tags = [];

  // Include any config tags
  if (this.config.tags && this.config.tags.length > 0) {
    tags.push(this.config.tags);
  }

  if (this.config.tagWithEventParts) {
    tags.push(eventString.split(':')[0].split('.'));
  }

  return _.flatten(tags);
};

Riemann.prototype.handlePacketEvent = function(eventString) {
  // See here for valid event properties:
  // http://aphyr.github.io/riemann/concepts.html
  this.send({
    service: this.getService(eventString),
    state: 'ok',
    description: this.getDescription(eventString),
    tags: this.getTags(eventString),
    metric: this.getMetric(eventString),
    ttl: this.config.ttl
  });
};

Riemann.prototype.send = function(eventData) {
  var eventToSend = this.client.Event(eventData);

  // Send using proper transport
  if (this.config.transport && this.config.transport === 'tcp') {
    this.client.send(eventToSend, this.client.tcp);
  } else {
    this.client.send(eventToSend);
  }
};

module.exports = Riemann;
