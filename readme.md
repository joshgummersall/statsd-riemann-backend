[![Build Status](https://travis-ci.org/joshgummersall/statsd-riemann-backend.svg)](https://travis-ci.org/joshgummersall/statsd-riemann-backend)

statsd-riemann-backend
======================

A backend plugin for [Statsd](https://github.com/etsy/statsd/) to forward
events to [Riemann.io](http://riemann.io/).

## Overview

Suppose you wanted to use StatsD as your main event stream aggregator due
to its simple interface and its ease of integration with existing services.
Perfect! What if you wanted to include some alerts around the events you
were sending to StatsD? Enter Riemann.io! Riemann.io is similar to StatsD
in that it is an event stream aggregator, however Riemann.io includes
support for many stream operations, event aggregation, and advanced
alerting features. Please
[read more about Riemann.io](http://riemann.io/concepts.html) if you want
to learn more about what it can do.

This backend forwards all event packets sent to StatsD. Riemann.io includes
lots of support for aggregating events, including rolling up and grouping
events, computing metrics (like latency profiles) and is generally more
useful when dealing with all metrics events rather than the rolled up metrics
that StatsD also publishes. What that means is that this backend only responds
to the `packet` event emitter and not the `flush` event emitter. Support for
the `flush` event emitter may be added in the future.

## Installation

In your StatsD installation folder, run:

```bash
$ npm install statsd-riemann-backend
```

Include the backend in your `config.js` file (see example configuration file below
for complete configuration example).

```json
{
  "backends": ["statsd-riemann-backend"]
}
```

If `npm install` fails with the following error message:

```
Package protobuf was not found in the pkg-config search path.
Perhaps you should add the directory containing `protobuf.pc'
to the PKG_CONFIG_PATH environment variable
No package 'protobuf' found
```

You must follow the [riemann installation instructions](https://www.npmjs.com/package/riemann#prerequisites).

## Configuration

There are several configuration options that are available for this backend.

#### `host`, `port`, and `transport`

Override the `host` and `port` properties if your Riemann.io instance
is not running on the same machine as your StatsD instance. Valid `transport`
values include "tcp" and "udp". "udp" is the default method of transport.

#### `tags`

Anything you would like included as a tag on every event forwarded to Riemann.io

#### `parseNamespace`

StatsD encourages that events are named in the "Graphite way"
(read more about that [here](http://graphite.wikidot.com/getting-your-data-into-graphite))
Events in Riemann.io have several properties that are useful when performing
event stream operations. Two of those properties are `service` and
`description`. If you set `parseNamespace` to `true` the backend will use the
first portion of the event name as the event `service` and will use the
remaining pieces of the event name as the event `description`.

For example: `apiServer.findUser.response.statusCode:200|c` would be parsed such
that the event `service` would be "apiServer" and the `description` would be
"findUser.response.statusCode" (the 200 count would be the event `metric`).

#### `tagWithEventParts`

Riemann.io events support arbitrary free text tags. If you set the
`tagWithEventParts` property to `true`, the event name will be split into its
separate parts and each part will be a separate tag on the event.

For example: `apiServer.findUser.response.statusCode:200|c` would be parsed such
that the event tags would be `["apiServer", "findUser", "response", "statusCode"]`.

## Example Configuration

```json
{
  "backends": ["statsd-riemann-backend"],

  "riemann": {
    "host": "localhost",
    "port": 5555,
    "transport": "tcp",
    "tags": ["statsd"],
    "parseNamespace": true,
    "tagWithEventParts": true
  }
}
```

## Contributing

Feel free to [leave issues here](https://github.com/joshgummersall/statsd-riemann-backend/issues)
or fork the project and submit pull requests. If there is a feature you would like added
just submit an issue describing the feature and I will do my best.
