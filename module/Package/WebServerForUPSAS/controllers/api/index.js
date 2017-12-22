const path = require('path')
module.exports = function (app) {
  // const rootDic = process.env.NODE_ENV === 'production' ? __dirname :   ;
  // SU.ChainingControllers(path.join(process.cwd(), '/controllers/api'), app);
  SU.ChainingControllers(__dirname, app);
}