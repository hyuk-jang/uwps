module.exports = {
  current: {
    inverterList: []
  },
  InverterController: [{
    current: {
      hasDev: false, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
      ivtSavedInfo: {
        target_id: 'IVT1',
        target_name: '인버터 1',
        target_type: 0, // 0: 단상, 1: 삼상
        dialing: '04', // id, 
        code: '장치 고유 id',
        amount: 3, // 3Kw, 
        director_name: '홍길동',
        director_tel: '01012345589'
      },
      deviceInfo: {
        hasSocket: false,
        deviceName: 'singleHexInverter', // Device Name
        ip: 0,
        port: 'COM9', // Port를 직접 지정하고자 할때 사용
        baudRate: 9600, // 장치 BaudRate
        transportCode: '', // Serial이 연결되고 특정 Code를 전송해야 할 경우
        identificationCode: '41494e20253d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부},
      }
    },
    DummyInverter: {
      current: {
        port: 6000,
        hasSingle: true,
        pvData: {
          amp: 20, // Ampere
          vol: 220 // voltage
        },
        renewalCycle: 10, // sec  데이터 갱신 주기,
        dummyValue: {
          // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
          powerRangeByYear: [68, 75, 76, 79, 84, 87, 96, 100, 92, 85, 76, 71],
          // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
          powerRangeByMonth: [0, 0, 0, 0, 0, 0, 10, 20, 30, 40, 50, 70, 90, 100, 95, 85, 65, 40, 25, 10, 0, 0, 0, 0],
          pv: {
            amp: 6.4, // Ampere
            vol: 225, // voltage
            baseAmp: 6.5, // 기준
            baseVol: 230,
            ampCritical: 2,
            volCritical: 20
          },
          ivt: {
            pf: 96.7,
            basePf: 97,
            pfCritical: 4
          }
        }
      }
    }
  }]
}