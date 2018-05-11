
module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'VantagePro_1',
      target_name: 'Davis Vantage Pro2',
      target_category: 'weathercast',
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
      },
      protocol_info: {
        mainCategory: 'weathercast',
        subCategory: 'vantagepro2'
      },
      controlInfo: {
        hasErrorHandling: false,
        hasOneAndOne: true,
        hasReconnect: true
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
};