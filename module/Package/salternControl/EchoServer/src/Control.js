"use strict";
const _ = require("lodash");
const { BU } = require("base-util-jh");
const net = require("net");

const Model = require("./Model");

class Control {
  /**
   *
   * @param {number} port
   */
  constructor(port) {
    this.port = port;

    this.model = new Model();
  }

  init() {
    const server = net
      .createServer(socket => {
        // socket.end('goodbye\n');
        console.log(`client is Connected ${this.port}`);

        /**
         *
         */
        socket.on("data", data => {
          /** @type {xbeeApi_0x10} */
          let parseData = JSON.parse(data.toString());
          // parseData.data = Buffer.from(parseData.data);
          BU.CLI(`P: ${this.port}Received Data: `, parseData);
          // return socket.write('this.is.my.socket\r\ngogogogo' + this.port);
          let returnData = this.model.onData(parseData);
          BU.CLI(returnData);

          // 약간의 지연 시간을 둠 (30ms)
          setTimeout(() => {
            // socket.write('hi');
            socket.write(JSON.stringify(returnData));
          }, 500);
        });
      })
      .on("error", err => {
        // handle errors here
        console.error("@@@@", err, server.address());
        // throw err;
      });

    // grab an arbitrary unused port.
    server.listen(this.port, () => {
      console.log("opened server on", server.address());
    });

    server.on("close", () => {
      console.log("clonse");
    });

    server.on("error", err => {
      console.error(err);
    });
  }
}
module.exports = Control;
