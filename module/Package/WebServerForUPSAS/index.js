process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

process.env.NODE_ENV === 'development' && require('dotenv').config();

const Promise = require('bluebird');

const InitSetter = require('./config/InitSetter.js');

const config = require('./config.js');
const {BU, DU, SU} = require('base-util-jh');
const _ = require('underscore');

global.BU = BU;
global.DU = DU;
global.SU = SU;
global._ = _;

// SSCS와 연결을 수립하고 데이터 통신을 제어하는 모듈
const SalternConnector = require('./src/SalternConnector');
// 현황판으로 데이터를 보내는 모듈
const StatusBoard = require('./src/StatusBoard');
const GetterWeathercast = require('./src/GetterWeathercast');

const CONTROLLERS_PATH = `${process.cwd()}\\controllers`;
global.CONTROLLERS_PATH = CONTROLLERS_PATH;

// TODO: 개선 필요
const initSetter = new InitSetter(config.init);
global.initSetter = initSetter;

// 통합 서버와 통신 (초기화)
exchangeInfo()
  .then(res => downloadMap())
  .then(res =>
    // BU.CLI(res);
    operationController(),
  )
  .catch(error => {
    BU.CLI('????', error);
    setTimeout(() => {
      process.exit();
    }, 10000);
    BU.errorLog('init', 'init() 실패', error);
  });

process.on('unhandledRejection', r => console.log(BU.CLI(r)));

// 통합 서버와 정보 교환
function exchangeInfo() {
  return new Promise((resolve, reject) => {
    initSetter.exchangeInfo((err, resExchangeKey) => {
      if (err) {
        reject(Error('Fail'));
      } else {
        resolve(resExchangeKey);
      }
    });
  });
}
// Map 초기화
function downloadMap() {
  return new Promise((resolve, reject) => {
    initSetter.downloadMap((err, resDownloadMap) => {
      if (err) {
        reject(Error('Fail'));
      } else {
        resolve(resDownloadMap);
      }
    });
  });
}

// 컨트롤러 구동 시작
function operationController() {
  // BU.CLI(mainConfig.workers.SocketServer.PushServer.current.port)
  const salternConnector = new SalternConnector(config.init.salternInfo);

  // 현황판 객체 생성 및 초기화 진행 후 구동 요청.
  const stautsBoard = new StatusBoard(config.statusBoard);
  stautsBoard.init();
  // stautsBoard.submitStatusPowerData();
  // 기상청 날씨 자동으로 가져오는 모듈
  const getterWeathercast = new GetterWeathercast();
  // getterWeathercast.getLocationList();

  const app = require('./config/app.js')(initSetter.dbInfo);
  const passport = require('./config/passport.js')(
    app,
    initSetter.aliceBobSecret,
  );
  app.set('passport', passport);
  app.set('initSetter', initSetter);

  require('./controllers')(app);

  /** Web Socket Binding */
  const http = require('http').Server(app);

  salternConnector.setSocketIO(http);

  // TEST
  http.listen(initSetter.webPort, (req, res) => {
    console.log('Controller Server is Running', initSetter.webPort);
  });
}
