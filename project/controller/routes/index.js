var _ = require("underscore");
var BU = require("base-util-jh").baseUtil;
var BI = require("../source/db/bi.js")
var _gcm = require("../source/init/gcm.js");
require("../source/util/setJavascript.js")

// "/index"
exports["/"] = function (req, res) {
    //var _w = new WebBase(req, res);
    //var returnObj = {};
    //returnObj["test"] = "한글이지지롱";
    //html = _w.getHtmlPage("/Index.html", returnObj);
    //res.send(html);
};

// "/index"
exports["/Login"] = function (req, res) {

    var _w = new WebBase(req, res);
    var returnObj = {};
    returnObj["test"] = "로그인";
    html = _w.getHtmlPage("/Index.html", returnObj);
    res.send(html);
};


exports["/RegGCM"] = function (req, res) {
    BU.CLI("/RegGCM Started");
    //BU.log("request.connection.remoteAddress", res.connection.remoteAddress);

    var _w = new WebBase(req, res);
    

    var RegistrationId = _w.getParam("RegistrationId");
    var DeviceKey = _w.getParam("DeviceKey");
    var MemberSeq = _w.getParam("MemberIdx");
    
    var SendObj = {};
    var SendObjContents = {};

    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";

    if (DeviceKey == "" || MemberSeq == "" || MemberSeq == null || MemberSeq === null || RegistrationId == "") {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "필수 파라미터가 없습니다.";
        _w.render(returnObj);
        return;
    }
    
    BU.CLI("MemberSeq", MemberSeq, "RegistrationId", RegistrationId, "DeviceKey", DeviceKey);

    var WriteDate = BU.convertDateToText(new Date());

    

    BI.getGcmDevice(DeviceKey, function (err, res) {
        if (err) {
            throw new Error("DB 오류.");
        }
        //BU.CLI(res)
        if (res.length == 0) {
            BI.insertGcmDevice(MemberSeq, DeviceKey, RegistrationId, function (err, subRes, query) {
                BU.log(query)
                if (err) {
                    throw new Error(err)
                }
                BU.log("New Device")
                returnObj["Message"] = "입력 성공";
                _w.render(returnObj);
                return;
            })
        }
        else {
            BI.updateGcmDevice(res[0].gcm_device_seq, MemberSeq, DeviceKey, RegistrationId, function (err, subRes, query) {
                if (err) {
                    throw new Error(err)
                }
                BU.log("Update Device")
                returnObj["Message"] = "입력 성공";
                _w.render(returnObj);
                return;
            })

        }
    });
}

exports["/DelGCM"] = function (req, res) {
    var _w = new WebBase(req,res);

    var DeviceKey = _w.getParam("DeviceKey");

    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";

    if (DeviceKey == "") {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "필수 파라미터가 없습니다.";
        _w.render(returnObj);
    }

    BI.deleteGcmDevice(DeviceKey, function (err, row) {
        if (err) {
            BU.log(err);
            throw new Error("DB 오류.");
        }
        returnObj["IsError"] = 0;
        returnObj["Message"] = "";
        _w.render(returnObj);
        return;
    })
}


exports["/GetAllData"] = function (req, res) {
    var _w = new WebBase(req, res);
    var main = _w.main;

    var returnObj = {};
    returnObj["CMD"] = "GetAllStats";
    returnObj["CMD_Key"] = "";
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    returnObj["Contents"] = ""
    
    var ControlStatus = main.Control.ControlType;
    var WaterDoorList = main.Salt.SaltData["WaterDoorList"];
    var WaterLevelList = main.Salt.SaltData["WaterLevelList"];
    var PumpList = main.Salt.SaltData["PumpList"];
    var SalinityList = main.Salt.SaltData["SalinityList"];
    var ValveList = main.Salt.SaltData["ValveList"];
    var WeatherDeviceStatus = main.WeatherDeviceStatus;
    //var WeatherCastStatus = main.WeatherCastStatus;
    
    //BU.CLI(WeatherDeviceStatus);
    var ControlList = main.Control.AutomationMode.GetControlList();
    //ControlList["ProgressCMD"] = main.Control.AutomationMode.ControlProgressList;
    //ControlList["CompleteCMD"] = main.Control.AutomationMode.ControlCompleteList;
    //ControlList["DeletingCMD"] = main.Control.AutomationMode.DeletingCMD;
    

    
    var StatusWaterDoorList = new Array();
    _.each(WaterDoorList, function (WD) {
        StatusWaterDoorList.push(WD.GetStatus());
    });
    
    var StatusWaterLevelList = new Array();
    _.each(WaterLevelList, function (WL) {
        StatusWaterLevelList.push(WL.GetStatus());
    });
    
    var StatusSalinityList = new Array();
    _.each(SalinityList, function (S) {
        StatusSalinityList.push(S.GetStatus());
    });
    
    var StatusPumpList = new Array();
    _.each(PumpList, function (P) {
        StatusPumpList.push(P.GetStatus());

    });
    
    var StatusValveList = new Array();
    _.each(ValveList, function (V) {
        StatusValveList.push(V.GetStatus());

    });
    
    returnObj["Contents"] = {
        "ControlStatus" : ControlStatus,
        "WaterDoorList" : StatusWaterDoorList,
        "WaterLevelList" : StatusWaterLevelList,
        "SalinityList" : StatusSalinityList,
        "PumpList" : StatusPumpList,
        "ValveList" : StatusValveList,
        "WeatherDeviceStatus" : WeatherDeviceStatus,
        "ControlList" : ControlList
        //"WeatherCastStatus" : WeatherCastStatus
    };

    _w.render(returnObj);
};

exports["/PredictWaterLevel"] = function (req, res) {
    var _w = new WebBase(req, res);
    var main = _w.main;

    var returnObj = {};
    returnObj["CMD"] = "PredictWaterLevel";
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    returnObj["Contents"] = {};
    
    var _w = new WebBase(req, res);
    var SP_ID = _w.getParam("SP_ID");
    var WT_ID = _w.getParam("WT_ID");
    var Time = _w.getParam("Time");
    
    var self = this;


    main.PredictSalt.emit("PredictSalt", "WaterLevel", SP_ID, WT_ID, Time, function (err, result) {
        if (err) {
            BU.log("에러도착");
            //returnObj["IsError"] = 1;
            BU.log(err);
            returnObj["IsError"] = err["Code"];
            returnObj["Message"] = err["Meg"];
            _w.render(JSON.stringify(returnObj));
            return;
        }
        
        var Result = result;
        //returnObj["Contents"] = result;
        //_w.render(JSON.stringify(returnObj));

        var SimpleCMD = {};
        SimpleCMD["Src"] = WT_ID;
        SimpleCMD["Des"] = SP_ID;
        SimpleCMD["SetWaterLevel"] = result["Now_Myheight"];
        SimpleCMD["ControlType"] = "SimpleCMD";
        
        main.Control.emit("OrderControl", SimpleCMD, function (err, result) {
            if (err) {
                BU.log("OrderControl 에러도착");
                //returnObj["IsError"] = 1;
                BU.log(err);
                returnObj["IsError"] = err["IsError"];
                returnObj["Message"] = err["Message"];
                _w.render(JSON.stringify(returnObj));
                return;
                
                //var SendData = BU.makeMessage(SendObj);
                //BU.log(SendData);
                //socket.write(SendData);
                //socket.destroy();
                //return;
            }
            
            var ResultObj = {};
            ResultObj["Src"] = result["Src"];
            ResultObj["Des"] = result["Des"];
            ResultObj["WaterLevel"] = Result["Now_Myheight"];
            ResultObj["Salinity"] = Result["Mix_WaterRate_Result"];
            ResultObj["TargetDate"] = Result["set_target_Date"];
            
            returnObj["Contents"] = ResultObj;
            _w.render(JSON.stringify(returnObj));
            
            //var SendData = BU.makeMessage(result);
            //BU.log(SendData);
            //socket.write(SendData);
            //socket.destroy();
            //return;

        });

    });
}

exports["/PredictTime"] = function (req, res) {
    var _w = new WebBase(req, res);
    var main = _w.main;

    var returnObj = {};
    returnObj["CMD"] = "PredictTime";
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    returnObj["Contents"] = {};
    
    var _w = new WebBase(req, res);
    var SP_ID = _w.getParam("SP_ID");
    var WT_ID = _w.getParam("WT_ID");
    var WaterLevel = _w.getParam("WaterLevel");

    
    main.PredictSalt.emit("PredictSalt", "Time", SP_ID, WT_ID, WaterLevel, function (err, result) {
        if (err) {
            BU.log("에러도착");

            //returnObj["IsError"] = 1;
            BU.log(err);
            returnObj["IsError"] = err["Code"];
            returnObj["Message"] = err["Meg"];
            _w.render(JSON.stringify(returnObj));
            return;
        }
        
        var Result = result;
        //returnObj["Contents"] = result;
        //_w.render(JSON.stringify(returnObj));
        
        var SimpleCMD = {};
        SimpleCMD["Src"] = WT_ID;
        SimpleCMD["Des"] = SP_ID;
        SimpleCMD["SetWaterLevel"] = WaterLevel;
        SimpleCMD["ControlType"] = "SimpleCMD";
        
        main.Control.emit("OrderControl", SimpleCMD, function (err, result) {
            if (err) {
                BU.log("OrderControl 에러도착");
                //returnObj["IsError"] = 1;
                BU.log(err);
                returnObj["IsError"] = err["IsError"];
                returnObj["Message"] = err["Message"];
                _w.render(JSON.stringify(returnObj));
                return;
                
                //var SendData = BU.makeMessage(SendObj);
                //BU.log(SendData);
                //socket.write(SendData);
                //socket.destroy();
                //return;
            }
            
            var ResultObj = {};
            ResultObj["Src"] = result["Src"];
            ResultObj["Des"] = result["Des"];
            ResultObj["WaterLevel"] = WaterLevel;
            ResultObj["Salinity"] = Result["Mix_WaterRate_Result"];
            ResultObj["TargetDate"] = Result["set_target_Date"];
            
            returnObj["Contents"] = ResultObj;
            _w.render(JSON.stringify(returnObj));
            
            //var SendData = BU.makeMessage(result);
            //BU.log(SendData);
            //socket.write(SendData);
            //socket.destroy();
            //return;

        });
    });
}

exports["/OpenDoor"] = function (req, res) {
    var _w = new WebBase(req, res);

    var ID = _w.getParam("ID");
    var IsOpen = _w.getParam("IsOpen");

    var main = _w.main;
    var salt = main.Salt;
    var SaltData = salt.SaltData;
    var WaterDoor = salt.FindObj(ID);

    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";

    //BU.log("_w : " + _w);
    

    if(IsOpen == "true")
        IsOpen = "1";
    else if(IsOpen == "false")
        IsOpen = "0"
    else {
        returnObj["IsError"] = -1;
        returnObj["Message"] = "IsOpen Parameter Invalid";
        _w.render(JSON.stringify(returnObj));
        return;
    }
    
    
    
    
    if(WaterDoor == null)
    {
        returnObj["IsError"] = -1;
        returnObj["Message"] = "Not Find Object";
        _w.render(JSON.stringify(returnObj));
        return;
    }
    
    main.Control.emit("DeviceControl", ID, IsOpen, "WaterDoor", function (err, result) {
        if (err) {
            returnObj["IsError"] = err["IsError"];
            returnObj["Message"] = err["Message"];
            _w.render(JSON.stringify(returnObj));
            return;
        }
        
        returnObj["IsError"] = result["IsError"];
        returnObj["Message"] = result["Message"];
        
        _w.render(JSON.stringify(returnObj));
        return;
    });    

    //WaterDoor.SetOpen(IsOpen,function(err,Door){
    //    if (err) {
    //        returnObj["IsError"] = -1;
    //        returnObj["Message"] = "변경도중 오류가 발생했습니다.";
    //        _w.render(JSON.stringify(returnObj));
    //        return;
    //    }

    //    returnObj["Message"] = "정상적으로 명령이 수행 되었습니다.";

    //    _w.render(JSON.stringify(returnObj));
    //    return;
    //});
}

exports["/GetRelation"] = function (req, res) {
    var _w = new WebBase(req, res);
    var main = _w.main;
    var mapObj = _w.mapObj;
    var Salt = main.Salt;

    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    returnObj["Map_Version"] = mapObj.mapFileName;
    
    
    var ArrayReservoir = [];
    _.each(Salt.SaltData["ReservoirList"], function (Target) {
        ArrayReservoir.push(Target.GetRelation());
    });
    var ArraySaltPlate = [];
    _.each(Salt.SaltData["SaltPlateList"], function (Target) {
        ArraySaltPlate.push(Target.GetRelation());
    });
    var ArrayWaterTank = [];
    _.each(Salt.SaltData["WaterTankList"], function (Target) {
        ArrayWaterTank.push(Target.GetRelation());
    });
    var ArrayWaterOut = [];
    _.each(Salt.SaltData["WaterOutList"], function (Target) {
        ArrayWaterOut.push(Target.GetRelation());
    });

    var ArrayWaterWay = [];
    _.each(Salt.SaltData["WaterWayList"], function (Target) {
        ArrayWaterWay.push(Target.GetRelation());
    });
    //var ArrayValveRank = [];
    //_.each(Salt.SaltData["ValveRankData"], function (Target) {
    //    ArrayReservoir.push(Target.GetRelation());
    //});
    

    returnObj["Contents"] = {
        "ListReservoir" : ArrayReservoir,
        "ListSaltPlate" : ArraySaltPlate,
        "ListWaterTank" : ArrayWaterTank,
        "ListWaterOut" : ArrayWaterOut,
        "ListWaterWay" : ArrayWaterWay,
        "ListValveRank": mapObj.mapRelation.ValveRankData
    };
    
    _w.render(returnObj);
}

exports["/GetMap"] = function (req, res) {
    var Map = global.mapImg;

    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["CMD"] = "GetMap";
    returnObj["CMD_Key"] = "1425524467514_51";
    returnObj["Map_Version"] = global.mapFileName;
    returnObj["Contents"] = Map;

    var _w = new WebBase(req, res);
    

    _w.render(returnObj);
}

exports["/GetMapData"] = function (req, res) {
    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    
    var _w = new WebBase(req, res);
    
    _w.render(global.mapText);
}

exports["/GetControl"] = function (req, res) {
    var self = this;
    var _w = new WebBase(req, res);
    var main = _w.main;
    var SimpleControlList = main.ShortListSimple;
    var ShortListAutomation = main.ShortListAutomation;
    var ControlReferenceKeys = main.Control.AutomationMode.ControlReferenceKeys;
    var returnObj = {};
    returnObj["CMD"] = "GetControl";
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    
    returnObj["Contents"] = {
        "SimpleControlList" : SimpleControlList,
        "ShortListAutomation" : ShortListAutomation,
        "ControlReferenceKeys" : ControlReferenceKeys
    };
    
    
    
    _w.render(returnObj);
}


exports["/WeatherDeviceChange"] = function (req, res) {
    var self = this;
    self.main = global.main;
    
    var _w = new WebBase(req, res);
    var DataObj = JSON.parse(_w.getParam("Data"));
    BU.CLI(DataObj)
    
    var Key = DataObj["ID"];
    var WeatherObj = {};
    WeatherObj["RainRate"] = self.main.WeatherDeviceStatus.RainRate;
    WeatherObj["Temperature"] = self.main.WeatherDeviceStatus.Temperature;
    WeatherObj["Humidity"] = self.main.WeatherDeviceStatus.Humidity;
    WeatherObj["WindDirection"] = self.main.WeatherDeviceStatus.WindDirection;
    WeatherObj["WindSpeed"] = self.main.WeatherDeviceStatus.WindSpeed;
    WeatherObj["SolarRadiation"] = self.main.WeatherDeviceStatus.SolarRadiation;
    
    switch (Key) {
        case "RainRate":
            BU.log("RRRRRRRRRRRRRRRRRRR");
            WeatherObj.RainRate = DataObj["Value"];
            break;
        case "Temperature":
            WeatherObj.Temperature = DataObj["Value"];
            break;
        case "Humidity":
            WeatherObj.Humidity = DataObj["Value"];
            break;
        case "WindDirection":
            WeatherObj.WindDirection = DataObj["Value"];
            break;
        case "WindSpeed":
            WeatherObj.WindSpeed = DataObj["Value"];
            break;
        case "SolarRadiation":
            WeatherObj.SolarRadiation = DataObj["Value"];
            break;
        default :
            break;
    }
    BU.CLI(WeatherObj)
    global.main.Weather.emit("ReceiveWeatherData", WeatherObj);


    var returnObj = {};
    returnObj["CMD"] = "WeatherDeviceChangeEnd";
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";

    
    returnObj["Contents"] = {
        "ID" : DataObj["ID"],
        "Name" : "",
        "Value" : DataObj["Value"]
    };
    var _w = new WebBase(req, res);
    
    _w.render(returnObj);
}


// 배수지의 들어오는 수문의 닫는 여부
var IsSendWaterObjClosedWaterDoor = "0";
// 급수지의 들어오는 수문의 닫는 여부
var IsReceiveWaterObjClosedWaterDoor = "0";

var WaterDoorSeperateList = [];
// 심플 컨트롤
var SimpleControlList = [];
var AutomationControlList = [];
var SettingControlList = [];
var RainControlList = [];

var InitSetting = function (){
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    
    WaterDoorSeperateList = [];
    SimpleControlList = [];
    AutomationControlList = [];
    SettingControlList = [];
    RainControlList = [];
    
    var ArrayReservoir = [];
    _.each(Salt.SaltData["ReservoirList"], function (Target) {
        ArrayReservoir.push(Target.GetRelation());
    });
    var ArraySaltPlate = [];
    _.each(Salt.SaltData["SaltPlateList"], function (Target) {
        ArraySaltPlate.push(Target.GetRelation());
    });
    var ArrayWaterTank = [];
    _.each(Salt.SaltData["WaterTankList"], function (Target) {
        ArrayWaterTank.push(Target.GetRelation());
    });
    var ArrayWaterOut = [];
    _.each(Salt.SaltData["WaterOutList"], function (Target) {
        ArrayWaterOut.push(Target.GetRelation());
    });
    var ArrayWaterWay = [];
    _.each(Salt.SaltData["WaterWayList"], function (Target) {
        ArrayWaterWay.push(Target.GetRelation());
    });
    
    var ArrayObjList = _.union(ArrayReservoir, ArraySaltPlate, ArrayWaterTank, ArrayWaterOut, ArrayWaterWay);
    
    _.each(ArrayObjList, function (ArrayObj) {
        _.each(ArrayObj["ListInWaterDoor"], function (WaterDoor) {
            var AddObj = {};
            AddObj["Type"] = "In";
            AddObj["Parent"] = ArrayObj["ID"];
            AddObj["ID"] = WaterDoor;
            WaterDoorSeperateList.push(AddObj);
        });
        _.each(ArrayObj["ListEqualWaterDoor"], function (WaterDoor) {
            var AddObj = {};
            AddObj["Type"] = "Equal";
            AddObj["Parent"] = ArrayObj["ID"];
            AddObj["ID"] = WaterDoor;
            WaterDoorSeperateList.push(AddObj);
        });
        _.each(ArrayObj["ListOutWaterDoor"], function (WaterDoor) {
            var AddObj = {};
            AddObj["Type"] = "Out";
            AddObj["Parent"] = ArrayObj["ID"];
            AddObj["ID"] = WaterDoor;
            WaterDoorSeperateList.push(AddObj);
        });
    });
}

// 자동 명령 생성 클래스
function makeControlList(isSendTargetClosedWD, isReceiveTargetClosedWD) {
    var self = this;
    self.main = global.main;
    self.saltJs = self.mainJs.Salt;

    // 배수지의 들어오는 수문의 닫는 여부
    self.IsSendWaterObjClosedWaterDoor = isSendTargetClosedWD;
    // 급수지의 들어오는 수문의 닫는 여부
    self.IsReceiveWaterObjClosedWaterDoor = isReceiveTargetClosedWD;

    self.WaterDoorSeperateList = [];
    // 심플 컨트롤
    self.SimpleControlList = [];
    self.AutomationControlList = [];
    self.SettingControlList = [];
    self.RainControlList = [];

    // ~!@
    self.initTest = function(){
        BU.log("hi");
    }

    // Simple 명령 생성(염판 -> 염판, 염판 -> 해주, 염판 -> 바다 등등) 단순 명령.
    self.MakeSimpleMode = function () {
        _.each(self.saltJs.SaltData["SaltPlateList"], function (SaltPlate) {
            var AddObj = {};
            AddObj["SrcID"] = SaltPlate["ID"];
            AddObj["DesList"] = [];

            SimpleControlList.push(AddObj);

            var DesValue = [];
            // Depth 차가 존재 할 경우
            GetMoveWaterList([], SaltPlate["ID"], SaltPlate["ID"], "0", function (ResValue) {
                var UpdateMakeControl = _.findWhere(SimpleControlList, { "SrcID": SaltPlate["ID"] });
                UpdateMakeControl["DesList"].push(ResValue);
            });
            // 동일 Depth 일 경우
            GetEqualWaterList([], SaltPlate["ID"], SaltPlate["ID"], function (ResValue, err) {
                var UpdateMakeControl = _.findWhere(SimpleControlList, { "SrcID": SaltPlate["ID"] });
                UpdateMakeControl["DesList"].push(ResValue);
            });
        });

        var PumpList = _.filter(self.saltJs.SaltData["ValveRankList"], function (ValveRank) {
            if (ValveRank["ID"].indexOf("P") != -1)
                return true;
        });

        var PumpFeedRankList = [];
        _.each(PumpList, function (Pump) {
            var PumpParent = self.saltJs.FindParent(Pump["ID"], "Pump")[0];
            var IsExistSimpleControl = _.findWhere(SimpleControlList, { "SrcID": PumpParent["ID"] });

            if (BU.isEmpty(IsExistSimpleControl)) {
                var AddObj = {};
                AddObj["SrcID"] = PumpParent["ID"];
                AddObj["DesList"] = [];
                SimpleControlList.push(AddObj);
            }
            GetPumpServiceable(PumpParent["ID"], Pump["ID"], []);
        });

        _.each(SimpleControlList, function (MakeControl) {
            MakeControl["DesList"] = _.sortBy(MakeControl["DesList"], function (Des) {
                var OrderOfPriority = RelationOrderOfPriorityArray(Des["DesID"]);
                var ReturnValue = OrderOfPriority["Value"];
                return ReturnValue + Number(Des["DesID"].substr(OrderOfPriority["Point"]));
            });
        });
        return SimpleControlList;
    }
    // 결정지 급수 결정 명령 생성
    self.MakeAutomationMode = function () {
        var CrystallizingSaltPondList = [];
        _.each(self.saltJs.SaltData["SaltPlateList"], function (Target) {
            if (Target["PlateType"].indexOf("Crystallizing") != -1) {
                var AddObj = {};
                AddObj["Des"] = Target["ID"];
                AddObj["Src"] = [];

                AutomationControlList.push(AddObj);
                CrystallizingSaltPondList.push(Target["ID"]);
            }
        });
        _.each(SimpleControlList, function (SimpleControl) {
            _.each(SimpleControl["DesList"], function (DesInfo) {
                var DesID = DesInfo["DesID"]
                var IsContain = _.contains(CrystallizingSaltPondList, DesID);
                if (IsContain == true && DesInfo["Type"] !== "Emulator") {
                    var FindObj = _.findWhere(AutomationControlList, { "Des": DesID });
                    FindObj["Src"].push(SimpleControl["SrcID"]);
                }
            });
        })

        return AutomationControlList;
    }

    // 설정 모드 생성
    self.MakeSettingMode = function () {
        // 장치 모두 정지
        var DeviceClose = {};
        DeviceClose["ID"] = "DeviceClose";
        DeviceClose["True"] = [];
        DeviceClose["False"] = [];

        var DeviceList = self.saltJs.DeviceList();
        _.each(DeviceList, function (DeviceCategory) {
            _.each(DeviceCategory, function (Device) {
                if (Device["DeviceKey"] !== "Salinity" && Device["DeviceKey"] !== "WL")
                    DeviceClose["False"].push(Device["ID"]);
            });
        });

        SettingControlList.push(DeviceClose);

        // 최종 우천 대피
        var GoToSea = {};
        GoToSea["ID"] = "GoToSea";
        GoToSea["True"] = DeviceClose["False"];
        GoToSea["False"] = [];

        _.each(self.saltJs.SaltData["WaterTankList"], function (WaterTank) {
            var InWaterDoorList = _.where(WaterDoorSeperateList, { "Parent": WaterTank["ID"], "Type": "In" });

            _.each(InWaterDoorList, function (InWaterDoor) {
                GoToSea["True"] = _.reject(GoToSea["True"], function (True) {
                    return True === InWaterDoor["ID"];
                });
                GoToSea["False"].push(InWaterDoor["ID"]);
            });
        });

        _.each(self.saltJs.SaltData["ValveList"], function (Valve) {
            GoToSea["True"] = _.reject(GoToSea["True"], function (True) {
                return True === Valve["ID"];
            });
            GoToSea["False"].push(Valve["ID"]);
        });

        _.each(self.saltJs.SaltData["PumpList"], function (Pump) {
            GoToSea["True"] = _.reject(GoToSea["True"], function (True) {
                return True === Pump["ID"];
            });
            GoToSea["False"].push(Pump["ID"]);
        });

        SettingControlList.push(GoToSea);

        //BU.CLI(SettingControlList);
        return SettingControlList;
    }


    var GetPumpServiceable = function (SrcID, TargetID, RouteList) {
        var self = this;
        self.main = global.main;
        var Salt = self.mainJs.Salt;
        //BU.log("TargetID : " + TargetID)
        var NowTrueDeviceList = RouteList;
        NowTrueDeviceList.push(TargetID);
        var ValveRank = _.findWhere(global.main.self.saltJs.SaltData["ValveRankList"], { "ID": TargetID });
        var ValveRankLow = ValveRank["Low"];
        //BU.CLI(ValveRank);
        if (BU.isEmpty(ValveRankLow)) {
            //BU.log("본 함수로 전송")
            var FinalDes = self.saltJs.FindParent(TargetID, "Valve")[0];
            var OutWaterDoorList = _.where(WaterDoorSeperateList, { "Parent": FinalDes.ID, "Type": "Out" });

            var AddObj = {};
            AddObj.DesID = FinalDes.ID;
            AddObj.Type = "Common";
            AddObj.True = NowTrueDeviceList;
            AddObj.False = [];
            _.each(OutWaterDoorList, function (OutWaterDoor) {
                AddObj.False.push(OutWaterDoor.ID);
            });

            // 배수지의 들어오는 수문을 닫음
            if (IsSendWaterObjClosedWaterDoor == "1") {
                var InWaterDoorList = _.where(WaterDoorSeperateList, { "Parent": SrcID, "Type": "In" });
                _.each(InWaterDoorList, function (InWaterDoor) {
                    AddObj.False.push(InWaterDoor.ID);
                });
            }
            // 급수지의 들어오는 수문을 닫음
            if (IsReceiveWaterObjClosedWaterDoor == "1") {
                var InWaterDoorList = _.where(WaterDoorSeperateList, { "Parent": FinalDes.ID, "Type": "In" });
                _.each(InWaterDoorList, function (InWaterDoor) {
                    AddObj.False.push(InWaterDoor.ID);
                });
            }
            var FindObj = _.findWhere(SimpleControlList, { "SrcID": SrcID });
            FindObj["DesList"].push(AddObj);
        }

        _.each(ValveRankLow, function (Low) {
            if (Low.indexOf("V") != -1) {
                NowTrueDeviceList = _.difference(NowTrueDeviceList, ValveRankLow);
                GetPumpServiceable(SrcID, Low, NowTrueDeviceList);
            }
        });
    }

    var RelationOrderOfPriorityArray = function (RelationID) {
        var returnvalue = {};

        if (RelationID.indexOf("SP") != -1) {
            returnvalue.Value = 1000;
            returnvalue.Point = 2;
        }
        else if (RelationID.indexOf("WT") != -1) {
            returnvalue.Value = 2000;
            returnvalue.Point = 2;
        }
        else if (RelationID.indexOf("WO") != -1) {
            returnvalue.Value = 3000;
            returnvalue.Point = 2;
        }
        else if (RelationID.indexOf("RV") != -1) {
            returnvalue.Value = 4000;
            returnvalue.Point = 2;
        }
        return returnvalue;
    }

    var DeviceOrderOfPriorityArray = function (Device) {
        var returnvalue = {};

        if (Device.indexOf("WD") != -1) {
            returnvalue.Value = 1000;
            returnvalue.Point = 2;
        }
        else if (Device.indexOf("V") != -1) {
            returnvalue.Value = 2000;
            returnvalue.Point = 1;
        }
        else if (Device.indexOf("P") != -1) {
            returnvalue.Value = 3000;
            returnvalue.Point = 1;
        }

        return returnvalue;
    }

    var GetEqualWaterList = function (DesList, Src, BaseSrc, CallBack) {
        var SrcOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "Out", "Parent": Src });
        var SrcInWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "In", "Parent": Src });
        var SrcEqualWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "Equal", "Parent": Src });


        var WaterSupplyList = [];
        // 배수지의 동일 Depth 수문을 공유하는 수문을 찾음
        _.each(SrcEqualWaterDoorList, function (EqualWaterDoor) {
            var ReceiveWaterObj = _.filter(WaterDoorSeperateList, function (WaterDoorSeperate) {
                return EqualWaterDoor["ID"] == WaterDoorSeperate["ID"] && EqualWaterDoor["Parent"] != WaterDoorSeperate["Parent"];
            });

            if (BU.isEmpty(ReceiveWaterObj)) {
                CallBack("", "Error");
                return;
            }

            // 배열-오브젝트 형식에서 배열 형식 제거
            ReceiveWaterObj = ReceiveWaterObj[0];
            //BU.CLI(ReceiveWaterObj);
            var UsedDesParent = _.findWhere(WaterSupplyList, { "DesID": ReceiveWaterObj["Parent"] });
            if (BU.isEmpty(UsedDesParent)) {
                var DesObj = {};
                DesObj["DesID"] = ReceiveWaterObj["Parent"];
                DesObj["Type"] = "Emulator";
                DesObj["True"] = [];
                DesObj["False"] = [];
                DesObj["True"].push(ReceiveWaterObj["ID"]);

                // 배수지의 들어오는 수문을 전부 닫음.
                if (IsSendWaterObjClosedWaterDoor == "1") {
                    _.each(SrcInWaterDoorList, function (ThisInWaterDoor) {
                        DesObj["False"].push(ThisInWaterDoor["ID"]);
                    });
                }

                // 배수지의 나가는 수문을 전부 닫음.
                _.each(SrcOutWaterDoorList, function (ThisOutWaterDoor) {
                    DesObj["False"].push(ThisOutWaterDoor["ID"]);
                });
                WaterSupplyList.push(DesObj);
            }
                // 이미 등록된 목적지라면 True False 를 수정
            else {
                UsedDesParent["True"].push(ReceiveWaterObj["ID"]);
                UsedDesParent["False"] = _.reject(UsedDesParent["False"], function (False) {
                    return ReceiveWaterObj["ID"] == False;
                });
            }
        });

        _.each(WaterSupplyList, function (WaterSupply) {
            var AddDesListWaterSupply = WaterSupply;

            if (!BU.isEmpty(DesList)) {
                AddDesListWaterSupply["True"] = AddDesListWaterSupply["True"].concat(DesList["True"]);
                AddDesListWaterSupply["False"] = AddDesListWaterSupply["False"].concat(DesList["False"]);
            }

            var ReceivceWaterObjEqualList = _.where(WaterDoorSeperateList, { "Type": "Equal", "Parent": AddDesListWaterSupply["DesID"] });

            // Equal 수문을 통해 이동한 급수지에 추가적인 Equal 수문을 통해 염수가 이동할 수 있는지 검색
            var IsRemainEqualObj = _.filter(ReceivceWaterObjEqualList, function (ReceivceWaterObjEqual) {
                return !_.contains(AddDesListWaterSupply["True"], ReceivceWaterObjEqual) && !_.contains(AddDesListWaterSupply["False"], ReceivceWaterObjEqual);
            });

            // 추가적인 Equal 수문이 존재 할 경우 
            if (!BU.isEmpty(IsRemainEqualObj)) {
                var ReceiveWaterObjList = _.filter(IsRemainEqualObj, function (RemainEqual) {
                    return RemainEqual["Parent"] != AddDesListWaterSupply["DesID"];
                });

                _.each(ReceiveWaterObjList, function (ReceiveWaterObj) {
                    GetEqualWaterList(WaterDoorSeperateList, AddDesListWaterSupply, AddDesListWaterSupply["DesID"], BaseSrc, CallBack)
                });
            }

            // 급수지에서 수로를 통해 염수가 흐를 수 있는지 검색
            var ReceivceWaterObjOutList = _.where(WaterDoorSeperateList, { "Type": "Out", "Parent": AddDesListWaterSupply["DesID"] });

            var RemainObjList = _.filter(ReceivceWaterObjOutList, function (ReceivceWaterObjOut) {
                var UsedInWaterDoorObj = _.findWhere(WaterDoorSeperateList, { "Type": "In", "ID": ReceivceWaterObjOut["ID"] });

                if (!BU.isEmpty(UsedInWaterDoorObj) && UsedInWaterDoorObj["Parent"].indexOf("SP") == -1) {
                    return true;
                }
            });
            // 급수지에 Out 수문이 존재하며 해당 루트를 통해 염수가 이동하는 곳이 염판이 아니라면 Depth Function 알고리즘 호출
            if (!BU.isEmpty(RemainObjList)) {
                GetMoveWaterList(AddDesListWaterSupply, AddDesListWaterSupply["DesID"], BaseSrc, "1", CallBack);
            }

            var EditWaterSupply = AddDesListWaterSupply;
            // 급수지의 Out 수문 닫음
            var DesOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "Out", "Parent": AddDesListWaterSupply["DesID"] });
            _.each(DesOutWaterDoorList, function (DesOutWaterDoor) {
                EditWaterSupply["False"].push(DesOutWaterDoor["ID"]);
            });

            // 급수지의 들어오는 수문을 전부 닫음.
            if (IsReceiveWaterObjClosedWaterDoor == "1") {
                var DesInWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "In", "Parent": AddDesListWaterSupply["DesID"] });
                _.each(DesInWaterDoorList, function (ThisInWaterDoor) {
                    if (!_.contains(EditWaterSupply["True"], ThisInWaterDoor["ID"]) && !_.contains(EditWaterSupply["False"], ThisInWaterDoor["ID"]))
                        EditWaterSupply["False"].push(ThisInWaterDoor["ID"]);
                });
            }
            CallBack(EditWaterSupply);
        });

    }

    var GetMoveWaterList = function (DesList, Src, BaseSrc, IsUsedEqualWaterDoor, CallBack) {
        var SrcOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "Out", "Parent": Src });
        var SrcInWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "In", "Parent": Src });

        var WaterSupplyList = [];

        _.each(SrcOutWaterDoorList, function (OutWaterDoor) {
            var ReceiveWaterObj = _.findWhere(WaterDoorSeperateList, { "Type": "In", "ID": OutWaterDoor["ID"] });
            // 급수지에 In 수문이 없거나, 배수지에서 Equal수문을 통해 들어온 경우 이번 급수지가 염판이라면 종료
            if (BU.isEmpty(ReceiveWaterObj) || (IsUsedEqualWaterDoor == "1" && ReceiveWaterObj["Parent"].indexOf("SP") != -1))
                return;

            var UsedDesParent = _.findWhere(WaterSupplyList, { "DesID": ReceiveWaterObj["Parent"] });
            if (BU.isEmpty(UsedDesParent)) {
                var DesObj = {};
                DesObj["DesID"] = ReceiveWaterObj["Parent"];

                if (BU.isEmpty(DesList) || DesList["Type"] == "Common")
                    DesObj["Type"] = "Common";
                else {
                    DesObj["Type"] = "Controller";
                }


                DesObj["True"] = [];
                DesObj["False"] = [];
                DesObj["True"].push(ReceiveWaterObj["ID"]);

                // 배수지의 들어오는 수문을 전부 닫음.
                if (IsSendWaterObjClosedWaterDoor == "1") {
                    _.each(SrcInWaterDoorList, function (ThisInWaterDoor) {
                        if (!_.contains(DesList["True"], ThisInWaterDoor["ID"]) && !_.contains(DesList["False"], ThisInWaterDoor["ID"]))
                            DesObj["False"].push(ThisInWaterDoor["ID"]);
                    });
                }

                // 배수지의 나가는 수문을 전부 닫음.
                _.each(SrcOutWaterDoorList, function (ThisOutWaterDoor) {
                    if (OutWaterDoor["ID"] != ThisOutWaterDoor["ID"])
                        DesObj["False"].push(ThisOutWaterDoor["ID"]);
                });

                WaterSupplyList.push(DesObj);
            }
                // 이미 등록된 목적지라면 True False 를 수정
            else if (UsedDesParent !== undefined) {
                UsedDesParent["True"].push(ReceiveWaterObj["ID"]);
                UsedDesParent["False"] = _.reject(UsedDesParent["False"], function (False) {
                    return False == ReceiveWaterObj["ID"];
                });
            }
            if (DesList["Type"] == "Controller" && UsedDesParent !== undefined) {
                BU.log("Error");
                BU.CLI(UsedDesParent);
            }
        });

        _.each(WaterSupplyList, function (WaterSupply) {
            var AddDesListWaterSupply = WaterSupply;
            if (!BU.isEmpty(DesList)) {
                AddDesListWaterSupply["True"] = DesList["True"].concat(AddDesListWaterSupply["True"]);
                AddDesListWaterSupply["False"] = DesList["False"].concat(AddDesListWaterSupply["False"]);
            }

            if (AddDesListWaterSupply["DesID"].indexOf("WW") != -1) {
                GetMoveWaterList(AddDesListWaterSupply, AddDesListWaterSupply["DesID"], BaseSrc, IsUsedEqualWaterDoor, CallBack);
            }
            else {
                var EditWaterSupply = AddDesListWaterSupply;
                var DesOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "Out", "Parent": AddDesListWaterSupply["DesID"] });
                _.each(DesOutWaterDoorList, function (DesOutWaterDoor) {
                    EditWaterSupply["False"].push(DesOutWaterDoor["ID"]);
                });

                // 급수지의 들어오는 수문을 전부 닫음.
                if (IsReceiveWaterObjClosedWaterDoor == "1") {
                    var DesInWaterDoorList = _.where(WaterDoorSeperateList, { "Type": "In", "Parent": AddDesListWaterSupply["DesID"] });
                    _.each(DesInWaterDoorList, function (ThisInWaterDoor) {
                        if (!_.contains(EditWaterSupply["True"], ThisInWaterDoor["ID"]) && !_.contains(EditWaterSupply["False"], ThisInWaterDoor["ID"]))
                            EditWaterSupply["False"].push(ThisInWaterDoor["ID"]);
                    });
                }

                // 최초 배수지에서 최종 급수지의 명령 존재여부 탐색
                var BaseSrcObj = _.findWhere(SimpleControlList, { "SrcID": BaseSrc });

                // 명령이 존재하지 않을경우 명령 추가
                if (BaseSrcObj === undefined) {
                    CallBack(EditWaterSupply);
                    return;
                }

                var IsRemainControlOrder = _.filter(BaseSrcObj["DesList"], function (DesObj) {
                    return DesObj["DesID"] == EditWaterSupply["DesID"];
                });

                // 명령이 중복 존재하지 않을경우에 명령 추가
                if (BU.isEmpty(IsRemainControlOrder))
                    CallBack(EditWaterSupply);
            }
        });
    }
}

exports["/MakeControlList"] = function (req, res) {
    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    
    // 초기 설정
    InitSetting();

    

    var ControlObj = {};
    ControlObj["SimpleMode"] = MakeSimpleMode();
    ControlObj["AutomationMode"] = MakeAutomationMode();
    ControlObj["SettingMode"] = MakeSettingMode();
    ControlObj["RainMode"] = [];
    
    // ~!@
    var makeInstance = new makeControlList("0", "0");
    makeInstance.initTest();
    //BU.CLI(SimpleControlList);
    
    
    returnObj["Contents"] = ControlObj;
    
    var _w = new WebBase(req, res);
    _w.render(returnObj["Contents"]);
}

// 설정 모드 생성
var MakeSettingMode = function (){
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    
    // 장치 모두 정지
    var DeviceClose = {};
    DeviceClose["ID"] = "DeviceClose";
    DeviceClose["True"] = [];
    DeviceClose["False"] = [];
    
    var DeviceList = Salt.DeviceList();
    _.each(DeviceList, function (DeviceCategory) {
        _.each(DeviceCategory, function (Device) {
            if(Device["DeviceKey"] !== "Salinity" && Device["DeviceKey"] !== "WL")
                DeviceClose["False"].push(Device["ID"]);
        });
    });

    SettingControlList.push(DeviceClose);
    
    // 최종 우천 대피
    var GoToSea = {};
    GoToSea["ID"] = "GoToSea";
    GoToSea["True"] = DeviceClose["False"];
    GoToSea["False"] = [];

    _.each(Salt.SaltData["WaterTankList"], function (WaterTank) {
        var InWaterDoorList = _.where(WaterDoorSeperateList, { "Parent" : WaterTank["ID"], "Type" : "In" });
        
        _.each(InWaterDoorList, function (InWaterDoor) {
            GoToSea["True"] = _.reject(GoToSea["True"], function (True) {
                return True === InWaterDoor["ID"];
            });
            GoToSea["False"].push(InWaterDoor["ID"]);
        });
    });
    
    _.each(Salt.SaltData["ValveList"], function (Valve) {
        GoToSea["True"] = _.reject(GoToSea["True"], function (True) {
            return True === Valve["ID"];
        });
        GoToSea["False"].push(Valve["ID"]);
    });
    
    _.each(Salt.SaltData["PumpList"], function (Pump) {
        GoToSea["True"] = _.reject(GoToSea["True"], function (True) {
            return True === Pump["ID"];
        });
        GoToSea["False"].push(Pump["ID"]);
    });

    SettingControlList.push(GoToSea);

    //BU.CLI(SettingControlList);
    return SettingControlList;
}

// 결정지 급수 결정 명령 생성
var MakeAutomationMode = function (){
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    
    var CrystallizingSaltPondList = [];
    _.each(Salt.SaltData["SaltPlateList"], function (Target) {
        if (Target["PlateType"].indexOf("Crystallizing") != -1) {
            var AddObj = {};
            AddObj["Des"] = Target["ID"];
            AddObj["Src"] = [];
            
            AutomationControlList.push(AddObj);
            CrystallizingSaltPondList.push(Target["ID"]);
        }
    });
    _.each(SimpleControlList, function (SimpleControl){
        _.each(SimpleControl["DesList"], function (DesInfo) {
            var DesID = DesInfo["DesID"]
            var IsContain = _.contains(CrystallizingSaltPondList, DesID);
            if (IsContain == true && DesInfo["Type"] !== "Emulator") {
                var FindObj = _.findWhere(AutomationControlList, { "Des" : DesID });
                FindObj["Src"].push(SimpleControl["SrcID"]);
            }
        });
    })
    
    return AutomationControlList;
}

// 최상위 펌프 리스트를 구하는 재귀 함수
var GetPumpListValveRank = function (ValveID, CallBack) {
    var ValveRank = _.findWhere(SaltData["ValveRankList"], { "ID" : ValveID });
    var ValveRankHigh = ValveRank["High"];
    _.each(ValveRankHigh, function (High) {
        if (High.indexOf("P") == 0) {
            CallBack(High);
            return;
        }
        else
            GetPumpListValveRank(High, CallBack);
    });
}

// Simple 명령 생성(염판 -> 염판, 염판 -> 해주, 염판 -> 바다 등등) 단순 명령.
var MakeSimpleMode = function (){
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;

    _.each(Salt.SaltData["SaltPlateList"], function (SaltPlate) {
        var AddObj = {};
        AddObj["SrcID"] = SaltPlate["ID"];
        AddObj["DesList"] = [];
        
        SimpleControlList.push(AddObj);
        
        var DesValue = [];
        // Depth 차가 존재 할 경우
        GetMoveWaterList([], SaltPlate["ID"], SaltPlate["ID"], "0", function (ResValue) {
            var UpdateMakeControl = _.findWhere(SimpleControlList, { "SrcID" : SaltPlate["ID"] });
            UpdateMakeControl["DesList"].push(ResValue);
        });
        // 동일 Depth 일 경우
        GetEqualWaterList([], SaltPlate["ID"], SaltPlate["ID"], function (ResValue, err) {
            var UpdateMakeControl = _.findWhere(SimpleControlList, { "SrcID" : SaltPlate["ID"] });
            UpdateMakeControl["DesList"].push(ResValue);
        });
    });
    
    var PumpList = _.filter(Salt.SaltData["ValveRankList"], function (ValveRank) {
        if (ValveRank["ID"].indexOf("P") != -1)
            return true;
    });

    var PumpFeedRankList = [];
    _.each(PumpList, function (Pump) {
        var PumpParent = Salt.FindParent(Pump["ID"], "Pump")[0];
        var IsExistSimpleControl = _.findWhere(SimpleControlList, { "SrcID" : PumpParent["ID"] });
        
        if (BU.isEmpty(IsExistSimpleControl)) {
            var AddObj = {};
            AddObj["SrcID"] = PumpParent["ID"];
            AddObj["DesList"] = [];
            SimpleControlList.push(AddObj);
        }
        GetPumpServiceable(PumpParent["ID"], Pump["ID"], []);
    });
    
    _.each(SimpleControlList, function (MakeControl) {
        MakeControl["DesList"] = _.sortBy(MakeControl["DesList"], function (Des) {
            var OrderOfPriority = RelationOrderOfPriorityArray(Des["DesID"]);
            var ReturnValue = OrderOfPriority["Value"];
            return ReturnValue + Number(Des["DesID"].substr(OrderOfPriority["Point"]));
        });
    });
    return SimpleControlList;
}

var GetPumpServiceable = function (SrcID, TargetID, RouteList) {
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    //BU.log("TargetID : " + TargetID)
    var NowTrueDeviceList = RouteList;
    NowTrueDeviceList.push(TargetID);
    var ValveRank = _.findWhere(global.main.Salt.SaltData["ValveRankList"], { "ID" : TargetID });
    var ValveRankLow = ValveRank["Low"];
    //BU.CLI(ValveRank);
    if (BU.isEmpty(ValveRankLow)) {
        //BU.log("본 함수로 전송")
        var FinalDes = Salt.FindParent(TargetID, "Valve")[0];
        var OutWaterDoorList = _.where(WaterDoorSeperateList, { "Parent" : FinalDes.ID, "Type" : "Out" });
        
        var AddObj = {};
        AddObj.DesID = FinalDes.ID;
        AddObj.Type = "Common";
        AddObj.True = NowTrueDeviceList;
        AddObj.False = [];
        _.each(OutWaterDoorList, function (OutWaterDoor) {
            AddObj.False.push(OutWaterDoor.ID);
        });
        
        // 배수지의 들어오는 수문을 닫음
        if (IsSendWaterObjClosedWaterDoor == "1") {
            var InWaterDoorList = _.where(WaterDoorSeperateList, { "Parent" : SrcID, "Type" : "In" });
            _.each(InWaterDoorList, function (InWaterDoor) {
                AddObj.False.push(InWaterDoor.ID);
            });
        }
        // 급수지의 들어오는 수문을 닫음
        if (IsReceiveWaterObjClosedWaterDoor == "1") {
            var InWaterDoorList = _.where(WaterDoorSeperateList, { "Parent" : FinalDes.ID, "Type" : "In" });
            _.each(InWaterDoorList, function (InWaterDoor) {
                AddObj.False.push(InWaterDoor.ID);
            });
        }
        var FindObj = _.findWhere(SimpleControlList, { "SrcID" : SrcID });
        FindObj["DesList"].push(AddObj);
    }
    
    _.each(ValveRankLow, function (Low) {
        if (Low.indexOf("V") != -1) {
            NowTrueDeviceList = _.difference(NowTrueDeviceList, ValveRankLow);
            GetPumpServiceable(SrcID, Low, NowTrueDeviceList);
        }
    });
}

var RelationOrderOfPriorityArray = function (RelationID){
    var returnvalue = {};
    
    if (RelationID.indexOf("SP") != -1) {
        returnvalue.Value = 1000;
        returnvalue.Point = 2;
    }
    else if (RelationID.indexOf("WT") != -1) {
        returnvalue.Value = 2000;
        returnvalue.Point = 2;
    }
    else if (RelationID.indexOf("WO") != -1) {
        returnvalue.Value = 3000;
        returnvalue.Point = 2;
    }
    else if (RelationID.indexOf("RV") != -1) {
        returnvalue.Value = 4000;
        returnvalue.Point = 2;
    }
    return returnvalue;
}

var DeviceOrderOfPriorityArray = function (Device) {
    var returnvalue = {};

    if (Device.indexOf("WD") != -1) {
        returnvalue.Value = 1000;
        returnvalue.Point = 2;
    }
    else if (Device.indexOf("V") != -1) {
        returnvalue.Value = 2000;
        returnvalue.Point = 1;
    }
    else if (Device.indexOf("P") != -1) {
        returnvalue.Value = 3000;
        returnvalue.Point = 1;
    }

    return returnvalue;
}

var GetEqualWaterList = function (DesList, Src, BaseSrc, CallBack) {
    var SrcOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "Out", "Parent" : Src });
    var SrcInWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "In", "Parent" : Src });
    var SrcEqualWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "Equal", "Parent" : Src });


    var WaterSupplyList = [];
    // 배수지의 동일 Depth 수문을 공유하는 수문을 찾음
    _.each(SrcEqualWaterDoorList, function (EqualWaterDoor) {
        var ReceiveWaterObj = _.filter(WaterDoorSeperateList, function (WaterDoorSeperate) {
            return EqualWaterDoor["ID"] == WaterDoorSeperate["ID"] && EqualWaterDoor["Parent"] != WaterDoorSeperate["Parent"];
        });
        
        if (BU.isEmpty(ReceiveWaterObj)) {
            CallBack("", "Error");
            return;
        }
        
        // 배열-오브젝트 형식에서 배열 형식 제거
        ReceiveWaterObj = ReceiveWaterObj[0];
        //BU.CLI(ReceiveWaterObj);
        var UsedDesParent = _.findWhere(WaterSupplyList, { "DesID" : ReceiveWaterObj["Parent"] });
        if (BU.isEmpty(UsedDesParent)) {
            var DesObj = {};
            DesObj["DesID"] = ReceiveWaterObj["Parent"];
            DesObj["Type"] = "Emulator";
            DesObj["True"] = [];
            DesObj["False"] = [];
            DesObj["True"].push(ReceiveWaterObj["ID"]);

            // 배수지의 들어오는 수문을 전부 닫음.
            if (IsSendWaterObjClosedWaterDoor == "1") {
                _.each(SrcInWaterDoorList, function (ThisInWaterDoor) {
                        DesObj["False"].push(ThisInWaterDoor["ID"]);
                });
            }
            
            // 배수지의 나가는 수문을 전부 닫음.
            _.each(SrcOutWaterDoorList, function (ThisOutWaterDoor) {
                    DesObj["False"].push(ThisOutWaterDoor["ID"]);
            });
            WaterSupplyList.push(DesObj);
        }
        // 이미 등록된 목적지라면 True False 를 수정
        else {
            UsedDesParent["True"].push(ReceiveWaterObj["ID"]);
            UsedDesParent["False"] = _.reject(UsedDesParent["False"], function (False) {
                return ReceiveWaterObj["ID"] == False;
            });
        }
    });

    _.each(WaterSupplyList, function (WaterSupply) {
        var AddDesListWaterSupply = WaterSupply;
        
        if (!BU.isEmpty(DesList)) {
            AddDesListWaterSupply["True"] = AddDesListWaterSupply["True"].concat(DesList["True"]);
            AddDesListWaterSupply["False"] = AddDesListWaterSupply["False"].concat(DesList["False"]);
        }
        
        var ReceivceWaterObjEqualList = _.where(WaterDoorSeperateList, { "Type" : "Equal", "Parent" : AddDesListWaterSupply["DesID"] });
        
        // Equal 수문을 통해 이동한 급수지에 추가적인 Equal 수문을 통해 염수가 이동할 수 있는지 검색
        var IsRemainEqualObj =  _.filter(ReceivceWaterObjEqualList, function (ReceivceWaterObjEqual) {
            return !_.contains(AddDesListWaterSupply["True"], ReceivceWaterObjEqual) && !_.contains(AddDesListWaterSupply["False"], ReceivceWaterObjEqual);
        });
        
        // 추가적인 Equal 수문이 존재 할 경우 
        if (!BU.isEmpty(IsRemainEqualObj)) {
            var ReceiveWaterObjList = _.filter(IsRemainEqualObj, function (RemainEqual) {
                return RemainEqual["Parent"] != AddDesListWaterSupply["DesID"];
            });

            _.each(ReceiveWaterObjList, function (ReceiveWaterObj) {
                GetEqualWaterList(WaterDoorSeperateList, AddDesListWaterSupply, AddDesListWaterSupply["DesID"], BaseSrc, CallBack)
            });
        }
        
        // 급수지에서 수로를 통해 염수가 흐를 수 있는지 검색
        var ReceivceWaterObjOutList = _.where(WaterDoorSeperateList, { "Type" : "Out", "Parent" : AddDesListWaterSupply["DesID"] });
        
        var RemainObjList = _.filter(ReceivceWaterObjOutList, function (ReceivceWaterObjOut) {
            var UsedInWaterDoorObj = _.findWhere(WaterDoorSeperateList, { "Type" : "In", "ID" : ReceivceWaterObjOut["ID"] });

            if (!BU.isEmpty(UsedInWaterDoorObj) && UsedInWaterDoorObj["Parent"].indexOf("SP") == -1) {
                return true;
            }
        });
        // 급수지에 Out 수문이 존재하며 해당 루트를 통해 염수가 이동하는 곳이 염판이 아니라면 Depth Function 알고리즘 호출
        if (!BU.isEmpty(RemainObjList)) {
            GetMoveWaterList(AddDesListWaterSupply, AddDesListWaterSupply["DesID"], BaseSrc, "1", CallBack);
        }

        var EditWaterSupply = AddDesListWaterSupply;
        // 급수지의 Out 수문 닫음
        var DesOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "Out", "Parent" : AddDesListWaterSupply["DesID"] });
        _.each(DesOutWaterDoorList, function (DesOutWaterDoor) {
            EditWaterSupply["False"].push(DesOutWaterDoor["ID"]);
        });
            
        // 급수지의 들어오는 수문을 전부 닫음.
        if (IsReceiveWaterObjClosedWaterDoor == "1") {
            var DesInWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "In", "Parent" : AddDesListWaterSupply["DesID"] });
            _.each(DesInWaterDoorList, function (ThisInWaterDoor) {
                if (!_.contains(EditWaterSupply["True"], ThisInWaterDoor["ID"]) && !_.contains(EditWaterSupply["False"], ThisInWaterDoor["ID"]))
                    EditWaterSupply["False"].push(ThisInWaterDoor["ID"]);
            });
        }
        CallBack(EditWaterSupply);
    });

}

var GetMoveWaterList = function (DesList, Src, BaseSrc, IsUsedEqualWaterDoor, CallBack) {
    var SrcOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "Out", "Parent" : Src });
    var SrcInWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "In", "Parent" : Src });
    
    var WaterSupplyList = [];
    
    _.each(SrcOutWaterDoorList, function (OutWaterDoor) {
        var ReceiveWaterObj = _.findWhere(WaterDoorSeperateList, { "Type" : "In", "ID" : OutWaterDoor["ID"] });
        // 급수지에 In 수문이 없거나, 배수지에서 Equal수문을 통해 들어온 경우 이번 급수지가 염판이라면 종료
        if (BU.isEmpty(ReceiveWaterObj) || (IsUsedEqualWaterDoor == "1" && ReceiveWaterObj["Parent"].indexOf("SP") != -1))
            return;
        
        var UsedDesParent = _.findWhere(WaterSupplyList, { "DesID" : ReceiveWaterObj["Parent"] });
        if (BU.isEmpty(UsedDesParent)) {
            var DesObj = {};
            DesObj["DesID"] = ReceiveWaterObj["Parent"];
            
            if(BU.isEmpty(DesList) || DesList["Type"] == "Common")
                DesObj["Type"] = "Common";
            else {
                DesObj["Type"] = "Controller";
            }
                

            DesObj["True"] = [];
            DesObj["False"] = [];
            DesObj["True"].push(ReceiveWaterObj["ID"]);
            
            // 배수지의 들어오는 수문을 전부 닫음.
            if (IsSendWaterObjClosedWaterDoor == "1") {
                _.each(SrcInWaterDoorList, function (ThisInWaterDoor) {
                    if(!_.contains(DesList["True"], ThisInWaterDoor["ID"]) && !_.contains(DesList["False"], ThisInWaterDoor["ID"]))
                        DesObj["False"].push(ThisInWaterDoor["ID"]);
                });
            }
            
            // 배수지의 나가는 수문을 전부 닫음.
            _.each(SrcOutWaterDoorList, function (ThisOutWaterDoor) {
                if (OutWaterDoor["ID"] != ThisOutWaterDoor["ID"])
                    DesObj["False"].push(ThisOutWaterDoor["ID"]);
            });

            WaterSupplyList.push(DesObj);
        }
        // 이미 등록된 목적지라면 True False 를 수정
        else if (UsedDesParent !== undefined){
            UsedDesParent["True"].push(ReceiveWaterObj["ID"]);
            UsedDesParent["False"] = _.reject(UsedDesParent["False"], function (False) {
                return False == ReceiveWaterObj["ID"];
            });
        }
        if (DesList["Type"] == "Controller" && UsedDesParent !== undefined) {
            BU.log("Error");
            BU.CLI(UsedDesParent);
        }
    });
   
    _.each(WaterSupplyList, function (WaterSupply) {
        var AddDesListWaterSupply = WaterSupply;
        if (!BU.isEmpty(DesList)) {
            AddDesListWaterSupply["True"] = DesList["True"].concat(AddDesListWaterSupply["True"]);
            AddDesListWaterSupply["False"] = DesList["False"].concat(AddDesListWaterSupply["False"]);
        }
       
        if (AddDesListWaterSupply["DesID"].indexOf("WW") != -1) {
            GetMoveWaterList(AddDesListWaterSupply, AddDesListWaterSupply["DesID"], BaseSrc, IsUsedEqualWaterDoor, CallBack);
        }
        else {
            var EditWaterSupply = AddDesListWaterSupply;
            var DesOutWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "Out", "Parent" : AddDesListWaterSupply["DesID"] });
            _.each(DesOutWaterDoorList, function (DesOutWaterDoor) {
                EditWaterSupply["False"].push(DesOutWaterDoor["ID"]);
            });
            
            // 급수지의 들어오는 수문을 전부 닫음.
            if (IsReceiveWaterObjClosedWaterDoor == "1") {
                var DesInWaterDoorList = _.where(WaterDoorSeperateList, { "Type" : "In", "Parent" : AddDesListWaterSupply["DesID"] });
                _.each(DesInWaterDoorList, function (ThisInWaterDoor) {
                    if (!_.contains(EditWaterSupply["True"], ThisInWaterDoor["ID"]) && !_.contains(EditWaterSupply["False"], ThisInWaterDoor["ID"]))
                        EditWaterSupply["False"].push(ThisInWaterDoor["ID"]);
                });
            }

            // 최초 배수지에서 최종 급수지의 명령 존재여부 탐색
            var BaseSrcObj = _.findWhere(SimpleControlList, { "SrcID" : BaseSrc });
            
            // 명령이 존재하지 않을경우 명령 추가
            if (BaseSrcObj === undefined) {
                CallBack(EditWaterSupply);
                return;
            }

            var IsRemainControlOrder = _.filter(BaseSrcObj["DesList"], function (DesObj) {
                return DesObj["DesID"] == EditWaterSupply["DesID"];
            });

            // 명령이 중복 존재하지 않을경우에 명령 추가
            if(BU.isEmpty(IsRemainControlOrder))
                CallBack(EditWaterSupply);
        }
    });
}


exports["/RecordSaltHarvest"] = function (req, res) {
    var _w = new WebBase(req, res);
    

    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";
    
    var RecordType = _w.getParam(req, "RecordType");        // Get : 채염, Storage : 보관, Release : 출고
    var SaltPondID = _w.getParam(req, "SaltPondID");
    var WriteDate = _w.getParam(req, "WriteDate");
    
    if (RecordType === "") {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "기록 형식을 선택하세요.";
        _w.render(returnObj);
        return;
    }
    
    if (!(RecordType === "Take" || RecordType === "Storage" || RecordType === "Release")) {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "기록 형식 형식이 다릅니다.\n확인 후 재시도 해주세요.";
        _w.render(returnObj);
        return;
    }
    
    if (SaltPondID === "" || WriteDate === "") {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "데이터 입력 형식이 다릅니다.\n확인 후 재시도 해주세요.";
        _w.render(returnObj);
        return;
    }
    
    var FindObj = global.main.Salt.FindObj(SaltPondID);
    if (BU.isEmpty(FindObj)) {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "해당 염판의 데이터를 찾을 수 없습니다.";
        _w.render(returnObj);
        return;
    }
    
    if (FindObj["PlateType"].indexOf("Crystallizing") === -1) {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "해당 염판 ID는 결정지가 아닙니다.";
        _w.render(returnObj);
        return;
    }
    
    WriteDate = BU.convertDateFormat(WriteDate);

    if (WriteDate === "") {
        returnObj["IsError"] = 1;
        returnObj["Message"] = "날짜 형식이 다릅니다.";
        _w.render(returnObj);
        return;
    }
    
    if (RecordType === "Take") {
        BI.GetSaltHarvest(SaltPondID, function (error, result) {
            if (error) {
                BU.log("데이터를 로드하지 못했습니다.");
                returnObj["IsError"] = 1;
                returnObj["Message"] = "데이터를 로드하지 못했습니다.";
                _w.render(returnObj);
                BU.log(error);
                return;
            }
            var LastedDate = result[0];
            var PrevDate = new Date(LastedDate["writedate"]);
            var NextDate = new Date(WriteDate);
            if (PrevDate.getTime() >= NextDate.getTime()) {
                BU.log("ASDAS");
                returnObj["IsError"] = 1;
                returnObj["Message"] = "해당 결정지의 이전 채염기록보다 느립니다.\n이전기록 : " + BU.convertDateToText(LastedDate["writedate"]);
                _w.render(returnObj);
                return;
            }
            
            BI.InsertSaltHarvest(FindObj["ID"], WriteDate, function (error, result) {
                if (error) {
                    BU.log("신규 데이터를 입력하는데 실패하였습니다.");
                    returnObj["IsError"] = 1;
                    returnObj["Message"] = "데이터 입력 형식이 다릅니다.\n확인 후 재시도 해주세요.";
                    _w.render(returnObj);
                    BU.log(error);
                    return;
                }
                returnObj["Message"] = "입력 완료";
                
                
                _w.render(returnObj);
            });
        });
    }
    else {
        BI.InsertSaltHarvestDetail(RecordType, FindObj["ID"], WriteDate, function (error, result) {
            if (error) {
                BU.log("InsertSaltHarvestDetail 신규 데이터를 입력하는데 실패하였습니다.");
                returnObj["IsError"] = 1;
                returnObj["Message"] = "데이터 입력 형식이 다릅니다.\n확인 후 재시도 해주세요.";
                _w.render(returnObj);
                BU.log(error);
                return;
            }
            returnObj["Message"] = "입력 완료";
            
            _w.render(returnObj);
        });
    }
    
}

exports["/RecordView"] = function (req, res) {
    var _w = new WebBase(req, res);
    
    
    var SendObj = {};
    SendObj["WebURL"] = global.setInfo.WebURL;
    

    
    var page = _w.getParam(req, "page");
    var SearchType = _w.getParam(req, "searchType");
    var FirstDate = _w.getParam(req, "firstDate");
    var FirstHour = _w.getParam(req, "firstHour");
    var SecondDate = _w.getParam(req, "secondDate");
    var SecondHour = _w.getParam(req, "secondHour");
    var SaltPlateResultID = _w.getParam(req, "saltPlateResultID");
    var SaltPlateResultName = _w.getParam(req, "saltPlateResultName");
    
    var FirstDateString = FirstDate + " " + FirstHour + ":00:00";
    var SecondDateString = SecondDate + " " + SecondHour + ":00:00";

    
    if (page >>> 0 === parseFloat(page) == false)
        page = "1";
    
    var PageListCount = 5;
    var PageListViewCount = 5;
    
    var SearchObj = {};
    SearchObj["Type"] = SearchType;
    SearchObj["FirstDate"] = FirstDate;
    SearchObj["FirstHour"] = FirstHour;
    SearchObj["SecondDate"] = SecondDate;
    SearchObj["SecondHour"] = SecondHour;
    SearchObj["SaltPlateResultID"] = SaltPlateResultID;
    SearchObj["SaltPlateResultName"] = SaltPlateResultName;
    SearchObj["PageListCount"] = PageListCount;
    SearchObj["PageListViewCount"] = PageListViewCount;

    BU.CLI(SearchObj);
    
    //pageNation 에 셋팅에 필요한 내용
    var pageName = "/RecordView";
    var pageField = "searchType=" + encodeURIComponent(SearchType) + "&firstDate=" + encodeURIComponent(FirstDate) 
    + "&firstHour=" + encodeURIComponent(FirstHour) + "&secondDate=" + encodeURIComponent(SecondDate) + "&secondHour=" + encodeURIComponent(SecondHour) 
    + "&saltPlateResultID=" + encodeURIComponent(SaltPlateResultID) + "";
    
    
    BU.log("pagefield : " + pageField)

    
    var param = { "page": page, "pageName": pageName, "ListCount": PageListCount, "SearchObj": SearchObj }

    
    BI.GetListRecordView(page, SearchObj, function (err, result) {
        if (err) {
            res.send("ERROR");
            return;
        }
        var List = result.ListCategory;
        var PageTotalCount = result.TotalCount; //게시판이라 토탈 카운트 필요함
        

        var PageHtml = BU.getPageHtml(page, pageName, pageField, PageTotalCount, PageListCount);
        
        SendObj["List"] = List;
        SendObj["PageHtml"] = PageHtml;
        SendObj["SearchObj"] = SearchObj;
        SendObj["SaltPondObjList"] = global.main.Salt.SaltData["SaltPlateList"];
        
        //BU.CLI(List);

        
        html = _w.getHtmlPage("/RecordView.html", SendObj);
        res.send(html);

        return;
    });

    
    //var _w = new WebBase(req, res);
    //html = _w.getHtmlPage("/RecordView.html", SendObj);
    //res.send(html);
}

exports["/CodeTest"] = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    var Map = global.mapImg;
    
    var returnObj = {};
    //returnObj["WebURL"] = global.setInfo.WebURL;
    //returnObj["MapImg"] = JSON.stringify(global.mapImg);
    //returnObj["MapRelation"] = JSON.stringify(global.mapRelation);
    //returnObj["SimpleControlList"] = global.main.Salt.SaltData["SimpleControlList"];
    //returnObj["EmergencyControlList"] = global.main.Salt.SaltData["EmergencyControlList"];
    
    
    var _w = new WebBase(req, res);
    html = _w.getHtmlPage("/CodeTest.html", returnObj);
    res.send(html);
}

exports["/OperationView"] = function (req, res) {
    var returnObj = {};
    returnObj["IsError"] = 0;
    returnObj["Message"] = "";

    var self = this;
    var Salt = global.main.Salt;

    var ControlDeviceList = _.union(Salt.SaltData["WaterDoorList"], Salt.SaltData["ValveList"], Salt.SaltData["PumpList"]);
    var OperationControlDeviceList = [];
    _.each(ControlDeviceList, function (ControlDevice) {
        var FindObj = Salt.FindObj(ControlDevice["ID"]).GetStatus();
        if (FindObj["Value"] == "1") {
            
            var ParentList = [];
            var WaterDoorParent = Salt.FindParent(ControlDevice["ID"], "WaterDoor");
            var ValveParent = Salt.FindParent(ControlDevice["ID"], "Valve");
            var Pump = Salt.FindParent(ControlDevice["ID"], "Pump");
            ParentList = _.union(WaterDoorParent, ValveParent, Pump);
            
            var ViewParentList = [];
            _.each(ParentList, function (Parent) {
                if (Parent["Type"] != "WaterWay")
                    ViewParentList.push(Parent);
            });
            
            var ViewDeviceList = [];
            _.each(ViewParentList, function (ViewParent) {
                _.each(ViewParent["SalinityList"], function (Device) {
                    OperationControlDeviceList.push(Device);
                });
                _.each(ViewParent["WaterLevelList"], function (Device) {
                    OperationControlDeviceList.push(Device);
                });
            });
        }
    });

    var OperationDeviceList = _.union(OperationControlDeviceList);
    //BU.CLI(OperationParentList);
    var ViewDeviceList = [];
    if (!BU.isEmpty(OperationDeviceList)) {
        _.each(OperationDeviceList, function (OperationDevice) {
            if (OperationDevice["DeviceType"] == "Serial") {
                ViewDeviceList.push(OperationDevice["BoardID"]);
            }
        });
    }
    
    ViewDeviceList = _.union(ViewDeviceList);

    returnObj["Contents"] = ViewDeviceList;
    
    var _w = new WebBase(req, res);
    _w.render(returnObj);
}



exports["/RainControl"] = function (req, res) {
    var self = this;

    var _w = new WebBase(req, res);
    var main = _w.main;


    self.GCM_Sended = false;
    var Rain_Status = _w.getParam("Rain_Status");
    //global.main.WeatherStatus = {};
    //self.statusWeatherDevice = main.weatherControl.getWeatherDeviceStatus();



    //self.StatusWeatherDevice["Rain_Status"] = Rain_Status;
    //main.WeatherDeviceStatus["Rain_Status"] = self.StatusWeatherDevice["Rain_Status"];
    

    
    
    var SendObj = {};
    SendObj["CMD"] = "RainStart";
    SendObj["Contents"] = main.WeatherDeviceStatus;

    //main.pushServer.emit("SendAllClient", SendObj);

    
    //var changeData = main.weatherControl.originalDeviceData;
    ////changeData.rainfall = predictAmount;
    //changeData.rainValue = Rain_Status * 301;

    //main.weatherControl.emit("updateWeatherDevice", changeData);
    //BU.CLI(changeData);
    
    var predictAmount = main.weatherControl.emit("updateInfraredRainSensor", Rain_Status * 301);



    
    //return;
    //if (Rain_Status == 1) {
    //    if (!self.GCM_Sended) {

    //        BI.GetGCMList(function (err, res) {
    //            if (err) {
    //                BU.log("IsRain err : " + err);
    //                return;
    //            }
    //            BU.log(res);
    //            var GCM_Device_List = res;
    //            BU.log("GCM_Device_List : " + GCM_Device_List);
    //            var GCM = new _gcm.GCM();
    //            //BU.log(global.main.WeatherStats["IsRain_UpdateDate"]);

    //            var currTime = BU.convertDateToText(new Date(), "kor", 6);

    //            //var RainDate = BU.convertDateToText(new Date());

    //            //var substringRainDate = RainDate.substring(0, 10);
    //            ////var SendTextDate = RainDate.substring(0, 4) + "년 ";
    //            //var SendTextDate = RainDate.substring(5, 7) + "월 ";
    //            //SendTextDate = SendTextDate + RainDate.substring(8, 10) + "일 ";
    //            //SendTextDate = SendTextDate + RainDate.substring(11, 13) + "시 ";
    //            //SendTextDate = SendTextDate + RainDate.substring(14, 16) + "분 ";

    //            _.each(GCM_Device_List, function (Device) {
    //                GCM.Send({ "Message": currTime + "부터 비가 내립니다. \r\n염전을 점검하세요.", "status": "rain", "RegIds": [Device["registration_id"]] });
    //                BU.log("비가내립니다");
    //            });
    //            // GCM 전송상태 보냄으로 변경
    //            self.GCM_Sended = true;


    //            main.weatherControl.emit("updateInfraredRainSensor", Rain_Status);


    //            var SendObj = {};
    //            SendObj["CMD"] = "RainStart";
    //            SendObj["Contents"] = self.main.WeatherDeviceStatus;
    //            var PushServer = self.main.PushServer;
    //            PushServer.emit("SendAllClient", SendObj);
    //        });
    //    }
    //}
    //else if (Rain_Status == 0) {
    //    //global.main.WeatherStats["IsRain"] = rain;
    //    self.GCM_Sended = false;
    //}

    
    _w.render(SendObj);
}


exports["/ChangeControlMode"] = function (req, res) {
    var returnObj = {};
    returnObj["CMD"] = "ChangeControlMode";
    returnObj["IsError"] = "0";
    returnObj["Message"] = "완료";
    
    var _w = new WebBase(req, res);
    var Data = {};
    Data["ControlType"] = _w.getParam("ControlType");

    if (!Data["ControlType"] == "Manual" && !Data["ControlType"] == "Auto") {
        returnObj["IsError"] = "1";
        returnObj["Message"] = "적합한 명령이 아닙니다.";
        _w.render(JSON.stringify(returnObj));
        return;
    }
    
    var self = this;
    self.main = global.main;
    var Control = self.main.Control;
    Control.emit("ChangeControlMode", Data["ControlType"], function (err, Result) {
        if (err) {
            returnObj["IsError"] = err["IsError"];;
            returnObj["Message"] = err["Message"];
            _w.render(JSON.stringify(returnObj));
            return;
        }
        
        returnObj["Message"] = Result;
        //BU.log("모드 변경 완료");
        _w.render(returnObj);
    });
}

// 내일 강수 확률
exports["/GetTomorrowPOP"] = function (req, res) {
    var _w = new WebBase(req, res);
    var setInfo = _w.setInfo;
    //
    console.log(setInfo)
    var queryString = "controllerNum=" + setInfo.identificationNum;
    var request = BU.makeRequestUrl("tomorrowPop", setInfo) + "?" + queryString;
    console.log(request)
    BU.requestHttp(BU.makeRequestUrl("tomorrowPop", setInfo) + "?" + queryString, function (err, result) {
        if (err) {
            console.error(err);
            return res.send(err);
        }
        BU.CLI(result)
        var maxPop = result.Contents[0].Max;

        var tomorrow = BU.convertDateToText(new Date().addDays(1), "kor", 2);
        var message = tomorrow.concat("의 강수확률은 " + maxPop + "% 입니다.");
        var gcm = new _gcm.GCM();
        gcm.sendAll(message, "tomorrowPOP");

        return res.send(maxPop);
    })

    

    return;

    //var mysql = require('mysql');
    var TomorrowPOP = "";
    var BaseDate = new Date();
    var Tomorrow = new Date(BaseDate);
    Tomorrow = Tomorrow.setDate(BaseDate.getDate() + 1);
    Tomorrow = BU.convertDateToText(new Date(Tomorrow));
    var TomorrowMin = Tomorrow.substring(0, 10) + " 00:00:00";
    var TomorrowMax = Tomorrow.substring(0, 10) + " 23:00:00";
    




    BI.getTomorrowPop(setInfo.identificationNum, function (err, res, query) {
        if (err) {
            return;
        }
        //BU.CLI("query", query);

        var maxPop = res[0].Max;

        var tomorrow = BU.convertDateToText(new Date().addDays(1), "kor", 2);
        var message = tomorrow.concat("의 강수확률은 " + maxPop + "% 입니다.");
        var gcm = new _gcm.GCM();
        gcm.sendAll(message, "tomorrowPOP");
    })

    _w.render(TomorrowPOP);
}



exports["/MapView"] = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var _w = new WebBase(req, res);

    var setInfo = _w.setInfo;

    var mapObj = _w.mapObj;
    
    var returnObj = {};
    returnObj["webPort"] = setInfo.init.webPort;
    returnObj["MapImg"] = JSON.stringify(mapObj.mapImg);
    returnObj["MapRelation"] = JSON.stringify(mapObj.mapRelation);
    returnObj["SimpleControlList"] = global.main.Salt.SaltData["SimpleControlList"];
    //returnObj["EmergencyControlList"] = global.main.Salt.SaltData["EmergencyControlList"];
    
    //BU.CLI(returnObj)

    html = _w.getHtmlPage("/SaltModelView.html", returnObj);
    res.send(html);
}


exports["/OrderControl"] = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    var _w = new WebBase(req, res);
    
    var returnObj = {};
    returnObj["CMD"] = "OrderControl";
    returnObj["IsError"] = "0";
    returnObj["Message"] = "완료";
    
    var Data = {};
    Data["ControlType"] = "SimpleCMD";
    Data["Src"] = _w.getParam("Src");
    Data["Des"] = _w.getParam("Des");
    Data["RunType"] = _w.getParam("RunType");
    Data["SetWaterLevel"] = _w.getParam("SetWaterLevel");
    //var CMD = Data["Src"] + "~" + Data["Des"];
    BU.log(Data);
    
    var ControlName = "";

    if (Data["RunType"] == "Add")
        ControlName = "OrderControl";
    else if (Data["RunType"] == "Delete")
        ControlName = "CancelControl";

    global.main.Control.emit(ControlName, Data, function (err, result) {
        if (err) {
            BU.log("에러발생");
            returnObj["IsError"] = err.Code;
            returnObj["Message"] = err.Message;
            //BU.CLI(err)
            _w.render(returnObj);
            return;
        }
        
        BU.log(result);
        
        var Src = Data["Src"];
        var Des = Data["Des"];
        
        var AddObj = {};
        AddObj["SrcID"] = global.main.Salt.FindObj(Src).Name;
        AddObj["Des"] = global.main.Salt.FindObj(Des).Name;
        
        returnObj["Contents"] = AddObj;
        
        
        BU.CLI(returnObj);
        //BU.log(JSON.stringify(returnObj));
        //BU.log("정상실행");
        
        _w.render(returnObj);
    });
}


exports["/SaveMapData"] = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var _w = new WebBase(req, res);
    var MAP = _w.getParam("MAP");
    var fs = require('fs');
    fs.writeFile("./map.json", MAP, function (err) {
        if (err) {
            var returnObj = {};
            returnObj["IsError"] = 1;
            returnObj["Message"] = "";
            _w.render(JSON.stringify(returnObj));
            return;

        } else {
            var returnObj = {};
            returnObj["IsError"] = 0;
            returnObj["Message"] = "";
            _w.render(JSON.stringify(returnObj));

            BU.log("맵이 바뀌어 서버를 재시작합니다.");
            setTimeout(function () {
                BU.log("맵이 바뀌어 서버를 재시작합니다.");

                process.exit(1);
            }, 1000);

            return;
        }

    });
}

exports["/GetWeatherDevice"] = function (req, res) {
    var SendObj = {};
    SendObj["CMD"] = "GetWeatherDevice";
    
    var WeatherDeviceStatus = global.main.WeatherDeviceStatus;
    if (BU.isEmpty(WeatherDeviceStatus)) {
        SendObj["IsError"] = 1;
        SendObj["Message"] = "기상관측장비가 등록되지 않았습니다.";
        SendObj["Contents"] = "";
        
        var SendData = BU.makeMessage(SendObj);
    }
    else {
        SendObj["IsError"] = 0;
        SendObj["Message"] = "";
        SendObj["Contents"] = WeatherDeviceStatus;
        var SendData = BU.makeMessage(SendObj);
    }
    var _w = new WebBase(req, res);
    _w.render(SendObj);
}

exports["/GetWeatherCast"] = function (req, res) {
    var SendObj = {};
    SendObj["CMD"] = "GetWeatherCast";
    
    var WeatherCastStatus = global.main.WeatherCastStatus;
    if (BU.isEmpty(WeatherCastStatus)) {
        SendObj["IsError"] = 1;
        SendObj["Message"] = "기상청 일기예보가 등록되지 않았습니다.";
        SendObj["Contents"] = "";
        
        var SendData = BU.makeMessage(SendObj);
    }
    else {
        SendObj["IsError"] = 0;
        SendObj["Message"] = "";
        SendObj["Contents"] = WeatherCastStatus;
        var SendData = BU.makeMessage(SendObj);
    }
    var _w = new WebBase(req, res);
    _w.render(SendObj);
}


//여기는 한번은 실행된다.
var WebBase = function (req, res) {
    var self = this;
    
    self.header = "";
    self.footer = "";
    self.req = req;
    self.res = res;
    //BU.log(self.req);
    
    self.main = global.main;

    self.setInfo = self.main.setInfo;
    self.mapObj = self.main.mapObj;

    
    var htmlView = self.main.htmlView;
    
    //self.ServerURL = self.setInfo.WebURL;
    self._UserInfo = null;


    
    /*  Node Mail 관련
    var SendEmailUser = "noreply@sendchat.net";
    var SendEmailUserPassword = "okskoksk";

    //메일 설정 관련
    var nodemailer = require("nodemailer");
    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: SendEmailUser,
            pass: SendEmailUserPassword
        }
    });
    */


    res.setHeader('X-Powered-By', 'smsoft');


    //해더 셋팅
    self.setHeader = function (Obj) {
        self.header = htmlView.makeView("/Header.html", Obj);
    }
    //푸터 셋팅
    self.setFooter = function (Obj) {
        self.footer = htmlView.makeView("/Footer.html", Obj);
    }
    //기본적인 HTML 가져오기 해더푸터 포함
    self.getHtml = function (linkFileName, resObject) {
        resObject["_w"] = self;
        self.setHeader(resObject);
        self.setFooter(resObject);
        return self.header + htmlView.makeView(linkFileName, resObject) + self.footer;
    }

    self.getHtmlPage = function (linkFileName, resObject, isUseMaster) {
        if (isUseMaster == null || isUseMaster == "" || isUseMaster == "0")
            return htmlView.makeView(linkFileName, resObject);
        else
            return htmlView.makeView("/Header.html", resObject)
                + htmlView.makeView(linkFileName, resObject)
                + htmlView.makeView("/Footer.html", resObject);
    }


    //파라미터 가져오기
    self.getParam = function (name) {
        var returnvalue = "";

        if (req.body[name] !== undefined) {
            returnvalue = req.body[name];
        }
        else if (req.query[name] !== undefined){
            returnvalue = req.query[name];
        }

        return returnvalue;
    }

    self.errorBack = function (Message) {
        var SendMessage = '<script>alert("' + Message + '");history.back(-1)</script>';

        self.res.send(SendMessage);
    }

    self.render = function (Message) {
        self.res.send(Message);
    }


    self.JustGo = function (URL) {
        var SendMessage = '<script>location.href="' + URL + '"</script>';
        self.res.send(SendMessage);
    }

    self.errorGo = function (Message, URL) {
        var SendMessage = '<script>alert("' + Message + '");location.href="' + URL + '"</script>';
        self.res.send(SendMessage);
    }



    self.isEmail = function (value) {
        return BU.isEmail(value);
    }

    self.MRF = function (value) {
        return BU.MRF(value);
    }


    self.convertDateToText = function (dt) {
        return BU.convertDateToText(dt);
    }

    self.Sha256En = function (str) {
        return BU.Sha256En(str);
    }

    self.SendMail = function (SenderEmail, SendName, ReceiverList, Subject, Contents) {

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "" + SendName + " <" + SenderEmail + ">", // sender address
            to: ReceiverList, // list of receivers
            subject: Subject, // Subject line
            //text: MailContents, // plaintext body
            html: Contents // html body
        }

        //메일을 발송한다.
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                BU.log(error);
            } else {
                BU.log("Send Mail To " + response.message);
                BU.log(ReceiverList);
            }
        });



    }


    self.getRandomPassword = function () {
        var str = "1,2,3,4,5,6,7,8,9,0,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z";
        var arry = str.split(",")
        var returnvalue = "";

        for (var i = 0 ; i < 9; i++) {
            returnvalue += _.sample(arry);
        }
        return returnvalue;
    }


    self.AESEn = function (text) {
        var Password = self.setInfo.AES_Key;
        return BU.AESEn(text,Password);

    }
    self.AESDe = function (text) {
        var Password = self.setInfo.AES_Key;
        return BU.AESDe(text,Password);

    }


    self.CheckLogin = function () {
        var req = self.req;
        
        if (req.cookies.Member == undefined) {

            self._UserInfo = {};
            self._UserInfo["MemberIdx"] = "";
            self._UserInfo["NickName"] = "";
            return;
        }

        var LoingKey = req.cookies.Member["LoginKey"];
        var NickName = req.cookies.Member["NickName"];
        var Password = self.setInfo.AES_Key;
        LoingKey = self.AESDe(LoingKey,Password);

        if (LoingKey != "") {
            self._UserInfo = {};
            self._UserInfo["MemberIdx"] = LoingKey;
            self._UserInfo["NickName"] = NickName;
            return;
        }
    }
    self.CheckLogin();

}





