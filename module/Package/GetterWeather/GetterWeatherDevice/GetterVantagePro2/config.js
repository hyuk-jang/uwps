module.exports = {
  current: {
    hasDev: false,
    deviceInfo: {
      deviceName: 'vantagePro2', // Device Name
      port: 'COM3', // Port를 직접 지정하고자 할때 사용
      baudRate: 19200, // 장치 BaudRate
      transportCode: '\n', // Serial이 연결되고 특정 Code를 전송해야 할 경우
      identificationCode: '0a0d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부
    },
    calculateOption: {
      averageCount: 3, // 평균 합산 변수
      cycleCount: 10,
      criticalObj: {
        rainfall: 0, // 강우량 임계치 없음
        temperature: 0.2, // 섭씨 0.2도 초과 임계치
        humidity: 1, // 습도 1프로 초과 임계치
        windDirection: 0, // 풍향 임계치 없음
        windSpeed: 0.2, // 풍속 0.2 mm/s 초과 임계치
        min10AvgWindSpeed: 0.2,
        solarRadiation: 1, // 일사량 0.2 w/m2 초과 임계치  
      }
    }
  }
}