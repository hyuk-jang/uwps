const Control = require("./src/Control");

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log("__main__");

  const control = new Control(9000);
  control.init();

  process.on("uncaughtException", function(err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log("Node NOT Exiting...");
  });

  process.on("unhandledRejection", function(err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log("Node NOT Exiting...");
  });
}
