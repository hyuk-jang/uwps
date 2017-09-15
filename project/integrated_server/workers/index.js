// gather-weathercast/index.js
var gatherWeathercast = require("./gather-weathercast");
var salternInfo = require("./saltern-info");
var bi = require("./bi");

module.exports = {
  gatherWeathercast: gatherWeathercast,
  salternInfo: salternInfo,
  bi: bi
}