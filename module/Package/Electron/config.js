
module.exports = {
  current: {
    hasDev: true, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'IVT_001',
      target_name: '인버터 계측 프로그램',
      target_category: 'inverter',
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
      },
      protocol_info: {
        mainCategory: 'inverter',
        subCategory: 'das_1.3',
        deviceId: '001',
        option: true
      },
      controlInfo: {
        hasErrorHandling: true,
        hasOneAndOne: false,
        hasReconnect: true
      },
      // connect_info: {
      //   type: 'serial',
      //   baudRate: 19200,
      //   port: 'COM8'
      // },
      connect_info: {
        type: 'socket',
        port: 7777
      },
    }
  }
};