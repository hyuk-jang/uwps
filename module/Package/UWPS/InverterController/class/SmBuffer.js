class SmBuffer {
  constructor(parent) {
    this.parent = parent;

    this.smHeaderData = [];
    this.smBodyData = [];
    this.smBodyDataLength = 0;
  }

  // TODO timeout 기능 추가 필요
  addBuffer(bufferData) {
    // BU.CLI(bufferData)
    bufferData = typeof bufferData === 'string' ? Buffer.from(bufferData, 'utf-8') : bufferData;
    let strdata = bufferData.toString('utf-8');
    // BU.CLI('strdata',strdata)
    for (let i = 0; i < bufferData.length; i++) {
      let currBuffer = bufferData[i];
      // BU.CLI('currBuffer',currBuffer)
      // SM Buffer Header is 6 Length
      let headerLength = 6;
      if (this.smHeaderData.length < headerLength) {
        this.smHeaderData.push(currBuffer);
      } else {
        if (this.smBodyDataLength === 0) {
          let headerStr = Buffer.from(this.smHeaderData).toString();
          if (headerStr.substring(0, 2) !== 'SM') {
            this._initData();
            return this.parent.emit('endBuffer', 'Invaild Header Type');
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
            let returnvalue = Buffer.from(this.smBodyData).toString();
            let remainStr = strdata.substr(this.smBodyDataLength + headerLength);
            this._initData();
            if(remainStr){
              this.addBuffer(new Buffer(remainStr) );
            }
            // BU.CLI(returnvalue)
            return this.parent.emit('endBuffer', null, returnvalue);
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