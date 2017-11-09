// Date 관련

Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

Date.prototype.addYear = function (value) {
    this.setFullYear(this.getFullYear() + value);
    return this;
};

Date.prototype.addDays = function (value) {
    this.setDate(this.getDate() + value);
    return this;
};

Date.prototype.addHours = function (value) {
    this.setHours(this.getHours() + value);
    return this;
};

Date.prototype.addMinutes = function (value) {
    BU.log("value", value)
    this.setMinutes(this.getMinutes() + value);
    return this;
};

Date.prototype.addSeconds = function (value) {
    BU.log("addSeconds", value)
    this.setSeconds(this.getSeconds() + value);
    return this;
};

Date.prototype.addTime = function (year, month, day, hour, min, sec) {
    var year = year == "" || year == undefined ? 0 : year;
    var month = month == "" || month == undefined ? 0 : month;
    var day = day == "" || day == undefined ? 0 : day;
    var hour = hour == "" || hour == undefined ? 0 : hour;
    var min = min == "" || min == undefined ? 0 : min;
    var sec = sec == "" || sec == undefined ? 0 : sec;
    this.addYear(year);
    this.addMonths(month);
    this.addDays(day);
    this.addHours(hour);
    this.addMinutes(min);
    this.addSeconds(sec);
    return this;
}
