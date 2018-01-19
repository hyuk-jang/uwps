const {
  expect
} = require('chai');

const BU = require('base-util-jh').baseUtil;
global.BU = BU;

const Encoder = require('../src/Encoder');
const Decoder = require('../src/Decoder');



const dcm = require('device-connect-manager');

describe('Test', () => {
  const cmdList = [
    'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
  ];
  let reserveCmdList = [];
  describe('Test', () => {
    it('make Dev Encoder Msg', done => {
      const encoder = new Encoder();
      reserveCmdList = encoder.makeMsg();
      expect(reserveCmdList.length).to.equal(cmdList.length);
      BU.CLI(reserveCmdList);
      done();
    });

    after(() => {
      describe('Decoder Test', () => {
        let dummyInverter;
        let port;
        it('DummyInverter Server Listen', async() => {
          const DummyInverter = require('../../../DummyInverter');
          dummyInverter = new DummyInverter({
            dailyKwh: 0,
            cpKwh: 0
          });
          port = await dummyInverter.init();
          console.log('DummyInverter Server Listen', port);
          expect(port).to.be.an('number');
        });

        it('장치 접속 및 Decoder 유효성 검증', async() => {
          const connectorObj = dcm.init({
            connect_type: 'socket',
            port
          });

          // 데이터 수신 되는지 
          connectorObj.on('dcData', data => {
            BU.CLI(data.toString());
            const decoder = new Decoder();
            // 짤린 데이터를 넣어봄
            // data = data.slice(50);
            let result = decoder._receiveData(data);
            BU.CLI(result);
            expect(result).to.be.a('object');
          });

          console.time('connect');
          await dcm.connect();
          console.timeEnd('connect');
          console.time('write');
          await dcm.write(reserveCmdList[1]);
          console.timeEnd('write');
        });
      });
    });
  });
});