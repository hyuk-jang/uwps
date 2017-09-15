﻿var Map = {
    "MAP": {
        "MapSizeX": 1900,
        "MapSizeY": 1900,
        "ImgObjList": [{
            "ID": "Reservoir",
            "ImgData": {
                "Type": "Rect",
                "Width": 230,
                "Height": 150,
                "Color": "#33ffff"
            }
        },
        {
            "ID": "SaltPlate_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 200,
                "Height": 150,
                "Color": "#f8f8f8"
            }
        },
        {
            "ID": "SaltPlate_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 200,
                "Height": 150,
                "Color": "#c4c8c3"
            }
        },
        {
            "ID": "SaltPlate_C",
            "ImgData": {
                "Type": "Rect",
                "Width": 200,
                "Height": 150,
                "Color": "#c4c8c3"
            }
        },
        {
            "ID": "SaltPondLine_A",
            "ImgData": {
                "Type": "Line",
                "StrokeWidth": 40,
                "Color": "#33ccff"
            }
        },
        {
            "ID": "WaterTank_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 110,
                "Color": "#dbdbdb"
            }
        },
        {
            "ID": "WaterDoor_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 40,
                "Height": 40,
                "Color": "#9eb0d4"
            }
        },
        {
            "ID": "WaterDoor_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 40,
                "Height": 40,
                "Color": "#3cc8c8"
            }
        },
        {
            "ID": "WaterOut_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 100,
                "Height": 680,
                "Color": "#a5d8f0"
            }
        },
        {
            "ID": "Pump_A",
            "ImgData": {
                "Type": "Circle",
                "Radius": 20,
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
                "Radius": 20,
                "Color": "#efb4ce"
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
                670,
                880,
                670,
                160
            ]
        },
        {
            "ID": "SPL2",
            "Name": "2",
            "ImgID": "SaltPondLine_A",
            "Points": [
                1000,
                880,
                1000,
                160
            ]
        },
        {
            "ID": "SPL3",
            "Name": "3",
            "ImgID": "SaltPondLine_A",
            "Points": [
                650,
                180,
                840,
                180
            ]
        },
        {
            "ID": "SPL4",
            "Name": "4",
            "ImgID": "SaltPondLine_A",
            "Points": [
                880,
                180,
                1020,
                180
            ]
        },
        {
            "ID": "SPL5",
            "Name": "5",
            "ImgID": "SaltPondLine_A",
            "Points": [
                1060,
                180,
                1200,
                180
            ]
        }
        ],
        "SaltPlateList": [{
            "ID": "SP1",
            "Name": "증발지1-1",
            "X": 450,
            "Y": 50,
            "ImgID": "SaltPlate_B"
        },
        {
            "ID": "SP2",
            "Name": "증발지1-2",
            "X": 450,
            "Y": 220,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP3",
            "Name": "증발지1-3",
            "X": 450,
            "Y": 390,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP4",
            "Name": "증발지1-4",
            "X": 450,
            "Y": 560,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP5",
            "Name": "증발지1-5",
            "X": 450,
            "Y": 730,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP6",
            "Name": "증발지1",
            "X": 780,
            "Y": 220,
            "ImgID": "SaltPlate_B"
        },
        {
            "ID": "SP7",
            "Name": "증발지2",
            "X": 780,
            "Y": 390,
            "ImgID": "SaltPlate_B"
        },
        {
            "ID": "SP8",
            "Name": "증발지3",
            "X": 780,
            "Y": 560,
            "ImgID": "SaltPlate_B"
        },
        {
            "ID": "SP9",
            "Name": "결정지1",
            "X": 780,
            "Y": 730,
            "ImgID": "SaltPlate_C"
        }
        ],
        "WaterTankList": [{
            "ID": "WT1",
            "Name": "해주1",
            "X": 690,
            "Y": 50,
            "ImgID": "WaterTank_A"
        },
        {
            "ID": "WT2",
            "Name": "해주2",
            "X": 870,
            "Y": 50,
            "ImgID": "WaterTank_A"
        },
        {
            "ID": "WT3",
            "Name": "해주3",
            "X": 1050,
            "Y": 50,
            "ImgID": "WaterTank_A"
        }
        ],
        "WaterDoorList": [{
            "ID": "WD1",
            "Name": "수문1",
            "X": 610,
            "Y": 160,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD2",
            "Name": "수문2",
            "X": 610,
            "Y": 330,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD3",
            "Name": "수문3",
            "X": 610,
            "Y": 500,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD4",
            "Name": "수문4",
            "X": 610,
            "Y": 670,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD5",
            "Name": "수문5",
            "X": 610,
            "Y": 840,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD6",
            "Name": "수문6",
            "X": 800,
            "Y": 360,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD7",
            "Name": "수문7",
            "X": 800,
            "Y": 530,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD8",
            "Name": "수문8",
            "X": 940,
            "Y": 670,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD9",
            "Name": "수문9",
            "X": 940,
            "Y": 840,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD10",
            "Name": "수문10",
            "X": 800,
            "Y": 120,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD11",
            "Name": "수문11",
            "X": 980,
            "Y": 120,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD12",
            "Name": "수문12",
            "X": 1160,
            "Y": 120,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD13",
            "Name": "수문13",
            "X": 840,
            "Y": 160,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD14",
            "Name": "수문14",
            "X": 1020,
            "Y": 160,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD15",
            "Name": "수문15",
            "X": 1160,
            "Y": 200,
            "ImgID": "WaterDoor_B"
        }
        ],
        "PumpList": [{
            "ID": "P1",
            "Name": "펌프1",
            "X": 260,
            "Y": 120,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P2",
            "Name": "펌프2",
            "X": 820,
            "Y": 85,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P3",
            "Name": "펌프3",
            "X": 890,
            "Y": 140,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P4",
            "Name": "펌프4",
            "X": 1070,
            "Y": 140,
            "ImgID": "Pump_A"
        }
        ],
        "ValveList": [{
            "ID": "V1",
            "Name": "밸브1",
            "X": 350,
            "Y": 120,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V2",
            "Name": "밸브2",
            "X": 470,
            "Y": 120,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V3",
            "Name": "밸브3",
            "X": 470,
            "Y": 350,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V4",
            "Name": "밸브4",
            "X": 470,
            "Y": 410,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V5",
            "Name": "밸브5",
            "X": 470,
            "Y": 690,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V6",
            "Name": "밸브6",
            "X": 470,
            "Y": 750,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V7",
            "Name": "밸브7",
            "X": 890,
            "Y": 85,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V8",
            "Name": "밸브8",
            "X": 820,
            "Y": 240,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V9",
            "Name": "밸브9",
            "X": 820,
            "Y": 750,
            "ImgID": "Valve_A"
        }
        ],
        "PipeList": [{
            "ID": "PL1",
            "Name": "PL1",
            "ImgID": "PipeList_A",
            "Points": [
                280,
                120,
                330,
                120
            ]
        },
        {
            "ID": "PL2",
            "Name": "PL2",
            "ImgID": "PipeList_A",
            "Points": [
                370,
                120,
                410,
                120
            ]
        },
        {
            "ID": "PL3",
            "Name": "PL3",
            "ImgID": "PipeList_A",
            "Points": [
                410,
                120,
                450,
                120
            ]
        },
        {
            "ID": "PL4",
            "Name": "PL4",
            "ImgID": "PipeList_A",
            "Points": [
                410,
                120,
                410,
                380
            ]
        },
        {
            "ID": "PL5",
            "Name": "PL5",
            "ImgID": "PipeList_A",
            "Points": [
                410,
                380,
                410,
                720
            ]
        },
        {
            "ID": "PL6",
            "Name": "PL6",
            "ImgID": "PipeList_A",
            "Points": [
                410,
                380,
                470,
                380
            ]
        },
        {
            "ID": "PL7",
            "Name": "PL7",
            "ImgID": "PipeList_A",
            "Points": [
                410,
                720,
                470,
                720
            ]
        },
        {
            "ID": "PL8",
            "Name": "PL8",
            "ImgID": "PipeList_A",
            "Points": [
                470,
                370,
                470,
                380
            ]
        },
        {
            "ID": "PL9",
            "Name": "PL9",
            "ImgID": "PipeList_A",
            "Points": [
                470,
                380,
                470,
                390
            ]
        },
        {
            "ID": "PL10",
            "Name": "PL10",
            "ImgID": "PipeList_A",
            "Points": [
                470,
                710,
                470,
                720
            ]
        },
        {
            "ID": "PL11",
            "Name": "PL11",
            "ImgID": "PipeList_A",
            "Points": [
                470,
                720,
                470,
                730
            ]
        },
        {
            "ID": "PL12",
            "Name": "PL12",
            "ImgID": "PipeList_A",
            "Points": [
                840,
                85,
                870,
                85
            ]
        },
        {
            "ID": "PL13",
            "Name": "PL13",
            "ImgID": "PipeList_A",
            "Points": [
                890,
                160,
                890,
                210
            ]
        },
        {
            "ID": "PL14",
            "Name": "PL14",
            "ImgID": "PipeList_A",
            "Points": [
                890,
                210,
                820,
                210
            ]
        },
        {
            "ID": "PL15",
            "Name": "PL15",
            "ImgID": "PipeList_A",
            "Points": [
                820,
                210,
                820,
                220
            ]
        },
        {
            "ID": "PL16",
            "Name": "PL16",
            "ImgID": "PipeList_A",
            "Points": [
                1070,
                160,
                1070,
                720
            ]
        },
        {
            "ID": "PL17",
            "Name": "PL17",
            "ImgID": "PipeList_A",
            "Points": [
                1070,
                720,
                820,
                720
            ]
        },
        {
            "ID": "PL18",
            "Name": "PL18",
            "ImgID": "PipeList_A",
            "Points": [
                820,
                720,
                820,
                730
            ]
        }
        ],
        "WaterOutList": [{
            "ID": "WO1",
            "Name": "바다",
            "X": 1100,
            "Y": 200,
            "ImgID": "WaterOut_A"
        }],
        "WaterWayList": [{}],
        "SaltRateSensorList": [{
            "ID": "S1",
            "Name": "염도1",
            "X": 550,
            "Y": 145,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S2",
            "Name": "염도2",
            "X": 550,
            "Y": 315,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S3",
            "Name": "염도3",
            "X": 550,
            "Y": 485,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S4",
            "Name": "염도4",
            "X": 550,
            "Y": 655,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S5",
            "Name": "염도5",
            "X": 550,
            "Y": 825,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S6",
            "Name": "염도6",
            "X": 880,
            "Y": 315,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S7",
            "Name": "염도7",
            "X": 880,
            "Y": 485,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S8",
            "Name": "염도8",
            "X": 880,
            "Y": 655,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S9",
            "Name": "염도9",
            "X": 880,
            "Y": 825,
            "ImgID": "SRSensor"
        },
            // {
            //     "ID": "S10",
            //     "Name": "염도10",
            //     "X": 745,
            //     "Y": 110,
            //     "ImgID": "SRSensor"
            // },
            // {
            //     "ID": "S11",
            //     "Name": "염도11",
            //     "X": 1210,
            //     "Y": 110,
            //     "ImgID": "SRSensor"
            // },
            // {
            //     "ID": "S12",
            //     "Name": "염도12",
            //     "X": 1550,
            //     "Y": 110,
            //     "ImgID": "SRSensor"
            // }
        ],
        "WaterLevelSensorList": [{
            "ID": "WL1",
            "Name": "수위1",
            "X": 500,
            "Y": 145,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL2",
            "Name": "수위2",
            "X": 500,
            "Y": 315,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL3",
            "Name": "수위3",
            "X": 500,
            "Y": 485,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL4",
            "Name": "수위4",
            "X": 500,
            "Y": 655,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL5",
            "Name": "수위5",
            "X": 500,
            "Y": 825,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL6",
            "Name": "수위6",
            "X": 830,
            "Y": 315,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL7",
            "Name": "수위7",
            "X": 830,
            "Y": 485,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL8",
            "Name": "수위8",
            "X": 830,
            "Y": 655,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL9",
            "Name": "수위9",
            "X": 830,
            "Y": 825,
            "ImgID": "WLSensor"
        },
            // {
            //     "ID": "WL10",
            //     "Name": "수위10",
            //     "X": 695,
            //     "Y": 110,
            //     "ImgID": "WLSensor"
            // },
            // {
            //     "ID": "WL11",
            //     "Name": "수위11",
            //     "X": 915,
            //     "Y": 110,
            //     "ImgID": "WLSensor"
            // },
            // {
            //     "ID": "WL12",
            //     "Name": "수위12",
            //     "X": 1500,
            //     "Y": 110,
            //     "ImgID": "WLSensor"
            // }
        ],
        "UnderWaterTemperatureList": [{
            "ID": "UWT1",
            "Name": "수중온도1",
            "X": 485,
            "Y": 170,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT2",
            "Name": "수중온도2",
            "X": 485,
            "Y": 340,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT3",
            "Name": "수중온도3",
            "X": 485,
            "Y": 510,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT4",
            "Name": "수중온도4",
            "X": 485,
            "Y": 680,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT5",
            "Name": "수중온도5",
            "X": 485,
            "Y": 850,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT6",
            "Name": "수중온도6",
            "X": 815,
            "Y": 340,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT7",
            "Name": "수중온도7",
            "X": 815,
            "Y": 510,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT8",
            "Name": "수중온도8",
            "X": 815,
            "Y": 680,
            "ImgID": "UWTemperature"
        },
        {
            "ID": "UWT9",
            "Name": "수중온도9",
            "X": 815,
            "Y": 850,
            "ImgID": "UWTemperature"
        },
            // {
            //     "ID": "UWT10",
            //     "Name": "수중온도10",
            //     "X": 695,
            //     "Y": 135,
            //     "ImgID": "UWTemperature"
            // },
            // {
            //     "ID": "UWT11",
            //     "Name": "수중온도11",
            //     "X": 1160,
            //     "Y": 200,
            //     "ImgID": "UWTemperature"
            // },
            // {
            //     "ID": "UWT12",
            //     "Name": "수중온도12",
            //     "X": 1500,
            //     "Y": 200,
            //     "ImgID": "UWTemperature"
            // }
        ],
        "ModuleTemperatureList": [{
            "ID": "MT1",
            "Name": "모듈온도1",
            "X": 550,
            "Y": 170,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT2",
            "Name": "모듈온도2",
            "X": 550,
            "Y": 340,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT3",
            "Name": "모듈온도3",
            "X": 550,
            "Y": 510,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT4",
            "Name": "모듈온도4",
            "X": 550,
            "Y": 680,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT5",
            "Name": "모듈온도5",
            "X": 550,
            "Y": 850,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT6",
            "Name": "모듈온도6",
            "X": 880,
            "Y": 340,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT7",
            "Name": "모듈온도7",
            "X": 880,
            "Y": 510,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT8",
            "Name": "모듈온도8",
            "X": 880,
            "Y": 680,
            "ImgID": "MTemperature"
        },
        {
            "ID": "MT9",
            "Name": "모듈온도9",
            "X": 880,
            "Y": 850,
            "ImgID": "MTemperature"
        },
            // {
            //     "ID": "MT10",
            //     "Name": "모듈온도10",
            //     "X": 760,
            //     "Y": 135,
            //     "ImgID": "MTemperature"
            // },
            // {
            //     "ID": "MT11",
            //     "Name": "모듈온도11",
            //     "X": 1225,
            //     "Y": 200,
            //     "ImgID": "MTemperature"
            // },
            // {
            //     "ID": "MT12",
            //     "Name": "모듈온도12",
            //     "X": 1565,
            //     "Y": 200,
            //     "ImgID": "MTemperature"
            // }
        ],

    },

    "SETINFO": {
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
            "ID": "V9",
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
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V2"
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
                "V3"
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
                "V4"
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
                "V5"
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
            "PlateType": "Evaporating Pond 1",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListValve": [
                "V6"
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
                "P2"
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
            "ListValve": [
                "V7"
            ],
            "ListPump": [
                "P3"
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
                "P4"
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
            "Depth": 0.7,
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
                "SPL1",
                "SPL3"
            ]
        },
        {
            "ID": "WW2",
            "Depth": 0.8,
            "ListWaterDoor": [
                "WD8",
                "WD9",
                "WD11",
                "WD13",
                "WD14"
            ],
            "ListSaltPondLine": [
                "SPL2",
                "SPL4"
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
                "SPL5"
            ]
        }
        ],
        "ValveRankData": [{
            "ID": "P1",
            "High": [],
            "Low": [
                "V1"
            ]
        },
        {
            "ID": "P2",
            "High": [],
            "Low": [
                "V7"
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
            "High": [
                "P1"
            ],
            "Low": [
                "V2",
                "V3",
                "V4",
                "V5",
                "V6"

            ]
        },
        {
            "ID": "V2",
            "High": [
                "V1"
            ],
            "Low": []
        },
        {
            "ID": "V3",
            "High": [
                "V1"
            ],
            "Low": []
        },
        {
            "ID": "V4",
            "High": [
                "V1"
            ],
            "Low": []
        },
        {
            "ID": "V5",
            "High": [
                "V1"
            ],
            "Low": []
        },
        {
            "ID": "V6",
            "High": [
                "V1"
            ],
            "Low": []
        },
        {
            "ID": "V7",
            "High": [
                "P2"
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
        "FeedRankData": [{
            "ID": "SP1",
            "Rank": [
                "RV1"
            ]
        },
        {
            "ID": "SP2",
            "Rank": [
                "RV1"
            ]
        },
        {
            "ID": "SP3",
            "Rank": [
                "RV1"
            ]
        },
        {
            "ID": "SP4",
            "Rank": [
                "RV1"
            ]
        },
        {
            "ID": "SP5",
            "Rank": [
                "RV1"
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