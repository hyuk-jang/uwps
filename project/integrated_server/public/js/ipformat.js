
//아이피 포맷

function ValidateIPaddress(str) {
    var ipformat =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (str.match(ipformat)) {
        return true;
    } else {
        return false;
    }
}

function isNumber(input) {
    return !isNaN(input);
}
