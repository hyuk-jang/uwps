const _ = require('underscore');
const connectClient = require('./connect-client');
const eventToPromise = require('event-to-promise');

module.exports = (function () {
  let client = {};
  let manager = {};
  return {
    // manager: {},
    /**
     * 장치 접속
     * @param {{connecttype: String, port: Number|String, ip:String:Undefinded}}
     */
    init: (config) => {
      if (config === undefined || config.connecttype === undefined || _.contains(connectClient, config.connecttype)) {
        throw new Error('connect Type이 없군요');
      }
      const Manager = connectClient[config.connecttype];
      manager = new Manager(config);

      manager.on('disconnected', err => {
        BU.debugConsole();
        BU.CLI('T_T');
        manager = {};
      }); 

      return manager;
    },

    connect: async() => {
      console.log('config');
      manager.connect();

      // Manager에 이벤트가 발생하기까지 기다림
      await eventToPromise.multi(manager, ['connect', 'connection', 'open'], ['close, error', 'disconnected']);

      return true;
    },
    write: async msg => {
      if (_.isEmpty(manager)) {
        throw new Error('Connect가 안되었습니다.');
      }

      await manager.write(msg);
      return true;
    }
  };
})();