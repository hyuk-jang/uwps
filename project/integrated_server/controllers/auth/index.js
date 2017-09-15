module.exports = function (app, passport) {
    var auth = require("./auth")(passport);
    var controller = Object.assign({}, auth);

    for (var route in controller) {
        app.use("/auth", controller[route]);
    }

    return controller;
}