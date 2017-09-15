var Map = {
    "MAP": {
        "MapSizeX": 1000,
        "MapSizeY": 1500,
        "ImgObjList": [{
            "ID": "Container",
            "ImgData": {
                "Type": "Rect",
                "Width": 650,
                "Height": 200,
                "Color": "#33ffff"
            }
        },
        {
            "ID": "Inverter",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 150,
                "Color": "#33ffff"
            }
        },
        {
            "ID": "Connector",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 150,
                "Color": "#33ffff"
            }
        },
        {
            "ID": "Module_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 30,
                "Height": 30,
                "Color": "blue"
            }
        },
        {
            "ID": "Reservoir",
            "ImgData": {
                "Type": "Rect",
                "Width": 650,
                "Height": 200,
                "Color": "#33ffff"
            }
        },
        {
            "ID": "SaltPlate_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 320,
                "Height": 195,
                "Color": "#f8f8f8"
            }
        },
        {
            "ID": "SaltPlate_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 320,
                "Height": 195,
                "Color": "#c4c8c3"
            }
        },
        {
            "ID": "SaltPondLine_A",
            "ImgData": {
                "Type": "Line",
                "Color": "#33ccff",
                "StrokeWidth": 50
            }
        },
        {
            "ID": "WaterTank_A",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 195,
                "Color": "#dbdbdb"
            }
        },
        {
            "ID": "WaterTank_B",
            "ImgData": {
                "Type": "Rect",
                "Width": 150,
                "Height": 275,
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
                "Width": 900,
                "Height": 200,
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
                "Color": "#cd4275",
                "StrokeWidth": 2.5
            }
        },
        {
            "ID": "Valve_A",
            "ImgData": {
                "Type": "Squares",
                "fontsize": 12,
                "Radius": 25,
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
        }
        ],
        "ReservoirList": [{
            "ID": "RV1",
            "Name": "저수지",
            "X": 50,
            "Y": 50,
            "ImgID": "Reservoir"
        }],
        "SaltPondFrameList": [],
        "SaltPondLineList": [{
            "ID": "SPL1",
            "Name": "1",
            "ImgID": "SaltPondLine_A",
            "Points": [
                700,
                470,
                725,
                470
            ]
        },
        {
            "ID": "SPL2",
            "Name": "2",
            "ImgID": "SaltPondLine_A",
            "Points": [
                750,
                445,
                750,
                725
            ]
        },
        {
            "ID": "SPL3",
            "Name": "3",
            "ImgID": "SaltPondLine_A",
            "Points": [
                700,
                680,
                725,
                680
            ]
        },
        {
            "ID": "SPL4",
            "Name": "4",
            "ImgID": "SaltPondLine_A",
            "Points": [
                775,
                680,
                800,
                680
            ]
        },
        {
            "ID": "SPL5",
            "Name": "5",
            "ImgID": "SaltPondLine_A",
            "Points": [
                750,
                770,
                750,
                950
            ]
        },
        {
            "ID": "SPL6",
            "Name": "6",
            "ImgID": "SaltPondLine_A",
            "Points": [
                700,
                890,
                725,
                890
            ]
        },
        {
            "ID": "SPL7",
            "Name": "7",
            "ImgID": "SaltPondLine_A",
            "Points": [
                775,
                890,
                800,
                890
            ]
        }
        ],
        "SaltPlateList": [{
            "ID": "SP1",
            "Name": "증발지 1-1",
            "X": 50,
            "Y": 300,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP2",
            "Name": "증발지 1-2",
            "X": 380,
            "Y": 300,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP3",
            "Name": "증발지 2-1",
            "X": 50,
            "Y": 510,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP4",
            "Name": "증발지 2-2",
            "X": 380,
            "Y": 510,
            "ImgID": "SaltPlate_A"
        },
        {
            "ID": "SP5",
            "Name": "결정지 1-1",
            "X": 50,
            "Y": 720,
            "ImgID": "SaltPlate_B"
        },
        {
            "ID": "SP6",
            "Name": "결정지 1-2",
            "X": 380,
            "Y": 720,
            "ImgID": "SaltPlate_B"
        }
        ],
        "WaterTankList": [{
            "ID": "WT1",
            "Name": "해주1",
            "X": 800,
            "Y": 510,
            "ImgID": "WaterTank_A"
        },
        {
            "ID": "WT2",
            "Name": "해주2",
            "X": 800,
            "Y": 720,
            "ImgID": "WaterTank_A"
        }
        ],
        "WaterLevelSensorList": [{
            "ID": "WL1",
            "Name": "수위1",
            "X": 160,
            "Y": 420,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL2",
            "Name": "수위2",
            "X": 490,
            "Y": 420,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL3",
            "Name": "수위3",
            "X": 160,
            "Y": 630,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL4",
            "Name": "수위4",
            "X": 490,
            "Y": 630,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL5",
            "Name": "수위5",
            "X": 160,
            "Y": 840,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL6",
            "Name": "수위6",
            "X": 490,
            "Y": 840,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL7",
            "Name": "수위9",
            "X": 830,
            "Y": 625,
            "ImgID": "WLSensor"
        },
        {
            "ID": "WL8",
            "Name": "수위10",
            "X": 830,
            "Y": 835,
            "ImgID": "WLSensor"
        }
        ],
        "SaltRateSensorList": [{
            "ID": "S1",
            "Name": "염도1",
            "X": 210,
            "Y": 420,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S2",
            "Name": "염도2",
            "X": 540,
            "Y": 420,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S3",
            "Name": "염도3",
            "X": 210,
            "Y": 630,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S4",
            "Name": "염도4",
            "X": 540,
            "Y": 630,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S5",
            "Name": "염도5",
            "X": 210,
            "Y": 840,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S6",
            "Name": "염도6",
            "X": 540,
            "Y": 840,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S7",
            "Name": "염도9",
            "X": 880,
            "Y": 625,
            "ImgID": "SRSensor"
        },
        {
            "ID": "S8",
            "Name": "염도10",
            "X": 880,
            "Y": 835,
            "ImgID": "SRSensor"
        }
        ],
        "WaterDoorList": [{
            "ID": "WD1",
            "Name": "수문1",
            "X": 350,
            "Y": 445,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD2",
            "Name": "수문2",
            "X": 650,
            "Y": 445,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD3",
            "Name": "수문3",
            "X": 185,
            "Y": 475,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD4",
            "Name": "수문4",
            "X": 515,
            "Y": 475,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD5",
            "Name": "수문5",
            "X": 350,
            "Y": 655,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD6",
            "Name": "수문6",
            "X": 650,
            "Y": 655,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD7",
            "Name": "수문7",
            "X": 350,
            "Y": 865,
            "ImgID": "WaterDoor_A"
        },
        {
            "ID": "WD8",
            "Name": "수문8",
            "X": 650,
            "Y": 865,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD9",
            "Name": "수문9",
            "X": 800,
            "Y": 655,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD10",
            "Name": "수문10",
            "X": 800,
            "Y": 865,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD11",
            "Name": "수문11",
            "X": 725,
            "Y": 720,
            "ImgID": "WaterDoor_B"
        },
        {
            "ID": "WD12",
            "Name": "수문12",
            "X": 725,
            "Y": 950,
            "ImgID": "WaterDoor_B"
        }
        ],
        "PumpList": [{
            "ID": "P1",
            "Name": "펌프1",
            "X": 375,
            "Y": 225,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P2",
            "Name": "펌프2",
            "X": 875,
            "Y": 680,
            "ImgID": "Pump_A"
        },
        {
            "ID": "P3",
            "Name": "펌프3",
            "X": 875,
            "Y": 890,
            "ImgID": "Pump_A"
        }
        ],
        "WaterOutList": [{
            "ID": "WO1",
            "Name": "바다",
            "X": 50,
            "Y": 950,
            "ImgID": "WaterOut_A"
        }],
        "ValveList": [{
            "ID": "V1",
            "Name": "밸브1",
            "X": 300,
            "Y": 325,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V2",
            "Name": "밸브2",
            "X": 450,
            "Y": 325,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V3",
            "Name": "밸브3",
            "X": 300,
            "Y": 680,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V4",
            "Name": "밸브4",
            "X": 450,
            "Y": 680,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V5",
            "Name": "밸브5",
            "X": 300,
            "Y": 890,
            "ImgID": "Valve_A"
        },
        {
            "ID": "V6",
            "Name": "밸브6",
            "X": 450,
            "Y": 890,
            "ImgID": "Valve_A"
        }
        ],
        "WaterWayList": [],
        "PipeList": [{
            "ID": "PL1",
            "Name": "PL1",
            "ImgID": "PipeList_A",
            "Points": [
                375,
                250,
                375,
                275
            ]
        },
        {
            "ID": "PL2",
            "Name": "PL2",
            "ImgID": "PipeList_A",
            "Points": [
                375,
                275,
                300,
                275
            ]
        },
        {
            "ID": "PL3",
            "Name": "PL3",
            "ImgID": "PipeList_A",
            "Points": [
                300,
                275,
                300,
                300
            ]
        },
        {
            "ID": "PL4",
            "Name": "PL4",
            "ImgID": "PipeList_A",
            "Points": [
                375,
                275,
                450,
                275
            ]
        },
        {
            "ID": "PL5",
            "Name": "PL5",
            "ImgID": "PipeList_A",
            "Points": [
                450,
                275,
                450,
                300
            ]
        },
        {
            "ID": "PL6",
            "Name": "PL6",
            "ImgID": "PipeList_A",
            "Points": [
                300,
                715,
                450,
                715
            ]
        },
        {
            "ID": "PL7",
            "Name": "PL7",
            "ImgID": "PipeList_A",
            "Points": [
                450,
                715,
                875,
                715
            ]
        },
        {
            "ID": "PL8",
            "Name": "PL8",
            "ImgID": "PipeList_A",
            "Points": [
                300,
                700,
                300,
                715
            ]
        },
        {
            "ID": "PL9",
            "Name": "PL9",
            "ImgID": "PipeList_A",
            "Points": [
                450,
                700,
                450,
                715
            ]
        },
        {
            "ID": "PL10",
            "Name": "PL10",
            "ImgID": "PipeList_A",
            "Points": [
                875,
                700,
                875,
                715
            ]
        },
        {
            "ID": "PL11",
            "Name": "PL11",
            "ImgID": "PipeList_A",
            "Points": [
                300,
                925,
                450,
                925
            ]
        },
        {
            "ID": "PL12",
            "Name": "PL12",
            "ImgID": "PipeList_A",
            "Points": [
                450,
                925,
                875,
                925
            ]
        },
        {
            "ID": "PL13",
            "Name": "PL13",
            "ImgID": "PipeList_A",
            "Points": [
                300,
                915,
                300,
                925
            ]
        },
        {
            "ID": "PL14",
            "Name": "PL14",
            "ImgID": "PipeList_A",
            "Points": [
                450,
                915,
                450,
                925
            ]
        },
        {
            "ID": "PL15",
            "Name": "PL15",
            "ImgID": "PipeList_A",
            "Points": [
                875,
                915,
                875,
                925
            ]
        }
        ],
        "InverterList": [{
            "ID": "IV1",
            "Name": "인버터 1-1",
            "X": 50,
            "Y": 300,
            "ImgID": "Inverter_A"
        }],
        "ConnectorList": [{
            "ID": "CN1",
            "Name": "접속반 1-1",
            "X": 50,
            "Y": 300,
            "ImgID": "Connector_A"
        }],
        "ModuleList": [{
            "ID": "MD1",
            "Name": "G2G 형",
            "X": 50,
            "Y": 300,
            "ImgID": "Module_A"
        },
        {
            "ID": "MD2",
            "Name": "G2G 형",
            "X": 50,
            "Y": 300,
            "ImgID": "Module_A"
        },
        {
            "ID": "MD3",
            "Name": "G2G 형",
            "X": 50,
            "Y": 300,
            "ImgID": "Module_A"
        }, {
            "ID": "MD4",
            "Name": "G2G 형",
            "X": 50,
            "Y": 300,
            "ImgID": "Module_A"
        }
        ]
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
            "ListWaterDoor": [
                "WD1",
                "WD3"
            ],
            "ListValve": [
                "V1"
            ],
            "ListPump": [],
            "ListWaterLevel": [
                "WL1"
            ],
            "ListSalinity": [
                "S1"
            ]
        },
        {
            "ID": "SP2",
            "PlateType": "Evaporating Pond 1",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 5,
            "ListWaterDoor": [
                "WD1",
                "WD2",
                "WD4"
            ],
            "ListValve": [
                "V2"
            ],
            "ListPump": [],
            "ListWaterLevel": [
                "WL2"
            ],
            "ListSalinity": [
                "S2"
            ]
        },
        {
            "ID": "SP3",
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": 20,
            "Depth": 4,
            "ListWaterDoor": [
                "WD3",
                "WD5"
            ],
            "ListValve": [
                "V3"
            ],
            "ListPump": [],
            "ListWaterLevel": [
                "WL3"
            ],
            "ListSalinity": [
                "S3"
            ]
        },
        {
            "ID": "SP4",
            "PlateType": "Evaporating Pond 2",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": 15,
            "Depth": 4,
            "ListWaterDoor": [
                "WD4",
                "WD5",
                "WD6"
            ],
            "ListValve": [
                "V4"
            ],
            "ListPump": [],
            "ListWaterLevel": [
                "WL4"
            ],
            "ListSalinity": [
                "S4"
            ]
        },
        {
            "ID": "SP5",
            "PlateType": "Crystallizing Pond",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 3,
            "ListWaterDoor": [
                "WD7"
            ],
            "ListValve": [
                "V5"
            ],
            "ListPump": [],
            "ListWaterLevel": [
                "WL5"
            ],
            "ListSalinity": [
                "S5"
            ]
        },
        {
            "ID": "SP6",
            "PlateType": "Crystallizing Pond",
            "MinWaterLevel": 1,
            "MaxWaterLevel": 7,
            "SettingSalinity": "",
            "Depth": 3,
            "ListWaterDoor": [
                "WD7",
                "WD8"
            ],
            "ListValve": [
                "V6"
            ],
            "ListPump": [],
            "ListWaterLevel": [
                "WL6"
            ],
            "ListSalinity": [
                "S6"
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
            "ListValve": [],
            "ListWaterDoor": [
                "WD9"
            ],
            "ListPump": [
                "P2"
            ],
            "ListWaterLevel": [
                "WL7"
            ],
            "ListSalinity": [
                "S7"
            ]
        },
        {
            "ID": "WT2",
            "TankType": "Crystallizing Pond",
            "SettingSalinity": "",
            "MinWaterLevel": 20,
            "MaxWaterLevel": 100,
            "Depth": -1,
            "ListValve": [],
            "ListWaterDoor": [
                "WD10"
            ],
            "ListPump": [
                "P3"
            ],
            "ListWaterLevel": [
                "WL8"
            ],
            "ListSalinity": [
                "S8"
            ]
        }
        ],
        "WaterOutData": [{
            "ID": "WO1",
            "Depth": -1,
            "SettingSalinity": "",
            "ListWaterDoor": [
                "WD12"
            ],
            "ListPump": []
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
                "WD2",
                "WD6",
                "WD9",
                "WD11"
            ],
            "ListSaltPondLine": [
                "SPL1",
                "SPL2",
                "SPL3",
                "SPL4"
            ]
        },
        {
            "ID": "WW2",
            "Depth": 0.8,
            "ListWaterDoor": [
                "WD8",
                "WD10",
                "WD11",
                "WD12"
            ],
            "ListSaltPondLine": [
                "SPL5",
                "SPL6",
                "SPL7"
            ]
        }
        ],
        "ValveRankData": [{
            "ID": "P1",
            "High": [],
            "Low": [
                "V1",
                "V2"
            ]
        },
        {
            "ID": "P2",
            "High": [],
            "Low": [
                "V3",
                "V4"
            ]
        },
        {
            "ID": "P3",
            "High": [],
            "Low": [
                "V5",
                "V6"
            ]
        },
        {
            "ID": "V1",
            "High": [
                "P1"
            ],
            "Low": []
        },
        {
            "ID": "V2",
            "High": [
                "P1"
            ],
            "Low": []
        },
        {
            "ID": "V3",
            "High": [
                "P2"
            ],
            "Low": []
        },
        {
            "ID": "V4",
            "High": [
                "P2"
            ],
            "Low": []
        },
        {
            "ID": "V5",
            "High": [
                "P3"
            ],
            "Low": []
        },
        {
            "ID": "V6",
            "High": [
                "P3"
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
                "SP1",
                "WT1"
            ]
        },
        {
            "ID": "SP4",
            "Rank": [
                "SP2",
                "WT1"
            ]
        },
        {
            "ID": "SP5",
            "Rank": [
                "WT2"
            ]
        },
        {
            "ID": "SP6",
            "Rank": [
                "WT2"
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
            "Rank": [
                "WT1",
                "WT2"
            ]
        },
        {
            "ID": "SP4",
            "Rank": [
                "WT1",
                "WT2"
            ]
        },
        {
            "ID": "SP5",
            "Rank": []
        },
        {
            "ID": "SP6",
            "Rank": []
        }
        ]
    },
    "CONTROL": {
        "SimpleMode": [{
            "SrcID": "SP1",
            "DesList": [{
                "DesID": "SP2",
                "Type": "Emulator",
                "True": [
                    "WD1"
                ],
                "False": [
                    "WD2",
                    "WD3",
                    "WD4"
                ]
            },
            {
                "DesID": "SP3",
                "Type": "Common",
                "True": [
                    "WD3"
                ],
                "False": [
                    "WD5"
                ]
            },
            {
                "DesID": "WT1",
                "Type": "Controller",
                "True": [
                    "WD1",
                    "WD2",
                    "WD9"
                ],
                "False": [
                    "WD3",
                    "WD4",
                    "WD11"
                ]
            },
            {
                "DesID": "WT2",
                "Type": "Controller",
                "True": [
                    "WD1",
                    "WD2",
                    "WD10",
                    "WD11"
                ],
                "False": [
                    "WD3",
                    "WD4",
                    "WD9",
                    "WD12"
                ]
            },
            {
                "DesID": "WO1",
                "Type": "Controller",
                "True": [
                    "WD1",
                    "WD2",
                    "WD11",
                    "WD12"
                ],
                "False": [
                    "WD3",
                    "WD4",
                    "WD9",
                    "WD10"
                ]
            }
            ]
        },
        {
            "SrcID": "SP2",
            "DesList": [{
                "DesID": "SP1",
                "Type": "Emulator",
                "True": [
                    "WD1"
                ],
                "False": [
                    "WD2",
                    "WD3",
                    "WD4"
                ]
            },
            {
                "DesID": "SP4",
                "Type": "Common",
                "True": [
                    "WD4"
                ],
                "False": [
                    "WD5",
                    "WD6"
                ]
            },
            {
                "DesID": "WT1",
                "Type": "Common",
                "True": [
                    "WD2",
                    "WD9"
                ],
                "False": [
                    "WD4",
                    "WD11"
                ]
            },
            {
                "DesID": "WT2",
                "Type": "Common",
                "True": [
                    "WD2",
                    "WD10",
                    "WD11"
                ],
                "False": [
                    "WD4",
                    "WD9",
                    "WD12"
                ]
            },
            {
                "DesID": "WO1",
                "Type": "Common",
                "True": [
                    "WD2",
                    "WD11",
                    "WD12"
                ],
                "False": [
                    "WD4",
                    "WD9",
                    "WD10"
                ]
            }
            ]
        },
        {
            "SrcID": "SP3",
            "DesList": [{
                "DesID": "SP4",
                "Type": "Emulator",
                "True": [
                    "WD5"
                ],
                "False": [
                    "WD6"
                ]
            },
            {
                "DesID": "WT1",
                "Type": "Controller",
                "True": [
                    "WD5",
                    "WD6",
                    "WD9"
                ],
                "False": [
                    "WD11"
                ]
            },
            {
                "DesID": "WT2",
                "Type": "Controller",
                "True": [
                    "WD5",
                    "WD6",
                    "WD10",
                    "WD11"
                ],
                "False": [
                    "WD9",
                    "WD12"
                ]
            },
            {
                "DesID": "WO1",
                "Type": "Controller",
                "True": [
                    "WD5",
                    "WD6",
                    "WD11",
                    "WD12"
                ],
                "False": [
                    "WD9",
                    "WD10"
                ]
            }
            ]
        },
        {
            "SrcID": "SP4",
            "DesList": [{
                "DesID": "SP3",
                "Type": "Emulator",
                "True": [
                    "WD5"
                ],
                "False": [
                    "WD6"
                ]
            },
            {
                "DesID": "WT1",
                "Type": "Common",
                "True": [
                    "WD6",
                    "WD9"
                ],
                "False": [
                    "WD11"
                ]
            },
            {
                "DesID": "WT2",
                "Type": "Common",
                "True": [
                    "WD6",
                    "WD10",
                    "WD11"
                ],
                "False": [
                    "WD9",
                    "WD12"
                ]
            },
            {
                "DesID": "WO1",
                "Type": "Common",
                "True": [
                    "WD6",
                    "WD11",
                    "WD12"
                ],
                "False": [
                    "WD9",
                    "WD10"
                ]
            }
            ]
        },
        {
            "SrcID": "SP5",
            "DesList": [{
                "DesID": "SP6",
                "Type": "Emulator",
                "True": [
                    "WD7"
                ],
                "False": [
                    "WD8"
                ]
            },
            {
                "DesID": "WT2",
                "Type": "Controller",
                "True": [
                    "WD7",
                    "WD8",
                    "WD10"
                ],
                "False": [
                    "WD12"
                ]
            },
            {
                "DesID": "WO1",
                "Type": "Controller",
                "True": [
                    "WD7",
                    "WD8",
                    "WD12"
                ],
                "False": [
                    "WD10"
                ]
            }
            ]
        },
        {
            "SrcID": "SP6",
            "DesList": [{
                "DesID": "SP5",
                "Type": "Emulator",
                "True": [
                    "WD7"
                ],
                "False": [
                    "WD8"
                ]
            },
            {
                "DesID": "WT2",
                "Type": "Common",
                "True": [
                    "WD8",
                    "WD10"
                ],
                "False": [
                    "WD12"
                ]
            },
            {
                "DesID": "WO1",
                "Type": "Common",
                "True": [
                    "WD8",
                    "WD12"
                ],
                "False": [
                    "WD10"
                ]
            }
            ]
        },
        {
            "SrcID": "WT1",
            "DesList": [{
                "DesID": "SP3",
                "Type": "Common",
                "True": [
                    "P2",
                    "V3"
                ],
                "False": []
            },
            {
                "DesID": "SP4",
                "Type": "Common",
                "True": [
                    "V4",
                    "P2"
                ],
                "False": [
                    "WD6"
                ]
            }
            ]
        },
        {
            "SrcID": "WT2",
            "DesList": [{
                "DesID": "SP5",
                "Type": "Common",
                "True": [
                    "V5",
                    "P3"
                ],
                "False": []
            },
            {
                "DesID": "SP6",
                "Type": "Common",
                "True": [
                    "V6",
                    "P3"
                ],
                "False": [
                    "WD8"
                ]
            }
            ]
        },
        {
            "SrcID": "RV1",
            "DesList": [{
                "DesID": "SP1",
                "Type": "Common",
                "True": [
                    "P1",
                    "V1"
                ],
                "False": [
                    "WD3"
                ]
            },
            {
                "DesID": "SP2",
                "Type": "Common",
                "True": [
                    "V2",
                    "P1"
                ],
                "False": [
                    "WD2",
                    "WD4"
                ]
            }
            ]
        }
        ],
        "AutomationMode": [{
            "Des": "SP5",
            "Src": [
                "WT2"
            ]
        },
        {
            "Des": "SP6",
            "Src": [
                "WT2"
            ]
        }
        ],
        "SettingMode": [{
            "ID": "DeviceClose",
            "True": [],
            "False": [
                "WD1",
                "WD2",
                "WD3",
                "WD4",
                "WD5",
                "WD6",
                "WD7",
                "WD8",
                "WD9",
                "WD10",
                "WD11",
                "WD12",
                "P1",
                "P2",
                "P3",
                "V1",
                "V2",
                "V3",
                "V4",
                "V5",
                "V6"
            ]
        },
        {
            "ID": "GoToSea",
            "True": [
                "WD11",
                "WD12",
                "WD1",
                "WD2",
                "WD3",
                "WD4",
                "WD5",
                "WD6",
                "WD7",
                "WD8"
            ],
            "False": [
                "WD9",
                "WD10",
                "V1",
                "V2",
                "V3",
                "V4",
                "V5",
                "V6",
                "P1",
                "P2",
                "P3"
            ]
        }
        ],
        "RainMode": [{
            "GroupID": "A",
            "GroupName": "결정지 그룹",
            "GroupElement": [
                "SP5",
                "SP6"
            ],
            "DesList": [{
                "DesID": "WT2",
                "Delay": "10",
                "True": [
                    "WD7",
                    "WD8",
                    "WD10"
                ],
                "False": [
                    "WD11",
                    "WD12",
                    "P3"
                ]
            }]
        },
        {
            "GroupID": "B",
            "GroupName": "1 증발지 그룹",
            "GroupElement": [
                "SP3",
                "SP4"
            ],
            "DesList": [{
                "DesID": "WT1",
                "Delay": "0",
                "True": [
                    "WD5",
                    "WD6",
                    "WD9"
                ],
                "False": [
                    "WD2",
                    "WD11",
                    "P2"
                ]
            },
            {
                "DesID": "WT2",
                "Delay": "0",
                "True": [
                    "WD10",
                    "WD11",
                    "WD5",
                    "WD6"
                ],
                "False": [
                    "WD2",
                    "WD9",
                    "WD12",
                    "P3"
                ]
            }
            ]
        },
        {
            "GroupID": "C",
            "GroupName": "2 증발지 그룹",
            "GroupElement": [
                "SP1",
                "SP2"
            ],
            "DesList": []
        }
        ]
    }
}