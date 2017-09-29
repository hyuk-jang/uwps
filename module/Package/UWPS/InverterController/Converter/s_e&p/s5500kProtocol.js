

exports.encodingProtocolTable = (dialing) => {
  return {
    // fault: {
    //   dialing,
    //   code: 'R',
    //   address: '0004',
    //   length: '04'
    // },
    // pv: {
    //   dialing,
    //   code: 0x54,
    //   address: 0x18,
    //   length: 0x05
    // },
    pv: {
      dialing,
      code: [0x54],
      address: [0x18],
      length: []
    },
    // grid: {
    //   dialing,
    //   code: 'R',
    //   address: '0050',
    //   length: '07'
    // },
    // power: {
    //   dialing,
    //   code: 'R',
    //   address: '0060',
    //   length: '08'
    // },
    // sysInfo: {
    //   dialing,
    //   code: 'R',
    //   address: '01e0',
    //   length: '03'
    // },
    // weather: {

    // }
  }
}