const _ = require('underscore');

class Model {
  constructor(controller) {
    this.controller = controller;

    this.accessClientList = [];

    this.reserveClientList = [];
  }

  get connClients() {
    return this.accessClientList;
  }

  findClient(socket) {
    this.accessClientList.forEach(cl => {
      if (cl.socket === socket) {
        return cl.socket;
      }
    })
  }

  // 예약된 사용자가 있는지 탐색
  findReserveClient(sessionId) {
    let findObj = _.findWhere(this.reserveClientList, {
      sessionId: sessionId
    });
    if (findObj === undefined || BU.isEmpty(findObj)) {
      findObj = _.findWhere(this.accessClientList, {
        sessionId: sessionId
      });
    }
    if(findObj === undefined){
      findObj = {};
    }
    return findObj;
  }

  // 새로운 사용자 추가
  onNewClient(client, callback) {
    // 동일 기종에 대한 정보가 남아있다면 기존 데이터 삭제
    this.accessClientList = _.reject(this.accessClientList, (ele) => {
      return ele.deviceKey === client.deviceKey;
    })

    // 동일 기종에 대한 예약 정보 삭제
    this.reserveClientList = _.reject(this.reserveClientList, (ele) => {
      return ele.sessionId === client.sessionId;
    })

    this.connClients.push(client)
  }

  // 통합서버로부터 인증된 사용자
  onReserveClient(clientInfo) {
    // BU.CLI(clientInfo)
    let resFind = _.findWhere(this.reserveClientList, {
      sessionId: clientInfo.sessionId
    });
    // 동일 기종에 대한 예약 정보가 남아있다면 기존 데이터 삭제
    this.reserveClientList = _.reject(this.reserveClientList, client => {
      return client.sessionId === clientInfo.sessionId;
    })

    if (_.isEmpty(resFind)) {
      this.reserveClientList.push(clientInfo);
    } else {
      BU.CLI('이미 예약된 사용자네요.');
    }
  }

  destroySocket(socket) {
    // BU.CLI('destroySocket')
    _.each(this.accessClientList, client => {
      if (socket === client.socket) {
        this.checkSessionExpired(client);
        client.socket = {};
      }
    });
  }

  // App 밖으로 나갔을 경우 세션 체크. 지정된 시간 이상 외도 시 세션 삭제
  checkSessionExpired(client) {
    let sessionDelayTime = 60; //(60초)
    // BU.CLI(client.sessionId)
    // let findSocket = this.findClient(client);
    setTimeout(() => {
      let currDate = new Date();
      currDate.setTime(currDate.getTime() - 1000 * sessionDelayTime);

      if (client.loginDate < currDate && _.isEmpty(client.socket)) {
        this.accessClientList = _.reject(this.accessClientList, accessClient => {
          // BU.CLI(accessClient.sessionId)
          return accessClient.sessionId === client.sessionId;
        })
      }
      // BU.CLI("삭제된 결과 입니다.", this.accessClientList.length);
    }, 1000 * sessionDelayTime);
  }
}

module.exports = Model;