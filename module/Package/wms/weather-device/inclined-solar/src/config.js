const config = {
  current: {
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
        type: 'serial',
        baudRate: 9600,
        port: 'COM18',
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
module.exports = config;
