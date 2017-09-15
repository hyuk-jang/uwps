module.exports = function(controllerInfo, mapObj, app){
    // 소켓 서버 구동
    // BU.CLI("1 Depth Index")
    var socketServerForApp = require("./socket-server")(controllerInfo, mapObj);
    

    return {
        socketServer: socketServerForApp
    }
}