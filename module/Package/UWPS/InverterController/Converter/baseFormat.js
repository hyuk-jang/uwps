/**
 * @module baseFormat Module 인버터 데이터 가이드라인
 */
module.exports = {
  /**
   * 전류(Ampere), 단위[A]
   * @description PV 
   * @type {number=}
   */
  amp: null,
  /**
   * 전압(voltage), 단위[V]
   * @description PV 
   * @type {number=}
   */
  vol: null,
  /**
   * 출력 전력, 단위[kW]
   * @description Power 
   * @type {number=}
   */
  gridKw: null,
  /**
   * 하루 발전량, 단위[kWh]
   * @description Power 
   * @type {number=}
   */
  dailyKwh: null,
  /**
   * 인버터 누적 발전량, 단위[kWh] Cumulative Power Generation
   * @description Power 
   * @type {number=}
   */
  cpKwh: null,
  /**
   * 역률, 단위[%]
   * @description Power 
   * @type {number=}
   */
  pf: null,
  /**
   * RS 선간 전압, 단위[V]
   * @description Grid 
   * @type {number=}
   */
  rsVol: null,
  /**
   * ST 선간 전압, 단위[V]
   * @description Grid 
   * @type {number=}
   */
  stVol: null,
  /**
   * TR 선간 전압, 단위[V]
   * @description Grid 
   * @type {number=}
   */
  trVol: null,
  /**
   * R상 전류, 단위[A]
   * @description Grid 
   * @type {number=}
   */
  rAmp: null,
  /**
   * S상 전류, 단위[A]
   * @description Grid 
   * @type {number=}
   */
  sAmp: null,
  /**
   * T상 전류, 단위[A]
   * @description Grid 
   * @type {number=}
   */
  tAmp: null,
  /**
   * 라인 주파수 Line Frequency, 단위[Hz]
   * @description Grid 
   * @type {number=}
   */
  lf: null,
  /**
   * 단상 or 삼상, 단위[0 or 1]
   * @description System 
   * @type {number=}
   */
  isSingle: null,
  /**
   * 인버터 용량, 단위[kW] Capacity
   * @description System 
   * @type {number=}
   */
  capa: null,
  /**
   * 제작년도 월 일 yyyymmdd, 단위[yyyymmdd]
   * @description System 
   * @type {string=}
   */
  productYear: null,
  /**
   * Serial Number, 단위[String]
   * @description System 
   * @type {string=}
   */
  sn: null,
  /**
   * 인버터 동작 유무, 단위[0 or 1]
   * @description Operation 
   * @type {number=}
   */
  isRun: null,
  /**
   * 인버터 에러 발생 유무, 단위[0 or 1]
   * @description Operation 
   * @type {number=}
   */
  isError: null,
  /**
   * 인버터 온도, 단위[°C]
   * @description Operation 
   * @type {number=}
   */
  temperature: null,
  /**
   * 에러 리스트, 단위[Array.<{}>]
   * @description Operation 
   * @type {Array.<Object>=}
   */
  errorList: null,
  /**
   * 경고 리스트, 단위[Array.<{}>]
   * @description Operation 
   * @type {Array.<Object>=}
   */
  warningList: null

};