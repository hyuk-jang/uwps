// 팝업레이어 좌표
var win_X;
var win_Y;

$(document).on('mousemove', function (e) {
    win_X = e.pageX;
    win_Y = e.pageY;
});

//X_Y_M = 팝업 레이어 표시 위치 및 드래그 가능 (화면의 top과 left의 위치)
function X_Y_M(dataX, dataY) {
    $('.map_Class').css('top', dataY);
    $('.map_Class').css('left', dataX);
    $('.map_Class').draggable();
}

//container에 Map 드로우
$(document).ready(function () {
    if (Map.MAP != undefined) {
        var mapSize_X = Map.MAP.MapSizeX;
        var mapSize_Y = Map.MAP.MapSizeY;

        $("#container").css("width", mapSize_X);
        $("#container").css("height", mapSize_Y);
        showImg(mapSize_X, mapSize_Y);

        mapWidth = mapSize_X;
        mapHeight = mapSize_Y;

    }

    changeEditor("text");

    //Map의 Obj의 type and id 표시
    _.each(arrClickObj, function (obj) {

        var type = obj.Type;
        var id = obj.ID;


        obj.on("click", function (e) {

            console.log("클릭되었음", type, id);

            editView(type, id);
        });
    });
});

//수문, 밸브, 펌프, 수위, 염도에 대한 레이어 값 수정 (include/template.html를 불러옴) 
function changeDeviceData(ID) {
    var valueCheck = true;
    var name = $("#trData").find("[name='Name']").get(0).value;
    var ip = $("#trData").find("[name='IP']").get(0).value;
    var port = $("#trData").find("[name='Port']").get(0).value;
    if (!ValidateIPaddress(ip)) {
        alert("IP 형식으로 입력하세요.");
        valueCheck = false;
        return;
    }
    if (!isNumber(port)) {
        alert("포트는 숫자로 입력가능 합니다.");
        valueCheck = false;
        return;
    }
    if (name == "") {
        alert("이름을 입력하세요.");
        valueCheck = false;
        return;
    }

    if (valueCheck != false) {
        alert("저장 되었습니다.");
    }

    port = parseInt(port);

    var arrData = getId(ID);
    _.each(arrData, function (data) {
        if (data.Name != undefined) {
            data.Name = name;
        }
        if (data.IP != undefined) {
            data.IP = ip;
        }
        if (data.Port != undefined) {
            data.Port = port;
        }
    });

    var strJSON = JSON.stringify(Map, null, '\t');
    $("#jsonText").val(strJSON);
    //console.log(arrData);
}


//해주, 증발지에 대한 레이어 값 수정 (include/template.html를 불러옴) 
function changePanData(ID) {
    var valuecheck = true;
    var name = $("#trData").find("[name='Name']").get(0).value;
    var maxWaterLevel = $("#trData").find("[name='MaxWaterLevel']").get(0).value;
    var minWaterLevel = $("#trData").find("[name='MinWaterLevel']").get(0).value;
    var settingSalinity = $("#trData").find("[name='SettingSalinity']").get(0).value;

    if (!isNumber(maxWaterLevel)) {
        alert("수위레벨은 숫자로 입력가능 합니다.");
        valuecheck = false;
        return;
    }
    if (!isNumber(minWaterLevel)) {
        alert("수위레벨은 숫자로 입력가능 합니다.");
        valuecheck = false;
        return;
    }
    if (!isNumber(settingSalinity)) {
        alert("염도레벨은 숫자로 입력가능 합니다.");
        valuecheck = false;
        return;
    }
    if (name == "") {
        alert("이름을 입력하세요.");
        valuecheck = false;
        return;
    }

    if (valuecheck != false) {
        alert("저장 되었습니다.");
    }

    console.log(name, maxWaterLevel, minWaterLevel, settingSalinity)

    maxWaterLevel = parseInt(maxWaterLevel);
    minWaterLevel = parseInt(minWaterLevel);
    //SettingSalinity = SettingSalinity;

    var arrData = getId(ID);
    _.each(arrData, function (data) {
        if (data.MaxWaterLevel != undefined) {
            data.MaxWaterLevel = maxWaterLevel;
            console.log(data.MaxWaterLevel);
        }
        if (data.MinWaterLevel != undefined) {
            data.MinWaterLevel = minWaterLevel;
            console.log(data.MinWaterLevel);
        }
        if (data.SettingSalinity != undefined) {
            data.SettingSalinity = settingSalinity;
            console.log(data.SettingSalinity);
        }
        if (data.Name != name) {
            data.Name = name;
            console.log("?" + data.Name);
        }
    });

    var strJSON = JSON.stringify(Map, null, '\t');
    $("#jsonText").val(strJSON);
    //console.log(arrData);
}


//if 수문, 밸브, 펌프, 수위, 염도에 대한 레이어 값(include/template.html를 불러옴) 
//else 해주 와 증발지에 대한 레이어 값(include/template.html를 불러옴) 
function editView(type, id) {


    $("#editViewDiv");

    if (type == "수문" || type == "밸브" || type == "펌프" || type == "수위" || type == "염도") {
        var realData = getId(id);

        var port = "";
        var ip = "";
        var name = "";
        _.each(realData, function (data) {
            if (data.Port != undefined) {
                port = data.Port;
            }
            if (data.Name != undefined) {
                name = data.Name;
            }
            if (data.IP != undefined) {
                ip = data.IP;
            }
        });
        var type_Device = $("#type_Device").html();
        var param = {};
        param.ID = id;
        param.Port = port;
        param.Name = name;
        param.IP = ip;
        //MaxWaterLevel
        var compiled = _.template(type_Device);
        var str = compiled(param);
        $("#editViewDiv").html(str);
        X_Y_M(win_X, win_Y);
    } else {
        var realData = getId(id);
        var name = "";
        var maxWaterLevel = "";
        var minWaterLevel = "";
        var settingSalinity = "";

        _.each(realData, function (data) {
            if (data.Name != undefined) {
                name = data.Name;
            }
            if (data.MaxWaterLevel != undefined) {
                maxWaterLevel = data.MaxWaterLevel;
            }
            if (data.MinWaterLevel != undefined) {
                minWaterLevel = data.MinWaterLevel;
            }
            if (data.SettingSalinity != undefined) {
                settingSalinity = data.SettingSalinity;
            }
        });

        var type_Panel = $("#type_Panel").html();
        var param = {};
        param.ID = id;
        param.Name = name;
        param.MaxWaterLevel = maxWaterLevel;
        param.MinWaterLevel = minWaterLevel;
        param.SettingSalinity = settingSalinity;

        //MaxWaterLevel
        var compiled = _.template(type_Panel);
        var str = compiled(param);
        $("#editViewDiv").html(str);
        X_Y_M(win_X, win_Y);
    }
}

//Kinetic 드로우
function getImgObj(ID) {
    var imgObjList = Map.MAP.ImgObjList;

    for (var i = 0; i < imgObjList.length; i++) {
        var imgObj = imgObjList[i];
        if (imgObj.ID == ID) {
            return imgObj;
        }
    }
}

var arrClickObj = [];


function showImg(sizeX, sizeY) {

    var stage = new Kinetic.Stage({
        container: 'container',
        width: sizeX,
        height: sizeY
    });


    var layer = new Kinetic.Layer();
    var saltPondFrameList = Map.MAP.SaltPondFrameList;
    for (var i = 0; i < saltPondFrameList.length; i++) {
        var saltPondFrame = saltPondFrameList[i];
        var X = saltPondFrame.X;
        var Y = saltPondFrame.Y;
        var Name = saltPondFrame.Name;

        var ImgData = getImgObj(saltPondFrame.ImgID).ImgData;

        var rect = new Kinetic.Rect({
            x: X,
            y: Y,
            width: ImgData.Width,
            height: ImgData.Height,
            fill: ImgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });

        // add the shape to the layer
        layer.add(rect);
    }
    // add the layer to the stage
    stage.add(layer);

    var layer = new Kinetic.Layer();
    var saltPondLineList = Map.MAP.SaltPondLineList;

    for (var i = 0; i < saltPondLineList.length; i++) {
        var saltPondLine = saltPondLineList[i];
        //var X = WaterWay.X;
        //var Y = WaterWay.Y;
        var imgData = getImgObj(saltPondLine.ImgID).ImgData;

        var line = new Kinetic.Line({
            points: saltPondLine.Points,
            stroke: imgData.Color,
            strokeWidth: imgData.StrokeWidth,
            lineCap: 'rect',
            lineJoin: 'round'
        });

        // add the shape to the layer
        layer.add(line);
    }
    // add the layer to the stage
    stage.add(layer);


    var layer = new Kinetic.Layer();
    var waterWayList = Map.MAP.WaterWayList;

    for (var i = 0; i < waterWayList.length; i++) {

        var waterWay = waterWayList[i];
        //var X = WaterWay.X;
        //var Y = WaterWay.Y;
        var name = waterWay.Name;
        var imgData = getImgObj(waterWay.ImgID).ImgData;

        var line = new Kinetic.Line({
            points: waterWay.Points,
            stroke: imgData.Color,
            strokeWidth: 0,
            lineCap: 'rect',
            lineJoin: 'round'
        });

        //Line.move(X, Y);

        var simpleText = new Kinetic.Text({
            x: (waterWay.Points[0] + waterWay.Points[2]) / 2,
            y: (waterWay.Points[1] + waterWay.Points[3]) / 2,
            text: name,
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'black'
        });

        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(line);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);


    var layer = new Kinetic.Layer();
    var saltPlateList = Map.MAP.SaltPlateList;
    for (var i = 0; i < saltPlateList.length; i++) {
        var saltPlate = saltPlateList[i];
        var saltPlate_X = saltPlate.X;
        var saltPlate_Y = saltPlate.Y;
        var name = saltPlate.Name;

        var ImgData = getImgObj(saltPlate.ImgID).ImgData;


        var rect = new Kinetic.Rect({
            x: saltPlate_X,
            y: saltPlate_Y,
            width: ImgData.Width,
            height: ImgData.Height,
            fill: ImgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });
        rect.Type = "염판";
        rect.ID = saltPlate.ID;
        arrClickObj.push(rect);

        var simpleText = new Kinetic.Text({
            x: saltPlate_X + ImgData.Width / 2,
            y: saltPlate_Y + ImgData.Height / 3,
            text: name,
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        simpleText.Type = "염판";
        simpleText.ID = saltPlate.ID;
        arrClickObj.push(simpleText);
        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);

        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);

    var layer = new Kinetic.Layer();
    var waterTankList = Map.MAP.WaterTankList;

    for (var i = 0; i < waterTankList.length; i++) {

        var waterTank = waterTankList[i];
        var waterTank_X = waterTank.X;
        var waterTank_Y = waterTank.Y;
        var name = waterTank.Name;

        var imgData = getImgObj(waterTank.ImgID).ImgData;


        var rect = new Kinetic.Rect({
            x: waterTank_X,
            y: waterTank_Y,
            width: imgData.Width,
            height: imgData.Height,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });
        rect.Type = "해주";
        rect.ID = waterTank.ID;
        arrClickObj.push(rect);


        var simpleText = new Kinetic.Text({
            x: waterTank_X + imgData.Width / 2,
            y: waterTank_Y + imgData.Height * 3 / 7,
            text: name,
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'green'
        });
        simpleText.Type = "해주";
        simpleText.ID = waterTank.ID;
        arrClickObj.push(simpleText);
        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);

        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);
    }
    // add the layer to the stage
    stage.add(layer);


    var layer = new Kinetic.Layer();
    var waterOutList = Map.MAP.WaterOutList;

    for (var i = 0; i < waterOutList.length; i++) {

        var waterOut = waterOutList[i];
        var X = waterOut.X;
        var Y = waterOut.Y;
        var name = waterOut.Name;
        var imgData = getImgObj(waterOut.ImgID).ImgData;

        var rect = new Kinetic.Rect({
            x: X,
            y: Y,
            width: imgData.Width,
            height: imgData.Height,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 0.3
        });
        rect.Type = "바다";
        rect.ID = waterOut.ID;
        //arrClickObj.push(rect);

        var simpleText = new Kinetic.Text({
            x: X + imgData.Width / 2,
            y: Y + imgData.Height / 2,
            text: name,
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'green'
        });
        simpleText.Type = "바다";
        simpleText.ID = waterOut.ID;
        //arrClickObj.push(simpleText);

        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);


    //저수지
    var layer = new Kinetic.Layer();
    var reservoirList = Map.MAP.ReservoirList;
    for (var i = 0; i < reservoirList.length; i++) {
        var reservoir = reservoirList[i];
        var reservoir_X = reservoir.X;
        var reservoir_Y = reservoir.Y;
        var name = reservoir.Name;

        var imgData = getImgObj(reservoir.ImgID).ImgData;

        var rect = new Kinetic.Rect({
            x: reservoir_X,
            y: reservoir_Y,
            width: imgData.Width,
            height: imgData.Height,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 0.3
        });
        var simpleText = new Kinetic.Text({
            x: reservoir_X + imgData.Width / 2,
            y: reservoir_Y + imgData.Height / 2,
            text: name,
            fontSize: 40,
            fontFamily: 'Calibri',
            fill: 'blue'
        });
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);
        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);
    }
    // add the layer to the stage
    stage.add(layer);






    //수위센서
    var layer = new Kinetic.Layer();
    var waterLevelSensorList = Map.MAP.WaterLevelSensorList;
    for (var i = 0; i < waterLevelSensorList.length; i++) {

        var waterLevelSensor = waterLevelSensorList[i];
        var waterLevelSensor_X = waterLevelSensor.X;
        var waterLevelSensor_Y = waterLevelSensor.Y;
        var name = waterLevelSensor.Name;
        var imgData = getImgObj(waterLevelSensor.ImgID).ImgData;



        var rect = new Kinetic.Rect({
            x: waterLevelSensor_X,
            y: waterLevelSensor_Y,
            width: imgData.Width,
            height: imgData.Height,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });
        rect.Type = "수위";
        rect.ID = waterLevelSensor.ID;
        arrClickObj.push(rect);

        var simpleText = new Kinetic.Text({
            x: waterLevelSensor_X + imgData.Width / 2,
            y: waterLevelSensor_Y + imgData.Height / 2,
            text: name,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'blue'
        });
        simpleText.Type = "수위";
        simpleText.ID = waterLevelSensor.ID;
        arrClickObj.push(simpleText);


        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);


    //염도센서

    var layer = new Kinetic.Layer();
    var saltRateSensorList = Map.MAP.SaltRateSensorList;
    for (var i = 0; i < saltRateSensorList.length; i++) {

        var saltRateSensor = saltRateSensorList[i];
        var saltRateSensor_X = saltRateSensor.X;
        var saltRateSensor_Y = saltRateSensor.Y;
        var name = saltRateSensor.Name;
        var imgData = getImgObj(saltRateSensor.ImgID).ImgData;



        var rect = new Kinetic.Rect({
            x: saltRateSensor_X,
            y: saltRateSensor_Y,
            width: imgData.Width,
            height: imgData.Height,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });
        rect.Type = "염도";
        rect.ID = saltRateSensor.ID;
        arrClickObj.push(rect);

        var simpleText = new Kinetic.Text({
            x: saltRateSensor_X + imgData.Width / 2,
            y: saltRateSensor_Y + imgData.Height / 2,
            text: name,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'blue'
        });
        simpleText.Type = "염도";
        simpleText.ID = saltRateSensor.ID;
        arrClickObj.push(simpleText);


        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);

    //################################################################

    //펌프
    var layer = new Kinetic.Layer();
    var pumpList = Map.MAP.PumpList;


    for (var i = 0; i < pumpList.length; i++) {

        var pump = pumpList[i];
        var pump_X = pump.X;
        var pump_Y = pump.Y;
        var name = pump.Name;
        var imgData = getImgObj(pump.ImgID).ImgData;

        var circle = new Kinetic.Circle({
            x: pump_X,
            y: pump_Y,
            radius: imgData.Radius,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });
        circle.Type = "펌프";
        circle.ID = pump.ID;
        arrClickObj.push(circle);


        var simpleText = new Kinetic.Text({
            x: pump_X,
            y: pump_Y,
            text: name,
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        simpleText.Type = "펌프";
        simpleText.ID = pump.ID;
        arrClickObj.push(simpleText);
        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(circle);

        layer.add(simpleText);


    }
    // add the layer to the stage
    stage.add(layer);


    //파이프
    var layer = new Kinetic.Layer();
    var pipeList = Map.MAP.PipeList;

    for (var i = 0; i < pipeList.length; i++) {

        var Pipe = pipeList[i];
        //var X = Pipe.X;
        //var Y = Pipe.Y;
        var name = Pipe.Name;
        var imgData = getImgObj(Pipe.ImgID).ImgData;

        var line = new Kinetic.Line({
            points: Pipe.Points,
            stroke: imgData.Color,
            strokeWidth: imgData.StrokeWidth,
            lineCap: 'rect',
            lineJoin: 'round'
        });

        //Line.move(X, Y);

        var simpleText = new Kinetic.Text({
            x: (Pipe.Points[0] + Pipe.Points[2]) / 2,
            y: (Pipe.Points[1] + Pipe.Points[3]) / 2,
            text: name,
            fontSize: 0,
            fontFamily: 'Calibri',
            fill: 'blue'
        });

        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(line);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);

    //수문
    var layer = new Kinetic.Layer();
    var waterDoorList = Map.MAP.WaterDoorList;
    for (var i = 0; i < waterDoorList.length; i++) {

        var waterDoor = waterDoorList[i];
        var waterDoor_X = waterDoor.X;
        var waterDoor_Y = waterDoor.Y;
        var name = waterDoor.Name;
        var imgData = getImgObj(waterDoor.ImgID).ImgData;



        var rect = new Kinetic.Rect({
            x: waterDoor_X,
            y: waterDoor_Y,
            width: imgData.Width,
            height: imgData.Height,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });
        rect.Type = "수문";
        rect.ID = waterDoor.ID;
        arrClickObj.push(rect);

        var simpleText = new Kinetic.Text({
            x: waterDoor_X + imgData.Width / 2,
            y: waterDoor_Y + imgData.Height / 2,
            text: name,
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'purple'
        });
        simpleText.Type = "수문";
        simpleText.ID = waterDoor.ID;
        arrClickObj.push(simpleText);


        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(rect);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);

    //밸브
    var layer = new Kinetic.Layer();
    var valveList = Map.MAP.ValveList;


    for (var i = 0; i < valveList.length; i++) {

        var valve = valveList[i];
        var valve_X = valve.X;
        var valve_Y = valve.Y;
        var name = valve.Name;
        var imgData = getImgObj(valve.ImgID).ImgData;



        //console.log(Name);
        var Squares = new Kinetic.RegularPolygon({
            x: valve_X,
            y: valve_Y,
            sides: 4,
            radius: imgData.Radius,
            fill: imgData.Color,
            stroke: 'black',
            strokeWidth: 1
        });

        Squares.Type = "밸브";
        Squares.ID = valve.ID;
        arrClickObj.push(Squares);


        var simpleText = new Kinetic.Text({
            x: valve_X,
            y: valve_Y,
            text: name,
            fontSize: imgData.fontsize,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        simpleText.Type = "밸브";
        simpleText.ID = valve.ID;
        arrClickObj.push(simpleText);
        // to align text in the middle of the screen, we can set the
        // shape offset to the center of the text shape after instantiating it
        simpleText.offsetX(simpleText.width() / 2);
        simpleText.offsetY(simpleText.height() / 2);

        // add the shape to the layer
        layer.add(Squares);

        layer.add(simpleText);

    }
    // add the layer to the stage
    stage.add(layer);




}