const _ = require('underscore');

const {
  expect
} = require('chai')

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

let hasSocketS_hex = true;
let hasSocketDev = false;


describe('Inverter Controller Test', () => {
  // 접속방법 Socket 
  describe('ConnectType: Socket', () => {
    before(() => {
      config.current.deviceSavedInfo.connect_type = 'socket'
    })

    // 헥스 파워 단상 테스트
    if (hasSocketS_hex) {
      describe('Category: s_hex', () => {
        config.current.deviceSavedInfo.target_category = 's_hex'
        const control = new Control(config)

        it('Category: s_hex', async() => {
          await control.init()
          control.on('completeSend2Msg', res => {
            BU.CLI(res)
          })
          control.on('errorSend2Msg', err => {
            BU.CLI(err)
          })

          // 중복된 에러가 잘 표현되는지 체크
          let result = await control.measureDevice();

          expect(result).to.not.deep.equal({})
        })

        it('errorList Test ', async() => {
          control.on('completeSend2Msg', res => {
            // 에러가 잘 표현되는지 체크. 명령 프롬프트를 보고 잘 판단하길... 
            if (_.has(res, 'errorList')) {
              // BU.CLIS(res, control.model.troubleArrayStorage)
            }
          })
          // random Device Error List 발생 3회 추가 발생
          await control.measureDevice();
          await control.measureDevice();
          await control.measureDevice();

          // 일반 프로그램 이상 발생 테스트
          result = control.model.onTroubleData('Disconnected Inverter', true)
          BU.CLI(result)
          expect(result.obj.fix_date).to.be.equal(null);
          let currTrouble = control.model.getCurrTroubleData();
          // BU.CLI(currTrouble)
          result = control.model.onTroubleData('Disconnected Inverter', false)
          currTrouble = control.model.getCurrTroubleData();
          // BU.CLI(currTrouble)
          result = control.model.onTroubleData('Disconnected Inverter', true)
          // 프로그램 에러가 갱신될때 fix_date가 초기화 되는지 확인
          expect(result.obj.fix_date).to.be.equal(null);

        })
      })
    }

    // SM Dev 테스트
    if (hasSocketDev) {
      it('Category: dev', async() => {
        config.current.deviceSavedInfo.target_category = 'dev'
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
    }
  })

})