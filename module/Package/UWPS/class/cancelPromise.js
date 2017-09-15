const wait = (
  time,
  cancel = Promise.reject()
) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, time);
  const noop = () => {};

  cancel.then(() => {
    clearTimeout(timer);
    reject(new Error('Cancelled'));
  })
  // .catch(error => reject(new Error('T_T')))
  // ;
});

const shouldCancel = Promise.resolve(); // Yes, cancel
// const shouldCancel = Promise.reject(); // No cancel

wait(2000, shouldCancel).then(
  () => console.log('Hello!')
  // ,(e) => console.log(e) // [Error: Cancelled]
).catch(error => console.error('error', error)); 