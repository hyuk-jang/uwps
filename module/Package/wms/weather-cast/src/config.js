module.exports = {
  current: {
    hasDev: false, 
    /** @property {{x: number, y: number}} locationInfo 위도, 경도 */
    locationInfo: {
      x: 50, 
      y: 71, 
    },
    /** @property  접속 host, id, pw, database */
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'saltpond_controller'
    },
  }
};