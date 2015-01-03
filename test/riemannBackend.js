var test = require("unit.js");
var config = { riemann: { host: {} } };
var riemann = new require('../lib/riemann');

describe("riemann-backend", function(){	    
	var riemannBackend = new riemann({}, config, { on: function(){ } });
    
    it("should parse a single metric to an array of one element", function(){
    	var parsedMetrics = riemannBackend.parsePacket("foo:1|c\n");
    	test.array(parsedMetrics).is(["foo:1|c"]);
    });

    it("should parse a two metrics to an array of two elements", function(){
    	var parsedMetrics = riemannBackend.parsePacket("foo:1|c\nbar:2|c\n");
    	test.array(parsedMetrics).is(["foo:1|c", "bar:2|c"]);
    });
}) 