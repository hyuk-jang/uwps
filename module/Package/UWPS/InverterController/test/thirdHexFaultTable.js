

exports.faultInfo = (byteConut) => {
  let returnValue = [];
  if(byteConut === 0){
    returnValue = [
      {
        msg: '태양전지 과전압',
        code: 'Soloar Cell OV Fault',
        number: 0,
        errorValue: 1
      },{
        msg: '태양전지 과전압 제한초과',
        code: 'Solar Cell OV limit fault',
        number: 1,
        errorValue: 1
      },{
        msg: '태양전지 저전압 (변압기 type Only)',
        code: 'Solar Cell UV fault',
        number: 2,
        errorValue: 1
      },{
        msg: '태양전지 저전압 제한초과',
        code: 'Solar Cell UV limit fault',
        number: 3,
        errorValue: 1
      }
    ]
  } else if(byteConut === 1){
    returnValue = [
      {
        msg: '인버터 과 전류',
        code: 'Inverter over current fault',
        number: 0,
        errorValue: 1
      },{
        msg: '인버터 과 전류 시간 초과',
        code: 'Inverter O.C. overtime fault',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      }
    ]
  } else if(byteConut === 2){
    returnValue = [
      {
        msg: '인버터 과 전류',
        code: 'Inverter over current fault',
        number: 0,
        errorValue: 1
      },{
        msg: '인버터 과 전류 시간 초과',
        code: 'Inverter O.C. overtime fault',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      },{
        msg: '',
        code: '',
        number: 0,
        errorValue: 1
      }
    ]
  }

}