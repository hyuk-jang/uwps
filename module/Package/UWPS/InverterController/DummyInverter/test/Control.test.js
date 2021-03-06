const {
  expect
} = require('chai');
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;


const Control = require('../src/Control.js');

global.BU = BU;

describe('dummy Inverter Test', () => {
  let control;
  before(() => {
    control = new Control({
      dailyKwh: 10,
      cpKwh: 30
    });
  });

  it('normal course', async() => {
    let hasRun = await control.init();
    let operation = control.p_SocketServer.cmdProcessor('operation');
    BU.CLI(operation);
    let grid = control.p_SocketServer.cmdProcessor('grid');
    BU.CLI(grid);

    expect(operation).to.be.ok;

  });

  // DB 입력 테스트
  describe('insert DB Test', () => {
    let finalDummyDataList;
    // 인버터 리스트 별로 가상 데이터 생성
    before(() => {
      const allDummyDataList = [];
      let inverterList = [1, 2, 3, 4, 5, 6];
      inverterList.forEach(inverter_seq => {
        let control = new Control({
          dailyKwh: 0,
          cpKwh: 0
        });

        let dummyData = control.dummyRangeDataMaker('2017-11-27', '2017-11-27 15:00:00', 30, inverter_seq);
        allDummyDataList.push(dummyData);
      });
      finalDummyDataList = _.flatten(allDummyDataList);
      BU.CLI(finalDummyDataList.length);
    });



    // 실제 DB 입력.
    it('db insert', done => {
      let dbInfo = {
        host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
        user: 'upsas',
        password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
        database: 'upsas'
      };
      done();

      // const bmjh = require('base-model-jh');
      // let BM = new bmjh.BM(dbInfo);
      // BM.setTables('inverter_data', finalDummyDataList)
      //   .then(r => {
      //     done()
      //   })
      //   .catch(e => {
      //     console.error(e)
      //   })
    });

  });


});