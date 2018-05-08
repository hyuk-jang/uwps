
module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    socketServerInfo: {
      port: 7777,
    },
    deviceInfo: {
      target_id: 'WD_001',
      target_name: 'testWaterDoor',
      target_category: 'saltern',
      target_protocol: 'xbee', 
      hasOneAndOne: false,
      hasErrorHandling: true,
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
      },
      protocol_info: {
        mainCategory: 'saltern',
        subCategory: 'xbee',
        deviceId: '0013A20040F7AB6C',
      },
      connect_info: {
        type: 'zigbee',
        subType: 'xbee',
        baudRate: 9600,
        port: 'COM19',
        
      },
    },
  },

};