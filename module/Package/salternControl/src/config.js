
module.exports = {
  current: {
    hasDev: false, // 장치 연결을 실제로 하는지 여부
    deviceInfo: {
      target_id: 'WD_001',
      target_name: 'testWaterDoor',
      target_category: 'saltern',
      target_protocol: 'xbee', 
      hasOneAndOne: false,
      logOption: {
        hasCommanderResponse: true,
        hasDcError: true,
        hasDcEvent: true,
        hasReceiveData: true,
        hasDcMessage: true,
        hasTransferCommand: true
      },
      protocolConstructorConfig: {
        deviceId: '0013A20040F7AB6C',
      },
      connect_info: {
        type: 'zigbee',
        subType: 'xbee',
        baudRate: 9600,
        port: 'COM10',
        
      },
    },
  },

};