const {
  expect
} = require('chai')
const Promise = require('bluebird');
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');

const Control = require('../src/Control.js');

global.BU = BU;

describe('dummy Inverter Test', () => {
  let control
  before(() => {
    control = new Control({
      dailyKwh: 10,
      cpKwh: 30
    });
  })

  it('normal course', done => {
    control.init()
      .then(hasRun => {
        BU.CLI('hasRun', hasRun)
        // return control.p_GenerateData.dummyRangeDataMaker('2017-11-11', '2017-11-12');
        return control.p_SocketServer.cmdProcessor('weather');
      })
      .then(result => {
        // result = control.cmdProcessor('pv');
        BU.CLIS(result, control.model.power)
        return control.p_SocketServer.cmdProcessor('power');
      }).catch(err => {
        BU.CLI(err)
      })
      .then(r => {
        BU.CLI(r)
        done()
      });
  })

  // DB 입력 테스트
  describe('insert DB Test', () => {
    let finalDummyDataList
    // 인버터 리스트 별로 가상 데이터 생성
    before(() => {
      const allDummyDataList = [];
      let inverterList = [1, 2, 3, 4, 5, 6];
      inverterList.forEach(inverter_seq => {
        let control = new Control({
          dailyKwh: 0,
          cpKwh: 0
        });

        let dummyData = control.dummyRangeDataMaker('2017-11-27', '2017-11-27 15:00:00', 30, inverter_seq)
        allDummyDataList.push(dummyData);
      })
      finalDummyDataList = _.flatten(allDummyDataList);
      BU.CLI(finalDummyDataList)
    })



    // 실제 DB 입력.
    it('db insert', done => {
      let dbInfo = {
        host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
        user: 'upsas',
        password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
        database: 'upsas'
      }
      done()

      // let BM = new bmjh.BM(dbInfo);
      // BM.setTables('inverter_data', finalDummyDataList)
      //   .then(r => {
      //     done()
      //   })
      //   .catch(e => {
      //     console.error(e)
      //   })
    })

  })


})