const EventEmitter = require('events');
const util = require('util');

function ForecastEmitter() {
    EventEmitter.call(this);

    let weatherCastList = [];

    this.on('addForecast', (castInfo) => {
        weatherCastList.push(castInfo);
        // BU.CLI(weatherCastList)
        // console.log('an addForecast event occurred!');
    });

    this.on('deleteForecast', () => {
        weatherCastList = [];
        // console.log('an deleteForecast event occurred!');
    });

    this.on('getForecast', function (callback) {
        callback(weatherCastList);
    });

    this.on('error', (err) => {
        console.log("oops error occurd", err)
    });

}
util.inherits(ForecastEmitter, EventEmitter);




module.exports = new ForecastEmitter();