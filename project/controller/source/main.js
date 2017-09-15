var _ = require('underscore');
var events = require('events');
var util = require('util');

// var BU = global.BU;
var BI = require("./db/bi.js")

// Core
var _settingSaltpondStorage = require("./saltpondCore/settingStorage.js");
var _eventListener = require("./saltpondCore/eventListener.js");
var _deviceDataSender = require("./saltpondCore/deviceDataSender.js");

// 채염 시간 알고리즘
var _predictSalt = require("./algorithm/predictSalt.js");

const localConfig = require('../config.js')


// const hiweather =  new Weather();

var Main = function (mapObj) {
  events.EventEmitter.call(this);
  // BU.CLI(mapObj)
  var self = this;
  // 전역 변수 - 메인
  global.main = self;
  // global.setInfo = self.setInfo = setInfo;
  self.mapObj = mapObj;
  global.mapObj = mapObj;


  // 염전 관련된 모델 생성. 초기값 배정
  var Salt = new _settingSaltpondStorage.Salt(self);
  self.Salt = Salt;

  // Auto Stop, 염수 이동에 관련된 모든 것을 처리
  var Control = new _eventListener.Control(self);
  self.Control = Control;
  // BU.CLI(Control)
  //기상관측장치 현재값 저장
  self.WeatherDeviceStatus = {};
  self.WeatherCastStatus = {};

  self.ListALLDevice = [];

  // App으로 넘겨줄 명령 리스트
  self.ShortListSimple = [];
  self.ShortListAutomation = [];




  self.on("Start", function () {
    BU.CLI("Main Start")
    // self.pushServer = global.workers.socketServer.pushServer;
    
    // BU.CLI(global.pushServer)
    Salt.emit("SettingData");

    // 채염시기 예측 
    self.PredictSalt = new _predictSalt.PredictSalt(self);

  });

  self.on("SettingDataEnd", function () {
    BU.CLI("SettingDataEnd");

    // 기본 서버 (인증서버에서 User 판별하기 위한 Session 제어 서버)
    // var baseServer = new _baseServer.BaseServer(self, setInfo);
    // self.baseServer = baseServer;
    // baseServer.emit("Start");

    // Push 서버 실행 (Client 접속 관리 서버, Client로 Push Message 보내는 socket client 존재)
    // var pushServer = new _pushServer.PushServer(self, setInfo);
    // self.pushServer = pushServer;
    // pushServer.emit("Start");


    // // 명령 서버 실행 ( App에서 지시한 명령 수행 )
    // var cmdServer = new _cmdServer.CmdServer(self, setInfo);
    // self.cmdServer = cmdServer;
    // cmdServer.emit("Start");

    // // 통합기상 서버 ( 기상청 날씨, 기상장비 데이터 관리 서버 )
    // var weatherServer = new _weatherServer.WeatherServer(self, setInfo);
    // self.weatherServer = weatherServer;
    // weatherServer.emit("Start");

    // 가상 장치 시작
    require("./phantomDevice/deviceServerStarter.js");


    // // 웹브라우저 변환 미들웨어
    // var _htmlViewContainer = require("./init/htmlViewContainer.js");
    // var htmlView = new _htmlViewContainer.HtmlView();
    // self.htmlView = htmlView;
    // htmlView.emit("Start");

    //소켓 접속


    // 장치로부터 데이터를 받아오는 기능 담당
    var controlSerialData = new _deviceDataSender.controlSerialData(self);
    self.controlSerialData = controlSerialData;
    controlSerialData.emit("Start");

  });
}
util.inherits(Main, events.EventEmitter);


module.exports = function (mapObj) {
  // BU.CLI(mapObj)
  return new Main(mapObj);
}