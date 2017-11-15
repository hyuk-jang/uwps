module.exports = {
  current: {
    hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
    ivtDummyData: {
      dailyKwh: 4.5147,
      cpKwh: 111.3691
    },
    ivtSavedInfo: {
			inverter_seq: 1,
			connector_seq: 1,
			target_id: 'IVT1',
			target_category: 's_hex',
			target_name: '인버터 1',
			target_type: 'single_ivt',
			dialing: '0x3031',
			connect_type: 'socket',
			ip: 'localhost',
			port: 'COM1',
			baud_rate: 9600,
			code: '11ae01ed-5f42-4063-858f-d500294dcf11',
			amount: 30,
			director_name: '홍길동 1',
			director_tel: '01011114444'
		},
    // ivtSavedInfo: {
    //   inverter_seq: 5,
    //   target_category: 'dev',
    //   target_id: 'IVT1',
    //   target_name: '인버터 1',
    //   target_type: 0, // 0: 단상, 1: 삼상
    //   dialing: Buffer.from('01', 'ascii'), // id,
    //   connect_type: 'socket', // `socket` or `serial`
    //   ip: 'localhost', // Socket 연결 시 사용
    //   port: 'COM1', // Port를 직접 지정하고자 할때 사용
    //   baud_rate: 9600, // 장치 BaudRate
    //   code: '장치 고유 id', 
    //   amount: 3, // 3Kw, 
    //   director_name: '홍길동', 
    //   director_tel: '01012345589'
    // }
  }
}