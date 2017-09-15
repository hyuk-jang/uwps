module.exports = function (app, passport) {
    var salternController = require("./saltern-controller")();
    var mobile = require("./mobile")();
    
    var controller = Object.assign({}, salternController, mobile);
    // BU.CLI(controller)
    // if (app.get("env") === "production") {
    //     app.use("/api", function (req, res, next) {
    //         console.log(config)
    //         if (!req.user) {
    //             return res.redirect("/auth/login");
    //         }
    //         next();
    //     });
    // }

    for (var route in controller) {
        app.use("", controller[route]);
    }

    return controller;
}