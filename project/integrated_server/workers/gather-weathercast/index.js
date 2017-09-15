// event-emitter.js
var eventEmitter = require("./event-emitter");
var gather = require("./gather")(eventEmitter);

module.exports = {
    emitter:eventEmitter,
    start: gather.start
}