const _ = require('lodash');
const Control = require('./Control');
// const {operationController} = require('../../../../module/device-protocol-converter-jh');
const BU = require('base-util-jh').baseUtil;

// const cmdStorage = operationController.saltern.xbee;

const wdDummyList = [
  { type: 144,
    remote64: '0013a20040f7ab6c',
    remote16: 'e77b',
    receiveOptions: 1,
    data:{'type':'Buffer',data:[35,48,48,48,49,48,48,48,49,48,52,48,48,48,48,48,48,49,48,46,50]}
  },
];
wdDummyList.forEach((currentItem, index) => {
  currentItem.data = Buffer.from(currentItem.data);
});

let index = 0;


let onceRun = true;
/**
 * @param {Control} controller 
 */
let controller;
const generateData = () => {
  controller.onDcData({commandSet: {cmdList: [{data:'LOOP\n', commandExecutionTimeoutMs:1000}]}, currCmdIndex:0, data: wdDummyList[index]});
};


function executeCommand(dataaaa){
  return controller.onDcData({data:_.sample(wdDummyList)});
}



/**
 * @param {Control} control 
 */
module.exports = control => {
  controller = control;
  return executeCommand;
};