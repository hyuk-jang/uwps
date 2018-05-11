
module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'WD_001',
      target_name: 'testWaterDoor',
      target_category: 'saltern',
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
      },
      controlInfo: {
        hasErrorHandling: true,
        hasOneAndOne: false,
        hasReconnect: true
      },
      protocol_info: {
        mainCategory: 'saltern',
        subCategory: 'xbee',
      },
      connect_info: {
        // type: 'zigbee',
        type: 'socket',
        subType: 'xbee',
        baudRate: 9600,
        // port: 'COM5',
        port: 9000,
        
      },
    },
  },

};