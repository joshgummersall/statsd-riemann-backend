"use strict";

var Riemann = require('../lib/riemann');
var EventEmitter = require('events').EventEmitter;
var should = require('should');

// Returns a fresh backend for each invocation
var newBackend = function () {
  return new Riemann(null, {
    riemann: { host: '', port: '' }
  }, new EventEmitter());
};

describe("riemannBackend", function () {
  describe("parsePacket", function () {
    it("should parse a single metric to an array of one element", function () {
      var parsedMetrics = newBackend().parsePacket("foo:1|c\n");
      parsedMetrics.should.eql(["foo:1|c"]);
    });

    it("should parse a two metrics to an array of two elements", function () {
      var parsedMetrics = newBackend().parsePacket("foo:1|c\nbar:2|c\n");
      parsedMetrics.should.eql(["foo:1|c", "bar:2|c"]);
    });
  });

  describe("getService", function () {
    it("should return the name without the metric and type", function () {
      var serviceName = newBackend().getService("foo:1|c\n");
      serviceName.should.eql("foo");
    });

    describe("when parseNamespace is true", function () {
      it("should return the namespace without the metric and type", function () {
        var backend = newBackend();
        backend.config.parseNamespace = true;
        backend.getService("ns.foo:1|c\n").should.eql("ns");
      });
    });
  });

  describe("getDescription", function () {
    it("should return the name without the metric and type", function () {
      var serviceName = newBackend().getDescription("ns.foo:1|c\n");
      serviceName.should.eql("ns.foo");
    });

    describe("when parseNamespace is true", function () {
      it("should return the second level without the namespace", function () {
        var backend = newBackend();
        backend.config.parseNamespace = true;
        backend.getDescription("ns.foo.bar:1|c\n").should.eql("foo.bar");
      });
    });
  });
});
