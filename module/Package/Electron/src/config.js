module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
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
      controlInfo: {
        hasErrorHandling: false,
        hasOneAndOne: true,
        hasReconnect: true
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

};