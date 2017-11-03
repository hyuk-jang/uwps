const router = require('express').Router();
const _ = require('underscore');

const biApp = require('../../models/api/app.js');
const BU = require('base-util-jh').baseUtil;
module.exports = function (app) {
  // server middleware
  router.use(function (req, res, next) {
    req.locals = BU.param2Lowercase(req);
    next();
  });

  // App Regi 등록
  router.post('/reggcm', function (req, res) {
    BU.CLI('reggcm @@@@@@@@ B_B', req.locals)
    // var bodyParam = BU.param2Lowercase(req);
    // err, new, update 
    biApp.getGcmDevice(req.locals.devicekey, function (err, resGet, query) {
      BU.CLIS('getGcmDevice', err, resGet, query)
      if (err) {
        return res.status(400).send(_occurError(err));
      } else if (resGet.length === 0) {
        biApp.insertGcmDevice(req.locals, function (err, resInsert, query) {
          if (err) {
            return res.status(400).send(_occurError(err));
          } else {
            return res.send(_occurSuccess(resInsert));
          }
        });
      } else {
        BU.CLI('updateGcmDevice')
        biApp.updateGcmDevice(resGet[0].gcm_device_seq, req.locals, function (err, resUpdate) {
          if (err) {
            return res.status(400).send(_occurError(err));
          } else {
            // BU.CLI(resUpdate)
            return res.send(_occurSuccess(resUpdate));
          }
        })
      }
    });
  });

  // GCM 삭제하고자 할때
  router.post('/delgcm', function (req, res) {
    biApp.deleteGcmDevice(req.locals.devicekey, function (err, resDel) {
      if (err) {
        return res.status(400).send(_occurError(err));
      } else {
        return res.send(_occurSuccess(resDel));
      }
    });
  });



  function _occurError(err, cmd, contents) {
    return {
      CMD: cmd || '',
      IsError: 1,
      Message: err,
      Contents: contents || {}
    };
  }

  function _occurSuccess(msg, cmd, contents) {
    return {
      CMD: cmd || '',
      IsError: 0,
      Message: msg,
      Contents: contents || {}
    };
  }



  return router;
}