module.exports = {
  current: {
    dbInfo: {
      host: 'localhost',
      user: 'root',
      password: 'akdntm007!',
      database: 'infrared_sensor'
    },
  },
  GetterSmRainSensor_1: {
    current: {
      hasDev: false, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        deviceName: 'NewSmRainSensor', // Device Name
        port: 'COM10', // Port를 직접 지정하고자 할때 사용
        baudRate: 9600, // 장치 BaudRate
        transportCode: '', // Serial이 연결되고 특정 Code를 전송해야 할 경우
        identificationCode: '41494e20253d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부},
      },
      calculateOption: {
        averageCount: 3, // 평균 합산 변수
        cycleCount: 10,
        criticalObj: {
          smRain: 1 // 적외선 감지 센서
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
    }
  },
  GetterSmRainSensor_2: {
    current: {
      hasDev: false, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        deviceName: 'OldSmRainSensor', // Device Name
        port: 'COM9', // Port를 직접 지정하고자 할때 사용
        baudRate: 9600, // 장치 BaudRate
        transportCode: '', // Serial이 연결되고 특정 Code를 전송해야 할 경우
        identificationCode: '41494e20253d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부},
      },
      calculateOption: {
        averageCount: 3, // 평균 합산 변수
        cycleCount: 10,
        criticalObj: {
          smRain: 1 // 적외선 감지 센서
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
    }
  }
}