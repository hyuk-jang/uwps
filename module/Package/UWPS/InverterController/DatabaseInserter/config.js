module.exports = {
  current: {
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'saltpond_controller'
    },
    ivtInfo: {
      hasSingle: 1, // 단상 or 삼상
      capa: 3,  // 인버터 용량 kW
      productYear: 20170808, // 제작년도 월 일 yyyymmdd,
      sn: 'afajkh'  // Serial Number
    },
    pvData: {
      amp: 20,  // Ampere
      vol: 220  // voltage
    },
    renewalCycle: 10, // sec  데이터 갱신 주기,
    dummyValue: {
      pv: {
        amp: 6.4,  // Ampere
        vol: 225,  // voltage
        baseAmp: 6.5,  // 기준
        baseVol: 230, 
        ampCritical: 2,
        volCritical: 20
      },
      ivt: {
        pf: 96.7,
        basePf: 97,
        pfCritical: 4

      }
    },
    dbmsManager: {
      dailyScale: [],
      inverterId:'IVT1',
      startDate: '2017-08-04 17:00:00',
      insertInterval: 10,  // 분
      // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
      powerRange: [0,0,0,0,0,0,10,20,30,40,50,70,90,100,95,85,65,40,25,10,0,0,0,0]
    }


  }
}