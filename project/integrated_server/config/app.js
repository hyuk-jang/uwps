module.exports = function (config) {
    var express = require("express");
    var session = require("express-session");
    var MySQLStore = require('express-mysql-session')(session);

    var bodyParser = require("body-parser");
    var serveStatic = require("serve-static");

    var methodOverride = require("method-override");
    var logger = require("morgan");

    var path = require("path");

    var app = express();

    var flash = require("connect-flash");


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        limit: 1024 * 1024 * 1, // 1mb 까지 허용
        extended: true
    }));

    app.use(methodOverride("_method"));

    app.use(flash());



    // // expose the "messages" local variable when views are rendered
    // app.use(function(req, res, next){
    //   var msgs = req.session.messages || [];

    //   // expose "messages" local variable
    //   res.locals.messages = msgs;

    //   // expose "hasMessages"
    //   res.locals.hasMessages = !! msgs.length;

    //   /* This is equivalent:
    //    res.locals({
    //      messages: msgs,
    //      hasMessages: !! msgs.length
    //    });
    //   */

    //   next();
    //   // empty or "flush" the messages so they
    //   // don't build up
    //   req.session.messages = [];
    // });

    app.use(express.static(path.join(__dirname, "../", "public")));
    app.use(session({
        key: "sid",
        secret: "SJ@*B390x@!9cxkj/5129x",
        store: new MySQLStore(config.inteDbInfo),
        resave: false,
        saveUninitialized: true
    }));


    app.use('/upload', serveStatic(path.join(__dirname, "../", "uploads")));


    app.engine("html", require("ejs").renderFile);
    app.set('view engine', 'html');

    app.set("views", path.join(__dirname, "../", "views"));

    // 배포 Ver 일 경우 사용자 권한 체크
    if (app.get("env") === "production") {
        // app.use("/admin", function (req, res, next) {
        //     console.log("all admin hello")
        //     if (!req.user) {
        //         return res.redirect("/auth/login");
        //     }
        //     next();
        // })
    }




    // Error-handling middleware
    // console.log(app.get('env') )
    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(logger(":method :url :status :response-time ms - :res[content-length]"), function (req, res, next) {
            next();
        });

        // app.use(function (err, req, res, next) {
        //     // console.log(res);
        //     res.status(res.status || 500);
        //     res.render('error', {
        //         message: err.message,
        //         error: err
        //     });
        // });



    }


    return app;
}