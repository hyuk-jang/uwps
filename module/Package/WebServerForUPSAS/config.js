module.exports = {
  // 현재 컨트롤러 설정
  global: {
    // 염전 장치 Serial 사용여부(0: 소켓만, 1: 혼합, 2: 시리얼 만)
    isUsedSerial: '0',
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
    AES_Key: 'nyhewp!00V1q3&56',
    xbeeSH: '0013A200',
    socketDeviceIP: 'localhost',
    socketDevicePort: 12345
  },



  init: {
    cryptoInfo: {
      prime_key: 'c7987b7564ca0417400c5b139a4197755255c4ceb2a05b232e32f24f8da6ac6b',
      alice: {},
      aliceBobSecret: null,
      bobPub: null,
      alicePub: null
    },
    dbInfo: {
      // host: 'smtb.iptime.org',
      // password: 'upsas1111',
      port: process.env.DB_UPSAS_PORT ? process.env.DB_UPSAS_PORT : '3306',
      host: process.env.DB_UPSAS_HOST ? process.env.DB_UPSAS_HOST : 'localhost',
      user: process.env.DB_UPSAS_USER ? process.env.DB_UPSAS_USER : 'root',
      password: process.env.DB_UPSAS_PW ? process.env.DB_UPSAS_PW : 'test',
      database: process.env.DB_UPSAS_DB ? process.env.DB_UPSAS_DB : 'test'
    },
    salternInfo: {
      hasTryConnect: true,  // 염전과의 연결을 할지 여부
      port: 7777,
      host: 'localhost'
    },
    identificationNum: 3,
    hasExchangeKey: false, // exchangeKey
    hasMapDownload: false, // map download 
    webServerUrl: 'http://115.23.49.28:7505', 
    controllerInfo: {},
    mapInfo: {}
  },
  statusBoard: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    dbInfo: {
      port: process.env.DB_UPSAS_PORT ? process.env.DB_UPSAS_PORT : '3306',
      host: process.env.DB_UPSAS_HOST ? process.env.DB_UPSAS_HOST : 'localhost',
      user: process.env.DB_UPSAS_USER ? process.env.DB_UPSAS_USER : 'root',
      password: process.env.DB_UPSAS_PW ? process.env.DB_UPSAS_PW : 'test',
      database: process.env.DB_UPSAS_DB ? process.env.DB_UPSAS_DB : 'test'
    },
    deviceInfo: {
      target_id: 'StatusBoard',
      target_name: '현황판',
      target_category: 'statusBoard',
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
      },
      protocol_info: {
        mainCategory: 'weathercast',
        subCategory: 'vantagepro2'
      },
      controlInfo: {
        hasErrorHandling: false,
        hasOneAndOne: true,
        hasReconnect: true
      },
      connect_info: {
        type: 'serial',
        baudRate: 9600,
        port: 'COM???'
      },
      // connect_info: {
      //   type: 'socket',
      //   port: 9000
      // },
    }
  }

};