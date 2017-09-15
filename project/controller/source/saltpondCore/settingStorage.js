var _ = require('underscore');
var events = require('events');
var util = require('util');
var fs = require('fs');

// var BU = require('../util/baseUtil.js');
var Model = require('../model/model.js');


/**
염전 클래스 BI 등이 들어있다

@class Salt : 염전
@constructor
**/
var Salt = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.main = global.main;
    self.SaltData = new Object();
    //var Setting = global.mapSetInfo;

    var mapObj = global.mapObj;
    //BU.CLI(mapObj)
    //return;
    var mapImg = mapObj.mapImg;
    var mapSetInfo = mapObj.mapSetInfo;
    var mapRelation = mapObj.mapRelation;
    var mapControl = mapObj.mapControl;

    /**
    수문리스트
    @property SaltData.WaterDoorList : 수문 리스트
    @type Array
    **/
    self.SaltData["WaterDoorList"] = new Array();


    //수위센서 리스트
    self.SaltData["WaterLevelList"] = new Array();

    //배터리센서 리스트
    self.SaltData["BatteryList"] = new Array();

    // 염도센서 리스트
    self.SaltData["SalinityList"] = new Array();

    /**
    밸브 리스트
    @property SaltData.ValveList : 밸프 리스트
    @type Array
    **/
    self.SaltData["ValveList"] = new Array();
    /**
    펌프 리스트
    @property SaltData.PumpList : 펌프 리스트
    @type Array
    **/
    self.SaltData["PumpList"] = new Array();

    /**
    ID를 가진 오브젝트 리스트
    @property SaltData.PumpList : 오브젝트 ID 리스트
    @type Array
    **/
    //self.SaltData["ObjList"] = ["WaterDoorList", "WaterLevelList", "SalinityList", "ValveList", "PumpList"];

    /**
    저수지 리스트
    @property SaltData.ReservoirList : 저수지 리스트
    @type Array
    **/
    self.SaltData["ReservoirList"] = new Array();
    /**
    염판 리스트
    @property SaltData.SaltPlateList : 염판 리스트
    @type Array
    **/
    self.SaltData["SaltPlateList"] = new Array();
    /**
    해주 리스트
    @property SaltData.WaterTankList : 해주 리스트
    @type Array
    **/
    self.SaltData["WaterTankList"] = new Array();

    /**
    바다 리스트
    @property SaltData.WaterOutList : 바다 리스트
    @type Array
    **/
    self.SaltData["WaterOutList"] = new Array();
    /**
    수로 리스트
    @property SaltData.WaterWayList : 수로 리스트
    @type Array
    **/
    self.SaltData["WaterWayList"] = new Array();
    /**
    벨브 상하위 순위 리스트
    @property SaltData.ValveRankList : 벨브 상하위 순위 리스트
    @type Array
    **/
    self.SaltData["ValveRankList"] = new Array();
    /**
    염판 급수 받는 대상 순위 리스트
    @property SaltData.FeedRankList : 염판 급수 받는 대상 순위 리스트
    @type Array
    **/
    self.SaltData["FeedRankList"] = new Array();
    /**
    증발지 설정 염도 도달시 이동할 대상 순위 리스트
    @property SaltData.FeedRankList : 염판 급수 받는 대상 순위 리스트
    @type Array
    **/
    self.SaltData["MaxSalinityFeedRankList"] = new Array();
    /**
    수로의 길 리스트
    @property SaltData.WaterPathList : 수로의 길 리스트
    @type Array
    **/
    //self.SaltData["WaterPathList"] = new Array();
    /**
    명령어 리스트
    @property SaltData.SaltPlateList : 명령어 리스트
    @type Array
    **/
    self.SaltData["SimpleControlList"] = new Array();
    //self.SaltData["AutomationControlList"] = new Array();
    self.SaltData["SettingControlList"] = new Array();
    self.SaltData["RainControlList"] = new Array();

    self.SaltData["Map"] = {};

    self.DeviceList = function () {
        var returnvalue = {};
        returnvalue["WaterDoorList"] = self.SaltData["WaterDoorList"];
        returnvalue["WaterLevelList"] = self.SaltData["WaterLevelList"];
        returnvalue["SalinityList"] = self.SaltData["SalinityList"];
        returnvalue["ValveList"] = self.SaltData["ValveList"];
        returnvalue["PumpList"] = self.SaltData["PumpList"];
        return returnvalue;
    }

    self.FindObj = function (ID) {
        var returnvalue = null;
        var UnionArray = _.union(
            self.SaltData["WaterDoorList"],
            self.SaltData["WaterLevelList"],
            self.SaltData["SalinityList"],
            self.SaltData["ValveList"],
            self.SaltData["PumpList"],
            self.SaltData["ReservoirList"],
            self.SaltData["SaltPlateList"],
            self.SaltData["WaterTankList"],
            self.SaltData["WaterOutList"],
            self.SaltData["WaterWayList"])
        return UnionArray.findArrayElementById(ID);
    }

    self.FindObjByDeviceType = function (ID, DeviceType) {
        if (DeviceType != "")
            return self.SaltData[DeviceType].findArrayElementById(ID);
        else {
            var UnionArray = _.union(
                self.SaltData["WaterDoorList"],
                self.SaltData["WaterLevelList"],
                self.SaltData["SalinityList"],
                self.SaltData["ValveList"],
                self.SaltData["PumpList"]);

            return UnionArray.findArrayElementsByBoardid(ID);
        }
    }

    self.FindControlDeviceObj = function (ID) {
        var returnvalue = null;
        var UnionArray = _.union(
            self.SaltData["WaterDoorList"],
            self.SaltData["WaterLevelList"],
            self.SaltData["SalinityList"],
            self.SaltData["ValveList"],
            self.SaltData["PumpList"]);
        return UnionArray.findArrayElementById(ID);
    }

    self.FindParent = function (ID, Reference) {
        var returnvalue = [];
        var ReferenceValue = Reference + "List";
        var UnionArray = _.union(
            self.SaltData["ReservoirList"],
            self.SaltData["SaltPlateList"],
            self.SaltData["WaterTankList"],
            self.SaltData["WaterOutList"]);

        _.each(UnionArray, function (TargetArray) {
            _.each(TargetArray[ReferenceValue], function (Obj) {
                var Target = Obj.GetStatus();
                if (Target["ID"] == ID) returnvalue.push(TargetArray);
            });
        });
        return returnvalue;
    }

    self.FindParentSalinity = function (ID) {
        var returnvalue = [];
        var UnionArray = _.union(
            self.SaltData["ReservoirList"],
            self.SaltData["SaltPlateList"],
            self.SaltData["WaterTankList"],
            self.SaltData["WaterOutList"]);

        _.each(UnionArray, function (TargetArray) {
            _.each(TargetArray["SalinityList"], function (SalinityObj) {
                var Target = SalinityObj.GetStatus();
                if (Target["ID"] == ID) returnvalue.push(TargetArray);
            });
        });
        return returnvalue;
    }

    self.FindParentWaterLevel = function (ID) {
        var returnvalue = [];
        var UnionArray = _.union(
            self.SaltData["ReservoirList"],
            self.SaltData["SaltPlateList"],
            self.SaltData["WaterTankList"]);

        _.each(UnionArray, function (TargetArray) {
            _.each(TargetArray["WaterLevelList"], function (WaterLevelObj) {
                var Target = WaterLevelObj.GetStatus();
                if (Target["ID"] == ID) returnvalue.push(TargetArray);
            });
        });
        return returnvalue;
    }


    var GetWaterDoorType = function (BaseObj, TargetID) {
        var MapRelationArray = _.union(mapRelation["SaltPlateData"], mapRelation["WaterTankData"], mapRelation["WaterOutData"], mapRelation["ReservoirData"], mapRelation["WaterWayData"]);
        var ContainWaterDoorTargetList = [];

        _.each(MapRelationArray, function (RelationData) {
            var IsContains = _.contains(RelationData["ListWaterDoor"], TargetID);
            if (IsContains && BaseObj["ID"] != RelationData["ID"])
                ContainWaterDoorTargetList.push(RelationData);
        });

        var returnType = "Under";
        _.each(ContainWaterDoorTargetList, function (Target) {
            if (BaseObj["Depth"] < Target["Depth"])
                returnType = "Over";
            else if (BaseObj["Depth"] == Target["Depth"] && BaseObj["ID"] != TargetID) {
                returnType = "Equal";
                var WaterDoorObj = self.FindObj(TargetID);
                WaterDoorObj["IsEqualWaterDoor"] = "1";
            }

        });
        return returnType;
    }

    /**
    이벤트를 받으면 염전의 데이터를 셋팅한다.
    @event SettingData : 염전 데이터 셋팅
    **/
    this.on("SettingData", function () {
        // BU.CLI(mapSetInfo)
        _.each(mapSetInfo["WaterDoorData"], function (Data) {
            var AddObj = new Model.WaterDoor();
            AddObj["ID"] = Data["ID"];
            AddObj["DeviceType"] = Data["DeviceType"];
            AddObj["BoardID"] = Data["BoardID"];
            AddObj["IP"] = Data["IP"];
            AddObj["Port"] = Data["Port"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            self.SaltData["WaterDoorList"].push(AddObj);
        });

        _.each(mapSetInfo["WaterLevelData"], function (Data) {
            var AddObj = new Model.WaterLevel();
            AddObj["ID"] = Data["ID"];
            AddObj["DeviceType"] = Data["DeviceType"];
            AddObj["BoardID"] = Data["BoardID"];
            AddObj["IP"] = Data["IP"];
            AddObj["Port"] = Data["Port"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);

            var WL_Number = Data["ID"].substring(2);

            /********************************************/
            if (WL_Number < 5) {
                AddObj.socketValue = AddObj["Value"] = 5;

            }
            if (WL_Number >= 7)
                AddObj.socketValue = AddObj["Value"] = 80;

            //if (WL_Number == 23)
            //    AddObj["Value"] = 20;
            //if (WL_Number > 23)
            //    AddObj["Value"] = 90;

            /********************************************/

            self.SaltData["WaterLevelList"].push(AddObj);
        });

        _.each(mapSetInfo["SalinityData"], function (Data) {
            var AddObj = new Model.Salinity();
            AddObj["ID"] = Data["ID"];
            AddObj["DeviceType"] = Data["DeviceType"];
            AddObj["BoardID"] = Data["BoardID"];
            AddObj["IP"] = Data["IP"];
            AddObj["Port"] = Data["Port"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);


            /********************************************/
            var S_Number = Data["ID"].substring(1);
            //BU.log(WL_Number)
            AddObj["Value"] = 10;

            //if (S_Number == 23)
            //    AddObj["Value"] = 5;
            //if (S_Number == 24)
            //    AddObj["Value"] = 12;
            //if (S_Number == 25)
            //    AddObj["Value"] = 15;
            //if (S_Number == 26)
            //    AddObj["Value"] = 18;
            //if (S_Number == 27)
            //    AddObj["Value"] = 18;

            if (S_Number == 7)
                AddObj["Value"] = 15;
            if (S_Number == 8)
                AddObj["Value"] = 20;

            /********************************************/

            self.SaltData["SalinityList"].push(AddObj);
        });

        _.each(mapSetInfo["ValveData"], function (Data) {
            var AddObj = new Model.Valve();
            AddObj["ID"] = Data["ID"];
            AddObj["DeviceType"] = Data["DeviceType"];
            AddObj["BoardID"] = Data["BoardID"];
            AddObj["IP"] = Data["IP"];
            AddObj["Port"] = Data["Port"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);

            self.SaltData["ValveList"].push(AddObj);
        });

        _.each(mapSetInfo["PumpData"], function (Data) {
            var AddObj = new Model.Pump();
            AddObj["ID"] = Data["ID"];
            AddObj["DeviceType"] = Data["DeviceType"];
            AddObj["BoardID"] = Data["BoardID"];
            AddObj["IP"] = Data["IP"];
            AddObj["Port"] = Data["Port"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            AddObj["ValveInfo"] = [];

            self.SaltData["PumpList"].push(AddObj);
        });

        _.each(mapRelation["ReservoirData"], function (Data) {
            var AddObj = new Model.Reservoir();
            AddObj["ID"] = Data["ID"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            AddObj["SettingSalinity"] = Data["SettingSalinity"];
            AddObj["MinWaterLevel"] = Data["MinWaterLevel"];
            AddObj["MaxWaterLevel"] = Data["MaxWaterLevel"];

            AddObj["WaterDoorList"] = new Array();
            AddObj["InWaterDoorList"] = new Array();
            AddObj["EqualWaterDoorList"] = new Array();
            AddObj["OutWaterDoorList"] = new Array();

            AddObj["ValveList"] = new Array();
            AddObj["PumpList"] = new Array();

            _.each(Data["ListWaterDoor"], function (DoorID) {
                var DoorObj = self.SaltData["WaterDoorList"].findArrayElementById(DoorID);
                AddObj["WaterDoorList"].push(DoorObj);
                returnType = GetWaterDoorType(AddObj, DoorID);
                if (returnType == "Over")
                    AddObj["InWaterDoorList"].push(DoorObj);
                else if (returnType == "Equal")
                    AddObj["EqualWaterDoorList"].push(DoorObj);
                else
                    AddObj["OutWaterDoorList"].push(DoorObj);
            });

            _.each(Data["ListValve"], function (PumpID) {
                var PumpObj = self.SaltData["ValveList"].findArrayElementById(PumpID);
                AddObj["ValveList"].push(PumpObj);
            });

            _.each(Data["ListPump"], function (PumpID) {
                var PumpObj = self.SaltData["PumpList"].findArrayElementById(PumpID);
                AddObj["PumpList"].push(PumpObj);
            });
            self.SaltData["ReservoirList"].push(AddObj);
        });

        _.each(mapRelation["SaltPlateData"], function (Data) {
            var AddObj = new Model.SaltPlate();
            AddObj["ID"] = Data["ID"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            AddObj["Depth"] = Data["Depth"];
            AddObj["PlateType"] = Data["PlateType"];
            AddObj["SettingSalinity"] = Data["SettingSalinity"];
            AddObj["MinWaterLevel"] = Data["MinWaterLevel"];
            AddObj["MaxWaterLevel"] = Data["MaxWaterLevel"];
            AddObj["WaterDoorList"] = new Array();
            AddObj["InWaterDoorList"] = new Array();
            AddObj["EqualWaterDoorList"] = new Array();
            AddObj["OutWaterDoorList"] = new Array();
            AddObj["PumpList"] = new Array();
            AddObj["ValveList"] = new Array();
            AddObj["WaterLevelList"] = new Array();
            AddObj["SalinityList"] = new Array();

            _.each(Data["ListWaterDoor"], function (DoorID) {
                var DoorObj = self.SaltData["WaterDoorList"].findArrayElementById(DoorID);
                AddObj["WaterDoorList"].push(DoorObj);
                returnType = GetWaterDoorType(AddObj, DoorID);
                if (returnType == "Over")
                    AddObj["InWaterDoorList"].push(DoorObj);
                else if (returnType == "Equal")
                    AddObj["EqualWaterDoorList"].push(DoorObj);
                else
                    AddObj["OutWaterDoorList"].push(DoorObj);
            });

            _.each(Data["ListValve"], function (valveID) {
                var valveObj = self.SaltData["ValveList"].findArrayElementById(valveID);
                AddObj["ValveList"].push(valveObj);
            });

            _.each(Data["ListPump"], function (PumpID) {
                var PumpObj = self.SaltData["PumpList"].findArrayElementById(PumpID);
                AddObj["PumpList"].push(PumpObj);
            });
            _.each(Data["ListWaterLevel"], function (WaterLevelID) {
                var WaterLevelObj = self.SaltData["WaterLevelList"].findArrayElementById(WaterLevelID);
                AddObj["WaterLevelList"].push(WaterLevelObj);
            });

            _.each(Data["ListSalinity"], function (SalinityID) {
                var SalinityObj = self.SaltData["SalinityList"].findArrayElementById(SalinityID);
                AddObj["SalinityList"].push(SalinityObj);
            });
            self.SaltData["SaltPlateList"].push(AddObj);
        });
        _.each(mapRelation["WaterTankData"], function (Data) {
            var AddObj = new Model.WaterTank();
            AddObj["ID"] = Data["ID"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            AddObj["Depth"] = Data["Depth"];
            AddObj["TankType"] = Data["TankType"];
            AddObj["SettingSalinity"] = Data["SettingSalinity"];
            AddObj["MinWaterLevel"] = Data["MinWaterLevel"];
            AddObj["MaxWaterLevel"] = Data["MaxWaterLevel"];

            AddObj["WaterDoorList"] = new Array();
            AddObj["InWaterDoorList"] = new Array();
            AddObj["EqualWaterDoorList"] = new Array();
            AddObj["OutWaterDoorList"] = new Array();

            AddObj["PumpList"] = new Array();
            AddObj["ValveList"] = new Array();

            AddObj["WaterLevelList"] = new Array();
            AddObj["SalinityList"] = new Array();

            _.each(Data["ListWaterDoor"], function (DoorID) {
                var DoorObj = self.SaltData["WaterDoorList"].findArrayElementById(DoorID);
                AddObj["WaterDoorList"].push(DoorObj);
                returnType = GetWaterDoorType(AddObj, DoorID);
                if (returnType == "Over")
                    AddObj["InWaterDoorList"].push(DoorObj);
                else if (returnType == "Equal")
                    AddObj["EqualWaterDoorList"].push(DoorObj);
                else
                    AddObj["OutWaterDoorList"].push(DoorObj);
            });

            _.each(Data["ListValve"], function (PumpID) {
                var PumpObj = self.SaltData["ValveList"].findArrayElementById(PumpID);
                AddObj["ValveList"].push(PumpObj);
            });

            _.each(Data["ListPump"], function (PumpID) {
                var PumpObj = self.SaltData["PumpList"].findArrayElementById(PumpID);
                AddObj["PumpList"].push(PumpObj);
            });
            _.each(Data["ListWaterLevel"], function (WaterLevelID) {
                var WaterLevelObj = self.SaltData["WaterLevelList"].findArrayElementById(WaterLevelID);
                AddObj["WaterLevelList"].push(WaterLevelObj);
            });

            _.each(Data["ListSalinity"], function (SalinityID) {
                var SalinityObj = self.SaltData["SalinityList"].findArrayElementById(SalinityID);
                AddObj["SalinityList"].push(SalinityObj);
            });

            self.SaltData["WaterTankList"].push(AddObj);
        });


        _.each(mapRelation["WaterOutData"], function (Data) {
            var AddObj = new Model.WaterOut();
            AddObj["ID"] = Data["ID"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            AddObj["SettingSalinity"] = Data["SettingSalinity"];
            AddObj["Depth"] = Data["Depth"];

            AddObj["WaterDoorList"] = new Array();
            AddObj["InWaterDoorList"] = new Array();
            AddObj["EqualWaterDoorList"] = new Array();
            AddObj["OutWaterDoorList"] = new Array();


            _.each(Data["ListWaterDoor"], function (DoorID) {
                var DoorObj = self.SaltData["WaterDoorList"].findArrayElementById(DoorID);
                AddObj["WaterDoorList"].push(DoorObj);
                returnType = GetWaterDoorType(AddObj, DoorID);
                if (returnType == "Over")
                    AddObj["InWaterDoorList"].push(DoorObj);
                else if (returnType == "Equal")
                    AddObj["EqualWaterDoorList"].push(DoorObj);
                else
                    AddObj["OutWaterDoorList"].push(DoorObj);
            });

            self.SaltData["WaterOutList"].push(AddObj);
        });


        _.each(mapRelation["WaterWayData"], function (Data) {
            var AddObj = new Model.WaterWay();
            AddObj["ID"] = Data["ID"];
            AddObj["Name"] = BU.getFindName(mapImg, Data["ID"]);
            AddObj["Depth"] = Data["Depth"];

            AddObj["WaterDoorList"] = new Array();
            AddObj["InWaterDoorList"] = new Array();
            AddObj["EqualWaterDoorList"] = new Array();
            AddObj["OutWaterDoorList"] = new Array();


            _.each(Data["ListWaterDoor"], function (DoorID) {
                var DoorObj = self.SaltData["WaterDoorList"].findArrayElementById(DoorID);
                AddObj["WaterDoorList"].push(DoorObj);
                returnType = GetWaterDoorType(AddObj, DoorID);
                if (returnType == "Over")
                    AddObj["InWaterDoorList"].push(DoorObj);
                else if (returnType == "Equal")
                    AddObj["EqualWaterDoorList"].push(DoorObj);
                else
                    AddObj["OutWaterDoorList"].push(DoorObj);
            });

            self.SaltData["WaterWayList"].push(AddObj);
        });

        //BU.CLI(self.SaltData["WaterWayList"]);

        _.each(mapRelation["ValveRankData"], function (Data) {
            var AddObj = {};
            AddObj["ID"] = Data["ID"];
            AddObj["High"] = new Array();
            AddObj["Low"] = new Array();

            _.each(Data["High"], function (High) {
                AddObj["High"].push(_.clone(High));
            });
            _.each(Data["Low"], function (Low) {
                AddObj["Low"].push(_.clone(Low));
            });
            self.SaltData["ValveRankList"].push(AddObj);
        });

        _.each(mapRelation["FeedRankData"], function (Data) {
            var AddObj = {};
            AddObj["ID"] = Data["ID"];
            AddObj["Rank"] = new Array();
            _.each(Data["Rank"], function (Rank) {
                AddObj["Rank"].push(_.clone(Rank));
            });
            self.SaltData["FeedRankList"].push(AddObj);
        });

        _.each(mapRelation["MaxSalinityFeedRankData"], function (Data) {
            var AddObj = {};
            AddObj["ID"] = Data["ID"];
            AddObj["Rank"] = new Array();
            _.each(Data["Rank"], function (Rank) {
                AddObj["Rank"].push(_.clone(Rank));
            });
            self.SaltData["MaxSalinityFeedRankList"].push(AddObj);
        });

        _.each(mapControl["SimpleMode"], function (List) {
            var AddObj = {};
            AddObj["Src"] = List["SrcID"];
            AddObj["DesList"] = new Array();
            var SrcName = BU.getFindName(mapImg, List["SrcID"]);
            _.each(List["DesList"], function (Des) {
                if (Des["Type"] != "Emulator") {
                    var AddDes = {};
                    AddDes["Des"] = Des["DesID"];
                    var DesName = BU.getFindName(mapImg, AddDes["Des"]);
                    AddDes["Name"] = SrcName + " → " + DesName;
                    AddDes["True"] = Des["True"];
                    AddDes["False"] = Des["False"];
                    AddObj["DesList"].push(AddDes);
                }
            });
            self.SaltData["SimpleControlList"].push(AddObj);
        });

        _.each(mapControl["SettingMode"], function (List) {
            var AddObj = {};
            AddObj["ID"] = List["ID"];
            AddObj["True"] = List["True"];
            AddObj["False"] = List["False"];
            self.SaltData["SettingControlList"].push(AddObj);
        });

        _.each(mapControl["RainMode"], function (List) {
            var AddObj = {};
            AddObj["GroupID"] = List["GroupID"];
            AddObj["GroupName"] = List["GroupName"];
            AddObj["GroupElement"] = List["GroupElement"];
            AddObj["DesList"] = new Array();
            _.each(List["DesList"], function (Des) {
                var AddDes = {};
                AddDes["Des"] = Des["DesID"];
                AddDes["Delay"] = Des["Delay"];
                var DesName = BU.getFindName(mapImg, AddDes["Des"]);
                AddDes["Name"] = List["GroupName"] + " → " + DesName;
                AddDes["True"] = Des["True"];
                AddDes["False"] = Des["False"];
                AddObj["DesList"].push(AddDes);
            });
            self.SaltData["RainControlList"].push(AddObj);
        });


        //Map 데이터 셋팅
        self.SaltData["Map"] = mapSetInfo["Map"]
        self.main.emit("SettingDataEnd");

    });
    /**
    데이터 셋팅 완료 후 받는 이벤트
    @event SettingDataEnd : 염전 데이터 셋팅 완료
    **/
    //this.on("SettingDataEnd", function () {
    //    BU.log("SettingDataEnd")
    //});
}


util.inherits(Salt, events.EventEmitter);
exports.Salt = Salt;