module.exports = {
  hasDev: false, 
  /** @property {{x: number, y: number}} locationInfo 위도, 경도 */
  locationSeq: 2659,
  locationInfo: {
    x: 50, 
    y: 71, 
  },
  /** @property  접속 host, id, pw, database */
  dbInfo: {
    host: process.env.DB_UPSAS_HOST,
    user: process.env.DB_UPSAS_USER,
    port: process.env.DB_UPSAS_PORT,
    password: process.env.DB_UPSAS_PW,
    database: process.env.DB_UPSAS_DB
  },
};