
const db = require('./db');

const Dao = require('./Dao');

class Model extends Dao {
  constructor(dbInfo) {
    super(dbInfo);

  }

  insertTable(tbName, insertObj){
    let values = makeInsertValues(Object.values(insertObj));
    let sql = `INSERT INTO ${tbName} (${Object.keys(insertObj)}) VALUES ${values}`;
    return this.single(sql);
  }
  getTable(tbName, fieldName, attribute){
    let sql = `select * from ${tbName}`;
    if (fieldName !== '' && fieldName !== undefined) {
      sql += ` WHERE ${fieldName} = '${attribute}';`;
    }
    console.log(sql)
    return this.single(sql);
  }
  getTest(table) {
    return this.single(`SELECT * FROM ${table}`);
  }

  setTest(conn, value) {
    return conn.queryAsync('INSERT INTO table SET ?', {
      test: value
    });
  }

}
module.exports = Model;


function makeInsertValues(arrValue) {
  // BU.CLI(arrValue)
  let returnValue = '(';

  let count = 0;
  
  _.each(arrValue, (value) => {
    if (count !== 0) {
      returnValue += ', ';
    }
    if (value === null) {
      returnValue += null;
    } else if (value === undefined) {
      returnValue += '';
    } else if (typeof value === 'number') {
      returnValue += value;
    } else {
      returnValue += value;
    }
    count++;
  })
  returnValue += ')';

  return returnValue;
}