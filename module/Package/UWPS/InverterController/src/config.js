module.exports = {
  current: {
    hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
    ivtDummyData: {
      dailyKwh: 4.5147,
      cpKwh: 111.3691
    },
    baseFormat: {
      // Pv Info
      amp: null, // Ampere
      vol: null, // voltage
      // Power Info
      gridKw: null, // 출력 전력
      dailyKwh: null, // 하루 발전량 kWh
      cpKwh: null, // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: null, // 역률 Power Factor %
      // Grid Info
      rsVol: null, // rs 선간 전압
      stVol: null, // st 선간 전압
      trVol: null, // tr 선간 전압
      rAmp: null, // r상 전류
      sAmp: null, // s상 전류
      tAmp: null, // t상 전류
      lf: null, // 라인 주파수 Line Frequency, 단위: Hz
      // System Info
      isSingle: null, // 단상 or 삼상
      capa: null, // 인버터 용량 kW
      productYear: null, // 제작년도 월 일 yyyymmdd,
      sn: null, // Serial Number,
      // Operation Info
      isRun: null, // 인버터 동작 유무
      isError: null, // 인버터 에러 발생 유무
      temperature: null, // 인버터 온도
      errorList: null, // 에러 리스트 Array
      warningList: null // 경고 리스트 Array
    },
    "ivtSavedInfo": {
      "inverter_seq": 1,
      "target_id": "IVT1",
      "target_name": "인버터 1",
      "target_type": "single_ivt",
      "target_category": "s_hex",
      "connect_type": "socket",
      "dialing": {
        "type": "Buffer",
        "data": [48, 49]
      },
      "ip": "localhost",
      "port": null,
      "baud_rate": 9600,
      "code": "e279f4c4-cdc8-4423-97f8-d30a78c5aff1",
      "amount": 30,
      "director_name": "홍길동 1",
      "director_tel": "01011114444"
    }
  }
}