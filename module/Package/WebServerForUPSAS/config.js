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
      // host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      host: 'smtb.iptime.org',
      port: '7498',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      // password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      password: 'upsas1111',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'saltpond_controller'
    },
    salternInfo: {
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

};