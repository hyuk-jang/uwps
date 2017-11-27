module.exports = {
  current: {
    hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
    ivtDummyData: {
      dailyKwh: 4.5147,
      cpKwh: 111.3691
    },
    ivtSavedInfo: {
			inverter_seq: 1,
			target_id: 'IVT1',
			target_name: '인버터 1',
			target_type: 'single_ivt',
			target_category: 'dev',
			connect_type: 'socket',
			dialing: Buffer.from([0x30, 0x31]),
			ip: 'localhost',
			port: 'COM1',
			baud_rate: 9600,
			code: '11ae01ed-5f42-4063-858f-d500294dcf11',
			amount: 30,
			director_name: '홍길동 1',
			director_tel: '01011114444'
		}
  }
}