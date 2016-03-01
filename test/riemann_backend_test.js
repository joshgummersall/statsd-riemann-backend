import Riemann from '../src/riemann';
import {EventEmitter} from 'events';
import should from 'should';

// Returns a fresh backend for each invocation
const newBackend = () => {
  return new Riemann(null, {
    riemann: { host: '', port: '' }
  }, new EventEmitter());
};

describe('riemann backend', () => {
  describe('parsePacket', () => {
    it('parses a single metric to an array of one element', () => {
      const parsedMetrics = newBackend().parsePacket('foo:1|c\n');
      parsedMetrics.should.eql(['foo:1|c']);
    });

    it('parses a two metrics to an array of two elements', () => {
      const parsedMetrics = newBackend().parsePacket('foo:1|c\nbar:2|c\n');
      parsedMetrics.should.eql(['foo:1|c', 'bar:2|c']);
    });
  });

  describe('getService', () => {
    it('returns the name without the metric and type', () => {
      const serviceName = newBackend().getService('foo:1|c\n');
      serviceName.should.eql('foo');
    });

    describe('when parseNamespace is true', () => {
      it('returns the namespace without the metric and type', () => {
        const backend = newBackend();
        backend.config.parseNamespace = true;
        backend.getService('ns.foo:1|c\n').should.eql('ns');
      });
    });
  });

  describe('getDescription', () => {
    it('returns the name without the metric and type', () => {
      const serviceName = newBackend().getDescription('ns.foo:1|c\n');
      serviceName.should.eql('ns.foo');
    });

    describe('when parseNamespace is true', () => {
      it('returns the second level without the namespace', () => {
        const backend = newBackend();
        backend.config.parseNamespace = true;
        backend.getDescription('ns.foo.bar:1|c\n').should.eql('foo.bar');
      });
    });
  });
});
