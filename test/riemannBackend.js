var config = { riemann: { host: {} } };
var riemann = require('../lib/riemann');
var should = require('should');

describe("riemann-backend", function(){

  var riemannBackend = new riemann({}, config, { on: function(){ } });

    describe("parsePacket", function() {
      it("should parse a single metric to an array of one element", function(){
        var parsedMetrics = riemannBackend.parsePacket("foo:1|c\n");
        parsedMetrics.should.eql(["foo:1|c"]);
      });

      it("should parse a two metrics to an array of two elements", function(){
        var parsedMetrics = riemannBackend.parsePacket("foo:1|c\nbar:2|c\n");
        parsedMetrics.should.eql(["foo:1|c", "bar:2|c"]);
      });
  });

  describe("getService", function(){
    it("should return the name without the metric and type", function(){
      var serviceName = riemannBackend.getService("foo:1|c\n");
      serviceName.should.eql("foo");
    });

    it("should return the namespace without the metric and type, when parseNamespace is true", function(){
      config.riemann.parseNamespace = true;
      var serviceName = riemannBackend.getService("ns.foo:1|c\n");
      config.riemann.parseNamespace = false;
      serviceName.should.eql("ns");
    });
  });

  describe("getDescription", function(){
    it("should return the name without the metric and type", function(){
      var serviceName = riemannBackend.getDescription("ns.foo:1|c\n");
      serviceName.should.eql("ns.foo");
    });

    it("should return the second level without the namespace, metric or type, when parseNamespace is true", function(){
      config.riemann.parseNamespace = true;
      var serviceName = riemannBackend.getDescription("ns.foo.bar:1|c\n");
      config.riemann.parseNamespace = false;
      serviceName.should.eql("foo.bar");
    });
  });
});
