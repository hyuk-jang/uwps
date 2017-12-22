const path = require('path')
module.exports = function (app) {
  // SU.ChainingControllers(path.join(process.cwd(), '/controllers/api/dev'), app);
  SU.ChainingControllers(__dirname, app);
}