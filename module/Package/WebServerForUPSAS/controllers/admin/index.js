const path = require('path')
module.exports = function (app) {
  SU.ChainingControllers(path.join(process.cwd(), '/controllers/admin'), app);

  if (app.get('env') === 'production') {
    app.use('/admin', function (req, res, next) {
      console.log(config)
      if (!req.user) {
        return res.redirect('/auth/login');
      }
      next();
    });
  }
}