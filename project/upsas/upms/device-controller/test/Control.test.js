const {
  expect
} = require('chai');
const BU = require('base-util-jh').baseUtil;
const Control = require('../src/Control.js');
global.BU = BU;
// const config = require('../src/config.js');

describe('Category 구분', () => {
  describe('장치 Category 별 접속 테스트', () => {
    it('Socket 접속', async() => {
      let config = {
        connecttype: 'Socket',
        port: 8888
      };
      let control = new Control();

      let result = await control.connect(config);

      console.log('@@', result);

      expect(result).to.be.ok;
    });

  });

  // describe('Converter 붙이기 테스트', () => {

  // });
});