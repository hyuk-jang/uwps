
class Control{
  constructor() {

    this.bi = require('./model.js');
  }

  getSelect(tbName) {
    this.bi.getTable(tbName).then(r => {
      console.dir(r);
    }).catch(e => {
      console.error(e);
    })
  }



}
module.exports = Control;