var _ = require("underscore");

// var BU = require("../util/baseUtil.js");
var daoC = require("./daoClient.js");
var setInfo = require("../../config.js").setInfo;

/************************************************************************
                            controller
************************************************************************/

// 염전 GCM 보낼 장치 정보 조회
exports.getGcmDevice = function (deviceKey, callback) {
    var sql = "SELECT * FROM GCM_Device WHERE devicekey = '" + BU.MRF(deviceKey) + "' "

    daoC.doQuery(sql, callback);
}

// GCM Device 정보 등록
exports.insertGcmDevice = function (member_seq, devicekey, registration_id, callback) {
    var sql = " INSERT INTO `gcm_device` (`member_seq`, `devicekey`, `registration_id`, `writedate`, `updatedate`) " +
        "VALUES (" + BU.MRF(member_seq) + ", '" + BU.MRF(devicekey) + "', '" + BU.MRF(registration_id) + "', now(), now()) ";

    daoC.doQuery(sql, callback);
}

// GCM Device 정보 수정
exports.updateGcmDevice = function (gcm_device_seq, member_seq, devicekey, registration_id, callback) {
    var sql = " UPDATE `gcm_device` SET registration_id='" + BU.MRF(registration_id) + "'";
    sql += " ,member_seq = '" + BU.MRF(member_seq) + "'";
    sql += " , devicekey='" + BU.MRF(devicekey) + "'";
    sql += " , updatedate=now()"
    sql += " WHERE  `gcm_device_seq`= " + gcm_device_seq + " ";
    
    daoC.doQuery(sql, callback);
}

// Gcm Devie 삭제
exports.deleteGcmDevice = function (gcm_device_seq, callback) {
    var sql = " DELETE FROM gcm_device WHERE devicekey = '" + BU.MRF(DeviceKey) + "'  ";
    daoC.doQuery(sql, callback);
}
    
    
// 염전 통합서버 정보 조회
exports.GetGCMList = function (callback) {
    var sql = "select * from gcm_device";

    daoC.doQuery(sql, callback);

}

// 알람 저장
exports.InsertAlarm = function (Alarm, callback) {
    BU.CLIS(Alarm)
    //_.each(AlarmList, function (Alarm) {
        sql = "INSERT INTO alarm (device_id, alarm_type, message, writedate) VALUES";
        sql += " (" + Alarm["Device_ID"] + ", " + Alarm["Alarm_Type"] + ", " + Alarm["Message"] + ", '" + BU.convertDateToText(new Date()) + "')";
        daoC.doQuery(sql, callback);
    //});
}

// 생산정보 저장
exports.InsertProductInfo = function (ProductInfo, callback) {
    //BU.log("InsertProductInfo");
    //BU.CLIS(ProductInfo)
    //_.each(AlarmList, function (Alarm) {
    sql = "INSERT INTO product_info (give_id, give_prev_waterlevel, give_prev_salinity, give_after_waterlevel, give_after_salinity";
    sql += "  , receive_id, receive_prev_waterlevel, receive_prev_salinity, receive_after_waterlevel, receive_after_salinity";
    sql += " , startdate, enddate) VALUES ";
    sql += " ('" + ProductInfo["Give_ID"] + "', " + ProductInfo["Give_Prev_WaterLevel"] + ", " + ProductInfo["Give_Prev_Salinity"] + ", " + ProductInfo["Give_After_WaterLevel"] + ", " + ProductInfo["Give_After_Salinity"] + "";
    sql += " ,'" + ProductInfo["Receive_ID"] + "', " + ProductInfo["Receive_Prev_WaterLevel"] + ", " + ProductInfo["Receive_Prev_Salinity"] + ", " + ProductInfo["Receive_After_WaterLevel"] + ", " + ProductInfo["Receive_After_Salinity"] + "";
    sql += " ,'" + BU.convertDateToText(new Date()) + "', null)";
    //BU.log(sql);
    daoC.doQuery(sql, callback);
}

// 생산정보 수정 입력
exports.UpdateProductInfo = function (ProductInfo, callback) {
    //BU.CLIS(ProductInfo)
    //BU.log("UpdateProductInfo");
    var sql = "UPDATE product_info SET";
    sql += "	give_after_waterlevel = " + ProductInfo["Give_After_WaterLevel"] + "";
    sql += "	,give_after_salinity = " + ProductInfo["Give_After_Salinity"] + "";
    sql += "	,receive_after_waterlevel = " + ProductInfo["Receive_After_WaterLevel"] + "";
    sql += "	,receive_after_salinity = " + ProductInfo["Receive_After_Salinity"] + "";
    sql += "	,enddate = '" + BU.convertDateToText(new Date()) + "'";
    sql += "WHERE";
    sql += "	product_info_seq = " + ProductInfo["ProductInfoSeq"] + "";
    //BU.log(sql);
    daoC.doQuery(sql, callback);
}


// 염전 통합서버 정보 조회
exports.GetSaltHarvest = function (SaltpondID, callback) {
    BU.log("GetSaltHarvest");
    var AddSql = "";
    if (SaltpondID !== "") {
        AddSql = " WHERE saltpond_id = '" + SaltpondID + "' ORDER BY salt_harvest_seq DESC";
    }

    var sql = "select * from salt_harvest";
    sql += AddSql;
    sql += " Limit 1";
    daoC.doQuery(sql, callback);
}

exports.InsertSaltHarvest = function (SaltPondID, WriteDate, callback){
    //BU.log("InsertSaltHarvest");
    var sql = "SELECT * FROM salt_harvest WHERE ";
    sql += "saltpond_id = '" + SaltPondID + "'";
    sql += " ORDER  BY salt_harvest_seq DESC LIMIT 1";

    daoC.doQuery(sql, function (err, res) {
        if (err) {
            callback(err);
            return;
        }

        var Prev = {};
        var AddSql = "0";

        if (!BU.isEmpty(res)) {
            Prev = res[0];
            AddSql = Prev["salt_harvest_seq"];
        }
        sql = "INSERT INTO salt_harvest (saltpond_id, prev_salt_harvest_seq, writedate) VALUES ";
        sql += " ('" + SaltPondID + "', ";
        sql += AddSql;
        sql += " , '" + WriteDate + "')";
        //BU.log(sql);
        daoC.doQuery(sql, callback);
    });

}
    
exports.InsertSaltHarvestDetail = function (RecordType, SaltPondID, WriteDate, callback) {
    //BU.log("InsertSaltHarvest");
 
    sql = "INSERT INTO salt_harvest_detail (saltpond_id, input_type, writedate) VALUES ";
    sql += " ('" + SaltPondID + "'";
    sql += " , '" + RecordType + "'";
    sql += " , '" + WriteDate + "')";
    //BU.log(sql);
    daoC.doQuery(sql, callback);
}
    
    
    
// 안쓰는 구문이기 때문에 내부에 임시로 로직을 작성함. 
exports.GetListRecordView = function (page, SearchObj, callback){
    BU.log("GetListRecordView");
        
    var SaltPondObjList = _.union(
        global.main.Salt.SaltData["ReservoirList"],
        global.main.Salt.SaltData["SaltPlateList"],
        global.main.Salt.SaltData["WaterTankList"],
        global.main.Salt.SaltData["WaterOutList"]);
        
    var returnvalue = [];
        
    var FirstDate = SearchObj["FirstDate"] + " " + SearchObj["FirstHour"] + ":00:00";
    var SecondDate = SearchObj["SecondDate"] + " " + SearchObj["SecondHour"] + ":00:00";
        
    var FirstDATESQL = "";
    var SecondDATESQL = "";
    var SaltPlateSQL = "";
    if (SearchObj["Type"] === "ALL") {

    }
    else if (SearchObj["Type"] === "DATE") {
        FirstDATESQL = " AND IF(main.writedate > '" + FirstDate + "', 1, 0) = 1 "
        SecondDATESQL = " AND IF(main.writedate < '" + SecondDate + "', 1, 0) = 1 ";
    }
    else if (SearchObj["Type"] === "SALTPLATE") {
        SaltPlateSQL = "AND main.saltpond_id = '" + SearchObj["SaltPlateResultID"] + "'";
    }
        
    var ps = (page - 1) * SearchObj["PageListCount"];
        
        
    var sql = "SELECT Count(*) " 
    sql += " FROM   (SELECT main.*, "
    sql += "               (SELECT sub.writedate "
    sql += "                FROM   salt_harvest sub "
    sql += "                WHERE  main.prev_salt_harvest_seq = sub.salt_harvest_seq ) AS "
    sql += "                      prevwritedate, "
    sql += "               (SELECT third.give_id "
    sql += "                FROM   product_info third "
    sql += "                WHERE  third.receive_id = main.saltpond_id "
    sql += "                       AND IF(third.enddate < main.writedate, 1, 0) = 1 "
    sql += "                       AND IF(third.enddate > prevwritedate, 1, 0) = 1 "
    sql += "                       AND third.give_id LIKE 'WT%' "
    sql += "                ORDER  BY third.enddate DESC "
    sql += "                LIMIT  1)                                                 AS "
    sql += "                      lastgiveobj "
    sql += "        FROM   salt_harvest main "
    sql += "        WHERE  main.prev_salt_harvest_seq != 0 "
    sql += SaltPlateSQL;
    sql += FirstDATESQL;
    sql += SecondDATESQL;
    sql += "        ORDER  BY main.salt_harvest_seq DESC) cnt";
  
    BU.log(sql);
    daoC.doQuery(sql, function (err, res, field) {
        if (err) {
            BU.CLI(err);
            return;
        }
        //BU.CLIS(res);
        //BU.CLIS(field);
        var pageList = 5;
            
        var totalCount = res[0]["Count(*)"];
        returnvalue["TotalCount"] = totalCount;
            
        var sql = ""
        sql += "SELECT Result.*, "
        sql += "       fourth.* "
        sql += "FROM   (SELECT main.*, "
        sql += "               (SELECT sub.writedate "
        sql += "                FROM   salt_harvest sub "
        sql += "                WHERE  main.prev_salt_harvest_seq = sub.salt_harvest_seq "
        sql += "               )"
        sql += "               AS "
        sql += "               prevwritedate, "
        sql += "               (SELECT third.give_id "
        sql += "                FROM   product_info third "
        sql += "                WHERE  third.receive_id = main.saltpond_id "
        sql += "                       AND IF(third.enddate < main.writedate, 1, 0) = 1 "
        sql += "                       AND IF(third.enddate > prevwritedate, 1, 0) = 1 "
        sql += "                       AND third.give_id LIKE 'WT%' "
        sql += "                ORDER  BY third.enddate DESC "
        sql += "                LIMIT  1) "
        sql += "               AS "
        sql += "                      lastgiveobj "
        sql += "        FROM   salt_harvest main "
        sql += "        WHERE  main.prev_salt_harvest_seq != 0 "
        sql += SaltPlateSQL;
        sql += FirstDATESQL;
        sql += SecondDATESQL;
        sql += "        ORDER  BY main.salt_harvest_seq DESC "
        sql += "        LIMIT " + ps + ", " + SearchObj["PageListViewCount"] + ") result"
        sql += "       LEFT OUTER JOIN product_info fourth "
        sql += "                    ON (fourth.receive_id = Result.lastgiveobj "
        sql += "                       AND IF(fourth.enddate < Result.writedate, 1, 0) = 1 "
        sql += "                       AND IF(fourth.enddate > Result.prevwritedate, 1, 0) = 1)";
        sql += "                    OR (fourth.give_id = Result.lastgiveobj "
        sql += "                       AND IF(fourth.enddate < Result.writedate, 1, 0) = 1 "
        sql += "                       AND IF(fourth.enddate > Result.prevwritedate, 1, 0) = 1)";
        sql += "       ORDER  BY result.salt_harvest_seq DESC ";
        BU.log(sql);
        daoC.doQuery(sql, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
                
            var ListCategory = [];
            var ListContents = [];
                
            _.each(result, function (res) {
                var Salt = global.main.Salt;
                var AddObj = {};
                    
                if (res["saltpond_id"] === null)
                    return;
                    
                var RemainSec = parseInt(res["writedate"] - res["prevwritedate"]) / 1000;
                //var diffSec = diffMilSec / 1000;
                //var diffMin = diffSec / 60;
                //var diffHour = diffMin / 60;
                //var diffDay = diffHour / 24;
                    
                var TotalRemainHour = parseInt(RemainSec / 60 / 60);
                var RemainDay = parseInt(RemainSec / 60 / 60 / 24);
                RemainSec = (RemainSec - (RemainDay * 60 * 60 * 24));
                var RemainHour = parseInt(RemainSec / 60 / 60);
                RemainSec = (RemainSec - (RemainHour * 60 * 60));
                var RemainMin = parseInt(RemainSec / 60);
                RemainSec = parseInt(RemainSec - (RemainMin * 60));
                    

                var getMonth = Number(res["writedate"].getMonth()) + 1;
                var Class = "";
                    
                var Score = 0;

                if (getMonth < 5)
                    Score = 60;
                else if (getMonth > 10)
                    Score = 60;
                else if (getMonth < 7)
                    Score = 80;
                else if (getMonth > 9)
                    Score = 80;
                else
                    Score = 100;
                    
                var variable = 0;
                    
                if (TotalRemainHour < 12)
                    variable = 1.3;
                else if (TotalRemainHour < 18)
                    variable = 1.2;
                else if (TotalRemainHour < 24)
                    variable = 1.1;
                else if (TotalRemainHour < 30)
                    variable = 1.0;
                else if (TotalRemainHour < 36)
                    variable = 0.95;
                else if (TotalRemainHour < 42)
                    variable = 0.9;
                else
                    variable = 0.85;
                    
                var ResultScore = Score * variable;
                var ResultGray = "";
                if (ResultScore >= 90)
                    Class = "A";
                else if (ResultScore >= 80)
                    Class = "B";
                else if (ResultScore >= 70)
                    Class = "C";
                else
                    Class = "D";
                    
                //BU.log("TotalRemainHour : " + TotalRemainHour)
                //BU.log("ResultScore : " + ResultScore)
                //BU.log("Class : " + Class)
                    
                var FindObj = Salt.FindObj(res["saltpond_id"]);
                    
                AddObj["salt_harvest_seq"] = res["salt_harvest_seq"];
                AddObj["saltpond_id"] = res["saltpond_id"];
                AddObj["saltpond_name"] = Salt.FindObj(res["saltpond_id"]).Name;
                AddObj["writedate"] = BU.convertDateToText(res["writedate"]);
                AddObj["prevwritedate"] = BU.convertDateToText(res["prevwritedate"]);
                AddObj["writedate2"] = BU.convertDateToText(res["writedate"]).split(" ")[0] + "<BR />" + BU.convertDateToText(res["writedate"]).split(" ")[1];
                    
                AddObj["getMonth"] = getMonth;
                AddObj["TotalRemainHour"] = TotalRemainHour;
                AddObj["RemainDay"] = RemainDay;
                AddObj["RemainHour"] = RemainHour;
                AddObj["RemainMin"] = RemainMin;
                AddObj["Class"] = Class;

                    
                //BU.log("diffDay : " + RemainDay)
                //BU.log("diffHour : " + RemainHour)
                //BU.log("diffMin : " + RemainMin);

                    
                if (res["lastgiveobj"] === null)
                    AddObj["lastgiveobj"] = "";
                else
                    AddObj["lastgiveobj"] = Salt.FindObj(res["lastgiveobj"]).Name;

                var IsExist = _.findWhere(ListCategory, { "salt_harvest_seq" : res["salt_harvest_seq"] });
                if (BU.isEmpty(IsExist)) {
                    AddObj["ListContents"] = [];
                    ListCategory.push(AddObj);
                    IsExist = _.findWhere(ListCategory, { "salt_harvest_seq" : res["salt_harvest_seq"] });
                }
                if (res["give_id"] === undefined || res["give_id"] === null)
                    return;

                var AddContentObj = {};
                var GiveType = "급수";
                    
                if (res["lastgiveobj"] === res["give_id"])
                    GiveType = "배수";

                AddContentObj["give_type"] = GiveType;
                AddContentObj["give_id"] = res["give_id"];
                AddContentObj["give_name"] = Salt.FindObj(res["give_id"]).Name; 
                AddContentObj["give_prev_waterlevel"] = res["give_prev_waterlevel"];
                AddContentObj["give_prev_salinity"] = res["give_prev_salinity"];
                AddContentObj["give_after_waterlevel"] = res["give_after_waterlevel"];
                AddContentObj["give_after_salinity"] = res["give_after_salinity"];
                    
                AddContentObj["receive_id"] = res["receive_id"];
                AddContentObj["receive_name"] = Salt.FindObj(res["receive_id"]).Name;
                AddContentObj["receive_prev_waterlevel"] = res["receive_prev_waterlevel"];
                AddContentObj["receive_prev_salinity"] = res["receive_prev_salinity"];
                AddContentObj["receive_after_waterlevel"] = res["receive_after_waterlevel"];
                AddContentObj["receive_after_salinity"] = res["receive_after_salinity"];

                AddContentObj["startdate"] = BU.convertDateToText(res["startdate"]).split(" ")[0] + "<BR />" + BU.convertDateToText(res["startdate"]).split(" ")[1];
                AddContentObj["enddate"] = BU.convertDateToText(res["enddate"]).split(" ")[0] + "<BR />" + BU.convertDateToText(res["enddate"]).split(" ")[1];

                IsExist["ListContents"].push(AddContentObj);
            });
                
            returnvalue["ListCategory"] = ListCategory;
            returnvalue["SaltPondObjList"] = SaltPondObjList;

            GetSaltHarvestDetail(returnvalue, callback);
        });
    });

}

var GetSaltHarvestDetail = function (SaltRecordList, callback){
    BU.log("GetSaltHarvestDetail ");
    var Salt = global.main.Salt;
    //BU.CLI(SaltRecordList)
    _.each(SaltRecordList["ListCategory"], function (SaltRecord) {
        var AddArray = [];
        SaltRecord["ActionTypeList"] = [];

        var SP_ID = SaltRecord["saltpond_id"];
        var WriteDate = SaltRecord["writedate"];
            
        var sql = ""
        sql += "SELECT * ";
        sql += "       FROM   salt_harvest_detail ";
        sql += "WHERE  saltpond_id = '" + SP_ID + "' ";
        sql += "       AND IF(writedate > '" + WriteDate + "', 1, 0) = 1 ";
        sql += "       AND input_type = 'Storage' ";
        sql += " ORDER  BY salt_harvest_detail_seq ASC LIMIT 1 ";
        //BU.log(sql);
        daoC.doQuery(sql, function (err, res) {
            if (err) {
                BU.CLI(err);
                return;
            }
                
            if (BU.isEmpty(res))
                return;
                
            var Result = res[0];
            var AddObj = {};
                
            AddObj["saltpond_id"] = Salt.FindObj(Result["saltpond_id"]).Name;
            AddObj["input_type"] = Result["input_type"];
            AddObj["writedate"] = BU.convertDateToText(Result["writedate"]).split(" ")[0] + "<BR />" + BU.convertDateToText(Result["writedate"]).split(" ")[1];
            SaltRecord["ActionTypeList"].push(AddObj);
        });

        var sql = ""
        sql += "SELECT * ";
        sql += "       FROM   salt_harvest_detail ";
        sql += "WHERE  saltpond_id = '" + SP_ID + "' ";
        sql += "       AND IF(writedate > '" + WriteDate + "', 1, 0) = 1 ";
        sql += "       AND input_type = 'Release' ";
        sql += " ORDER  BY salt_harvest_detail_seq ASC LIMIT 1 ";
        //BU.log(sql);
        daoC.doQuery(sql, function (err, res) {
            if (err) {
                BU.CLI(err);
                return;
            }
                
            if (BU.isEmpty(res))
                return;
                
            var Result = res[0];
            var AddObj = {};
            AddObj["saltpond_id"] = Salt.FindObj(Result["saltpond_id"]).Name;
            AddObj["input_type"] = Result["input_type"];
            AddObj["writedate"] = BU.convertDateToText(Result["writedate"]).split(" ")[0] + "<BR />" + BU.convertDateToText(Result["writedate"]).split(" ")[1];
            SaltRecord["ActionTypeList"].push(AddObj);
        });
    });
    setTimeout(function () {
        callback("", SaltRecordList);
    }, 100);
}
