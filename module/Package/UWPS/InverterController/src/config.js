module.exports = {
  current: {
    hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
    ivtDummyData: {
      dailyKwh: 4.5147,
      cpKwh: 111.3691
    },
    'deviceSavedInfo': {
      'inverter_seq': 1,
      'target_id': 'IVT1',
      'target_name': '인버터 1',
      'target_type': 'single',
      'target_category': 's_hex',
      'connect_type': 'socket',
      'dialing': {
        'type': 'Buffer',
        'data': [48, 49]
      },
      'ip': 'localhost',
      'port': null,
      'baud_rate': 9600,
      'code': 'e279f4c4-cdc8-4423-97f8-d30a78c5aff1',
      'amount': 30,
      'director_name': '홍길동 1',
      'director_tel': '01011114444'
    }
  }
};