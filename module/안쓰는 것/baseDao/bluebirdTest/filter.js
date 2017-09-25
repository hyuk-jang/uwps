const Promise = require('bluebird');

/* Double all numbers */
Promise.map([1, 2, 3], function(num) {
  // console.time(num);
  // return Promise.delay(num * 1000).then(() => {
  //   console.timeEnd(num);
  //   return num * 2;
  // })
  return num * 2;
}).then(function(numbers) {
  console.log("The final list of numbers:", numbers);
  //The final list of numbers: [ 2, 4, 6 ]
});

/* Remove all the odd numbers */
Promise.filter([1, 2, 3], function(num) {
  return (num % 2) == 0;
}).then(function(numbers) {
  console.log("The final list of numbers:", numbers);
  // The final list of numbers: [ 2 ]
});

/* Sum all the numbers */
Promise.reduce([1, 2, 3], function(total, num) {
  return total + num;
}, 0).then(function(number) {
  console.log("The final value:", number);
  // The final value: 6
});