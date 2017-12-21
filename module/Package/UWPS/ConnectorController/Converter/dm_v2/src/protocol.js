

exports.encodingProtocolTable = (dialing) => {
  return {
    pv: {
      code: [0x52],
      dialing,
    },
  }
}