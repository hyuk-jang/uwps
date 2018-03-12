const {
  expect
} = require('chai');

const SmInfraredControl = require('../src/SmInfraredControl');
const config = require('../src/config');

describe('UPSAS Connector Controller Test', () => {

  it('rainData Step 1', done => {
    const smInfraredControl = new SmInfraredControl(config);
    smInfraredControl.on('updateSmRainSensor', data => {
      console.dir(data);
    });
    let dataList = [];

    dataList = [
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000000\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000033\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000033\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000333\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000033\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000033\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000355\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000055\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000105\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000085\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000016\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000016\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000316\r\n\r\n\r\n',
      'VIS = 0x000000\r\nBG  = 0x000000\r\n\r\nRAIN %=00000016\r\n\r\n\r\n',
    ];

    dataList.forEach(currentItem => {
      smInfraredControl.updateDcData({}, Buffer.from(currentItem) );
    });

    

    expect(smInfraredControl.model.averageCalculator.averageStorage.smInfrared.storage.length).to.be.equal(10);

    done();
  });


});