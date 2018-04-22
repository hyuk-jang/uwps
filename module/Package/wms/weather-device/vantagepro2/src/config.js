
module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'VantagePro_1',
      target_name: 'Davis Vantage Pro2',
      target_category: 'weathercast',
      target_protocol: 'vantagepro2',
      // hasOneAndOne: true,
      // connect_type: 'serial',
      // port: 'COM8', // Port를 직접 지정하고자 할때 사용
      // baud_rate: 19200,

      // connect_info: {
      //   hasOneAndOne: true,
      //   type: 'serial',
      //   baudRate: 19200,
      //   port: 'COM8'
      // },
      connect_info: {
        hasOneAndOne: true,
        type: 'socket',
        port: 9000
      },
    }
  }
};