var dao = require("../dao.js");

var getProvinceList = function (callback) {
    var sql = "SELECT province FROM weather_location GROUP BY province";
    dao.doQuery(sql, callback);
}
exports.getProvinceList = getProvinceList;

var getCityList = function (province, callback) {
    var sql = " SELECT City FROM weather_location WHERE province = '" + MRF(province) + "' Group By City ";
    dao.doQuery(sql, callback);
}
exports.getCityList = getCityList;

var getTownList = function (province, city, callback) {
    var sql = "   SELECT town,weather_location_seq FROM weather_location WHERE province = '" + MRF(province) + "' AND city = '" + MRF(city) + "' Group By town ";
    dao.doQuery(sql, callback);
}
exports.getTownList = getTownList;

var getWeather = function (weather_location_seq, callback) {
    var sql = " SELECT * FROM weather_location  WHERE weather_location_seq = '" + MRF(weather_location_seq) + "'  ";
    dao.doQuery(sql, callback);
}
exports.getWeather = getWeather;





function MRF(value) {
    return BU.MRF(value);
}

function MSF(value) {
    return BU.makeSearchField(value);
}