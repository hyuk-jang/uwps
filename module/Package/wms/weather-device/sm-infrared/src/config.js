
module.exports = {
  current: {
    hasDev: true, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'SI1',
      target_name: 'SmRainSensor',
      target_category: 'weather',
      hasOneAndOne: true,
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