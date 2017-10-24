module.exports = {
  current: {
    cntSavedInfo: {
      connector_seq: 5,
      target_category: 'modbus_tcp',
      target_id: 'CNT1',
      target_name: '접속반 1',
      dialing: 1, // id,
      connect_type: 'socket', // `socket` or `serial`
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
}