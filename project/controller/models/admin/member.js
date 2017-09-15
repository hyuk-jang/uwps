var dao = require("../dao.js");
var _ = require("underscore");


var getMemberBySeq = function (member_seq, callback) {
    var sql = " SELECT * ";
        sql += " FROM member WHERE member_seq = '" + member_seq + "' AND is_deleted = 0";
    dao.doQuery(sql, callback);
}
exports.getMemberBySeq = getMemberBySeq;


// 회원 정보 불러오기
var getMemberInfo = function(member_seq, callback){
    var sql = " SELECT *, ";
    sql += " IFNULL ( (SELECT name  FROM saltpond_info WHERE saltpond_info_seq = Member.saltpond_info_seq ),'') AS saltpondName ";
    sql += " FROM Member WHERE member_seq = '" + MRF(member_seq) + "'";
    dao.doQuery(sql, callback);
}
exports.getMemberInfo = getMemberInfo;



/**
 * 
 * @param {Number} 페이지번호
 * @param {String} 검색 Text
 */
var getMemberList = function ({page, search, pageCount }, callback) {
    var page = parseInt(page);

    if (page <= 0) {
        page = 1;
    }
    var ps = (page - 1) * pageCount;
    var pe = (page) * pageCount;

    var sql = "";

    sql = " SELECT *, ";
        sql += ' IFNULL ( (SELECT name  FROM saltpond_info WHERE saltpond_info_seq = Member.saltpond_info_seq ),"") AS saltpondName ';
        sql += " FROM Member WHERE username Like '%" + MRF(search) + "%' AND is_deleted = 0 AND type != 0";
        sql += " ORDER BY member_seq DESC  Limit " + ps + "," + pageCount + "  ";


    dao.doQuery(sql, function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        var returnvalue = {
            "list": result
        };
        var sql = " SELECT COUNT(*) AS CCOUNT FROM Member WHERE username Like '%" + MSF(search) + "%' AND is_deleted = 0 AND type != 0 ";

        dao.doQuery(sql, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            
            returnvalue.totalCount = result[0].CCOUNT;

            return callback(err, returnvalue);
        });

    });

}
exports.getMemberList = getMemberList;


var createMember = function({saltpond_info_seq, userid, username, address, salt, hashPassword, tel, is_deleted }, callback){
    var updatedate = BU.convertDateToText(new Date());
    var writedate = BU.convertDateToText(new Date());

    var sql = "";
    sql += " INSERT INTO `saltpond_integratedserver`.`member` ( `type`, `saltpond_info_seq`, `userid`, `username`, `address`, `temppw`, `salt`, `password`, `tel`, `is_deleted`, `writedate`, `updatedate`) ";
    sql += " VALUES (";
    sql += "'" + MRF("1") + "'"
    sql += ", '" + MRF(saltpond_info_seq) + "'"
    sql += ", '" + MRF(userid) + "'"
    sql += ", '" + MRF(username) + "'"
    sql += ", '" + MRF(address) + "'"
    sql += ", '" + MRF(salt) + "'"
    sql += ", '" + MRF(hashPassword) + "'"
    sql += ", '" + MRF(tel) + "'"
    sql += ", '" + MRF("0") + "'"
    sql += ", '" + MRF(writedate) + "'"
    sql += ", '" + MRF(updatedate) + "') "


    dao.doQuery(sql, callback);

}
exports.createMember = createMember;

// 서버 수정
/**
 * @param {Number} member_seq member 시퀀스
 * @param {Number} saltpond_info_seq 염전서버 시퀀스
 */
var updateMember = function (member_seq, {saltpond_info_seq, userid, username, address, salt, hashPassword, tel, is_deleted}, callback) {
    var updatedate = BU.convertDateToText(new Date());
    var sql = " UPDATE `saltpond_integratedserver`.`member` SET ";
    sql += " `saltpond_info_seq`='" + MRF(saltpond_info_seq) + "'";
    sql += " , `userid`='" + MRF(userid) + "'";
    sql += " , `username`='" + MRF(username) + "'";
    sql += " , `address`='" + MRF(address) + "'";
    if(salt != null && hashPassword != null){
        sql += " , `salt`='" + MRF(salt) + "'";
        sql += " , `password`='" + MRF(hashPassword) + "'";
    }
    sql += " , `tel`='" + MRF(tel) + "'";
    sql += " , `updatedate`='" + MRF(updatedate) + "'";
    sql += " WHERE  `member_seq`='" + MRF(member_seq) + "' ";

    dao.doQuery(sql, callback);
}
exports.updateMember = updateMember;


// 서버 삭제
var deleteMember = function (ids, callback) {
    var sql = " UPDATE member SET is_deleted = 1  WHERE member_seq IN (" + ids + ")  ";
    dao.doQuery(sql, callback);
}
exports.deleteMember = deleteMember;


var getOpenPopMember = function (serverList, callback) {
    if (serverList.length == 0) {
        callback(undefined, []);
        return;
    }
    var strList = "";
    _.each(serverList, function (data, index) {
        if (index == 0) {
            strList += data.saltpond_info_seq.toString();
        }
        else {
            strList += "," + data.saltpond_info_seq.toString();
        }

    });
    var sql = " SELECT username,saltpond_info_seq FROM Member WHERE member.saltpond_info_seq IN (" + strList + ") AND is_deleted = 0 ";

    dao.doQuery(sql, callback);

}
exports.getOpenPopMember = getOpenPopMember;


function MRF(value) {
    return BU.MRF(value);
}

function MSF(value) {
    return BU.makeSearchField(value);
}