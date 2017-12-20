var expect;
var assert;

if(typeof require === "function") {
	var chai = require("chai");
	expect = chai.expect;
	assert = chai.assert;
	chai.should();
} else {
	expect = chai.expect;
	chai.should();
}