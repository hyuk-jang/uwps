module.exports = {
  // 현재 컨트롤러 설정
  global: {
    // 염전 장치 Serial 사용여부(0: 소켓만, 1: 혼합, 2: 시리얼 만)
    isUsedSerial: "0",
    // 기상청 날씨로 기상관측장비 데이터 초기화 여부 (0: 실제 장치 데이터에 의해 초기화. 1: 기상청 데이터 기반 초기화)
    isInitWeatherDevice: 1,
    // GCM을 보낼지 여부 (0: 안보냄, 1: 보냄)
    isSendGCM: 0,
    // 개발자 모드(우천모드시 즉시 "바다로" 명령 수행, 배터리 난수 발생)
    isDev: 0,
    // map 사용 위치(0: public/map.js, 1: server URL)
    isLocal: 1,
    // 핫스팟 모드
    isWifiHotSpotMode: 0,
    // 입력해야 하는 기본 세팅
    AES_Key: "nyhewp!00V1q3&56",
    xbeeSH: "0013A200",
    socketDeviceIP: 'localhost',
    socketDevicePort: 12345
  },



  config: {
    cryptoInfo: {
      prime_key: 'c7987b7564ca0417400c5b139a4197755255c4ceb2a05b232e32f24f8da6ac6b',
      alice: {},
      aliceBobSecret: null,
      bobPub: null,
      alicePub: null
    },
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : "saltpond_controller"
    },
    identificationNum: 3,
    hasExchangeKey: true, // exchangeKey
    hasMapDownload: false, // map download 
    webServerUrl: 'http://115.23.49.28:7505',
    controllerInfo: {},
    mapInfo: {}
  },
  source: {
    current: {

    },
    smartSaltern: {
      current: {
        isUsedSerial: 0, // 염전 장치 Serial 사용여부(0: 소켓만, 1: 혼합, 2: 시리얼 만)
      },
      smartController: {

      },
      salternEmulator: {
        current: {
          ip: 'localhost',
          port: 12345
        }
      },
      xbeeManager: {
        current: {
          serialDevicePort: 'COM4',
          serialDeviceBaudRate: 9600,
          serialDeviceIdentificationCode: 'at+ds',
          xbeeSH: '0013A200'
        }
      }

    },
    underwaterPhotovoltaic: {
      current: {

      }

    },
  },
  workers: {
    current: {

    },
    GcmSender: {
      current: {
        gcmInfo: {
          hasSendGcm: true,
          key: 'AIzaSyDGgt3enrX_DJTgophXl4XCgMRVCXEaeLY',
          startTransferPossibleHour: 7,
          endTransferPossibleHour: 20,
        },
        dbInfo: {
          host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
          user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
          password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
          database: process.env.SALTERN_DB ? process.env.SALTERN_DB : "saltpond_controller"
        },
      }
    },
    GetterWeather: {
      current: {},
      GetterWeatherCast: {
        current: {
          hasDev: true, // true면 저장된 File 읽어옴. false면 기상청 접속
          locationInfo: {
            x: 44,
            y: 55,
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
    },
    SocketServer: {
      current: {

      },
      PushServer: {
        current: {
          port: 4056,
          isWifiHotSpotMode: false,
          mapInfo: {
            mapFileName: 'v.01'
          }
        }
      }
    }
  },
  app: {
    mapVer: '',
  }

}