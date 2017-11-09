module.exports = {
  current: {
    hasDev: false, // true면 저장된 File 읽어옴. false면 기상청 접속
    locationInfo: {
      x: 44, // Device Name
      y: 55, // Port를 직접 지정하고자 할때 사용
    },
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : "saltpond_controller"
    },
  }
}