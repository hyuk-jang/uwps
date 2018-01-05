'use strict';


const dev = require('./dev')
const s_hex = require('./s_hex')
const baseFormat = {
  // Pv Info
  amp: null, // Ampere
  vol: null, // voltage
  // Power Info
  gridKw: null, // 출력 전력
  dailyKwh: null, // 하루 발전량 kWh
  cpKwh: null, // 인버터 누적 발전량 mWh  Cumulative Power Generation
  pf: null, // 역률 Power Factor %
  // Grid Info
  rsVol: null, // rs 선간 전압
  stVol: null, // st 선간 전압
  trVol: null, // tr 선간 전압
  rAmp: null, // r상 전류
  sAmp: null, // s상 전류
  tAmp: null, // t상 전류
  lf: null, // 라인 주파수 Line Frequency, 단위: Hz
  // System Info
  isSingle: null, // 단상 or 삼상
  capa: null, // 인버터 용량 kW
  productYear: null, // 제작년도 월 일 yyyymmdd,
  sn: null, // Serial Number,
  // Operation Info
  isRun: null, // 인버터 동작 유무
  isError: null, // 인버터 에러 발생 유무
  temperature: null, // 인버터 온도
  errorList: null, // 에러 리스트 Array
  warningList: null // 경고 리스트 Array
}

module.exports = {
  dev,
  s_hex,
  baseFormat
}


// if __main process
if (require !== undefined && require.main === module) {
}