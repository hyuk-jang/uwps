const EventEmitter = require('events');
class SmBuffer {
  constructor(controller) {
    this.controller = controller;

    this.smHeaderData = [];
    this.smBodyData = [];
    this.smBodyDataLength = 0;
  }

  addBuffer(bufferData) {
    let strdata = bufferData.toString('utf-8');
    // BU.CLI(strdata)
    for (let i = 0; i < bufferData.length; i++) {
      let currBuffer = bufferData[i];
      // SM Buffer Header is 6 Length
      if (this.smHeaderData.length < 6) {
        this.smHeaderData.push(currBuffer);
      } else {
        if (this.smBodyDataLength == 0) {
          let headerStr = Buffer.from(this.smHeaderData).toString();

          if (headerStr.substring(0, 2) != 'SM') {
            this._initData();
            return this.controller.emit('endBuffer', 'Invaild Header Type');
            break;
          } else {
            this.smBodyDataLength = parseInt(headerStr.substring(2, 6), 16);
          }
        }

        if (this.smBodyDataLength > this.smBodyData.length) {
          this.smBodyData.push(currBuffer);
          // CR 고려. 1 Byte

          if (this.smBodyDataLength === this.smBodyData.length) {
            // BU.log(this.smBodyDataLength,this.smBodyData.length)
            let returnvalue = Buffer.from(this.smBodyData).toString('utf-8');
            let remainStr = strdata.substr(this.smBodyDataLength + 6);
            this._initData();
            if(remainStr){
              this.addBuffer(new Buffer(remainStr) );
            }
            // this._initData();
            return this.controller.emit('endBuffer', null, returnvalue);
          }
        }
      }
    }
  }

  _initData() {
    this.smHeaderData = [];
    this.smBodyData = [];
    this.smBodyDataLength = 0;
  }
}

module.exports = SmBuffer;