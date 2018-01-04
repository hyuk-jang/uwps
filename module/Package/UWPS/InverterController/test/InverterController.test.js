const _ = require('underscore');

const {expect} = require('chai')

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

describe('Inverter Controller Test', () => {
  describe('ConnectType: Socket', () => {
    before(() => {
      config.current.ivtSavedInfo.connect_type = 'socket'
    })
    it('Category: s_hex', async() => {
      config.current.ivtSavedInfo.target_category = 's_hex'
      const control = new Control(config)
      await control.init()
      control.on('completeSend2Msg', res => {
        BU.CLI(res)
      })
      control.on('errorSend2Msg', err => {
        BU.CLI(err)
      })
      let result = await control.measureDevice();
      BU.CLI(result)
      expect(result).to.not.deep.equal({})
    })

    it('Category: dev', async() => {
      config.current.ivtSavedInfo.target_category = 'dev'
      const control = new Control(config);
      let obj = await control.init()
      control.on('completeSend2Msg', res => {
        BU.CLI(res)
      })
      control.on('errorSend2Msg', err => {
        BU.CLI(err)
      })

      let result = await control.measureDevice();


      BU.CLI(result)
      expect(result).to.not.deep.equal({})
    })
  })

})