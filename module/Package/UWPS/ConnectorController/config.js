module.exports = {
  current: {
    hasDev: true,
    devPort: 5555,
    "cntSavedInfo": {
      "connector_seq": 1,
      "target_id": "CNT1",
      "target_category": "dm_v1",
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
    moduleList: [
      {
        "photovoltaic_seq": 1,
        "inverter_seq": 1,
        "connector_seq": 1,
        "saltern_block_seq": 1,
        "connector_ch": 1
      },
      {
        "photovoltaic_seq": 2,
        "inverter_seq": 1,
        "connector_seq": 1,
        "saltern_block_seq": 2,
        "connector_ch": 2
      },
      {
        "photovoltaic_seq": 3,
        "inverter_seq": 3,
        "connector_seq": 1,
        "saltern_block_seq": 3,
        "connector_ch": 3
      },
      {
        "photovoltaic_seq": 4,
        "inverter_seq": 4,
        "connector_seq": 1,
        "saltern_block_seq": 4,
        "connector_ch": 4
      },

    ]
  }
}