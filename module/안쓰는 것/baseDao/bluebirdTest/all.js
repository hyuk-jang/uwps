const Promise = require('bluebird');



const allTest = {
  first: time => {
    console.time(time)
    return Promise.delay(100 * time).then(() => {
      console.timeEnd(time)
      // if(time < 2){
      //   console.log('rejected' + time)
      //   return Promise.reject('T_T' + time)
      // }
      return Promise.resolve(time)
    }).catch(e => {
      throw e;
    })
    // return new Promise((resolve, reject) => {
      

    //   setTimeout(() => {
    //     if(typeof time === 'number'){
    //       resolve(time);
    //     } 
    //     // else {
    //     //   reject(time);
    //     // }
    //   }, 10 * time);
    // })
  }
}

let arr = [5,4,3,2,1,6,7,8,9];


Promise.map(arr, (ele, index, length) => {
  return allTest.first(ele).filter((item, index, length) => {
    console.log('T_T');
    console.dir(item, index, length)
    return item < 5;
  });
})
.filter(r => {
  console.log('filter', r)
  return r < 5;
})
.then(result => {
  console.dir('@@@@@@', result);
}).catch(e => {
  console.log('error', e)
})

return;

Promise.any([allTest.first(2), allTest.first(1), allTest.first(3)], 2)
.spread(result => {
  console.log(result)
})
.then(r => {
  console.log('log',r)
})
.catch(e => {
  console.error('error',e);
})

// allTest.first(5).then(r => {
//   console.dir(r)
// }).catch(e => {
//   console.error('error', e)
// })