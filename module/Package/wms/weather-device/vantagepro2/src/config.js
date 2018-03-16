
module.exports = {
  current: {
    hasDev: true, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'VantagePro_1',
      target_name: 'Davis Vantage Pro2',
      hasOneAndOne: true,
      target_category: 'weathercast',
      target_protocol: 'vantagepro2',
      connect_type: 'serial',
      port: 'COM8', // Port를 직접 지정하고자 할때 사용
      baud_rate: 19200,
      // parser: {
      //   type: 'byteLengthParser',
      //   option: 55
      // }
    },
  }
};