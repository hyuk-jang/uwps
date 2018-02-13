module.exports = function (dbInfo) {
  var express = require('express');
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);

  var bodyParser = require('body-parser');
  var serveStatic = require('serve-static');

  var methodOverride = require('method-override');
  var logger = require('morgan');

  var path = require('path');

  var app = express();

  var flash = require('connect-flash');
  var favicon = require('serve-favicon');
  app.use(favicon(path.join(process.cwd(), 'public/image', 'favicon.ico')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    limit: 1024 * 1024 * 1, // 1mb 까지 허용
    extended: true
  }));
  
  app.use(methodOverride('_method'));

  app.use(flash());

  app.use(express.static(path.join(process.cwd(), '/', 'public')));
  app.use(session({
    key: 'sid',
    secret: BU.GUID(),
    store: new MySQLStore(dbInfo),
    resave: false,
    saveUninitialized: true
  }));


  app.use('/upload', serveStatic(path.join(process.cwd(), '/', 'uploads')));

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.set('views', path.join(process.cwd(), '/', 'views'));

  // 배포 Ver 일 경우 사용자 권한 체크
  if (app.get('env') === 'production') {
    process.on('uncaughtException', function (err) {
      //예상치 못한 예외 처리
      BU.debugConsole();
      console.log('uncaughtException 발생 : ' + err);
      BU.errorLog('uncaughtException', err);
    });
    // app.use('/admin', function (req, res, next) {
    //     console.log('all admin hello')
    //     if (!req.user) {
    //         return res.redirect('/auth/login');
    //     }
    //     next();
    // })
  }

  // Pkg 를 위한 path 추가
  path.join(process.cwd(), '/controllers/**/*');
  path.join(process.cwd(), '/models/**/*');

  
  // Error-handling middleware
  console.log(app.get('env'));
  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(logger(':method :url :status :response-time ms - :res[content-length]'), function (req, res, next) {
      next();
    });

    app.use(function (err, req, res, next) {
      // console.log(res);
      res.status(res.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }


  // FIXME: use 이벤트가 router 앞에 위치함.
  // catch 404 and forward to error handler
  setTimeout(function () {
    app.use((req, res, next) => {
      res.status(404).send('Sorry cant find that!');
    });
  }, 1000 * 3);






  return app;
};