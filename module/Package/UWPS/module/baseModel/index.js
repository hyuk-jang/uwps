const baseModel = require('./baseModel.js');
module.exports = baseModel;




// var db = require('./db');
// const BU = require('./baseUtil.js');
// const baseModel = require('./baseModel.js');

// baseModel.getTable('whetherdevice')
// .then(rows => {
//   let data = rows[0];
//   let setObj = data;
//   console.log('@@@@@@@',setObj)

//   delete(setObj.WhetherDeviceIdx);
//   setObj.WriteDate = BU.convertDateToText (new Date());

//   let test = baseModel.makeInsertValues(Object.values(setObj) );

//   console.log('test',test)

//   console.log(setObj);

//   return baseModel.setTest('whetherdevice', setObj);

// })
// .done(result => {
//   console.log('result', result)
// })

// return;


// // const Dao = require('./Dao.js');

// let dbInfo = {
//   connectionLimit:10,
//   host: '121.178.26.59',
//   user: 'root',
//   password: 'akdntm007!',
//   database: 'salt'
// };

// const Model = require('./Models.js');

// let model = new Model(dbInfo);

// model.getTable('whetherdevice').then(result => {
//   console.log(result)
// });

// return;


// const Control = require('./Control.js');


// const control = new Control();

// // control.getSelect('weatherlocation');

// control.getSelect('whetherdevice');





