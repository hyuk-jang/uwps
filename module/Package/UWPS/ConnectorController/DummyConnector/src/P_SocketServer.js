const bcjh = require('base-class-jh');

/** Class Socket Server 객체 */
class P_SocketServer extends bcjh.socket.SocketServer {
  /**
   * Controller Method Chaning Pattern
   * @param {Control} controller Control 객체
   */
  constructor(controller) {
    super(controller.config.port);
    this.controller = controller;

    this._eventHandler();
  }

  /**
   * SocketServer에서 발생한  Event를 여기서 처리. 대상 --> 'data'
   * 요청받은 socket Client에게 Msg 전송
   * @return {boolean} 전송 성공 or 실패 (실패 처리는 아직 수정 필요)  TODO
   */
  _eventHandler() {
    super.on('data', (err, bufferData, connectedClient) => {
      // BU.CLI(err, bufferData)
      let returnValue = {
        cmd: 'none',
        isError: 0,
        contents: ''
      };
      
      let cmd = '';
      try {
        let resolveBuffer = bcjh.classModule.resolveResponseMsgForTransfer(bufferData);
        // BU.CLI(resolveBuffer)
        cmd = resolveBuffer.toString();
      } catch (ex) {
        // BU.CLI(ex);
        returnValue.isError = '1';
        returnValue.contents = ex;
        return connectedClient.write(bcjh.classModule.makeRequestMsgForTransfer(returnValue));
      }
      // BU.CLI('cmd', cmd);
      // CMD에 따라
      if (cmd === 'pv') {
        let gridList = [];
        let ch_number = this.controller.config.ch_number;
        // ch 숫자에 맞춰서 TEST 데이터 생성
        for (let cnt = 1; cnt <= ch_number; cnt++) {
          gridList.push({
            amp: 15.3,
            vol: 223.3,
            ch: cnt
          });
        }
        returnValue.cmd = cmd;
        returnValue.contents = gridList;
      } else {
        // BU.CLI('여기')
        returnValue = {
          cmd: 'undefinedCMD',
          isError: '1',
          contents: '알수없는 명령입니다.'
        };
      }
      BU.CLI(returnValue);
      let result = connectedClient.write(bcjh.classModule.makeRequestMsgForTransfer(returnValue));
      BU.CLI(result);
      return result;
    });
  }
}
module.exports = P_SocketServer;