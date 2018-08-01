const _ = require('lodash');
const expressApp = require('express')();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {BU} = require('base-util-jh');

const AuthModel = require('../models/auth/AuthModel');

/**
 *
 * @param {expressApp} app
 * @param {dbInfo} dbInfo
 */
module.exports = (app, dbInfo) => {
  // var FacebookStrategy = require("passport-facebook").Strategy;
  const authModel = new AuthModel(dbInfo);
  // passport 설정
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'userid',
        passwordField: 'password',
      },
      (username, password, done) => {
        BU.CLIS(username, password);

        authModel
          .getAuthMember()
          .then(result => done(null, result))
          .catch(err => done(err, false, {message: '아이디와 비밀번호를 확인해주세요.'}));
      },
    ),
  );

  passport.serializeUser((user, done) => {
    // BU.CLI("serializeUser", user)
    done(null, user.userid);
  });

  passport.deserializeUser((id, done) => {
    // BU.CLI("deserializeUser", id)
    authModel
      .getTable('MEMBER', {id})
      .then(result => {
        if (_.isEmpty(result)) {
          return done(null, false, {message: '아이디와 비밀번호를 확인해주세요.'});
        }
        return done(null, _.head(result));
      })
      .catch(err => done(err, false, {message: '아이디와 비밀번호를 확인해주세요.'}));
  });

  return passport;
};
