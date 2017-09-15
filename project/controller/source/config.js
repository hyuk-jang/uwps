module.exports = {
  // 현재 컨트롤러 설정
  current: {

    },

    smartSaltern: {
      current: {
        isUsedSerial: 0, // 염전 장치 Serial 사용여부(0: 소켓만, 1: 혼합, 2: 시리얼 만)
      },
      smartController: {

      },
      salternEmulator: {
        current: {
          ip: 'localhost',
          port: 12345
        }
      },
      xbeeManager: {
        current: {
          serialDevicePort: 'COM4',
          serialDeviceBaudRate: 9600,
          serialDeviceIdentificationCode: 'at+ds',
          xbeeSH: '0013A200'
        }
      }

    },
    underwaterPhotovoltaic: {
      current: {

      }

    },

    
    communication: {
      current: {

      },
      socketServer: {
        
      }
    }
}