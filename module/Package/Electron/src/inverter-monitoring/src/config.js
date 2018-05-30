module.exports = {
  current: {
    dbInfo: {
      host: process.env.INVERTER_HOST ? process.env.INVERTER_HOST : 'localhost',
      user: process.env.INVERTER_USER ? process.env.INVERTER_USER : 'root',
      password: process.env.INVERTER_PW ? process.env.INVERTER_PW : 'reaper83',
      database: process.env.INVERTER_DB ? process.env.INVERTER_DB : 'power_monitoring'
    },
    'inverterList': [{
      'current': {
        'hasDev': true,
        'ivtDummyData': {
          'dailyKwh': 0,
          'cpKwh': 0
        },
        'deviceInfo': {
          'inverter_seq': 1,
          'target_id': 'IVT_001',
          'target_name': '600W 급',
          'target_category': 'inverter',
          'protocol_info': {
            'mainCategory': 'inverter',
            'subCategory': 'das_1.3',
            'deviceId': '001',
            'option': true
          },
          logOption: {
            hasCommanderResponse: true,
            hasDcError: true,
            hasDcEvent: true,
            hasReceiveData: true,
            hasDcMessage: true,
            hasTransferCommand: true
          },
          controlInfo: {
            hasErrorHandling: true,
            hasOneAndOne: false,
            hasReconnect: true
          },
          'connect_info': {
            'type': 'socket',
            'port': 9000
          },
          'code': '123',
          'amount': 33000,
          'director_name': '에스엠소프트',
          'director_tel': '061-285-3411',
          'chart_color': 'black',
          'chart_sort_rank': 1
        }
      }
    }, {
      'current': {
        'hasDev': true,
        'ivtDummyData': {
          'dailyKwh': 0,
          'cpKwh': 0
        },
        'deviceInfo': {
          'inverter_seq': 2,
          'target_id': 'IVT_002',
          'target_name': '3.3 kW 급',
          'target_category': 'inverter',
          logOption: {
            hasCommanderResponse: true,
            hasDcError: true,
            hasDcEvent: true,
            hasReceiveData: true,
            hasDcMessage: true,
            hasTransferCommand: true
          },
          controlInfo: {
            hasErrorHandling: true,
            hasOneAndOne: false,
            hasReconnect: false
          },
          'protocol_info': {
            'mainCategory': 'inverter',
            'subCategory': 'das_1.3',
            'deviceId': '002',
            'option': false
          },
          'connect_info': {
            'type': 'socket',
            'port': 9000
          },
          'code': '234',
          'amount': 6000,
          'director_name': '에스엠소프트',
          'director_tel': '061-285-3411',
          'chart_color': 'red',
          'chart_sort_rank': 2
        }
      }
    }]
  },
  
  
};