process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';


const Promise = require('bluebird');

const InitSetter = require('./config/InitSetter.js');

const config = require('./config.js');
const BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;
let SU = require('base-util-jh').salternUtil;
const _ = require('underscore');

global.BU = BU;
global.DU = DU;
global.SU = SU;
global._ = _;

const SalternConnector = require('./src/SalternConnector');

const CONTROLLERS_PATH = process.cwd() + '\\controllers';
global.CONTROLLERS_PATH = CONTROLLERS_PATH;


// TODO: 개선 필요
let initSetter = new InitSetter(config.init);
global.initSetter = initSetter;

// 통합 서버와 통신 (초기화)
exchangeInfo()
  .then(res => {
    return downloadMap();
  })
  .then(res => {
    // BU.CLI(res);
    return operationController();
  })
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

global.minyung = {
  has: false,
  webPort: 7400,
  pushPort: 7401,
  cmdPort: 7402
};

// 컨트롤러 구동 시작
function operationController() {
  // BU.CLI(mainConfig.workers.SocketServer.PushServer.current.port)
  const salternConnector = new SalternConnector(config.init.salternInfo);
  let app = require('./config/app.js')(initSetter.dbInfo);
  let passport = require('./config/passport.js')(app, initSetter.aliceBobSecret);
  app.set('passport', passport);
  app.set('initSetter', initSetter);

  require('./controllers')(app);

  /** Web Socket Binding */
  var http = require('http').Server(app);
  
  
  salternConnector.setSocketIO(http);

  // TEST
  http.listen(global.minyung.has ? global.minyung.webPort : initSetter.webPort, (req, res) => {
    console.log('Controller Server is Running', initSetter.webPort);
  });
}
