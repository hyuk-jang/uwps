const EventEmitter = require('events');
const _ = require('underscore');

const localConfig = require('./config.js')

class Control extends EventEmitter {
  constructor(parent) {
    super();
    // Connect Parent
    this.parent = parent;

    // 현재 Control 설정 변수
    this.config = {
      // smartSaltern: {},
      // underwaterPhotovoltaic: {},
      // measureWeather: {},
      // communication: {},
    };

    // Web Service Object
    this.smartSaltern = {};
    this.underwaterPhotovoltaic = {};
    this.measureWeather = {};
    // this.measureWeather = require('./measureWeather/control.js')();
    this.communication = {};


    // Processing

    // Model




  }

  init() {

  }

}

module.exports = (parent, thisConfig) => {
  // BU.CLI(thisConfig)
  /// Default Setting ------------->
  const control = new Control(parent);
  // 부모로부터 받는 config가 없다면 local config 사용하고 등록
  let config = _.isEmpty(thisConfig) ? localConfig : thisConfig;
  control.config = config.current;
  /// <------------ Default Setting


  // control.smartSaltern = require('./smartSaltern/control.js')(control, config.smartSaltern);
  // control.underwaterPhotovoltaic = require('./underwaterPhotovoltaic/control.js')(control, config.underwaterPhotovoltaic);

  // --------------> 기상 계측 System 
  let measureWeather = require('./measureWeather/control.js')(control, config.measureWeather);
  measureWeather.init();
  control.measureWeather = measureWeather;
  // <-------------- 기상 계측 System 


  // TODO: Socket 관련 수정 필요. 구조적이 됐든 기존 로직 수정이 됐든
  let socketServer = require("./socket-server")(parent.config.controllerInfo, parent.config.mapInfo);
  // BU.CLI(socketServer)
  // socketServer.pushServer.createServer();
  // socketServer.pushServer.checkClientsSesstion();
  socketServer.cmdServer.createServer();

  // global.pushServer = socketServer.pushServer;
  global.cmdServer = socketServer.cmdServer;

  // let communication = require('./communication/control.js')(control, config.communication);
  // control.communication = communication;


  // TODO: Main 관련 수정 필요. 구조적이 됐든 기존 로직 수정이 됐든

  // setTimeout(() => {
  //   let main = require("./main.js")(config.smartSaltern, parent.config.mapInfo);
  //   main.emit("Start");
  // }, 1000 * 3);






  return control;
}