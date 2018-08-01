module.exports = {
  // 현재 컨트롤러 설정
  init: {
    cryptoInfo: {
      prime_key: 'c7987b7564ca0417400c5b139a4197755255c4ceb2a05b232e32f24f8da6ac6b',
      alice: {},
      aliceBobSecret: null,
      bobPub: null,
      alicePub: null,
    },
    dbInfo: {
      // host: 'smtb.iptime.org',
      // password: 'upsas1111',
      port: process.env.DB_UPSAS_PORT ? process.env.DB_UPSAS_PORT : '3306',
      host: process.env.DB_UPSAS_HOST ? process.env.DB_UPSAS_HOST : 'localhost',
      user: process.env.DB_UPSAS_USER ? process.env.DB_UPSAS_USER : 'root',
      password: process.env.DB_UPSAS_PW ? process.env.DB_UPSAS_PW : 'test',
      database: process.env.DB_UPSAS_DB ? process.env.DB_UPSAS_DB : 'test',
    },
    identificationNum: 3,
    hasExchangeKey: false, // exchangeKey
    hasMapDownload: false, // map download
    webServerUrl: 'http://115.23.49.28:7505',
    controllerInfo: {web_port: 7500},
    mapInfo: {},
  },
};
