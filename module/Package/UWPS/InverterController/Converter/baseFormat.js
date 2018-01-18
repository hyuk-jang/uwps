/**
 * @module baseFormat Module 인버터 데이터 가이드라인
 */
module.exports = {
  // Pv Info
  /**
   * 전류(Ampere), 단위[A]
   * @type {number=}
   */
  amp: null,
  /**
   * 전압(voltage), 단위[V]
   * @type {number=}
   */
  vol: null,
  // Power Info
  /**
   * 출력 전력, 단위[kW]
   * @type {number=}
   */
  gridKw: null,
  /**
   * 하루 발전량, 단위[kWh]
   * @type {number=}
   */
  dailyKwh: null,
  /**
   * 인버터 누적 발전량, 단위[mWh] Cumulative Power Generation
   * @type {number=}
   */
  cpKwh: null,
  /**
   * 역률, 단위[%]
   * @type {number=}
   */
  pf: null,
  // Grid Info
  /**
   * RS 선간 전압, 단위[V]
   * @type {number=}
   */
  rsVol: null,
  /**
   * ST 선간 전압, 단위[V]
   * @type {number=}
   */
  stVol: null,
  /**
   * TR 선간 전압, 단위[V]
   * @type {number=}
   */
  trVol: null,
  /**
   * R상 전류, 단위[A]
   * @type {number=}
   */
  rAmp: null,
  /**
   * S상 전류, 단위[A]
   * @type {number=}
   */
  sAmp: null,
  /**
   * T상 전류, 단위[A]
   * @type {number=}
   */
  tAmp: null,
  /**
   * 라인 주파수 Line Frequency, 단위[Hz]
   * @type {number=}
   */
  lf: null,
  // System Info
  /**
   * 단상 or 삼상, 단위[0 or 1]
   * @type {number=}
   */
  isSingle: null,
  /**
   * 인버터 용량, 단위[kW] Capacity
   * @type {number=}
   */
  capa: null,
  /**
   * 제작년도 월 일 yyyymmdd, 단위[yyyymmdd]
   * @type {string=}
   */
  productYear: null,
  /**
   * Serial Number, 단위[String]
   * @type {string=}
   */
  sn: null,
  // Operation Info
  /**
   * 인버터 동작 유무, 단위[0 or 1]
   * @type {number=}
   */
  isRun: null,
  /**
   * 인버터 에러 발생 유무, 단위[0 or 1]
   * @type {number=}
   */
  isError: null,
  /**
   * 인버터 온도, 단위[°C]
   * @type {number=}
   */
  temperature: null,
  /**
   * 에러 리스트, 단위[Array.<{}>]
   * @type {Array.<Object>=}
   */
  errorList: null,
  /**
   * 경고 리스트, 단위[Array.<{}>]
   * @type {Array.<Object>=}
   */
  warningList: null

};