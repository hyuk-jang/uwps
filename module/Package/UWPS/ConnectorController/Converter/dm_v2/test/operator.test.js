const chai = require('chai');
const expect = chai.expect;
const should = chai.should();

const operator = require('../src/operator');
const sum = operator.sum;

describe('operator.js Test', () => {
  describe('sum 함수 테스트', () => {
    before(() => {
      console.log('before')
    })
    beforeEach(() => {
      console.log('beforeEach')
    })
    it('10과 20을 넘기면 30이 나와야한다.', done => {
      let result = sum(10, 20);
      expect(result).to.equal(30);

      expect(result).to.have.contain(30)

      // expect(false).to.be.ok;
      // expect(undefined).to.not.be.ok;
      // expect(null).to.not.be.ok;
      done();
    })



    after(() => {
      console.log('after')
    })
    it('10과 20을 넘기면 30이 나와야한다.', done => {
      let result = sum(10, 20);
      expect(result).to.equal(30);
      done();
    })
    afterEach(() => {
      console.log('afterEach')
    })
  })
})