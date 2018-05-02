


module.exports = {
  current: {

  },
  weatherCast: {
    current: {
      /** @property {boolean} hasDev 면 저장된 File 읽어옴. false면 기상청 접속 */
      hasDev: false, 
      /** @property {{x: number, y: number}} locationInfo 위도, 경도 */
      locationInfo: {
        x: 50, 
        y: 71, 
      },
      /** @property  접속 host, id, pw, database */
      dbInfo: {
        host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
        user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
        password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
        database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'saltpond_controller'
      },
    }
  },

  weatherDevice: {
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
        addTemp: 555,
        target_id: 'wds_01',
        target_category: 'weatherDevice',
        data_table_name: 'weather_device_data',
        trouble_table_name: null
      }
    },
    smInfrared:{
      current: {
        hasDev: false, // 장치 연결을 실제로 하는지 여부
        deviceInfo: {
          hasOneAndOne: true,
          target_id: 'SI1',
          target_name: 'SmRainSensor',
          target_category: 'weather',
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
            port: 'COM15',
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
        hasDev: false, // 장치 연결을 실제로 하는지 여부
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
            type: 'serial',
            baudRate: 19200,
            port: 'COM8'
          },
          // connect_info: {
          //   type: 'socket',
          //   port: 9000
          // },
        }
      }
    }
  }

};