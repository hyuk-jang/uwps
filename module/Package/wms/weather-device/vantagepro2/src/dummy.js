const Control = require('./Control');
const BU = require('base-util-jh').baseUtil;

const dummyList = [
  '4c4f4fec00a0045b7434032d24030201a300ffffffffffffffffffffffffffffff2bffffffffffffff000050ca030000ffff00000d000d0061002e016004ffffffffffffff000000000000000000000000000000000000c70003c06f02f9070a0d3387',
  '4c4f4f1400e2056f74270332bf020c0c4801ffffffffffffffffffffffffffffff41ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d03be',
  '064c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d39',
  '4c4f4f1400e4056f74260332be020a0c4c01ffffffffffffffffffffffffffffff41ffffffffffffff000009fb000000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000b00002876e02f9070a0d6112',
  '4c4f4f1400e4056f74260332be02090c6301ffffffffffffffffffffffffffffff41ffffffffffffff000009ff000000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000b00002876e02f9070a0db8e5',
  '4c4f4f1400e3056f74260332bf020b0c5601ffffffffffffffffffffffffffffff43ffffffffffffff000009ff000000ffff00000d000d00ca002e016004ffffffffffffff0000000000000000000000000000000000004c0102876e02f9070a0d13c8',
  '4c4f4f1400e2056f74270332be020c0c5801ffffffffffffffffffffffffffffff41ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d5e38',
  '4c4f4fec0026055574220334c4020d085a01ffffffffffffffffffffffffffffff44ffffffffffffff00003c37030000ffff00000d000d0093002e016004ffffffffffffff0000000000000000000000000000000000003b0103c06f02f9070a0d9320',
  '4c4f4f1400e2056f74270332bf020b0c5d01ffffffffffffffffffffffffffffff43ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d9b33',
  '4c4f4f1400e3056f74260332bf020a0c3701ffffffffffffffffffffffffffffff43ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff0000000000000000000000000000000000004c0102876e02f9070a0de828',
];

dummyList.forEach((currentItem, index) => {
  dummyList[index] = Buffer.from(currentItem, 'hex');
});

let index = 0;


let onceRun = true;
/**
 * @param {Control} controller 
 */
const generateData = (controller) => {
  if(onceRun){
    onceRun = false;
    BU.CLI('데이터 생성기 시작');
    setInterval(() => {
      controller.onDcData({commandSet: {cmdList: [{data:'LOOP\n', commandExecutionTimeoutMs:1000}]}, currCmdIndex:0, data: dummyList[index]});
      index += 1;
      // index = index >= dummyList.length ? 0 : index;
    }, 2000);
  }
};






/**
 * @param {Control} controller 
 */
module.exports = controller => generateData(controller);