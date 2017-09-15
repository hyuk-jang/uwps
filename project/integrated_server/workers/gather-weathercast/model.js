

var weather_cast = {
    x: "",
    y: "",
    applydate: "",
    temp: "",
    pty: "",
    pop: "",
    r12: "",
    ws: "",
    wd: "",
    reh: ""
}

weather_cast.prototype.getAll = function () {
    return weather_cast;
}

// weather_cast.prototype.setAll = function({x, y, applydate, temp, pty, pop, r12, ws, wd, reh}){
weather_cast.prototype.setAll = function (setObj) {
    for (key in setObj) {
        if (weather_cast.hasOwnProperty(key)) {
            weather_cast[x] = setObj[key];
        }
    }
}


module.exports = weather_cast;