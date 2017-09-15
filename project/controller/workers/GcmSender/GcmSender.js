const gcm = require('node-gcm');

class GcmSender {
  constructor(gcmInfo) {
    this.gcmInfo = gcmInfo;
  }

  sendAll(sendMsg, sendStatus, registrationList, callback) {
    // BU.CLIS('sendAll', sendMsg, sendStatus, registrationList)
    let sender = new gcm.Sender(this.gcmInfo.key);
    //var message = new gcm.Message();
    // ... or some given values 
    let message = new gcm.Message({
      collapseKey: BU.GUID(),
      priority: 'high',
      contentAvailable: true,
      delayWhileIdle: false,
      timeToLive: 64800
        //,
        //restrictedPackageName: "saltpond",
        //dryRun: true
        ,
      data: {
        msg: sendMsg,
        status: sendStatus == "" || sendStatus === undefined ? "default" : sendStatus,
        GUID: BU.GUID()
      },
      notification: {
        title: "node Gcm",
        icon: "ic_launcher",
        body: "This is a notification that will be displayed ASAP."
      }
    });

    if (this.gcmInfo.hasSendGcm) {
      // BU.CLI('hasSendGcm')
      // BU.CLI(message)
      let date = new Date();
      let currHour = date.getHours();

      if (currHour > this.gcmInfo.startTransferPossibleHour && currHour < this.gcmInfo.endTransferPossibleHour) {
        // registrationList.forEach(registrationObj => {
          // BU.CLI(registrationObj)
          sender.send(message, {registrationTokens: registrationList} , 10, function (err, response) {
            if (err) {
              BU.logFile(err)
              console.error("gcm Error", err);
            } else {
              BU.CLI("gcm Complete", sendMsg);
              // BU.CLI("gcm Complete", response);
            }
          // });
        });
      } else {
        BU.log("알람을 받을 시각이 아닙니다. : " + message);
      }
    } else
      BU.log("gcm Log:", sendMsg);
  }
}

module.exports = GcmSender;