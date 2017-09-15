module.exports = function (app) {
    var passport = require("passport");
    var LocalStrategy = require("passport-local").Strategy;
    // var FacebookStrategy = require("passport-facebook").Strategy;

    var BU = global.BU;
    var biAuth = require("../models/auth/auth");

    // passport 설정
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy({
        usernameField: "userid",
        passwordField: "password"
    }, function (username, password, done) {
        BU.CLIS(username, password)
        biAuth.selectAuthMember(username, password, function (err, result) {
            if (err) {
                console.log("server error.");
                return done(err)
            }
            if (BU.isEmpty(result)) {
                console.log("isEmpty")
                return done(err, false, {message: "아이디와 비밀번호를 확인해주세요."});
            }
            BU.CLI(result);
            return done(err, result);
        })
    }));

    passport.serializeUser(function (user, done) {
        // BU.CLI("serializeUser", user)
        done(null, user.userid);
    });


    passport.deserializeUser(function (id, done) {
        // BU.CLI("deserializeUser", id)
        biAuth.getMemberById(id, function (err, result) {
            if (err || BU.isEmpty(result))
                return done("no user");
            done(err, result[0]);
        });
    });

    return passport;
}