require('dotenv').config();

module.exports = {
  current: {
    dbInfo: {
      host: process.env.DB_UPSAS_HOST,
      user: process.env.DB_UPSAS_USER,
      port: process.env.DB_UPSAS_PORT,
      password: process.env.DB_UPSAS_PW,
      database: process.env.DB_UPSAS_DB,
    },
    controllerInfo: {
      main_seq: 1,
      target_id: 'wds_01',
      target_category: 'weatherDevice',
      data_table_name: 'weather_device_data',
      trouble_table_name: null,
    },
    inquiryIntervalSecond: 60,
  },
  smInfrared: {
    current: {
      hasDev: true, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        target_id: 'SI1',
        target_name: 'SmRainSensor',
        target_category: 'weather',
        connect_info: {
          type: 'serial',
          subType: 'parser',
          baudRate: 9600,
          port: 'COM20',
          addConfigInfo: {
            parser: 'byteLengthParser',
            option: 55,
          },
        },
      },
    },
  },
  vantagepro2: {
    current: {
      hasDev: false, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        target_id: 'VantagePro_1',
        target_name: 'Davis Vantage Pro2',
        target_category: 'weather',
        protocol_info: {
          mainCategory: 'weathercast',
          subCategory: 'vantagepro2',
          protocolOptionInfo: {
            hasTrackingData: true,
          },
        },
        controlInfo: {
          hasErrorHandling: false,
          hasOneAndOne: true,
          hasReconnect: true,
        },
        connect_info: {
          type: 'serial',
          baudRate: 19200,
          port: 'COM3',
        },
        // connect_info: {
        //   type: 'socket',
        //   port: 9000
        // },
      },
    },
  },
  inclinedSolar: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    incliendSolarInfo: {
      unitId: 9,
      address: 0,
      length: 1,
    },
    deviceInfo: {
      target_id: 'InclinedSolar',
      target_name: '경사 일사량',
      target_category: 'weathercast',
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true,
      },
      protocol_info: {
        mainCategory: 'weathercast',
        subCategory: 'vantagepro2',
        protocolOptionInfo: {
          hasTrackingData: false,
        },
      },
      controlInfo: {
        hasErrorHandling: false,
        hasOneAndOne: false,
        hasReconnect: true,
      },
      connect_info: {
        type: 'modbus',
        subType: 'rtu',
        baudRate: 9600,
        port: 'COM19',
      },
      // connect_info: {
      //   type: 'modbus',
      //   subType: 'tcp',
      //   host: 'localhost',
      //   port: 502,
      //   baudRate: 9600,
      // },
    },
  },
};
