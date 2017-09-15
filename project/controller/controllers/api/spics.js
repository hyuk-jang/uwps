module.exports = function (app) {
  const _ = require('underscore');
  const router = require('express').Router();
  const initSetter = app.get('initSetter');


  function parsingMiddleware(req) {
    // BU.CLI(initSetter.cryptoInfo)
    req.locals = BU.param2Lowercase(req);
    try {
      for (var ele in req.locals) {
        req.locals[ele] = BU.decryptAes(req.locals[ele], initSetter.aliceBobSecret);
      }
    } catch (error) {
      BU.logFile(error)
    }

  }

  // server middleware
  // 패킷 복호화 실패시 미들웨어에서 처리
  router.use(function (req, res, next) {
    try {
      parsingMiddleware(req);
      return next();
    } catch (error) {
      initSetter.exchangeInfo((err, result) => {
        if (err) {
          return res.status(401).send();
        } else {
          parsingMiddleware(req);
          return next();
        }
      });
    }
  });


  // 관제센터로부터 새로운 사용자가 로그인 할 거라고 요청받음
  router.post('/new-client', function (req, res) {
    // BU.CLI('newClient', req.locals)

    // 새로운 사용자가 로그인 할거라고 알려줌
    var newClient = {
      memberSeq: req.locals.member_seq,
      sessionId: req.locals.session_key,
      loginDate: new Date(),
      deviceKey: '',
      socket: null
    }

    let workers = app.get('workers');
    workers.socketServer.pushServer.reserveClient(newClient)

    return res.status(204).send();
  });

  return router;
}