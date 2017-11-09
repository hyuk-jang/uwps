const Promise = require('bluebird')

const InitSetter = require('./config/InitSetter.js');


const Workers = require('./workers/Control.js');
const mainConfig = require('./config.js');
const BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;
let SU = require('base-util-jh').salternUtil;
const _ = require('underscore');
global.BU = BU;
global.DU = DU;
global.SU = SU;
global._ = _;

const CONTROLLERS_PATH = process.cwd() + '\\controllers';
global.CONTROLLERS_PATH = CONTROLLERS_PATH;


// TODO: 걷어 내야함... 지저분
global.fixmeConfig = mainConfig.global;

// TODO: 개선 필요
let initSetter = new InitSetter(mainConfig.config);
global.initSetter = initSetter;

// 통합 서버와 통신 (초기화)
exchangeInfo()
  .then(res => {
    return downloadMap();
  }, error => {
    BU.CLI('????')
    BU.errorLog('init', 'exchangeInfo() 실패', error);
    process.exit();
  })
  .then(res => {
    BU.CLI(res)
    // let workersConfig = 
    initSetter.setterWorkersSetting(mainConfig.workers);
    operationController();
  }, error => {
    BU.errorLog('init', 'downloadMap() 실패', error);
    process.exit();
  })

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
    })
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
    })
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
  let app = require('./config/app.js')(initSetter.dbInfo);
  let passport = require('./config/passport.js')(app, initSetter.aliceBobSecret);
  app.set('passport', passport);
  app.set('initSetter', initSetter);

  require('./controllers')(app);
  // TEST
  app.listen(global.minyung.has ? global.minyung.webPort : initSetter.webPort, (req, res) => {
    console.log('Controller Server is Running', initSetter.webPort);
  });



  // PAC Pattern Workers
  let workers = new Workers(mainConfig.workers);

  workers.init()
    .then(r => {
      // BU.CLI(r)
      Promise.delay(1000).then(() => {
        return workers.uPMS.getInverterData('IVT1');
      })
        .then(r => {
          BU.CLI(r)
        })


    })
    .catch(err => {
      BU.CLI(err);
    })

  global.workers = workers;
  global.pushServer = workers.socketServer.pushServer;
  app.set('workers', workers);


  // Source Worker
  let worker = require('./source')(initSetter.controllerInfo, initSetter.mapInfo);
  worker.socketServer.cmdServer.createServer();
  global.cmdServer = worker.socketServer.cmdServer;
  global.worker = worker;
  app.set('worker', worker);
  var main = require('./source/main.js')(initSetter.mapInfo);
  main.emit('Start');

}
