module.exports = function (app, aliceBobSecret) {
  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;
  // const FacebookStrategy = require('passport-facebook').Strategy;
  const request = require('request');
  const crypto = require('crypto');

  const BU = require('../public/js/util/baseUtil.js')
  // var biAuth = require('../models/auth/auth');

  // passport 설정
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({
    usernameField: 'userid',
    passwordField: 'password'
  }, function (username, password, done) {
    // sharing secret key on a pair                                                 
    var enUsername = BU.encryptAes(username, aliceBobSecret);
    var enPassword = BU.encryptAes(password, aliceBobSecret);

    request.post(`${inteServerUrl}/api/auth-member/${controllerInfo.saltpond_info_seq}`, {
      json: {
        userid: enUsername,
        password: enPassword
      }
    }, function (err, response, body) {
      if (err) {
        console.log('server error.');
        return done(err)
      } else if (response.statusCode === 204) {
        BU.CLI('Empty');
        return done(err, false, {
          message: '아이디와 비밀번호를 확인해주세요.'
        });
      } else {
        BU.CLI('Success', body);
        return done(err, body);
      }
      // if (BU.isEmpty(body)) {
      //     // console.log('isEmpty')
      //     return done(err, false, {
      //         message: '아이디와 비밀번호를 확인해주세요.'
      //     });
      // }
    });
  }));

  passport.serializeUser(function (user, done) {
    BU.CLI('serializeUser', user)
    done(null, user.userid);
  });


  passport.deserializeUser(function (id, done) {
    BU.CLI('deserializeUser', id)
    done(null, id);
  });

  return passport;
}