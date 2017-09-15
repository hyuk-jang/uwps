module.exports = function (app, passport) {
    var server = require("./server.js")();
    var member = require("./member.js")();
    var map = require("./map.js")();
    var ajax = require("./ajax.js")();
    
    var controller = Object.assign({}, server, member, map, ajax);

    if (app.get("env") === "production") {
        app.use("/admin", function (req, res, next) {
            console.log(config)
            if (!req.user) {
                return res.redirect("/auth/login");
            }
            next();
        });
    }

    for (var route in controller) {
        app.use("/admin/" + route, controller[route]);
    }

    return controller;
}