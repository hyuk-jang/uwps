module.exports = {
  current: {
    port: 6000,
    hasSingle:true,
    pvData: {
      amp: 20,  // Ampere
      vol: 220  // voltage
    },
    renewalCycle: 10, // sec  데이터 갱신 주기,
    dummyValue: {
      // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
      powerRangeByYear: [68,75,76,79,84,87,96,100,92,85,76,71],
      // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
      powerRangeByMonth: [0,0,0,0,0,0,10,20,30,40,50,70,90,100,95,85,65,40,25,10,0,0,0,0],
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
    }
  }
}