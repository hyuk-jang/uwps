
module.exports = {
  current: {
    hasDev: true, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      hasOneAndOne: true,
      target_id: 'VantagePro_1',
      target_name: 'Davis Vantage Pro2',
      target_category: 'weathercast',
      target_protocol: 'vantagepro2',
      // connect_info: {
      //   type: 'serial',
      //   baudRate: 19200,
      //   port: 'COM8'
      // },
      connect_info: {
        type: 'socket',
        port: 9000
      },
    }
  }
};