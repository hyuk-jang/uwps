const _ = require('lodash');
const {BU} = require('base-util-jh');
const bmjh = require('base-model-jh');

const Weathercast = require('weather-cast');

module.exports = class {
  constructor() {
    // 기본 dbInfo 설정
    this.dbInfo = {
      host: process.env.DB_UPSAS_HOST,
      port: process.env.DB_UPSAS_PORT,
      user: process.env.DB_UPSAS_USER,
      password: process.env.DB_UPSAS_PW,
      database: process.env.DB_UPSAS_DB,
    };
  }

  /**
   * 기상청 동네예보 계측 동작
   */
  async init() {
    BU.CLI(this.dbInfo);
    const bi = new bmjh.BM(this.dbInfo);
    const sql = `
    select weather_location.* from (
      select * from MAIN
      where is_deleted = 0
      group by weather_location_seq
    ) m
    left join weather_location
     on m.weather_location_seq = weather_location.weather_location_seq
  `;
    const deviceList = await bi.db.single(sql);

    deviceList.forEach(currentItem => {
      const axis = _.pick(currentItem, ['x', 'y']);
      /** @type {{dbInfo: dbInfo, locationSeq: number, locationInfo: {x: number, y: number}}} */
      const config = {
        dbInfo: this.dbInfo,
        locationInfo: axis,
        locationSeq: _.get(currentItem, 'weather_location_seq'),
      };

      BU.CLI(config);/
      const weathercast = new Weathercast(config);
      weathercast.init();
    });
  }

  /**
   * 저장할 DB 접속 정보를 변경하고자 할 경우 정의
   * @param {dbInfo} dbInfo
   */
  setDB(dbInfo) {
    this.dbInfo = dbInfo;
  }
};
