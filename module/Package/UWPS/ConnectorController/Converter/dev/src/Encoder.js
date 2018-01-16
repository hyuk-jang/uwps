const bcjh = require('base-class-jh');
const {Converter} = bcjh;
/** Class Ecoding 개발용 */
class EncodingMsgSocket extends Converter {
  constructor() {
    super();
  }

  /**
   * 단일 명령 생성
   * @param {string} cmd 단일 명령 생성
   * @return {buffer} 명령
   */
  makeSingleMsg(cmd){
    return bcjh.classModule.makeRequestMsgForTransfer(cmd);
  }

  /**
   * TODO 접속반으로 보낼 모든 명령 생성. 테스트베드 6kw 접속반은 1개의 명령만 존재
   * @return {buffer[]} 
   */
  makeMsg(){
    let returnValue = bcjh.classModule.makeRequestMsgForTransfer('pv');
    return [returnValue];
  }
}

module.exports = EncodingMsgSocket;