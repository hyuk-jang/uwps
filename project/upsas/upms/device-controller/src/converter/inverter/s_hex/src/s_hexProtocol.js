exports.operationInfo = (groupIndex) => {
  let returnValue = [];
  if (groupIndex === 0) {
    returnValue = [{
      msg: '태양전지 과전압',
      code: 'Soloar Cell OV Fault',
      number: 0,
      errorValue: 1
    }, {
      msg: '태양전지 과전압 제한초과',
      code: 'Solar Cell OV limit fault',
      number: 1,
      errorValue: 1
    }, {
      msg: '태양전지 저전압 (변압기 type Only)',
      code: 'Solar Cell UV fault',
      number: 2,
      errorValue: 1
    }, {
      msg: '태양전지 저전압 제한초과',
      code: 'Solar Cell UV limit fault',
      number: 3,
      errorValue: 1
    }]
  } else if (groupIndex === 1) {
    returnValue = [{
      msg: '인버터 과 전류',
      code: 'Inverter over current fault',
      number: 0,
      errorValue: 1
    }, {
      msg: '인버터 과 전류 시간 초과',
      code: 'Inverter O.C. overtime fault',
      number: 1,
      errorValue: 1
    }, {
      msg: '계통-인버터 위상 이상',
      code: 'inverter-Line async fault',
      number: 3,
      errorValue: 1
    }, {
      msg: '인버터 퓨즈 단선',
      code: 'inverter fuse open',
      number: 5,
      errorValue: 1
    }, {
      msg: '인버터 과열',
      code: 'inverter over temperature fault',
      number: 7,
      errorValue: 1
    }, {
      msg: '인버터 MC 이상',
      code: 'inverter MC fault',
      number: 8,
      errorValue: 1
    }, {
      msg: '인버터 동작',
      code: 'inverter run',
      number: 14,
      errorValue: 0
    }]
  } else if (groupIndex === 2) {
    returnValue = [{
      msg: '계통 과 전압',
      code: 'Line over voltage fault',
      number: 0,
      errorValue: 1
    }, {
      msg: '계통 저 전압',
      code: 'Line under voltage fault',
      number: 1,
      errorValue: 1
    }, {
      msg: '계통 정전',
      code: 'Line failure fault',
      number: 3,
      errorValue: 1
    }, {
      msg: '계통 과 주파수',
      code: 'Line over frequency fault',
      number: 4,
      errorValue: 1
    }, {
      msg: '계통 저 주파수',
      code: 'Line under frequency fault',
      number: 5,
      errorValue: 1
    }]
  }
  return returnValue;
}


exports.encodingProtocolTable = (dialing) => {
  return {
    operation: {
      dialing,
      code: 0x52,
      address: [0x30, 0x30, 0x30, 0x34],
      length: [0x30, 0x34]
    },
    pv: {
      dialing,
      code: 0x52,
      address: '0020',
      length: '02'
    },
    grid: {
      dialing,
      code: 'R',
      address: '0050',
      length: '07'
    },
    power: {
      dialing,
      code: 'R',
      address: '0060',
      length: '08'
    },
    system: {
      dialing,
      code: 'R',
      address: '01e0',
      length: '03'
    },
    // weather: {

    // }
  }
}