const exchange = require('./config/exchange.js')

class AppSetter {
  constructor(controller) {
    this.controller = controller;

    this.config = this.controller.config;



  }

  runExchange() {
    const exchangeModule = exchange(this.controller);
    exchangeModule.exchange((err, controllerInfo, mapInfo) => {
      // BU.CLI(controllerInfo)
      var app = require("./config/app.js")(this.config, exchangeModule);
      var passport = require("./config/passport.js")(app, this.config.aliceBobSecret);
      var controller = require("./controllers")(app, passport);

      // catch 404 and forward to error handler
      app.use(function (req, res, next) {
        res.status(404).send('Sorry cant find that!');
      });

      app.listen(controllerInfo.web_port, function (req, res) {
        console.log("Controller Server is Running", controllerInfo.web_port);
      })

    });

  }
}
module.exports = AppSetter;