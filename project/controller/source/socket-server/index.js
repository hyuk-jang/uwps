module.exports = function (controllerInfo, mapObj) {
    // BU.CLI("2 Depth Index : socket-server")
    var cmdServer = require("./cmd.js")(controllerInfo, mapObj);
    // BU.CLI(push)
    return {
        cmdServer: cmdServer
    }
}