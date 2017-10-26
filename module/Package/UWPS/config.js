module.exports = {
  current: {
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'uwps'
    },
    inverterList: [],
    connectorList: []
  },
  InverterController: [{
    current: {
      hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
      controlOption: {
        reconnectInverterInterval: 1000 * 6, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
        sendMsgTimeOutSec: 1, // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
      },
      ivtSavedInfo: {
        inverter_seq: 5,
        target_category: 'dev',
        target_id: 'IVT1',
        target_name: '인버터 1',
        target_type: 0, // 0: 단상, 1: 삼상
        dialing: Buffer.from('01', 'ascii'), // id,
        connect_type: 'socket', // `socket` or `serial`
        ip: 'localhost', // Socket 연결 시 사용
        port: 'COM1', // Port를 직접 지정하고자 할때 사용
        baud_rate: 9600, // 장치 BaudRate
        code: '장치 고유 id', 
        amount: 3, // 3Kw, 
        director_name: '홍길동', 
        director_tel: '01012345589'
      }
    }
  }],
  ConnectorController: [{
    current: {
      cntSavedInfo: {
        connector_seq: 5,
        target_category: 'modbus_tcp',
        target_id: 'CNT1',
        target_name: '접속반 1',
        dialing: 1, // id,
        ip: 'localhost', // Socket 연결 시 사용
        port: 8888, // Port를 직접 지정하고자 할때 사용
        baud_rate: 9600, // 장치 BaudRate
        code: '장치 고유 id',
        addr_v: 0, // 3Kw, 
        addr_a: 4, // 전류값 시작 번지
        ch_number: 6,  // CH 수
        director_name: '홍길동',
        director_tel: '01012345589'
      }
    }
  }] 
}