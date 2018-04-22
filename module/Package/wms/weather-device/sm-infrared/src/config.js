
module.exports = {
  current: {
    hasDev: true, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'SI1',
      target_name: 'SmRainSensor',
      target_category: 'weather',
      hasOneAndOne: true,
      connect_type: 'serial',
      port: 'COM7', // Port를 직접 지정하고자 할때 사용
      baud_rate: 9600,
      parser: {
        type: 'byteLengthParser',
        option: 55
      },
      connect_info: {
        hasOneAndOne: true,
        type: 'socket',
        subType: 'parser',
        baudRate: 9600,
        port: 9000,
        addConfigInfo: {
          parser: 'byteLengthParser',
          option: 55
        }
      },
    },
    rainAlarmBoundaryList: [{
      rainLevel: 0,
      status: '화창',
      keyword: 'sun',
      predictAmount: 0,
      boundary: 100,
      msg: ''
    }, {
      rainLevel: 1,
      status: '이슬비',
      keyword: 'drizzle',
      predictAmount: 0,
      boundary: 200,
      msg: '이슬비가 내립니다.\r\n염전을 점검하세요.'
    }, {
      rainLevel: 2,
      status: '약한비',
      keyword: 'lightRain',
      predictAmount: 0,
      boundary: 300,
      msg: '약한비(0.5~2.5mm)가 내립니다.\r\n염전을 점검하세요.'
    }, {
      rainLevel: 3,
      status: '보통비',
      keyword: 'middleRain',
      predictAmount: 0,
      boundary: 400,
      msg: '보통(2.5~7.6mm)가 내립니다.\r\n염전을 점검하세요.'
    }, {
      rainLevel: 4,
      status: '폭우',
      keyword: 'heavyRain',
      predictAmount: 0,
      boundary: 10000,
      msg: '폭우가 내립니다.\r\n염전을 점검하세요.'
    }]
  },
};