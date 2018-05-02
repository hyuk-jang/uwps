


module.exports = {
  current: {
    dbInfo: {
      // host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      // user: 'upsas',
      // password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      // database: 'upsas'
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'uwps'
      // database: 'upsas'
    },
    controllerInfo: {
      target_id: 'wds_01',
      target_category: 'weatherDevice',
      data_table_name: 'weather_device_data',
      trouble_table_name: null
    }
  },
  smInfrared:{
    current: {
      hasDev: true, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        target_id: 'SI1',
        target_name: 'SmRainSensor',
        target_category: 'weather',
        hasOneAndOne: true,
        logOption: {
          hasCommanderResponse: false,
          hasDcError: false,
          hasDcEvent: false,
          hasReceiveData: false,
          hasDcMessage: false,
          hasTransferCommand: false
        },
        connect_info: {
          type: 'serial',
          subType: 'parser',
          baudRate: 9600,
          port: 'COM7',
          addConfigInfo: {
            parser: 'byteLengthParser',
            option: 55
          }
        },
      },
    },
  },
  vantagepro2: {
    current: {
      hasDev: true, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        hasOneAndOne: true,
        target_id: 'VantagePro_1',
        target_name: 'Davis Vantage Pro2',
        target_category: 'weathercast',
        target_protocol: 'vantagepro2',
        logOption: {
          hasCommanderResponse: true,
          hasDcError: true,
          hasDcEvent: true,
          hasReceiveData: true,
          hasDcMessage: true,
          hasTransferCommand: true
        },
        connect_info: {
          hasOneAndOne: true,
          type: 'serial',
          baudRate: 19200,
          port: 'COM8'
        },
        // connect_info: {
        //   hasOneAndOne: true,
        //   type: 'socket',
        //   port: 9000
        // },
      }
    }
  }

};