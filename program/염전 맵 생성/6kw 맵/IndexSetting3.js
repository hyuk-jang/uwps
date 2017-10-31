var Map = {
    "MAP": {
        "MapSizeX": 1900,
        "MapSizeY": 1300,
        "ImgObjList": [{
            "ID": "Reservoir",
            "ImgData": {
                "Type": "Rect",
                "Width": 270,
                "Height": 200,
                "Color": "#33ffff"
            }
        },
        {
            "ID": "SaltPlate_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 280,
                "Height": 150,
                "Color": "#f8f8f8"
            }
        },
        {
            "ID": "SaltPlate_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 280,
                "Height": 150,
                "Color": "#CFCFCF"
            }
        },
        {
            "ID": "SaltPlate_C",
            "ImgData": {
                "Type": "Rect",
                "Width": 380,
                "Height": 205,
                "Color": "#c4c8c3"
            }
        },
        {
            "ID": "SaltPlate_D",
            "ImgData": {
                "Type": "Rect",
                "Width": 380,
                "Height": 205,
                "Color": "#8C8C8C"
            }
        },
        {
            "ID": "SaltPondLine_A",
            "ImgData": {
                "Type": "Line",
                "StrokeWidth": 50,
                "Color": "#33ccff"
            }
        },
        {
            "ID": "WaterTank_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 210,
                "Height": 200,
                "Color": "#dbdbdb"
            }
        },
        {
            "ID": "WaterTank_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 300,
                "Height": 200,
                "Color": "#dbdbdb"
            }
        },
        {
            "ID": "WaterTank_C",
            "ImgData": {
                "Type": "Rect",
                "Width": 280,
                "Height": 200,
                "Color": "#dbdbdb"
            }
        },
        {
            "ID": "WaterDoor_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 50,
                "Height": 50,
                "Color": "#9eb0d4"
            }
        },
        {
            "ID": "WaterDoor_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 50,
                "Height": 50,
                "Color": "#3cc8c8"
            }
        },
        {
            "ID": "WaterOut_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 920,
                "Color": "#a5d8f0"
            }
        },
        {
            "ID": "Pump_A",
            "ImgData": {
                "Type": "Circle",
                "Radius": 25,
                "Color": "#9fe667"
            }
        },
        {
            "ID": "PipeList_A",
            "ImgData": {
                "Type": "Line",
                "StrokeWidth": 2.5,
                "Color": "#cd4275"
            }
        },
        {
            "ID": "Valve_A",
            "ImgData": {
                "Type": "Squares",
                "fontsizte": 12,
                "Radius": 25,
                "Color": "#efb4ce"
            }
        },
        {
            "ID": "SaltFilter_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 100,
                "Color": "#A5DE9F"
            }
        },
        {
            "ID": "WLSensor",
            "ImgData": {
                "Type": "Rect",
                "Width": 45,
                "Height": 20,
                "Color": "#FFFFFF"
            }
        },
        {
            "ID": "SRSensor",
            "ImgData": {
                "Type": "Rect",
                "Width": 45,
                "Height": 20,
                "Color": "#FFFFFF"
            }
        },
        {
            "ID": "UWTemperature",
            "ImgData": {
                "Type": "Rect",
                "Width": 60,
                "Height": 20,
                "Color": "#FFFFFF"
            }
        },
        {
            "ID": "MTemperature",
            "ImgData": {
                "Type": "Rect",
                "Width": 60,
                "Height": 20,
                "Color": "#FFFFFF"
            }
        }

        ],
        "ReservoirList": [{
            "ID": "RV1",
            "Name": "저수지",
            "X": 50,
            "Y": 50,
            "ImgID": "Reservoir"
        }],
        "SaltPondLineList": [{
            "ID": "SPL1",
            "Name": "1",
            "ImgID": "SaltPondLine_A",
            "Points": [
                855,
                1225,
                855,
                300
            ]
        },
        {
            "ID": "SPL2",
            "Name": "2",
            "ImgID": "SaltPondLine_A",
            "Points": [
                1325,
                1220,
                1325,
                300
            ]
        },
        {
            "ID": "SPL3",
            "Name": "3",
            "ImgID": "SaltPondLine_A",
            "Points": [
                930,
                330,
                1350,
                330
            ]
        },
        {
            "ID": "SPL4",
            "Name": "4",
            "ImgID": "SaltPondLine_A",
            "Points": [
                1400,
                330,
                1680,
                330
            ]
        }
        ],
        "SaltPlateList": [{
            "ID": "SP1",
            "Name": "증발지1-1",
            "X": 550,
            "Y": 355,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP2",
            "Name": "증발지1-2",
            "X": 550,
            "Y": 535,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP3",
            "Name": "증발지1-3",
            "X": 550,
            "Y": 715,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP4",
            "Name": "증발지1-4",
            "X": 550,
            "Y": 895,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP5",
            "Name": "증발지2-1",
            "X": 550,
            "Y": 1075,
            "ImgID": "SaltPlate_B"
        },
        {
            "ID": "SP6",
            "Name": "증발지2-2",
            "X": 920,
            "Y": 355,
            "ImgID": "SaltPlate_C"
        },
        {
            "ID": "SP7",
            "Name": "증발지2-3",
            "X": 920,
            "Y": 575,
            "ImgID": "SaltPlate_C"
        },
        {
            "ID": "SP8",
            "Name": "증발지2-4",
            "X": 920,
            "Y": 795,
            "ImgID": "SaltPlate_C"
        },
        {
            "ID": "SP9",
            "Name": "결정지1-1",
            "X": 920,
            "Y": 1015,
            "ImgID": "SaltPlate_D"
        }
        ],
        "WaterTankList": [{
            "ID": "WT1",
            "Name": "해주1",
            "X": 670,
            "Y": 105,
            "ImgID": "WaterTank_A"
        },
        {
            "ID": "WT2",
            "Name": "해주2",
            "X": 1050,
            "Y": 105,
            "ImgID": "WaterTank_B"
        },
        {
            "ID": "WT3",
            "Name": "해주3",
            "X": 1400,
            "Y": 105,
            "ImgID": "WaterTank_C"
        }
        ],
        "WaterDoorList": [{
            "ID": "WD1",
            "Name": "수문1",
            "X": 780,
            "Y": 355,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD2",
            "Name": "수문2",
            "X": 780,
            "Y": 535,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD3",
            "Name": "수문3",
            "X": 780,
            "Y": 715,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD4",
            "Name": "수문4",
            "X": 780,
            "Y": 895,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD5",
            "Name": "수문5",
            "X": 780,
            "Y": 1075,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD6",
            "Name": "수문6",
            "X": 1085,
            "Y": 543,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD7",
            "Name": "수문7",
            "X": 1085,
            "Y": 763,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD8",
            "Name": "수문8",
            "X": 1250,
            "Y": 950,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD9",
            "Name": "수문9",
            "X": 1250,
            "Y": 1170,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD10",
            "Name": "수문10",
            "X": 830,
            "Y": 255,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD11",
            "Name": "수문11",
            "X": 1300,
            "Y": 255,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD12",
            "Name": "수문12",
            "X": 1630,
            "Y": 255,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD13",
            "Name": "수문13",
            "X": 880,
            "Y": 305,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD14",
            "Name": "수문14",
            "X": 1350,
            "Y": 305,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD15",
            "Name": "수문15",
            "X": 1680,
            "Y": 305,
            "ImgID": "WaterDoor_B"
        }
        ],
        "PumpList": [{
            "ID": "P1",
            "Name": "펌프1",
            "X": 295,
            "Y": 110,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P2",
            "Name": "펌프2",
            "X": 695,
            "Y": 280,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P3",
            "Name": "펌프3",
            "X": 1075,
            "Y": 280,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P4",
            "Name": "펌프4",
            "X": 1425,
            "Y": 280,
            "ImgID": "Pump_A"
        }
        ],
        "WaterOutList": [{
            "ID": "WO1",
            "Name": "바다",
            "X": 1680,
            "Y": 305,
            "ImgID": "WaterOut_A"
        }],
        "ValveList": [{
            "ID": "V1",
            "Name": "밸브1",
            "X": 525,
            "Y": 210,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V2",
            "Name": "밸브2",
            "X": 600,
            "Y": 280,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V3",
            "Name": "밸브3",
            "X": 600,
            "Y": 480,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V4",
            "Name": "밸브4",
            "X": 600,
            "Y": 560,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V5",
            "Name": "밸브5",
            "X": 600,
            "Y": 840,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V6",
            "Name": "밸브6",
            "X": 600,
            "Y": 920,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V7",
            "Name": "밸브7",
            "X": 600,
            "Y": 1100,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V8",
            "Name": "밸브8",
            "X": 980,
            "Y": 380,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V9",
            "Name": "밸브9",
            "X": 980,
            "Y": 1040,
            "ImgID": "Valve_A"
        }
        ],
        "PipeList": [{
            "ID": "PL1",
            "Name": "PL1",
            "ImgID": "PipeList_A",
            "Points": [
                320,
                110,
                450,
                110
            ]
        },
        {
            "ID": "PL2",
            "Name": "PL2",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                160,
                525,
                185
            ]
        },
        {
            "ID": "PL3",
            "Name": "PL3",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                210,
                525,
                280
            ]
        },
        {
            "ID": "PL4",
            "Name": "PL4",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                280,
                575,
                280
            ]
        },
        {
            "ID": "PL5",
            "Name": "PL5",
            "ImgID": "PipeList_A",
            "Points": [
                625,
                280,
                670,
                280
            ]
        },
        {
            "ID": "PL6",
            "Name": "PL6",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                280,
                525,
                520
            ]
        },
        {
            "ID": "PL7",
            "Name": "PL7",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                520,
                525,
                880
            ]
        },
        {
            "ID": "PL8",
            "Name": "PL8",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                880,
                525,
                1060
            ]
        },
        {
            "ID": "PL9",
            "Name": "PL9",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                520,
                600,
                520
            ]
        },
        {
            "ID": "PL10",
            "Name": "PL10",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                880,
                600,
                880
            ]
        },
        {
            "ID": "PL11",
            "Name": "PL11",
            "ImgID": "PipeList_A",
            "Points": [
                525,
                1060,
                600,
                1060
            ]
        },
        {
            "ID": "PL12",
            "Name": "PL12",
            "ImgID": "PipeList_A",
            "Points": [
                600,
                520,
                600,
                505
            ]
        },
        {
            "ID": "PL13",
            "Name": "PL13",
            "ImgID": "PipeList_A",
            "Points": [
                600,
                520,
                600,
                535
            ]
        },
        {
            "ID": "PL14",
            "Name": "PL14",
            "ImgID": "PipeList_A",
            "Points": [
                600,
                880,
                600,
                865
            ]
        },
        {
            "ID": "PL15",
            "Name": "PL15",
            "ImgID": "PipeList_A",
            "Points": [
                600,
                880,
                600,
                895
            ]
        },
        {
            "ID": "PL16",
            "Name": "PL16",
            "ImgID": "PipeList_A",
            "Points": [
                600,
                1060,
                600,
                1075
            ]
        },
        {
            "ID": "PL17",
            "Name": "PL17",
            "ImgID": "PipeList_A",
            "Points": [
                1075,
                305,
                1075,
                330
            ]
        },
        {
            "ID": "PL18",
            "Name": "PL18",
            "ImgID": "PipeList_A",
            "Points": [
                1075,
                330,
                980,
                330
            ]
        },
        {
            "ID": "PL19",
            "Name": "PL19",
            "ImgID": "PipeList_A",
            "Points": [
                980,
                330,
                980,
                360
            ]
        },
        {
            "ID": "PL20",
            "Name": "PL20",
            "ImgID": "PipeList_A",
            "Points": [
                1425,
                305,
                1425,
                1005
            ]
        },
        {
            "ID": "PL21",
            "Name": "PL21",
            "ImgID": "PipeList_A",
            "Points": [
                1425,
                1005,
                980,
                1005
            ]
        },
        {
            "ID": "PL22",
            "Name": "PL22",
            "ImgID": "PipeList_A",
            "Points": [
                980,
                1005,
                980,
                1015
            ]
        }
        ],
        "SaltFilterList": [{
            "ID": "SF1",
            "Name": "여과기",
            "X": 450,
            "Y": 60,
            "ImgID": "SaltFilter_A"
        }],
        "WaterWayList": [{}],
        "SaltRateSensorList": [{
            "ID": "S1",
            "Name": "염도1",
            "X": 700,
            "Y": 450,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S2",
            "Name": "염도2",
            "X": 700,
            "Y": 630,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S3",
            "Name": "염도3",
            "X": 700,
            "Y": 810,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S4",
            "Name": "염도4",
            "X": 700,
            "Y": 990,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S5",
            "Name": "염도5",
            "X": 700,
            "Y": 1170,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S6",
            "Name": "염도6",
            "X": 1120,
            "Y": 480,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S7",
            "Name": "염도7",
            "X": 1120,
            "Y": 700,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S8",
            "Name": "염도8",
            "X": 1120,
            "Y": 920,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S9",
            "Name": "염도9",
            "X": 1120,
            "Y": 1140,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S10",
            "Name": "염도10",
            "X": 785,
            "Y": 175,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S11",
            "Name": "염도11",
            "X": 1210,
            "Y": 175,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S12",
            "Name": "염도12",
            "X": 1550,
            "Y": 175,
            "ImgID": "SRSensor"
        }
        ],
        "WaterLevelSensorList": [{
            "ID": "WL1",
            "Name": "수위1",
            "X": 650,
            "Y": 450,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL2",
            "Name": "수위2",
            "X": 650,
            "Y": 630,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL3",
            "Name": "수위3",
            "X": 650,
            "Y": 810,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL4",
            "Name": "수위4",
            "X": 650,
            "Y": 990,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL5",
            "Name": "수위5",
            "X": 650,
            "Y": 1170,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL6",
            "Name": "수위6",
            "X": 1070,
            "Y": 480,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL7",
            "Name": "수위7",
            "X": 1070,
            "Y": 700,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL8",
            "Name": "수위8",
            "X": 1070,
            "Y": 920,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL9",
            "Name": "수위9",
            "X": 1070,
            "Y": 1140,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL10",
            "Name": "수위10",
            "X": 735,
            "Y": 175,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL11",
            "Name": "수위11",
            "X": 1160,
            "Y": 175,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL12",
            "Name": "수위12",
            "X": 1500,
            "Y": 175,
            "ImgID": "WLSensor"
        }
        ],
        "UnderWaterTemperatureList": [{
            "ID": "UWT1",
            "Name": "수중온도1",
            "X": 650,
            "Y": 475,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT2",
            "Name": "수중온도2",
            "X": 650,
            "Y": 655,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT3",
            "Name": "수중온도3",
            "X": 650,
            "Y": 835,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT4",
            "Name": "수중온도4",
            "X": 650,
            "Y": 1015,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT5",
            "Name": "수중온도5",
            "X": 650,
            "Y": 1195,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT6",
            "Name": "수중온도6",
            "X": 1070,
            "Y": 505,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT7",
            "Name": "수중온도7",
            "X": 1070,
            "Y": 725,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT8",
            "Name": "수중온도8",
            "X": 1070,
            "Y": 945,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT9",
            "Name": "수중온도9",
            "X": 1070,
            "Y": 1165,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT10",
            "Name": "수중온도10",
            "X": 735,
            "Y": 200,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT11",
            "Name": "수중온도11",
            "X": 1160,
            "Y": 200,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT12",
            "Name": "수중온도12",
            "X": 1500,
            "Y": 200,
            "ImgID": "UWTemperature"
        }
        ],
        "ModuleTemperatureList": [{
            "ID": "MT1",
            "Name": "모듈온도1",
            "X": 715,
            "Y": 475,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT2",
            "Name": "모듈온도2",
            "X": 715,
            "Y": 655,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT3",
            "Name": "모듈온도3",
            "X": 715,
            "Y": 835,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT4",
            "Name": "모듈온도4",
            "X": 715,
            "Y": 1015,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT5",
            "Name": "모듈온도5",
            "X": 715,
            "Y": 1195,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT6",
            "Name": "모듈온도6",
            "X": 1135,
            "Y": 505,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT7",
            "Name": "모듈온도7",
            "X": 1135,
            "Y": 725,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT8",
            "Name": "모듈온도8",
            "X": 1135,
            "Y": 945,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT9",
            "Name": "모듈온도9",
            "X": 1135,
            "Y": 1165,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT10",
            "Name": "모듈온도10",
            "X": 800,
            "Y": 200,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT11",
            "Name": "모듈온도11",
            "X": 1225,
            "Y": 200,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT12",
            "Name": "모듈온도12",
            "X": 1565,
            "Y": 200,
            "ImgID": "MTemperature"
        }
        ]
    },

    "SETINFO": {
        "WaterLevelData": [{
            "ID": "WL1",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 12001
        },
        {
            "ID": "WL2",
            "DeviceType": "Serial",
            "BoardID": "7775",
            "IP": "127.0.0.1",
            "Port": 12002
        },
        {
            "ID": "WL3",
            "DeviceType": "Serial",
            "BoardID": "A060",
            "IP": "127.0.0.1",
            "Port": 12003
        },
        {
            "ID": "WL4",
            "DeviceType": "Serial",
            "BoardID": "7911",
            "IP": "127.0.0.1",
            "Port": 12004
        },
        {
            "ID": "WL5",
            "DeviceType": "Serial",
            "BoardID": "78D6",
            "IP": "127.0.0.1",
            "Port": 12005
        },
        {
            "ID": "WL6",
            "DeviceType": "Serial",
            "BoardID": "7771",
            "IP": "127.0.0.1",
            "Port": 12006
        },
        {
            "ID": "WL7",
            "DeviceType": "Socket",
            "BoardID": "A05F",
            "IP": "127.0.0.1",
            "Port": 12007
        },
        {
            "ID": "WL8",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 12008
        },
        {
            "ID": "WL9",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 12009
        },
        {
            "ID": "WL10",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 12010
        },
        {
            "ID": "WL11",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 12011
        },
        {
            "ID": "WL12",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 12012
        }
        ],
        "SalinityData": [{
            "ID": "S1",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 13001
        },
        {
            "ID": "S2",
            "DeviceType": "Serial",
            "BoardID": "7775",
            "IP": "127.0.0.1",
            "Port": 13002
        },
        {
            "ID": "S3",
            "DeviceType": "Serial",
            "BoardID": "A060",
            "IP": "127.0.0.1",
            "Port": 13003
        },
        {
            "ID": "S4",
            "DeviceType": "Serial",
            "BoardID": "7911",
            "IP": "127.0.0.1",
            "Port": 13004
        },
        {
            "ID": "S5",
            "DeviceType": "Serial",
            "BoardID": "78D6",
            "IP": "127.0.0.1",
            "Port": 13005
        },
        {
            "ID": "S6",
            "DeviceType": "Serial",
            "BoardID": "7771",
            "IP": "127.0.0.1",
            "Port": 13006
        },
        {
            "ID": "S7",
            "DeviceType": "Socket",
            "BoardID": "A05F",
            "IP": "127.0.0.1",
            "Port": 13007
        },
        {
            "ID": "S8",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 13008
        },
        {
            "ID": "S9",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 13009
        },
        {
            "ID": "S10",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 13010
        },
        {
            "ID": "S11",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 13011
        },
        {
            "ID": "S12",
            "DeviceType": "Socket",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 13012
        }
        ],
        "WaterDoorData": [{
            "ID": "WD1",
            "DeviceType": "Serial",
            "BoardID": "A05E",
            "IP": "127.0.0.1",
            "Port": 11001
        },
        {
            "ID": "WD2",
            "DeviceType": "Serial",
            "BoardID": "C7EB",
            "IP": "127.0.0.1",
            "Port": 11002
        },
        {
            "ID": "WD3",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 11003
        },
        {
            "ID": "WD4",
            "DeviceType": "Serial",
            "BoardID": "7775",
            "IP": "127.0.0.1",
            "Port": 11004
        },
        {
            "ID": "WD5",
            "DeviceType": "Serial",
            "BoardID": "A060",
            "IP": "127.0.0.1",
            "Port": 11005
        },
        {
            "ID": "WD6",
            "DeviceType": "Serial",
            "BoardID": "7911",
            "IP": "127.0.0.1",
            "Port": 11006
        },
        {
            "ID": "WD7",
            "DeviceType": "Serial",
            "BoardID": "78D6",
            "IP": "127.0.0.1",
            "Port": 11007
        },
        {
            "ID": "WD8",
            "DeviceType": "Serial",
            "BoardID": "7771",
            "IP": "127.0.0.1",
            "Port": 11008
        },
        {
            "ID": "WD9",
            "DeviceType": "Serial",
            "BoardID": "A05F",
            "IP": "127.0.0.1",
            "Port": 11009
        },
        {
            "ID": "WD10",
            "DeviceType": "Serial",
            "BoardID": "A05D",
            "IP": "127.0.0.1",
            "Port": 11010
        },
        {
            "ID": "WD11",
            "DeviceType": "Serial",
            "BoardID": "A0EF",
            "IP": "127.0.0.1",
            "Port": 11011
        },
        {
            "ID": "WD12",
            "DeviceType": "Serial",
            "BoardID": "A0F1",
            "IP": "127.0.0.1",
            "Port": 11012
        },
        {
            "ID": "WD13",
            "DeviceType": "Serial",
            "BoardID": "A0F1",
            "IP": "127.0.0.1",
            "Port": 11013
        },
        {
            "ID": "WD14",
            "DeviceType": "Serial",
            "BoardID": "A0F1",
            "IP": "127.0.0.1",
            "Port": 11014
        },
        {
            "ID": "WD15",
            "DeviceType": "Serial",
            "BoardID": "A0F1",
            "IP": "127.0.0.1",
            "Port": 11015
        }
        ],
        "ValveData": [{
            "ID": "V1",
            "DeviceType": "Serial",
            "BoardID": "C7F3",
            "IP": "127.0.0.1",
            "Port": 14001
        },
        {
            "ID": "V2",
            "DeviceType": "Serial",
            "BoardID": "C7EF",
            "IP": "127.0.0.1",
            "Port": 14002
        },
        {
            "ID": "V3",
            "DeviceType": "Serial",
            "BoardID": "C7F0",
            "IP": "127.0.0.1",
            "Port": 14003
        },
        {
            "ID": "V4",
            "DeviceType": "Serial",
            "BoardID": "C7F4",
            "IP": "127.0.0.1",
            "Port": 14004
        },
        {
            "ID": "V5",
            "DeviceType": "Serial",
            "BoardID": "C7EC",
            "IP": "127.0.0.1",
            "Port": 14005
        },
        {
            "ID": "V6",
            "DeviceType": "Serial",
            "BoardID": "C7ED",
            "IP": "127.0.0.1",
            "Port": 14006
        },
        {
            "ID": "V7",
            "DeviceType": "Serial",
            "BoardID": "C7F4",
            "IP": "127.0.0.1",
            "Port": 14007
        },
        {
            "ID": "V8",
            "DeviceType": "Serial",
            "BoardID": "C7EC",
            "IP": "127.0.0.1",
            "Port": 14008
        },
        {
            "ID": "V6",
            "DeviceType": "Serial",
            "BoardID": "C7ED",
            "IP": "127.0.0.1",
            "Port": 14009
        }
        ],
        "PumpData": [{
            "ID": "P1",
            "DeviceType": "Serial",
            "BoardID": "C7F2",
            "IP": "127.0.0.1",
            "Port": 15001
        },
        {
            "ID": "P2",
            "DeviceType": "Serial",
            "BoardID": "C7F1",
            "IP": "127.0.0.1",
            "Port": 15002
        },
        {
            "ID": "P3",
            "DeviceType": "Serial",
            "BoardID": "A0EE",
            "IP": "127.0.0.1",
            "Port": 15003
        }
        ],
        "UnderWaterTemperatureData": [{
            "ID": "UWT1",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16001
        },
        {
            "ID": "UWT2",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16002
        },
        {
            "ID": "UWT3",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16003
        },
        {
            "ID": "UWT4",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16004
        },
        {
            "ID": "UWT5",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16005
        },
        {
            "ID": "UWT6",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16006
        },
        {
            "ID": "UWT7",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16007
        },
        {
            "ID": "UWT8",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16008
        },
        {
            "ID": "UWT9",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16009
        },
        {
            "ID": "UWT10",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16010
        },
        {
            "ID": "UWT11",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16011
        },
        {
            "ID": "UWT12",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 16012
        }
        ],
        "ModuleTemperatureData": [{
            "ID": "MT1",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17001
        },
        {
            "ID": "MT2",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17002
        },
        {
            "ID": "MT3",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17003
        },
        {
            "ID": "MT4",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17004
        },
        {
            "ID": "MT5",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17005
        },
        {
            "ID": "MT6",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17006
        },
        {
            "ID": "MT7",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17007
        },
        {
            "ID": "MT8",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17008
        },
        {
            "ID": "MT9",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17009
        },
        {
            "ID": "MT10",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17010
        },
        {
            "ID": "MT11",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17011
        },
        {
            "ID": "MT12",
            "DeviceType": "Serial",
            "BoardID": "A0F2",
            "IP": "127.0.0.1",
            "Port": 17012
        }
        ]
    },

    "RELATION": {
        "SaltPlateData": [{
            "ID": "SP1",
            "PlateType": "Evaporating Pond 1",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V3"
            ],
            "ListWaterDoor": [
                "WD1"
            ],
            "ListWaterLevel": [
                "WL1"
            ],
            "ListSalinity": [
                "S1"
            ],
            "ListUnderWaterTemperature": [
                "UWT1"
            ],
            "ListModuleTemperature": [
                "MT1"
            ]
        },
        {
            "ID": "SP2",
            "PlateType": "Evaporating Pond 1",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V4"
            ],
            "ListWaterDoor": [
                "WD2"
            ],
            "ListWaterLevel": [
                "WL2"
            ],
            "ListSalinity": [
                "S2"
            ],
            "ListUnderWaterTemperature": [
                "UWT2"
            ],
            "ListModuleTemperature": [
                "MT2"
            ]
        },
        {
            "ID": "SP3",
            "PlateType": "Evaporating Pond 1",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V5"
            ],
            "ListWaterDoor": [
                "WD3"
            ],
            "ListWaterLevel": [
                "WL3"
            ],
            "ListSalinity": [
                "S3"
            ],
            "ListUnderWaterTemperature": [
                "UWT3"
            ],
            "ListModuleTemperature": [
                "MT3"
            ]
        },
        {
            "ID": "SP4",
            "PlateType": "Evaporating Pond 1",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V6"
            ],
            "ListWaterDoor": [
                "WD4"
            ],
            "ListWaterLevel": [
                "WL4"
            ],
            "ListSalinity": [
                "S4"
            ],
            "ListUnderWaterTemperature": [
                "UWT4"
            ],
            "ListModuleTemperature": [
                "MT4"
            ]
        },
        {
            "ID": "SP5",
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V7"
            ],
            "ListWaterDoor": [
                "WD5"
            ],
            "ListWaterLevel": [
                "WL5"
            ],
            "ListSalinity": [
                "S5"
            ],
            "ListUnderWaterTemperature": [
                "UWT5"
            ],
            "ListModuleTemperature": [
                "MT5"
            ]
        },
        {
            "ID": "SP6",
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V8"
            ],
            "ListWaterDoor": [
                "WD6"
            ],
            "ListWaterLevel": [
                "WL6"
            ],
            "ListSalinity": [
                "S6"
            ],
            "ListUnderWaterTemperature": [
                "UWT6"
            ],
            "ListModuleTemperature": [
                "MT6"
            ]
        },
        {
            "ID": "SP7",
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListWaterDoor": [
                "WD6",
                "WD7"
            ],
            "ListWaterLevel": [
                "WL7"
            ],
            "ListSalinity": [
                "S7"
            ],
            "ListUnderWaterTemperature": [
                "UWT7"
            ],
            "ListModuleTemperature": [
                "MT7"
            ]
        },
        {
            "ID": "SP8",
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListWaterDoor": [
                "WD7",
                "WD8"
            ],
            "ListWaterLevel": [
                "WL8"
            ],
            "ListSalinity": [
                "S8"
            ],
            "ListUnderWaterTemperature": [
                "UWT8"
            ],
            "ListModuleTemperature": [
                "MT8"
            ]
        },
        {
            "ID": "SP9",
            "PlateType": "Crystallizing Pond",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V9"
            ],
            "ListWaterDoor": [
                "WD9"
            ],
            "ListWaterLevel": [
                "WL9"
            ],
            "ListSalinity": [
                "S9"
            ],
            "ListUnderWaterTemperature": [
                "UWT9"
            ],
            "ListModuleTemperature": [
                "MT9"
            ]
        }
        ],
        "WaterTankData": [{
            "ID": "WT1",
            "TankType": "Evaporating Pond",
            "SettingSalinity": "",
            "MinWaterLevel": 20,
            "MaxWaterLevel": 100,
            "Depth": -1,
            "ListWaterDoor": [
                "WD10"
            ],
            "ListPump": [
                "p2"
            ],
            "ListWaterLevel": [
                "WL10"
            ],
            "ListSalinity": [
                "S10"
            ],
            "ListUnderWaterTemperature": [
                "UWT10"
            ],
            "ListModuleTemperature": [
                "MT10"
            ]
        },
        {
            "ID": "WT2",
            "TankType": "Evaporating Pond",
            "SettingSalinity": "",
            "MinWaterLevel": 20,
            "MaxWaterLevel": 100,
            "Depth": -1,
            "ListWaterDoor": [
                "WD11"
            ],
            "ListPump": [
                "p3"
            ],
            "ListWaterLevel": [
                "WL11"
            ],
            "ListSalinity": [
                "S11"
            ],
            "ListUnderWaterTemperature": [
                "UWT11"
            ],
            "ListModuleTemperature": [
                "MT11"
            ]
        },
        {
            "ID": "WT3",
            "TankType": "Evaporating Pond",
            "SettingSalinity": "",
            "MinWaterLevel": 20,
            "MaxWaterLevel": 100,
            "Depth": -1,
            "ListWaterDoor": [
                "WD12"
            ],
            "ListPump": [
                "p4"
            ],
            "ListWaterLevel": [
                "WL12"
            ],
            "ListSalinity": [
                "S12"
            ],
            "ListUnderWaterTemperature": [
                "UWT12"
            ],
            "ListModuleTemperature": [
                "MT12"
            ]
        }
        ],
        "WaterOutData": [{
            "ID": "WO1",
            "Depth": -1,
            "SettingSalinity": "",
            "ListWaterDoor": [
                "WD15"
            ]
        }],
        "ReservoirData": [{
            "ID": "RV1",
            "Depth": 100,
            "SettingSalinity": "",
            "ListPump": [
                "P1"
            ]
        }],
        "WaterWayData": [{
            "ID": "WW1",
            "Depth": 0.9,
            "ListWaterDoor": [
                "WD1",
                "WD2",
                "WD3",
                "WD4",
                "WD5",
                "WD10",
                "WD13"
            ],
            "ListSaltPondLine": [
                "SPL1"
            ]
        },
        {
            "ID": "WW2",
            "Depth": 0.9,
            "ListWaterDoor": [
                "WD8",
                "WD9",
                "WD11",
                "WD13",
                "WD14"
            ],
            "ListSaltPondLine": [
                "SPL2",
                "SPL3"
            ]
        },
        {
            "ID": "WW3",
            "Depth": 0.9,
            "ListWaterDoor": [
                "WD12",
                "WD14",
                "WD15"
            ],
            "ListSaltPondLine": [
                "SPL4"
            ]
        }
        ],
        "ValveRankData": [{
            "ID": "P1",
            "High": [],
            "Low": []
        },
        {
            "ID": "P2",
            "High": [],
            "Low": [
                "V2"
            ]
        },
        {
            "ID": "P3",
            "High": [],
            "Low": [
                "V8"
            ]
        },
        {
            "ID": "P4",
            "High": [],
            "Low": [
                "V9"
            ]
        },
        {
            "ID": "V1",
            "High": [],
            "Low": []
        },
        {
            "ID": "V2",
            "High": [
                "P2"
            ],
            "Low": [
                "V3",
                "V4"
            ]
        },
        {
            "ID": "V3",
            "High": [
                "V2"
            ],
            "Low": []
        },
        {
            "ID": "V4",
            "High": [
                "V2"
            ],
            "Low": []
        },
        {
            "ID": "V5",
            "High": [
                "V2"
            ],
            "Low": []
        },
        {
            "ID": "V6",
            "High": [
                "V2"
            ],
            "Low": []
        },
        {
            "ID": "V7",
            "High": [
                "V2"
            ],
            "Low": []
        },
        {
            "ID": "V8",
            "High": [
                "P3"
            ],
            "Low": []
        },
        {
            "ID": "V9",
            "High": [
                "P4"
            ],
            "Low": []
        }
        ],
        "SaltFilterData": [{}],
        "FeedRankData": [{
            "ID": "SP1",
            "Rank": [
                "SF1",
                "WT1"
            ]
        },
        {
            "ID": "SP2",
            "Rank": [
                "SF1",
                "WT1"
            ]
        },
        {
            "ID": "SP3",
            "Rank": [
                "SF1",
                "WT1"
            ]
        },
        {
            "ID": "SP4",
            "Rank": [
                "SF1",
                "WT1"
            ]
        },
        {
            "ID": "SP5",
            "Rank": [
                "SF1",
                "WT1"
            ]
        },
        {
            "ID": "SP6",
            "Rank": [
                "WT2"
            ]
        },
        {
            "ID": "SP7",
            "Rank": [
                "SP6"
            ]
        },
        {
            "ID": "SP8",
            "Rank": [
                "SP7"
            ]
        },
        {
            "ID": "SP9",
            "Rank": [
                "WT3"
            ]
        }
        ],
        "MaxSalinityFeedRankData": [{
            "ID": "SP1",
            "Rank": []
        },
        {
            "ID": "SP2",
            "Rank": []
        },
        {
            "ID": "SP3",
            "Rank": []
        },
        {
            "ID": "SP4",
            "Rank": []
        },
        {
            "ID": "SP5",
            "Rank": []
        },
        {
            "ID": "SP6",
            "Rank": []
        },
        {
            "ID": "SP7",
            "Rank": []
        },
        {
            "ID": "SP8",
            "Rank": []
        },
        {
            "ID": "SP9",
            "Rank": []
        }
        ]
    }

}