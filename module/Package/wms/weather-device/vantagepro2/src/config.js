const config = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'VantagePro_1',
      target_name: 'Davis Vantage Pro2',
      target_category: 'weather',
      protocol_info: {
        mainCategory: 'weathercast',
        subCategory: 'vantagepro2',
        protocolOptionInfo: {
          hasTrackingData: true,
        },
      },
      controlInfo: {
        hasErrorHandling: false,
        hasOneAndOne: true,
        hasReconnect: true,
      },
      connect_info: {
        type: 'serial',
        baudRate: 19200,
        port: 'COM3',
      },
      // connect_info: {
      //   type: 'socket',
      //   port: 9000
      // },
    },
  },
};
module.exports = config;
