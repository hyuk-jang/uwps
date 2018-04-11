


module.exports = {
  current: {
    dbInfo: {
      // host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      // user: 'upsas',
      // password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      // database: 'upsas'
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'uwps'
      // database: 'upsas'
    },
    controllerInfo: {
      target_id: 'wds_01',
      target_category: 'weatherDevice',
      data_table_name: 'weather_device_data',
      trouble_table_name: null
    }
  },
  smInfrared:{
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
        }
      },
      calculateOption: {
        averageCount: 3, // 평균 합산 변수
        maxCycleCount: 10,
        criticalInfo: {
          smInfrared: 10 // 적외선 감지 센서
        }
      },
      rainAlarmBoundaryList: [{
        status: '화창',
        keyword: 'sun',
        predictAmount: 0,
        boundary: 100,
        msg: ''
      }, {
        status: '이슬비',
        keyword: 'drizzle',
        predictAmount: 0,
        boundary: 200,
        msg: '이슬비가 내립니다.\r\n염전을 점검하세요.'
      }, {
        status: '약한비',
        keyword: 'lightRain',
        predictAmount: 0,
        boundary: 300,
        msg: '약한비(0.5~2.5mm)가 내립니다.\r\n염전을 점검하세요.'
      }, {
        status: '보통비',
        keyword: 'middleRain',
        predictAmount: 0,
        boundary: 400,
        msg: '보통(2.5~7.6mm)가 내립니다.\r\n염전을 점검하세요.'
      }, {
        status: '폭우',
        keyword: 'heavyRain',
        predictAmount: 0,
        boundary: 10000,
        msg: '폭우가 내립니다.\r\n염전을 점검하세요.'
      }]
    },
  },
  vantagepro2: {
    current: {
      hasDev: true, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        target_id: 'VantagePro_1',
        target_name: 'Davis Vantage Pro2',
        hasOneAndOne: true,
        target_category: 'weathercast',
        target_protocol: 'vantagepro2',
        connect_type: 'serial',
        port: 'COM8', // Port를 직접 지정하고자 할때 사용
        baud_rate: 19200,
        // parser: {
        //   type: 'byteLengthParser',
        //   option: 55
        // }
      }
    }
  }

};