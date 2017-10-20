const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;
const NU = BUJ.newUtil;

const EncodingMsgSocket = require('../dev/Encoder');
let encodingMsgSocket = new EncodingMsgSocket();

let result = encodingMsgSocket.makeMsg();