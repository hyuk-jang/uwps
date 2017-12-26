module.exports = {
  current: {
    hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
    baseFormat: {
      // Pv Info
      amp: null, // Ampere
      vol: null, // voltage
    },
    "cntSavedInfo": {
      "connector_seq": 1,
      "target_id": "CNT1",
      "target_category": "dm_v2",
      "target_name": "접속반 1",
      "dialing": {
        "type": "Buffer",
        "data": [1]
      },
      "code": "324f78ff-452c-4a46-844a-ffe47defc1f7",
      "ip": "localhost",
      "port": null,
      "baud_rate": 9600,
      "address": {
        "type": "Buffer",
        "data": [0, 0, 1]
      },
      "director_name": "에스엠관리자",
      "director_tel": "01012345678",
      "ch_number": 4  // 동적 생성해서 내려줌
    },
  }
}