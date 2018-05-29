module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'SI1',
      target_name: 'SmRainSensor',
      target_category: 'weather',
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
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
        port: 'COM3',
        addConfigInfo: {
          parser: 'byteLengthParser',
          option: 55
        }
      },
    },
  },

};