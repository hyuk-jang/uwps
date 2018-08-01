const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const _ = require('lodash');
const {BU} = require('base-util-jh');

const passport = require('passport');
const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');

module.exports = app => {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  router.get('/login', (req, res) => {
    res.render('./auth/login.html', {err: req.flash('error')});
  });

  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/admin/server',
      failureRedirect: '/auth/login',
      failureFlash: true,
    }),
  );

  router.get('/logout', (req, res) => {
    req.logOut();

    req.session.save(err => {
      if (err) {
        console.log('logout error');
      }
      return res.redirect('/auth/login');
    });
  });

  router.use(
    asyncHandler(async (err, req, res) => {
      console.trace(err);
      res.status(500).send(err);
    }),
  );

  return router;
};
