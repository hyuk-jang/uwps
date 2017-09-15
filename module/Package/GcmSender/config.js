module.exports = {
  current: {
    gcmInfo: {
      hasSendGcm: true,
      key: 'AIzaSyDGgt3enrX_DJTgophXl4XCgMRVCXEaeLY',
      startTransferPossibleHour: 7,
      endTransferPossibleHour: 20,
    },
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SrootTERN_PW ? process.env.SrootTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : "saltpond_controller"
    },
  }

}