const {
  expect
} = require('chai')
const eventToPromise = require('event-to-promise');

const Encoder = require('../src/Encoder')
const Decoder = require('../src/Decoder')

const BU = require('base-util-jh').baseUtil;
global.BU = BU;
const _ = require('underscore');

const bcjh = require('base-class-jh');

describe('Test', () => {
  const cmdList = [
    'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
  ]
  let reserveCmdList = [];
  describe('Test', () => {
    it('make Dev Encoder Msg', done => {
      const encoder = new Encoder();
      reserveCmdList = encoder.makeMsg();
      expect(reserveCmdList.length).to.equal(cmdList.length)
      BU.CLI(reserveCmdList)
      done();
    })

    after(() => {
      describe('Decoder Test', () => {
        let dummyInverter
        let port
        let client
        it('DummyInverter Server Listen', async() => {
          const DummyInverter = require('../../../DummyInverter');
          dummyInverter = new DummyInverter({
            dailyKwh: 0,
            cpKwh: 0
          });
          port = await dummyInverter.init()
          console.log('DummyInverter Server Listen', port)
          expect(port).to.be.an('number');
        })
    
        it('connect DummyInverter Server', async() => {
          let socketClient = new bcjh.socket.SocketClient(port);
          client = await socketClient.connect()
    
          expect(client).is.not.equal({})
        })
    
        it(`Decoder Test ${cmdList[0]}`, async() => {
          client.write(reserveCmdList[0])
    
          let resBuffer = await eventToPromise.multi(client, ['data'], ['close']);

          const decoder = new Decoder();

          let bufferBody = bcjh.classModule.resolveResponseMsgForTransfer(resBuffer[0]);

          let result = decoder._receiveData(resBuffer[0]);
          BU.CLI(result)
          expect(result).to.be.an('object')
        })
      })
    })
  })
})
