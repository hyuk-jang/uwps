var events = require('events');
var util = require('util');

// var BU = require("./baseUtil.js");

var SmBuffer = function ()
{
	events.EventEmitter.call(this);
	
	var self = this;
	self.Header = new Array();
	self.DataLength = null;
	self.Data = new Array();
	
	self.on("AddBuffer", function (buf) {

		var strdata = buf.toString("utf-8");

		for(var i = 0 ; i < buf.length ; i++)
		{
			var NowBuffer = buf[i];
			//헤더의 길이가 충분하지 않다.
            if (self.Header.length < 6) {
                self.Header.push(NowBuffer);
			}
			else
			{
				
				if(self.DataLength == null)
				{
					var headerBuf = new Buffer(self.Header);
					var headerStr = headerBuf.toString('utf-8', 0, headerBuf.length);
					if (headerStr.substring(0, 2) != "SM") {
						self.Header  = new Array();
						self.DataLength  = null;
						self.Data  = new Array();
						self.emit("Error","잘못된 해더 파일입니다.");
						break;
					}
					self.DataLength = parseInt("0x" + headerStr.substring(2, 6) + "");
				}
				//BU.Log(""+self.DataLength + ":" + self.Data.length);
				
				if(self.DataLength-1 != self.Data.length)
				{
					//아직 데이터가 안차서 데이터를 넣는다.
					self.Data.push(NowBuffer);
				}
				else
				{
				    self.Data.push(NowBuffer);

					var EndBuffer = new Buffer(self.Data);
					var EndBufferString = EndBuffer.toString("utf-8");
					self.emit("EndBuffer",EndBufferString);
					self.Header = new Array();
					self.DataLength = null;
					self.Data = new Array();
				}
			}
		}
	});
	
	self.on("Error",function(Message){
		//BU.Log("ERROR:" +Message);
	});
	
	self.on("EndBuffer",function(Data){
		//BU.Log("EndBuffer:" + Data);
	});	
	
}
util.inherits(SmBuffer, events.EventEmitter);
exports.SmBuffer = SmBuffer;
