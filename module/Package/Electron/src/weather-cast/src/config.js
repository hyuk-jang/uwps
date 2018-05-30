module.exports = {
  /** @property {Object} current 현재 기상청 날씨 가져오기 위한 설정 정보 */
  current: {
    /** @property {boolean} hasDev 면 저장된 File 읽어옴. false면 기상청 접속 */
    hasDev: false, 
    /** @property {{x: number, y: number}} locationInfo 위도, 경도 */
    locationInfo: {
      x: 50, 
      y: 71, 
    },
    /** @property  접속 host, id, pw, database */
    dbInfo: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: 'reaper83',
      database: 'upsas',
    },
  }
};