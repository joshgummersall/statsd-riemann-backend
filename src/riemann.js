import ld from 'lodash';
import riemann from 'riemann';

export default class Riemann {
  /*
   * Config object should contain:
   * host, port
   * Optional:
   * transport, flush, packet
   */
  constructor(startupTime, config, emitter) {
    this.config = config;
    this.setupClient();

    // If reconnect interval is specified in config and we are instructed to use
    // a TCP connection, set up the reconnect interval
    if (this.config.transport && this.config.transport === 'tcp' &&
        this.config.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.reconnectIfNeeded();
      }, this.config.reconnectInterval);
    }

    // Finally, bind to emitter to start handling packets
    emitter.on('packet', (...args) => {
      this.onPacket(...args);
    });
  }

  setupClient() {
    this.client = riemann.createClient({
      host: this.config.host,
      port: this.config.port
    });

    // Bind some Riemann handlers
    this.client.once('connect', (...args) => {
      this.onConnect(...args);
    });
    this.client.on('error', (...args) => {
      this.onError(...args);
    });
    this.client.on('data', (...args) => {
      this.onAck(...args);
    });
  }

  reconnectIfNeeded() {
    // Note: we only register this function as an interval _if_ the
    // configuration says to use TCP, hence no extra check here.
    if (!this.client.tcp || !this.client.tcp.socket ||
        this.client.tcp.socket.readyState === 'closed') {
      if (this.config.debug) {
        console.log('Riemann socket seems to be closed, reconnecting...');
      }
      this.setupClient();
    }
  }

  onConnect() {
    if (this.config.debug) {
      console.log('Connected to Riemann client!');
    }
  }

  onError(err) {
    if (this.config.debug) {
      console.error(err);
    } else if (!this.reconnectInterval) {
      throw err;
    }
  }

  onAck(ack) {
    if (this.config.debug) {
      console.log('Received ACK...');
    }
  }

  onPacket(packet, rinfo) {
    this.parsePacket(packet).each((...args) => {
      this.handlePacketEvent(...args);
    });
  }

  parsePacket(packet) {
    return packet.toString().trim().split(/\n/g);
  }

  // If `parseNamespace` is set to `true`, `service` is inferred from
  // first level `eventString`. Otherwise the entire `eventString` is used.
  getService(eventString) {
    if (this.config.parseNamespace) {
      return eventString.split('.')[0];
    }

    return eventString.split(':')[0];
  }

  // If `parseNamespace` is set to `true`, `description` is inferred from
  // second level `eventString`. Otherwise the entire `eventString` is used.
  getDescription(eventString) {
    if (this.config.parseNamespace) {
      const eventStringParts = eventString.split('.');
      eventStringParts.shift();
      eventString = eventStringParts.join('.');
      return eventString.split(':')[0];
    }

    return eventString.split(':')[0];
  }

  getMetric(eventString) {
    return eventString.split(':')[1].split('|')[0];
  }

  getTags(eventString) {
    const tags = [];

    // Include any config tags
    if (this.config.tags && this.config.tags.length > 0) {
      tags.push(this.config.tags);
    }

    if (this.config.tagWithEventParts) {
      tags.push(eventString.split(':')[0].split('.'));
    }

    return ld.flatten(tags);
  }

  handlePacketEvent(eventString) {
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
  }

  send(eventData) {
    const eventToSend = this.client.Event(eventData);

    try {
      // Send using proper transport
      if (this.config.transport && this.config.transport === 'tcp') {
        this.client.send(eventToSend, this.client.tcp);
      } else {
        this.client.send(eventToSend);
      }
    } catch (err) {
      this.onError(err);
    }
  }
}
