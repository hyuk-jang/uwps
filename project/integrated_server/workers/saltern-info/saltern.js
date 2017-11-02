const EventEmitter = require('events');
const util = require('util');
const _ = require("underscore");
var crypto = require("crypto");

function Saltern() {
    EventEmitter.call(this);

    var biSaltern = require("../bi/saltern-info.js");
    var salternInfoList = [];

    // db에 설정된 saltern 리스트로 설정
    this.on("start", () => {
    });

    this.on("initSalternInfo", function () {
        biSaltern.getOperationSalternList(function (err, result) {
            if (err) {
                return BU.logFile(err);
            } else {
                _.map(result, function (eleSaltern) {
                    var bob = crypto.createDiffieHellman(new Buffer(eleSaltern.prime_key, "hex"));
                    bob.generateKeys();
                    var bobPub = bob.getPublicKey();

                    eleSaltern.is_run = 0;
                    eleSaltern.bobPub = bobPub;
                    eleSaltern.bob = bob;
                    eleSaltern.bobAliceSecret = "";
                });

                salternInfoList = result;

                // BU.CLI(salternInfoList)
            }
        });
    });





    this.on('addSalternInfo', (salternInfo) => {
        salternInfoList.push(salternInfo);
        // BU.CLI(addSalternInfo)
        // console.log('an addSalternInfo event occurred!');
    });

    this.on('deleteAllSalternInfo', () => {
        salternInfoList = [];
        // console.log('an deleteAllSalternInfo event occurred!');
    });

    // saltern controller 반환
    this.on('getSalternInfo', function (salternSeq, callback) {
        var findSaltern = _.findWhere(salternInfoList, {
            saltern_info_seq: Number(salternSeq)
        });
        return callback(findSaltern);
    });

    // 제어서버와 관제서버간 키 교환 수행
    this.on("exchangeKey", function (salternSeq, salternIp, alicePub, callback) {
        // BU.CLIS(salternSeq, salternIp, alicePub)
        var crypto = require("crypto");

        var findSaltern = _.findWhere(salternInfoList, {
            saltern_info_seq: Number(salternSeq),
            // ip: salternIp
        });
        
        if (findSaltern == null) {
            return callback(400, {});
        } else {
            var salternInfo = findSaltern;
            salternInfo.bobAliceSecret = salternInfo.bob.computeSecret(new Buffer(alicePub));
            // BU.CLI(salternInfo.bobAliceSecret.toString("hex"))
            return callback(200, _getModel(salternInfo, 1));
        }
    });

    this.on('error', (err) => {
        console.log("oops error occurd", err)
    });


    /**
     * 내부 함수
     * @param {Number} salternSeq 
     * @param {String} option 1: 기본정보, 2: 암호화까지
     * @param {fn} callback 
     */
    function _getSalternInfo(salternSeq, option, callback) {
        var findSaltern = _.find(salternInfoList, {
            saltern_info_seq: Number(salternSeq)
        });

        if (findSaltern == null)
            return callback(findSaltern);
        else {
            salternInfo = findSaltern[0];
            return callback(_getModel(salternInfo, 1));
        }
    }

    // option에 따라 saltern 정보 반환
    function _getModel(modelInfo, option) {
        var resModel = {};
        var exceptList = [
            ["ip", "prime_key", "bob", "bobAliceSecret", "bobPub"],
            ["ip", "prime_key", "bob", "bobAliceSecret"]
        ];
        var exceptKeyIndex = 0;

        if (option == null || exceptList.length <= option) {
            return resModel;
        } else {
            exceptKeyIndex = exceptList[option];
            _.each(modelInfo, function (value, key) {
                if (!_.contains(exceptKeyIndex, key)) {
                    resModel[key] = value;
                }
            });

            return resModel;
        }
    }

}
util.inherits(Saltern, EventEmitter);
module.exports = new Saltern();