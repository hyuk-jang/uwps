const path = require('path');
let BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;
let SU = require('base-util-jh').salternUtil;



module.exports = function (app) {
  BU.CLI(__dirname);
  // SU.ChainingControllers(path.join(process.cwd(), '/controllers'), app);
  SU.ChainingControllers(__dirname, app);

  app.get('/', function (req, res, next) {
    // if (!req.user) {

    // BU.CLI('@@@@');
    return res.redirect('/main');
    // }
    // next();
  });


  app.post('/reggcm', function (req, res, next) {
    // BU.CLI('@@reggcm@@');
    const request = require('request');
    let locals = BU.param2Lowercase(req);

    let userAgent = req.get('User-Agent');
    let initSetter = app.get('initSetter');

    // Mobile 접속 환경
    if (userAgent.match(/iPad/) || userAgent.match(/Android/)) {
      // TODO: POSTMAN에서는 307 redirect가 잘 먹나 app에서는 안먹어서 임시로 해놓음. 문제가 무엇인지 모르겠음. app log 참조 불가
      request.post(`http://localhost:${initSetter.webPort}/api/app/reggcm`, {
        json: locals
      }, (err, response, body) => {
        // BU.CLI(err, response, body)
        if (err) {
          // console.log('server error.');
          return res.status(500).send(body);
        } else if (response.statusCode === 204) {
          // BU.CLI('Empty');
          res.send(204).send(body);
        } else {
          // BU.CLI('Success', body);
          return res.send(body);
        }
      });
    } else {
      return res.redirect(307, '/api/app/reggcm');
    }
  });

  app.post('/delgcm', function (req, res, next) {
    BU.CLI('@@delgcm@@');
    const request = require('request');
    let locals = BU.param2Lowercase(req);

    let userAgent = req.get('User-Agent');
    let initSetter = app.get('initSetter');

    // Mobile 접속 환경
    if (userAgent.match(/iPad/) || userAgent.match(/Android/)) {
      // TODO: POSTMAN에서는 307 redirect가 잘 먹나 app에서는 안먹어서 임시로 해놓음. 문제가 무엇인지 모르겠음. app log 참조 불가
      request.post(`http://localhost:${initSetter.webPort}/api/app/delgcm`, {
        json: locals
      }, (err, response, body) => {
        // BU.CLI(err, response, body)
        if (err) {
          // console.log('server error.');
          return res.status(500).send(body);
        } else if (response.statusCode === 204) {
          // BU.CLI('Empty');
          res.send(204).send(body);
        } else {
          // BU.CLI('Success', body);
          return res.send(body);
        }
      });
    } else {
      return res.redirect(307, '/api/app/delgcm');
    }
  });



};