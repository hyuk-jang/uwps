var events = require('events');
var util = require('util');
var _ = require("underscore");
var gcm = require('node-gcm');

// var BU = require("../util/baseUtil.js");
var BI = require("../db/BI.js");

var GCM = function () {
    events.EventEmitter.call(this);
    
    var self = this,
        main = global.main;

    this.sendAll = function (resMessage, resStatus, callback) {
        var sender = new gcm.Sender('AIzaSyDGgt3enrX_DJTgophXl4XCgMRVCXEaeLY');
        //var message = new gcm.Message();
        // ... or some given values 
        var message = new gcm.Message({
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
                msg: resMessage,
                status: resStatus == "" || resStatus === undefined ? "default" : resStatus,
                GUID: BU.GUID()
            }
            ,
            notification: {
                title: "Hello, World",
                icon: "ic_launcher",
                body: "This is a notification that will be displayed ASAP."
            }
        });

        if (global.fixmeConfig.isSendGCM == "1") {
            var date = new Date(),
                currHour = date.getHours();

            if (currHour > 7 && currHour < 20) {
                BI.GetGCMList(function (err, res) {
                    if (err) {
                        BU.log("db err : " + err);
                        return;
                    }
                    var regiList = _.pluck(res, "registration_id")
                    sender.send(message, regiList, 10, function (err, response) {
                        if (err) {
                            console.error("gcm Error", err);
                        }
                        else {
                            //BU.log("gcm Compete", response);
                        }
                    });

                })
            }
            else {
                BU.log("알람을 받을 시각이 아닙니다. : " + message);
            }
        }
        else
            BU.log("gcm Log:", resMessage);

    }

    this.Send = function (SendObj) {
        //BU.log("ServerKey : " + this.ServerKey);
        this.emit("Send",SendObj);
        var message = new gcm.Message(),
            sender = new gcm.Sender(main.setInfo.init.senderID);
            GUID = BU.GUID();
        //BU.debugConsole();
        //BU.CLI(SendObj)
        if (SendObj["status"] == undefined) {
            SendObj["status"] = "default";
        }

        if (SendObj["CMD"] == undefined) {
            SendObj["CMD"] = "default";
        }

        message.addData('msg', SendObj["Message"]);
        message.addData('status', SendObj["status"]);
        message.addData('GUID', GUID);
        message.collapseKey = BU.GUID();
        message.delayWhileIdle = false;
        message.timeToLive = 64800;

        registrationIds = SendObj["RegIds"];
        
        try {
            var NowDate = new Date(),
                NowHour = NowDate.getHours();
            
            if (NowHour > 7 && NowHour < 20) {
                if (main.setInfo.isSendGCM == "1") {
                    sender.send(message, registrationIds, 4, function (err, result) {
                        IsSend = true;
                        if (err) {
                            self.emit("SendEnd", err, SendObj);
                            return;
                        }
                        self.emit("SendEnd", undefined, SendObj);
                    });
                }
                else {
                    BU.log(SendObj);
                }
            }
            else {
                BU.log("알람을 받을 시각이 아닙니다. : " + SendObj.Message);
            }
        }
        catch(ex)
        {
            self.emit("SendEnd", ex);
        }
    }

    this.on("Send", function (SendObj) {
        //BU.log(SendObj);
        self.emit("SendEnd", undefined);
    });

    this.on("SendEnd", function (err, SendObj) {
        if(err)
        {
            setTimeout(function () {
                self.Send(SendObj);
            }, 1000);
            BU.log(err);
            return;
        }
    });




}
util.inherits(GCM, events.EventEmitter);
exports.GCM = GCM;

