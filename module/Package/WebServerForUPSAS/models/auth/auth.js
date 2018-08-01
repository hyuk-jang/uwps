var dao = require("../dao.js");
var BU = global.BU;


var addMember = function (userid, salt, password, nickname, callback) {
    var salt = BU.genCryptoRandomByte(16);
    BU.encryptPbkdf2(password, salt, function (hashPassword) {
        var sql = "INSERT INTO member (userid, salt, temppw, password, nickname, writedate) ";
        sql += " VALUES ('" + userid + "', '" + salt + "', '" + password + "', '" + hashPassword + "', '" + nickname + "', NOW())";

        dao.doQuery(sql, callback);
    })


}
exports.addMember = addMember;

var createMember = function (userid, salt, temppw, password, nickname, callback) {
    var sql = "INSERT INTO member (userid, salt, temppw, password, nickname, writedate) ";
    sql += " VALUES ('" + userid + "', '" + salt + "', '" + temppw + "', '" + password + "', '" + nickname + "', NOW())";

    dao.doQuery(sql, callback);
}
exports.createMember = createMember;


var selectMember = function (param, callback) {
    var userid = param.userid;
    var password = param.password;

    var sql = "SELECT * FROM member WHERE userid = '" + param.userid + "' AND  password = '" + param.password + "'";
    dao.doQuery(sql, callback);
}
exports.selectMember = selectMember;


var selectAuthMember = function (userid, password, callback) {
    getMemberById(userid, function (err, result) {
        if (err || !result.length) {
            return callback(err, result);
        }
        var userInfo = result[0];
        BU.encryptPbkdf2(password, userInfo.salt, function (hashPassword) {
            if (hashPassword === userInfo.password) {
                callback(err, userInfo);
            } else {
                callback(err, []);
            }
        });
    })
}
exports.selectAuthMember = selectAuthMember;

/**
 * App에서 Server 권한을 얻고자 할 때 userid, password를 통해 인증을 하고 해당되는 Server 정보 반환
 * @param {string} userid querystring UserID
 * @param {string} password  querystring Password
 * @param {*} callback 
 */
var getMemberForApp = function (userid, password, callback) {
    selectAuthMember(userid, password, function (err, result) {
        if (err || BU.isEmpty(result)) {
            return callback(err, result);
        } else {
            var sql = "SELECT STRAIGHT_JOIN A.member_seq, A.username m_name, A.address m_address, A.tel m_tel, B.*, C.*  ";
            sql += "    FROM (SELECT * FROM member WHERE userid = '" + BU.MRF(userid)  + "' AND is_deleted = 0) A ";
            sql += " 	LEFT OUTER JOIN saltern_info B ON  A.saltern_info_seq =  B.saltern_info_seq AND B.is_deleted = 0";
            sql += "	LEFT OUTER JOIN weather_location C ON B.weather_location_seq = C.weather_location_seq";

            dao.doQuery(sql, callback);
        }
    });
}
exports.getMemberForApp = getMemberForApp;

var getMemberById = function (userid, callback) {
    var sql = "SELECT * FROM member WHERE userid = '" + userid + "'";

    dao.doQuery(sql, callback);
}
exports.getMemberById = getMemberById;