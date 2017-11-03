const InitSetter = require('./config/InitSetter.js');


const Workers = require('./workers/Control.js');
const mainConfig = require('./config.js');
const BU = require('base-util-jh').baseUtil;
const DU = require('./public/js/util/domUtil.js');
const SU = require('./public/js/util/salternUtil.js');
global.BU = BU;
global.DU = DU;
global.SU = SU;

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

// 컨트롤러 구동 시작
function operationController() {
  BU.CLI(mainConfig.workers.SocketServer.PushServer.current.port)
  let app = require('./config/app.js')(initSetter.dbInfo);
  let passport = require('./config/passport.js')(app, initSetter.aliceBobSecret);
  // BU.CLI(initSetter)
  app.set('passport', passport);
  app.set('initSetter', initSetter);

  require('./controllers')(app);
  app.listen(initSetter.webPort, (req, res) => {
    console.log('Controller Server is Running', initSetter.webPort);
  });


  let worker = require('./source')(initSetter.controllerInfo, initSetter.mapInfo);

  // global.pushServer = worker.socketServer.pushServer;
  global.cmdServer = worker.socketServer.cmdServer;

  // Push, CMD Server 구동
  // worker.socketServer.pushServer.createServer();
  // worker.socketServer.pushServer.checkClientsSesstion();
  worker.socketServer.cmdServer.createServer();

  let workers = new Workers(mainConfig.workers);
  global.workers = workers;
  workers.init();

  global.pushServer = workers.socketServer.pushServer;
  app.set('workers', workers);
  
  

  global.worker = worker;
  app.set('worker', worker);
  var main = require('./source/main.js')(initSetter.mapInfo);
  main.emit('Start');


}
