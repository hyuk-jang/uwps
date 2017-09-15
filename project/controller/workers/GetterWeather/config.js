module.exports = {
  current: {},
  GetterWeatherCast: {
    current: {
      hasDev: true, // true면 저장된 File 읽어옴. false면 기상청 접속
      locationInfo: {
        x: 44, // Device Name
        y: 55, // Port를 직접 지정하고자 할때 사용
      },
      dbInfo: {
        host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
        user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
        password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
        database: process.env.SALTERN_DB ? process.env.SALTERN_DB : "saltpond_controller"
      }
    }
  },
  GetterWeatherDevice: {
    current: {},
    GetterSmRainSensor: {
      current: {
        hasDev: false, // 장비에 접속하지 않음(장비가 없을 경우)
        deviceInfo: {
          deviceName: 'infraredRainSensor', // Device Name
          port: 'COM9', // Port를 직접 지정하고자 할때 사용
          baudRate: 9600, // 장치 BaudRate
          transportCode: '', // Serial이 연결되고 특정 Code를 전송해야 할 경우
          identificationCode: '41494e20253d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부},
        },
        calculateOption: {
          averageCount: 3, // 평균 합산 변수
          cycleCount: 10,
          criticalObj: {
            smRain: 10 // 적외선 감지 센서
          }
        },
        rainAlarmBoundaryList: [{
          status: '화창',
          keyword: 'sun',
          predictAmount: 0,
          boundary: 10,
          msg: ''
        }, {
          status: '이슬비',
          keyword: 'drizzle',
          predictAmount: 0,
          boundary: 30,
          msg: '이슬비가 내립니다.\r\n염전을 점검하세요.'
        }, {
          status: '약한비',
          keyword: 'lightRain',
          predictAmount: 0,
          boundary: 50,
          msg: '약한비(0.5~2.5mm)가 내립니다.\r\n염전을 점검하세요.'
        }, {
          status: '보통비',
          keyword: 'middleRain',
          predictAmount: 0,
          boundary: 70,
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
    GetterVantagePro2: {
      current: {
        hasDev: false, // 장비에 접속하지 않음(장비가 없을 경우)
        deviceInfo: {
          deviceName: 'vantagePro2', // Device Name
          port: 'COM3', // Port를 직접 지정하고자 할때 사용
          baudRate: 19200, // 장치 BaudRate
          transportCode: '\n', // Serial이 연결되고 특정 Code를 전송해야 할 경우
          identificationCode: '0a0d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부
        },
        calculateOption: {
          averageCount: 3, // 평균 합산 변수
          cycleCount: 10,
          criticalObj: {
            rainfall: 0, // 강우량 임계치 없음
            temperature: 0.2, // 섭씨 0.2도 초과 임계치
            humidity: 1, // 습도 1프로 초과 임계치
            windDirection: 0, // 풍향 임계치 없음
            windSpeed: 0.2, // 풍속 0.2 mm/s 초과 임계치
            min10AvgWindSpeed: 0.2,
            solarRadiation: 1, // 일사량 0.2 w/m2 초과 임계치  
          }
        }
      }
    },
  },
}