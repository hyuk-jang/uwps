const CalculateAverage = require('./CalculateAverage.js');
class Model extends CalculateAverage {
  constructor(controller) {
    super(controller.config.calculateOption);
    this.controller = controller;


    this.hasConnectedDevice = false;
    this.retryConnectDeviceCount = 0;

    this.controlStatus = {
      retryChance: 3,
      reconnectDeviceInterval: 1000 * 60,  // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1   // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    }

    this.originalData = 0;
    // 평균치를 계산하고 저장할 객체
    this.averageObj = super.init();

    // 초기값으로 -1을 줌으로써 구동 시 화창한 날씨더라도 데이터 전송. 현재 내리고 있는 강수 단계 (0: 화창, 1: 이슬비, 2: 약한비, 3: 보통비, 4: 폭우)
    this.currRainLevel = -1;
  }



  get currOriginalData() {
    return this.originalData;
  }

  get averageRain() {
    // let resAverage = 0;
    // resAverage = Math.round(this.averageObj.smRain.average);
    // BU.CLIS('averageRain',this.averageObj, resAverage)
    return Math.round(this.averageObj.smRain.average);
  }

  // 우천 Level 반환
  get currentRainLevel() {
    return this.currRainLevel === -1 ? 0 : this.currRainLevel;
  }

  // 데이터 수신
  onSmRainData(rainData) {
    // BU.CLI('RainData', rainData)
    this.originalData = rainData;

    let dataObj = {
      smRain: rainData
    }
    // 부모에게 평균 치 계산 요청
    let resCalcObj = this.onDataObj(dataObj, this.averageObj);

    if (resCalcObj.hasOccurEvent) {
      this.averageObj = resCalcObj.cloneAverageObj;
      return this.checkRain();
    } else {
      return {};
    }
  };

  // 비 오는지 여부 체크
  checkRain() {
    // console.log('manageList',manageList)
    let manageList = this.controller.config.rainAlarmBoundaryList;
    if (manageList.length === 0) {
      return {};
    }

    let currTime = BU.convertDateToText(new Date(), "kor", 4, 1);
    let sendObj = {
      sendStatus: 'rain_0',
      currRainLevel: 0,
      currPredictAmount: 0,
      msg: ''
    };


    // BU.CLI('this.averageRain',this.averageRain)
    // 설정한 범위를 돌면서 값이 일치할 경우 계속해서 초기화
    let hasFind = false;
    manageList.forEach((element, index) => {
      // 적절한 상태를 찾았다면 수행 X
      if (hasFind) {
        return;
      }
      let nextElement = manageList[index + 1];
      // BU.CLIS(element.boundary, this.averageRain, index)
      // 비가 안올 경우 RainLevel 초기화
      if (index === 0 && element.boundary > this.averageRain && this.currRainLevel !== -1) {
        this.currRainLevel = 0;
      }

      // 현재 우천 센서 데이터 평균 값의 Config 범위에 따라 전송알림 객체 설정
      if (element.boundary > this.averageRain) {
        hasFind = true;

        sendObj.sendStatus = 'rain_' + (index);
        sendObj.currRainLevel = index;
        sendObj.currPredictAmount = element.predictAmount;
        sendObj.msg = index === 0 ? '' : currTime + '부터 ' + element.msg;
      }
    });
    // 현재 비오는 단계보다 강도가 약하다면 무시
    if (this.currRainLevel < sendObj.currRainLevel) {
      // BU.CLIS(sendObj, this.averageObj);
      this.currRainLevel = sendObj.currRainLevel;
      return sendObj;
    } else {
      return {};
    }
  }
}

module.exports = Model;