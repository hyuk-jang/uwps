const _ = require('underscore');
const Dao = require('./Dao.js');

class Bi extends Dao {
  constructor(dbInfo) {
    super(dbInfo);
  }
  get_device_structure(headerName, callback) {
    let sql = `select * from device_structure`;
    if (headerName !== '') {
      sql += ` WHERE structure_header = '${headerName}';`;
    }

    this.doQuery(sql, callback);

    this.query_saltern_device_info = {
      insert: [],
      update: []
    }
  }

  insert_device_structure({
    header,
    name
  }, callback) {
    let sql = `INSERT INTO device_structure (structure_header, structure_name)`;
    sql += ` VALUES ('${header}', '${name}')`;

    this.doQuery(sql, callback);
  }

  // 염전 설정 장비에 장치 입력
  setter_saltern_device_info(headerName, deviceInfo = {
    device_structure_seq,
    target_id,
    target_name,
    device_type,
    board_id,
    port
  }, callback) {

    this.get_saltern_device_info_ByTargetId(deviceInfo.target_id, (err, res) => {
      if (err) {
        return callback(err);
      }
      // 기존에 데이터가 있을 경우 업데이트
      if (res.length) {
        deviceInfo.saltern_device_info_seq = res[0].saltern_device_info_seq;
        this.update_saltern_device_info(deviceInfo, (err, result) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        })
      } else { // 데이터가 없을 경우 입력
        this.insert_saltern_device_info(deviceInfo, (err, result) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        })
      }
    });
  }

  get_saltern_device_info_ByTargetId(target_id, callback) {
    let sql = `SELECT * FROM saltern_device_info WHERE target_id = '${target_id}'`
    this.doQuery(sql, callback);
  }

  // 입력할 경우
  insert_saltern_device_info({
    device_structure_seq,
    target_id,
    target_name,
    device_type,
    board_id,
    port
  }, callback) {
    let sql = `INSERT INTO saltern_device_info`;
    sql += ` (device_structure_seq, target_id, target_name, device_type, board_id, port)`;
    sql += ` VALUES (${device_structure_seq}, '${target_id}', '${target_name}', ${device_type}, '${board_id}', ${port})`;
    this.doQuery(sql, callback);
  }

  // 수정이 필요 할 경우
  update_saltern_device_info({
    saltern_device_info_seq,
    device_structure_seq,
    target_id,
    target_name,
    device_type,
    board_id,
    port
  }, callback) {
    let sql = `UPDATE saltern_device_info`
    sql += ` SET`;
    sql += ` saltern_device_info_seq=${saltern_device_info_seq},`;
    sql += ` device_structure_seq=${device_structure_seq},`;
    sql += ` target_id='${target_id}',`;
    sql += ` target_name='${target_name}',`;
    sql += ` device_type=${device_type},`;
    sql += ` board_id='${board_id}',`;
    sql += ` port=${port}`;
    sql += ` WHERE saltern_device_info_seq = ${saltern_device_info_seq} AND device_structure_seq=${device_structure_seq}`;
    this.doQuery(sql, callback);
  }


  // 데이터 추출 saltern_block 
  get_saltern_block(seq, callback) {
    let sql = `select * from saltern_block`;
    if (seq !== '') {
      sql += ` WHERE saltern_block_seq = '${seq}';`;
    }
    this.doQuery(sql, callback);
  }



  // 염판 설정
  setter_saltern_block(relationInfo = {
    target_id,
    target_type,
    target_name,
    setting_salinity,
    water_level_count,
    min_water_level,
    max_water_level,
    water_cm,
    depth
  }, callback) {
    // BU.CLI('setter_saltern_block', relationInfo)
    let tbName = 'saltern_block';
    this.getInfoTable(tbName, 'target_id', relationInfo.target_id, (err, result, query) => {
      if (err) {
        return callback(err);
      }
      // 기존에 데이터가 있을 경우 업데이트
      if (result.length) {
        let findObj = result[0];
        this.updateTable(tbName, findObj[tbName + '_seq'], relationInfo, (err, result) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        })
      } else { // 데이터가 없을 경우 입력
        this.insertTable(tbName, relationInfo, (err, result) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        })
      }
    });
  }


  // UWPS 데이터 세터
  setterUwps(tbName, uwpsObj, callback) {
    this.getInfoTable(tbName, 'target_id', uwpsObj.target_id, (err, result, query) => {
      if (err) {
        return callback(err);
      }
      // 기존에 데이터가 있을 경우 업데이트
      if (result.length) {
        let findObj = result[0];
        this.updateTable(tbName, findObj[tbName + '_seq'], uwpsObj, (err, result) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        })
      } else { // 데이터가 없을 경우 입력
        this.insertTable(tbName, uwpsObj, (err, result) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        })
      }
    });
  }


  /**
   * 
   * @param {String} table 테이블 명
   * @param {Number} seq 시퀀스
   * @param {Fn} callback 
   */

  // 일반 테이블 SELECT
  getInfoTable(table, column, value, callback) {
    let sql = `select * from ${table}`;
    if (column !== '') {
      sql += ` WHERE ${column} = '${value}';`;
    }
    this.doQuery(sql, callback);
  }




  // UPDATE 일반 테이블 
  updateTable(tableName, seq, updateObj, callback) {
    // BU.CLI('updateTable')
    let updateValue = this.mrfUpdateValues(updateObj);
    let sql = `UPDATE ${tableName} SET ${updateValue} WHERE ${tableName}_seq = ${seq}`
    return this.doQuery(sql, callback);
  }

  // INSERT 일반 테이블 명과 
  insertTable(tableName, insertObj, callback) {
    let values = this.mrfInsertValues(_.values(insertObj));
    let sql = `INSERT INTO ${tableName} (${Object.keys(insertObj)}) VALUES ${values}`;
    return this.doQuery(sql, callback);
  }

  // insert values 만들어줌
  mrfInsertValues(arrValue) {
    let returnvalue = '(';

    _.each(arrValue, (value, index) => {
      if (index !== 0) {
        returnvalue += ', ';
      }
      if (value === null) {
        returnvalue += null;
      } else if (value === undefined) {
        returnvalue += '""';
      } else if (typeof value === 'number') {
        returnvalue += value;
      } else {
        returnvalue += `'${BU.MRF(value)}'`;
      }
    })
    returnvalue += ')';

    return returnvalue;
  }

  /**
   * update 구문 만들어줌
   * @param {Object} objValue json
   */
  mrfUpdateValues(objValue) {
    let returnvalue = '';

    _.each(objValue, (value, key) => {
      if (returnvalue !== '') {
        returnvalue += ', ';
      }
      if (value == null) {
        returnvalue += `${key} = null`;
      } else if (value === undefined) {
        returnvalue += `${key} = '""'`;
      } else if (typeof value === 'number') {
        returnvalue += `${key} = ${value}`;
      } else {
        returnvalue += `${key} = '${BU.MRF(value)}'`;
      }
    })

    return returnvalue;
  }

}
module.exports = Bi;