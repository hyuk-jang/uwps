module.exports = function (app, passport) {
    var admin = require("./admin")(app, passport);
    var auth = require("./auth")(app, passport);
    var api = require("./api")(app, passport);

    app.get(["/", "/admin"], function (req, res) {
        console.log("connect")
        if (req.user) {
            return res.redirect("/admin/server");
        } else {
            return res.redirect("/auth/login");
        }
    });

    // for (var route in controller) {
    //     // console.log("route", route)
    //     // app.all("/admin", function(req, res, next){
    //     //     console.log("admin 실행");
    //     //     next();
    //     // })
    //     app.use("/", controller[route]);
    // }

    return {
        admin: admin,
        auth: auth,
        api: api
    }
}