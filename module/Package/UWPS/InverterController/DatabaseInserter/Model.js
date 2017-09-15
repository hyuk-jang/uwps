const _ = require('underscore');
class Model {
  constructor(controller) {
    this.controller = controller;

    this.config = controller.config;

    this.ivtInfo = {
      hasSingle: this.config.ivtInfo.hasSingle, // 단상 or 삼상
      capa: this.config.ivtInfo.capa,  // 인버터 용량 kW
      productYear: this.config.ivtInfo.productYear, // 제작년도 월 일 yyyymmdd,
      sn: this.config.ivtInfo.sn  // Serial Number
    }

    this.pvData = {
      amp: this.config.dummyValue.pv.amp, // Ampere
      vol: this.config.dummyValue.pv.vol  // voltage
    }

    this.singleGridData = {
      amp: 0, // Ampere
      vol: 0, // voltage
      lf: 0 // 라인 주파수 Line Frequency, 단위: Hz
    }

    this.ThirdGridData = {
      rsVol: 0, // rs 선간 전압
      stVol: 0, // st 선간 전압
      trVol: 0, // tr 선간 전압
      rAmp: 0, // rs 선간 전류
      sAmp: 0, // st 선간 전류
      tAmp: 0, // tr 선간 전류
      lf: 0 // 라인 주파수 Line Frequency, 단위: Hz
    }

    this.ivt_data = {
      currPvKw: 0,  //  현재 태양 전지 출력 전력량, 단위: kW
      currIvtKva: 0,  //  현재 인버터 출력 전력량, 단위: kVa  피상전력
      currIvtKw: 0,  //  현재 인버터 출력 전력량, 단위: kW  유효전력
      ivtLowAddr: 0,  // 인버터 적산 전력량 Low Bit
      ivtHighAddr: 0,  // 인버터 적산 전력량 High Bit,
      ivtMaxKw: 0, // 인버터 최대 출력 kW
      ivtDailyKwh: 0, // 하루 발전량 kWh
      ivtCpKwh: 0, // 인버터 누적 발전량 kWh  Cumulative Power Generation
      ivtPf: 0 // 역률 Power Factor %
    }

    this.dummy = {
      pointHour: 0,
      pointDate: 1,
      storageHourKwh:[],
      storageDailyKwh:[]
    }

    

    this.ivt_seq = 0; // mysql inverter_data_seq
    

  }

  get currPvData() {
    let returnvalue = {
      amp: Number(this.pvData.amp.toFixed(2)),
      vol: Number(this.pvData.vol.toFixed(1))
    }
    return returnvalue;
  }

  get currIvtData() {
    let returnvalue = {};
    Object.assign(returnvalue, this.ivt_data);
    returnvalue.currPvKw = Number((returnvalue.currPvKw / 1000).toFixed(3));
    returnvalue.currIvtKva = Number((returnvalue.currIvtKva / 1000).toFixed(3));
    returnvalue.currIvtKw = Number((returnvalue.currIvtKw / 1000).toFixed(3));
    
    return returnvalue;
  }

  get currIvtDataForDbms() {
    let in_wh = this.pvData.amp * this.pvData.vol;
    let out_wh = this.currIvtAmp * this.currIvtVol;

    // BU.CLIS(this.pvData, in_wh)
    let returnvalue = {
      // inverter_seq: this.ivt_seq,
      in_a: this.pvData.amp,
      in_v: this.pvData.vol,
      in_wh: in_wh,
      out_a: this.currIvtAmp,
      out_v: this.currIvtVol,
      out_wh: out_wh,
      p_f: _.isNaN(out_wh / in_wh) ? 0 : out_wh / in_wh * 100,
      d_wh: this.ivt_data.ivtDailyKwh,
      c_wh: this.ivt_data.ivtCpKwh
    };
    
    // Scale 10 배수 처리
    _.each(returnvalue, (value, key) => returnvalue[key] = Math.trunc(parseFloat(value) * 10));

    // returnvalue.inverter_seq = this.ivt_seq;

    return returnvalue;
  }

  onPvData(pv = {amp, vol}){
    this.pvData.amp = pv.amp;
    this.pvData.vol = pv.vol;
  }


  get currIvtAmp() {
    if(this.ivtInfo.hasSingle){
      return this.singleGridData.amp;
    } else {
      return this.ThirdGridData.rsAmp;
    }
  }

  get currIvtVol() {
    if(this.ivtInfo.hasSingle){
      return this.singleGridData.vol;
    } else {
      return this.ThirdGridData.rsVol;
    }
  }


  onIvtData(ivt = {amp, vol}) {
    let amp = ivt.amp;
    let vol = ivt.vol;
    if(this.ivtInfo.hasSingle){
      this.singleGridData.amp = amp;
      this.singleGridData.vol = vol;
    } else {
      this.ThirdGridData.rsAmp = amp;
      this.ThirdGridData.rsVol = vol;
    }
    

    this.ivt_data.currPvKw = this.pvData.amp * this.pvData.vol;  // w
    this.ivt_data.currIvtKva = this.pvData.amp * this.pvData.vol;// w
    this.ivt_data.currIvtKw = amp * vol; // 유효 전력
    // this.ivt_data.ivtLowAddr = 0;
    // this.ivt_data.ivtHighAddr = 0;
    // this.ivt_data.ivtMaxKw = 0;
    // this.ivt_data.ivtDailyKwh = 0;
    // this.ivt_data.ivtCpKwh = 0;
    this.ivt_data.ivtPf = (amp * vol) / (this.pvData.amp * this.pvData.vol);
    
  }

  // 발전량 더미 데이터 수신
  onDummyIvtData(targetDate, ivtWh){
    let hour = targetDate.getHours();
    let date = targetDate.getDate();

    // 시간이 바뀜
    if(hour !== this.dummy.pointHour){
      // BU.CLIS(hour,this.dummy.storageHourKwh, ivtWh)
      this.dummy.pointHour = hour;
      let hourKwh = this.dummy.storageHourKwh.reduce((x, y) => x + y) / this.dummy.storageHourKwh.length;
      // 1시간 발전량 측정 저장소 초기화
      this.dummy.storageHourKwh = [];
      // 하루 저장소에 kwh 저장
      // this.dummy.storageDailyKwh.push(hourKwh);

      

      // 하루 누적 발전량에 추가
      this.ivt_data.ivtDailyKwh += hourKwh;
      // BU.CLI(hourKwh,this.ivt_data.ivtDailyKwh)
      // 누적 발전량 기입
      this.ivt_data.ivtCpKwh += hourKwh;

      // 요일이 바뀌었다면 하루 발전량
      if(date !== this.dummy.pointDate){
        // 요일 다시 지정
        this.dummy.pointDate = date;
        // let dateKwh = this.dummy.storageDailyKwh.reduce((x, y) => x + y);

        // 하루 발전량 측정 저장소 초기화
        // this.dummy.storageDailyKwh = [];
        
        // 누적 발전량 기입
        // this.ivt_data.ivtCpKwh += dateKwh;
        // 하루 발전량 초기화
        this.ivt_data.ivtDailyKwh = 0;
      }
    }

    this.dummy.storageHourKwh.push(ivtWh);

    // BU.CLI(this.currIvtDataForDbms)
    
  }





}

module.exports = Model; 