// var BU = require('../util/baseUtil.js');
var _ = require('underscore');

exports.Algorithm = function () {
    var returnvalue = [];
    var err = {};
    
    var self = this;
    
    self.PredictTime = function (SaltpondInfo, UserInfo, WeatherDevice, WeatherCast, CallBack) {
        returnvalue = [];
        err = {};
        
        var SaltpondInfo = SaltpondInfo;
        var UserInfo = UserInfo;
        var WeatherDevice = WeatherDevice;
        var WeatherCast = WeatherCast;
        
        //BU.CLI(SaltpondInfo);
        //BU.CLI(UserInfo);
        
        ////BU.log("PredictTime 실행 ----------------------------------------------------");
        var NowSalinity = SaltpondInfo.NowSalinity;
        var NowWaterLevel = SaltpondInfo.NowWaterLevel;
        var MaxWaterLevel = SaltpondInfo.MaxWaterLevel;
        
        var SetSalinity = UserInfo.SetSalinity;
        var SetTime = UserInfo.SetTime;
        var SetWaterLevel = UserInfo.SetWaterLevel;
        
        
        var Set_Value = {
            Set_SaltRate: SetSalinity,
            Set_SeaWater: SetWaterLevel,
            Set_LimitHeight: MaxWaterLevel,
            Set_Mytime: SetTime
        }
        
        var Now_Saltpond = {
            now_saltrate: NowSalinity,
            now_seawater: NowWaterLevel
        }
        
        var Device_Object = WeatherDevice;
        var Weather_Array = WeatherCast;
        
        var Result = Predict_SaltTime(Set_Value, Device_Object, Now_Saltpond, Weather_Array);
        
        ////BU.log("PredictTime 수신");
        
        if (Result === undefined) {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "최대수위에 도달하였습니다.";
            CallBack(err);
        }
            
        else if (Result[0] != "")
            CallBack(Result[0]);
        else
            CallBack("", Result[1]);
    }
    
    
    self.PredictWaterLevel = function (SaltpondInfo, UserInfo, WeatherDevice, WeatherCast, CallBack) {
        returnvalue = [];
        err = {};
        var SaltpondInfo = SaltpondInfo;
        var UserInfo = UserInfo;
        var WeatherDevice = WeatherDevice;
        var WeatherCast = WeatherCast;
        
        //BU.CLI(SaltpondInfo);
        //BU.CLI(UserInfo);
        
        ////BU.log("PredictWaterLevel 실행--------------------------------------");
        var NowSalinity = SaltpondInfo.NowSalinity;
        var NowWaterLevel = SaltpondInfo.NowWaterLevel;
        var MaxWaterLevel = SaltpondInfo.MaxWaterLevel
        
        var SetSalinity = UserInfo.SetSalinity;
        var SetTime = UserInfo.SetTime;
        var SetWaterLevel = UserInfo.SetWaterLevel;
        
        
        var Set_Value = {
            Set_SaltRate: SetSalinity,
            Set_SeaWater: SetWaterLevel,
            Set_LimitHeight: MaxWaterLevel,
            Set_Mytime: SetTime
        }
        
        var Now_Saltpond = {
            now_saltrate: NowSalinity,
            now_seawater: NowWaterLevel
        }
        
        var Device_Object = WeatherDevice;
        var Weather_Array = WeatherCast;
        
        var Result = Predict_SaltHeight(Set_Value, Device_Object, Now_Saltpond, Weather_Array);
        ////BU.log("PredictWaterLevel 수신")
        ////BU.log(Result);
        if (Result === undefined) {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "최대수위에 도달하였습니다.";
            CallBack(err);
        }
        else if (Result[0] != "")
            CallBack(Result[0]);
        else
            CallBack("", Result[1]);
        
    }
    
    
    
    
    
    
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //##########설정 높이에 따른 시간################################################################################################################################
    
    
    function Predict_SaltTime(z1, z2, z3, z4) {
        ////BU.log("Predict_SaltTime 실행-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        
        //BU.CLI(z1);
        //BU.CLI(z2);
        //BU.CLI(z3);
        ////BU.log("@@@@@@@@@@@@@@@@22");
        //BU.CLI(z4);
        
        var result = {};              //결과값
        

        
        
        
        if (z1.Set_SeaWater - 1 > z1.Set_LimitHeight - 1) {
            err.Code = "1";
            err.Meg = "현재 염판의 최대 수위는 " + z1.Set_LimitHeight + " 입니다. " + z1.Set_LimitHeight + "Cm 이하로 입력하세요.";
            ////BU.log(err);
            returnvalue.push(err);
            
            return returnvalue;
        } else if (z1.Set_SeaWater - 1 < z3.now_seawater - 1) {
            err.Code = "2";
            err.Meg = "현재 염판의 수위는 " + z3.now_seawater + "입니다. " + z3.now_seawater + "Cm 이상으로 입력하세요.";
            ////BU.log(err);
            returnvalue.push(err);
            return returnvalue;
        } else {
            
            
            //    z1 입력폼
            var Set_SaltRate = z1.Set_SaltRate;          //넣을 해수염도
            var Set_SeaWater = z1.Set_SeaWater;          //넣을 총 물높이
            var Set_LimitHeight = z1.Set_LimitHeight;    //최대 물높이
            
            //    z2 기상관측장비
            var Temperature = z2.Temperature;            //풍속
            var Humidity = Math.round(z2.Humidity);      //기온
            var WindSpeed = z2.WindSpeed;              //습도
            
            //    z3 염판
            var now_saltrate = z3.now_saltrate;          //현재염도
            var now_seawater = z3.now_seawater;          //남은 염판물높이
            
            //    z4 기상청
            var applydate;                                 //날짜.시간
            var temp;                                      //기상청 온도
            var reh;                                       //기상청 습도
            var ws;                                        //기상청 풍속
            
            //  오차
            var ocha_Tem = z4[0].temp - Temperature;      //기온오차
            var ocha_Hum = z4[0].reh - Humidity;          //습도오차
            var ocha_WS = z4[0].ws - WindSpeed;          //풍속오차
            
            
            //  혼합물 염도 ( 현재남은 소금물과 추가적인 해수유입 시) 
            var Send_SeaWaterH = Set_SeaWater - now_seawater;                               //넣을해수높이 (넣을 총 물높이 - 남은 염판물높이)
            var Mix_WaterRate = (Set_SaltRate * Send_SeaWaterH + now_saltrate * now_seawater) / Set_SeaWater;
            // ##최대값 혼합물 염도
            var Max_Send_SeaWaterH = Set_LimitHeight - now_seawater;
            var Max_Mix_WaterRate = (Set_SaltRate * Max_Send_SeaWaterH + now_saltrate * now_seawater) / Set_LimitHeight;
            
            //  포화공기습도비율 (습도 100%일때)
            var Dry = [0.088, 0.096, 0.106, 0.116, 0.127, 0.139, 0.151, 0.165, 0.180, 0.196,
                       0.214, 0.233, 0.253, 0.275, 0.299, 0.324, 0.352, 0.382, 0.414, 0.448,
                       0.487, 0.519, 0.558, 0.595, 0.638, 0.680, 0.726, 0.775, 0.827, 0.882,
                       0.940, 1.002, 1.067, 1.135, 1.208, 1.284, 1.364, 1.449, 1.538, 1.632,
                       1.731, 1.835, 1.944, 2.059, 2.180, 2.307, 2.440, 2.579, 2.726, 2.879,
                       3.040, 3.208, 3.385, 3.570, 3.770, 3.965, 4.176, 4.407, 4.628, 4.864,
                       5.110, 5.372, 5.645, 5.930, 6.226, 6.535, 6.857, 7.193, 7.541, 7.904,
                       8.282, 8.676, 9.084, 9.508, 9.949, 10.408, 10.883, 11.377, 11.889, 12.421, 12.972];
            // 각각의 온도에 맞게 넣어줌.
            var Tem = [0, 0, 0, 0, 0, 0, 0, 0,
                   0, 0, 0, 0, 0, 0, 0, 0,
                   0, 0, 0, 0, 0, 0, 0, 0];
            
            
            // 공식!
            var area = 100;                         //면적 고정값(사실 변해도 무관)
            var seta = 0;                           //θ
            var humi = 0;                           //(포화공기습도비율 - 공기습도비율) 할떄 퍼센트값
            var goalsalt = 25;                      //목표 염도
            var limit_goalsalt = 30;                //limit 목표 염도
            
            var seawater_height = Set_SeaWater / 100;                                //해수높이 (미터환산)
            var Max_seawater_height = Set_LimitHeight / 100;                        //Max_해수높이 (미터환산)
            
            var seawater_amount = 1000 * area * seawater_height;                    //해수 양 (리터로 환산)
            //BU.log("seawater_amount = " + seawater_amount);
            var Max_seawater_amount = 1000 * area * Max_seawater_height;            //Max_해수 양 (리터로 환산)
            
            var salt_amount = seawater_amount / 100 * Mix_WaterRate;                    //소금양             실수로되있네
            var Max_salt_amount = Max_seawater_amount / 100 * Max_Mix_WaterRate;        //Max_소금양         실수로되있네
            
            var water_amount = seawater_amount - salt_amount;                                    //순수 물의양 (해수 - 소금)
            var Max_water_amount = Max_seawater_amount - Max_salt_amount;                        //Max_순수 물의양 (Max_해수 - Max_소금)
            
            var disappear_water = seawater_amount - salt_amount * 100 / 25;                      //목표염도    25도까지 사라져야 할 물의양
            var disappear_water_limit = seawater_amount - salt_amount * 100 / 30;                //목표염도    30도까지 사라져야 할 물의양
            var Max_disappear_water = Max_seawater_amount - Max_salt_amount * 100 / 25;          //최대물높이    25도에 맞춰져있습니다.
            
            
            // 목표 염도까지 걸리는 시간
            var set_time = 0;          //설정시간 (25도)
            var limit_time = 0;        //설정시간 (30도)
            var max_time = 0;          //최대 물 넣었을 때 시간
            
            
            var k = 0;
            var setFunc = true;         //각 시간이 되면 빠져나올수 있게
            var limitFunc = true;
            var maxFunc = true;
            // 입력값 - 골라내기
            
            
            for (var i = 0; i < z4.length; i++) {
                
                applydate = z4[i].applydate;
                temp = Math.round(z4[i].temp - ocha_Tem);                //오차를 뺴주어 현재값에 근사하게 만듬   
                reh = z4[i].reh - ocha_Hum;
                ws = z4[i].ws - ocha_WS;
                
                if (ws < 0) {                     //바람세기가 0이하일때 0으로통일
                    ws = 0;
                }
                if (reh < 0) {                    //습도가 음수이거나 100을 초과시
                    reh = 0;
                } else if (reh > 100) {
                    reh = 100;
                }
                
                if (temp > 60) {
                    err.Code = "3";
                    err.Meg = "현재 온도값에 따른 60도 초과의 기상청 데이터 값이 있습니다.";
                    ////BU.log(err);
                    returnvalue.push(err);
                    
                    return returnvalue;
                } else if (temp<-20) {
                    err.Code = "4";
                    err.Meg = "현재 온도값에 따른 영하 20도 미만의 기상청 데이터 값이 있습니다.";
                    ////BU.log(err);
                    returnvalue.push(err);
                    
                    return returnvalue;
                }
                
                
                
                

                Tem[i] = temp;
                for (var j = -20; j < Dry.length-20; j++) {
                    if (Tem[i] == j) {
                        Tem[i] = Dry[j+20];                             //Tem값에 각각 습도에 맞는 포화공기습도비율을 기입
                    }
                }
                
                ////BU.log("★바람세기 = " + ws);
                seta = 25 + 19 * ws;
                humi = 100 - reh;                 //포화공기습도비율 - 공기습도비율 과정
                var TemSum = 0;                                                                    //포화공기습도비율 - 공기습도비율
                
                TemSum = Tem[i];
                TemSum = Tem[i] * humi / 100;                                                      //포화공기습도비율 - 공기습도비율 과정
                
                for (var j = 0; j < 3; j++) {                //하나의 기상청 정보가 3시간짜리기 때문에 3번반복
                    ////BU.log("사라져 disappear_water = " + disappear_water);
                    disappear_water = disappear_water - seta * area * TemSum / 100;                     //100으로 나누어주는 이유는 위에 (포화공기습도 비율)이기 때문
                    disappear_water_limit = disappear_water_limit - seta * area * TemSum / 100;
                    Max_disappear_water = Max_disappear_water - seta * area * TemSum / 100;
                    k++;
                    
                    
                    if (disappear_water < 0 && setFunc == true) {
                        set_time = k;
                        setFunc = false;
                    }
                    
                    if (disappear_water_limit < 0 && limitFunc == true) {
                        limit_time = k;
                        limitFunc = false;
                    }
                    
                    if (Max_disappear_water < 0 && maxFunc == true) {
                        max_time = k;
                        maxFunc = false;

                    }
                }
            }
            if (set_time == 0) {
                result.Now_Myheight = Set_SeaWater;
                result.Mix_WaterRate_Result = Mix_WaterRate;
                result.set_target_Date = "";
                
                returnvalue.push("");
                returnvalue.push(result);
                
                ////BU.log(returnvalue);
                return returnvalue;




                //set_time = "기상청 데이터인" + z4.length * 3 + "시간을 초과했습니다.";
       /*         err.Code = "3";
                err.Meg = "기상청 데이터인 " + parseInt(z4.length * 3 + 4) + "시간을 초과했습니다.";
                //BU.log(err);
                returnvalue.push(err);
                return returnvalue;
                */
        //err.Code = "3";
	    //err.Meg = set_time;

            }
            //            if (limit_time == 0) {
            //                limit_time = "기상청 데이터인" + z4.length * 3 + "시간을 초과했습니다.";
            //err.Code = "4";
            //err.Meg = limit_time;
            //            }
            //            if (max_time == 0) {
            //                max_time = "기상청 데이터인" + z4.length * 3 + "시간을 초과했습니다.";
            //err.Code = "5";
            //err.Meg = max_time;
            //            }
            //염도가 25도에서 소금이 만들어지는데 25도 후 4시간부터 채염시기로 잡고있음.
            set_time = set_time + 4;          //-4    +4를 해야됨
            //            limit_time = limit_time;
            //            max_time = max_time + 4;         //-4    +4를 해야됨   
            
            
            
            var set_target_Date = new Date();
            //            var limit_target_Date = new Date();
            //            var max_target_Date = new Date();
            
            set_target_Date.setHours(set_target_Date.getHours() + set_time);
            //            limit_target_Date.setHours(limit_target_Date.getHours() + limit_time);
            //            max_target_Date.setHours(max_target_Date.getHours() + max_time);
            
            convertDateToText1(set_target_Date);
            //            convertDateToText2(limit_target_Date);
            //            convertDateToText3(max_target_Date);
            
            
            function convertDateToText1(dt) {
                now = dt;
                year = "" + now.getFullYear();
                month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
                day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
                hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
                minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
                second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
                set_target_Date = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
            }
            
            
            
            result.Now_Myheight = Set_SeaWater;
            
            Mix_WaterRate_Result = Math.round(Mix_WaterRate * 10) / 10;          // 급수 후 염도값
            
            result.Mix_WaterRate_Result = Mix_WaterRate_Result;
            result.set_target_Date = set_target_Date;
            
            returnvalue.push("");
            returnvalue.push(result);
            
            
            //BU.log("set_target_Date : " + result.set_target_Date)

            ////BU.log("높이에 따른 시간 returnvalue : ");
            ////BU.log(returnvalue);
            
            return returnvalue;
        }
    }
    
    
    
    
    
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //####################################################################################################################################################################
    //##########시간에 따른 염판 높이 값################################################################################################################################
    
    
    function Predict_SaltHeight(z1, z2, z3, z4) {
        returnvalue = [];
        var not_error = false;
        
        ////BU.log("Predict_SaltHeight 실행-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        
        //BU.CLI(z1);
        //BU.CLI(z2);
        //BU.CLI(z3);
        //BU.CLI(z4);
        
        
        //    z1 입력폼
        var Set_SaltRate = z1.Set_SaltRate;          //넣을 해수염도
        var Set_Mytime = z1.Set_Mytime - 4;              //입력시간
        var Set_LimitHeight = z1.Set_LimitHeight;    //최대 물높이
        
        //    z2 기상관측장비
        var Temperature = z2.Temperature;            //기온
        var Humidity = Math.round(z2.Humidity);      //습도
        var WindSpeed = z2.WindSpeed;              //풍속

        //BU.log("z2.Temperature = " + Temperature);
        //BU.log("z2.Humidity = " + Humidity);
        //BU.log("z2.WindSpeed = " + WindSpeed);
        //    z3 염판
        var now_saltrate = z3.now_saltrate;          //현재염도
        var now_seawater = z3.now_seawater;          //남은 염판물높이
        //BU.log("now_seawaternow_seawaternow_seawater = " + now_seawater);
        //    z4 기상청
        var applydate;                                 //날짜.시간
        var temp;                                      //기상청 온도
        var reh;                                       //기상청 습도
        var ws;                                        //기상청 풍속
        
        //  오차
        var ocha_Tem = z4[0].temp - Temperature;      //기온오차
        var ocha_Hum = z4[0].reh - Humidity;          //습도오차
        var ocha_WS = z4[0].ws - WindSpeed;          //풍속오차
        
        //BU.log("z4[0].temp = " + z4[0].temp);
        //BU.log("z4[0].reh = " + z4[0].reh);
        //BU.log("z4[0].ws = " + z4[0].ws);

        // ##최대값 혼합물 염도
        var Max_Send_SeaWaterH = Set_LimitHeight - now_seawater;
        var Max_Mix_WaterRate = (Set_SaltRate * Max_Send_SeaWaterH + now_saltrate * now_seawater) / Set_LimitHeight;
        //BU.log("☎Max_Mix_WaterRate = " + Max_Mix_WaterRate);
        //  포화공기습도비율 (습도 100%일때)
        var Dry = [0.088, 0.096, 0.106, 0.116, 0.127, 0.139, 0.151, 0.165, 0.180, 0.196,
                       0.214, 0.233, 0.253, 0.275, 0.299, 0.324, 0.352, 0.382, 0.414, 0.448,
                       0.487, 0.519, 0.558, 0.595, 0.638, 0.680, 0.726, 0.775, 0.827, 0.882,
                       0.940, 1.002, 1.067, 1.135, 1.208, 1.284, 1.364, 1.449, 1.538, 1.632,
                       1.731, 1.835, 1.944, 2.059, 2.180, 2.307, 2.440, 2.579, 2.726, 2.879,
                       3.040, 3.208, 3.385, 3.570, 3.770, 3.965, 4.176, 4.407, 4.628, 4.864,
                       5.110, 5.372, 5.645, 5.930, 6.226, 6.535, 6.857, 7.193, 7.541, 7.904,
                       8.282, 8.676, 9.084, 9.508, 9.949, 10.408, 10.883, 11.377, 11.889, 12.421, 12.972];
        // 각각의 온도에 맞게 넣어줌.
        var Tem = [0, 0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 0, 0, 0, 0, 0];
        ////BU.log("최대높이" + Set_LimitHeight);
        
        if (Set_Mytime > z4.length * 3) {
            err.Code = "6";
            err.Meg = "기상청 데이터의 한계로" + parseInt(z4.length * 3 + 4) + " 시간 까지 입력하세요.";
            ////BU.log(err);
            returnvalue.push(err);
            return returnvalue;
        } else if (Set_Mytime <= -4) {   //-4했음
            err.Code = "7";
            err.Meg = "4시간이하를 입력할 수 없습니다.";
            ////BU.log(err);
            returnvalue.push(err);
            return returnvalue;
        } else {
            
            for (K = now_seawater * 10; K <= Set_LimitHeight * 10; K++) {
                //BU.log("now_seawater = " + now_seawater);
                var set_time = 0;
                var setFunc = true;
                
                var Now_Myheight = K / 10;
                
                
                // 총 물양
                var Send_SeaWaterH = Now_Myheight - now_seawater;                               //넣을해수높이 (넣을 총 물높이 - 남은 염판물높이)
                //  보내는 물 높이 = 넣을 물 높이 - 현재 물 높이
                var Mix_WaterRate = (Set_SaltRate * Send_SeaWaterH + now_saltrate * now_seawater) / Now_Myheight;
                //  혼합 물 염도  = (넣을 물 염도 * 넣을 물 높이   + 현재 물 염도 * 현재 물 높이) / 총 물양
                
                //  본격 공식!
                
                var area = 100;                         //면적 고정값(사실 변해도 무관)
                var seta = 0;                           //θ
                var humi = 0;                           //(포화공기습도비율 - 공기습도비율) 할떄 퍼센트값
                var goalsalt = 25;                      //목표 염도
                
                var seawater_height = Now_Myheight / 100;                        //해수높이 (미터환산)
                var seawater_amount = 1000 * area * seawater_height;            //해수 양 (리터로 환산)
                //BU.log("seawater_amount = " + seawater_amount);
                var salt_amount = seawater_amount / 100 * Mix_WaterRate;        //소금양             실수로되있네
                var water_amount = seawater_amount - salt_amount;                        //순수 물의양 (해수 - 소금)
                var disappear_water = seawater_amount - salt_amount * 100 / 25;          //목표염도    25도에 맞춰져있습니다.
                ////BU.log("★disappear_water = " + disappear_water);
                
                // 목표 염도까지 걸리는 시간
                var k = 0;
                
                
                for (var i = 0; i < z4.length; i++) {
                    
                    applydate = z4[i].applydate;
                    temp = Math.round(z4[i].temp - ocha_Tem);                //오차를 뺴주어 현재값에 근사하게 만듬   
                    
                    reh = z4[i].reh - ocha_Hum;
                    ws = z4[i].ws - ocha_WS;
                    if (ws < 0) {                     //바람세기가 0이하일때 0으로통일
                        ws = 0;
                    }
                    if (reh < 0) {                    //습도가 음수이거나 100을 초과시
                        reh = 0;
                    } else if (reh > 100) {
                        reh = 100;
                    }

                    //alert("[" + i + "] ---" + "temp = " + temp + "reh = " + reh + " ws = " + ws);  //오차값 계산된 온도,습도,풍속
                    if (temp > 60) {
                        err.Code = "3";
                        err.Meg = "현재 온도값에 따른 60도 초과의 기상청 데이터 값이 있습니다.";
                        ////BU.log(err);
                        returnvalue.push(err);
                        
                        return returnvalue;
                    } else if (temp < -20) {
                        err.Code = "4";
                        err.Meg = "현재 온도값에 따른 영하 20도 미만의 기상청 데이터 값이 있습니다.";
                        ////BU.log(err);
                        returnvalue.push(err);
                        
                        return returnvalue;
                    }

                    
                    Tem[i] = temp;
                    for (var j = -20; j < Dry.length-20; j++) {
                        if (Tem[i] == j) {
                            Tem[i] = Dry[j+20];                             //Tem값에 각각 습도에 맞는 포화공기습도비율을 기입
                        }
                    }
                    
                    
                    ////BU.log("★바람세기 = " + ws);
                    seta = 25 + 19 * ws;
                    humi = 100 - reh;                 //포화공기습도비율 - 공기습도비율 과정
                    var TemSum = 0;                                                                    //포화공기습도비율 - 공기습도비율
                    
                    TemSum = Tem[i];
                    TemSum = Tem[i] * humi / 100;                                                      //포화공기습도비율 - 공기습도비율 과정
                    
                    // alert("TemSum [" +i+ "] : " + TemSum);
                    
                    for (var l = 0; l < 3; l++) {                //하나의 기상청 정보가 3시간짜리기 때문에 3번반복
                        ////BU.log("사라져 disappear_water = " + disappear_water);
                        disappear_water = disappear_water - seta * area * TemSum / 100;
                        
                        k++;
                        ////BU.log("kkkkkkkkkkk = " + k);
                        ////BU.log("disappear_water = " + disappear_water);
                        ////BU.log("seta = " + seta);
                        ////BU.log("area = " + area);
                        ////BU.log("TemSum = " + TemSum);
                        //염도가 25도에서 소금이 만들어지는데 25도 후 4시간부터 채염시기로 잡고있음.
                        if (disappear_water < 0 && setFunc == true) {
                            set_time = k;
                            setFunc = false;
                        }
                    }
                }
                
                
                ////BU.log("K = "+K+"Now_Myheight = " + Now_Myheight + "?????????????set_time" + set_time + "???????Set_Mytime = " + Set_Mytime);
                //콘솔 이것!!!!!!!!!!!!!!
                // 0.1씩으로 작게 나누었으나 시간이 걸치지 않을 때. 예외처리 비어있는 시간은 커도 1시간밖에 없으나 최대5시간으로 잡음.
                //K = now_seawater*10; K <= Set_LimitHeight*10;
                
                
                if (K == now_seawater * 10) {
                    if (set_time > Set_Mytime) {
                        
                        err.Code = "8";
                        if (set_time == 0 || set_time == 1) {
                            err.Meg = "해당시간 내에 채염 하실 수 없으시거나 염도가 25도 이상입니다. 6시간 부터 입력하세요.";
                        } else {
                            err.Meg = "해당시간 내에 채염 하실 수 없으시거나 염도가 25도 이상입니다. " + parseInt(set_time + 4) + "시간 부터 입력하세요.";  //+4했음
                        }   
                        ////BU.log(err);
                        returnvalue.push(err);
                        ////BU.log("11111111")
                        return returnvalue;
                    }
                } else if (K == Set_LimitHeight * 10) {
                    if (set_time == 0) {
                        err.Code = "10";
                        err.Meg = "현재기상상황과 염도값으로 본 시간을 선택할 수 없습니다 시간을 줄이시거나 급수수위설정 기능을 사용하시길 바랍니다.";  //+4했음
                        ////BU.log(err);
                        returnvalue.push(err);
                        ////BU.log("222222222")
                        return returnvalue;
                    } else if (set_time < Set_Mytime) {
                        err.Code = "9";
                        if (set_time == 0 || set_time == 1) {
                            err.Meg = "증발 시간이 6시간 미만이므로 급수수위설정 기능을 사용하시길 바랍니다.";
                        } else {
                            err.Meg = "염수량 대비 증발시간이 초과했습니다. " + parseInt(set_time + 4) + "시간 까지 입력하세요.";  //+4했음
                        }
                        ////BU.log(err);
                        returnvalue.push(err);
                        ////BU.log("222222222")
                        return returnvalue;
                    }
                }
                
                
                for (z = 0; z < 5; z++) {
                    
                    if (set_time - z == Set_Mytime) {
                        not_error = true;
                        returnvalue = [];
                        var result = {};          //결과값
                        Mix_WaterRate_Result = Math.round(Mix_WaterRate * 10) / 10;  //혼합염도값 소수점 첫째짜리까지 반올림
                        
                        var set_target_Date = new Date();
                        set_target_Date.setHours(set_target_Date.getHours() + Set_Mytime + 4);  //4더해줘야지
                        convertDateToText1(set_target_Date);
                        function convertDateToText1(dt) {
                            now = dt;
                            year = "" + now.getFullYear();
                            month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
                            day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
                            hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
                            minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
                            second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
                            set_target_Date = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                            return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                        }
                        
                        
                        
                        result.Now_Myheight = Now_Myheight;
                        result.Mix_WaterRate_Result = Mix_WaterRate_Result;
                        //result.Set_Mytime = Set_Mytime;
                        result.set_target_Date = set_target_Date;
                        
                        returnvalue.push("");
                        returnvalue.push(result);
                        ////BU.log("333333333")
                        
                        //BU.log("set_time!!! : " + set_time)
                        //BU.log("set_target_Date!!! : " + result.set_target_Date)

                        return returnvalue;
                    }
                }

                
                
                ////BU.log("4444444444")
       
            }
            //return returnvalue;
        }
        //return returnvalue;
    }
    //return returnvalue;
}
