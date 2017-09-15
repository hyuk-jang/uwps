const EventEmitter = require('events');
class SmBuffer extends EventEmitter {
	constructor() {
		super();
		this.smHeaderData = [];
		this.smBodyData = [];
		this.smBodyDataLength = 0;

		this.on("addBuffer", this.addBuffer);
	}

	addBuffer(bufferData) {
		// var strdata = bufferData.toString("utf-8");
		for (var i = 0; i < bufferData.length; i++) {
			var currBuffer = bufferData[i];
			// SM Buffer Header is 6 Length
			if (this.smHeaderData.length < 6) {
				this.smHeaderData.push(currBuffer);
			} else {
				if (this.smBodyDataLength == 0) {
					var headerStr = Buffer.from(this.smHeaderData).toString();

					if (headerStr.substring(0, 2) != "SM") {
						this._initData();
						this.emit("errorBuffer", "Invaild Header Type");
						break;
					} else {
						this.smBodyDataLength = parseInt(headerStr.substring(2, 6), 16);
					}
				}
				
				if (this.smBodyDataLength > this.smBodyData.length) {
					this.smBodyData.push(currBuffer);
					// CR 고려. 1 Byte
					
					if (this.smBodyDataLength === this.smBodyData.length) {
						// console.log(this.smBodyDataLength,this.smBodyData.length)
						var returnvalue = Buffer.from(this.smBodyData).toString("utf-8");
						this.emit("endBuffer", returnvalue);
					}
				}
			}
		}
	}

	_initData() {
		this.smHeaderData = [];
		this.smBodyData = [];
		this.smBodyDataLength = null;
	}
}

module.exports = function () {
	return new SmBuffer();
}