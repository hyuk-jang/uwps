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
  self.initTest = function () {
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