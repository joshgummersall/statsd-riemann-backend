### statsd-riemann-backend

A backend plugin for Statsd to publish events to Riemann.io.

### Configuration

Example:

```json
{
  "backends": ["./node_modules/statsd-riemann-backend"],
  "riemann": {
    "host": "localhost",
    "port": 5555,
    "transport": "tcp",
    "parseNamespace": true,
    "tagWithEventParts": true
  }
}
```
