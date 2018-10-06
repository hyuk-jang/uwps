process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

process.env.NODE_ENV === 'development' && require('dotenv').config();

const { BU, DU, SU } = require('base-util-jh');
const _ = require('lodash');
// const _ = require('underscore');

const InitSetter = require('./config/InitSetter.js');

const config = require('./config.js');

global.BU = BU;
global.DU = DU;
global.SU = SU;
global._ = _;

const MainControl = require('./src/MainControl');

const CONTROLLERS_PATH = `${process.cwd()}\\controllers`;
global.CONTROLLERS_PATH = CONTROLLERS_PATH;

// TODO: 개선 필요
const initSetter = new InitSetter(config.init);
global.initSetter = initSetter;

// 컨트롤러 구동 시작
async function operationController() {
  try {
    const app = require('./config/app.js')(initSetter.dbInfo);
    const passport = require('./config/passport.js')(app, initSetter.dbInfo);
    app.set('passport', passport);
    app.set('initSetter', initSetter);

    BU.CLI(process.env.DEV_MODE);
    // 인증 시행 여부
    app.set('auth', process.env.DEV_MODE);

    require('./controllers')(app);

    /** Web Socket Binding */
    const http = require('http').Server(app);

    const mainControl = new MainControl();
    await mainControl.init();
    mainControl.dataStorageManager.setSocketIO(http);
    // 전역 변수로 설정
    global.mainStorageList = mainControl.dataStorageManager.mainStorageList;

    // TEST
    http.listen(initSetter.webPort, (req, res) => {
      console.log('Controller Server is Running', initSetter.webPort);
    });
  } catch (error) {
    BU.CLI(error);
    BU.errorLog('init', 'mainError', error);
  }
}

setTimeout(() => {
  operationController();
}, 1000);

process.on('uncaughtException', err => {
  BU.CLI(err);
  console.log('uncaughtException. Node NOT Exiting...');
});

process.on('unhandledRejection', err => {
  BU.CLI(err);
  console.log('unhandledRejection. Node NOT Exiting...');
});
