var https = require("https");


global.BU = require("./public/js/util/baseUtil");
global.DU = require("./public/js/util/domUtil");
// var BU = global.BU;
// var DU = global.DU;

var config = require("./config/config")();

global.config = config;

// console.log(global.config)

var app = require("./config/app")(config);
var passport = require("./config/passport")(app);

// var adminController = require("./controllers/admin/index")(passport, app);
var controller = require("./controllers/index")(app, passport);

// workers/index.js
var workers = require("./workers");
workers.gatherWeathercast.start();
workers.salternInfo.saltern.emit("initSalternInfo");
app.set("workers", workers);
// global.workers = workers;


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.listen(7505, function (req, res) {
    console.log("Server is Running");
})

// app.use("/admin")