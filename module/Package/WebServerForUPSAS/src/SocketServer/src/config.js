'use strict';
require('dotenv').config();
const config = {
  hasDev: false, // 장치 연결을 실제로 하는지 여부
  dbInfo: {
    port: process.env.DB_UPSAS_PORT ? process.env.DB_UPSAS_PORT : '3306',
    host: process.env.DB_UPSAS_HOST ? process.env.DB_UPSAS_HOST : 'localhost',
    user: process.env.DB_UPSAS_USER ? process.env.DB_UPSAS_USER : 'root',
    password: process.env.DB_UPSAS_PW ? process.env.DB_UPSAS_PW : 'test',
    database: process.env.DB_UPSAS_DB ? process.env.DB_UPSAS_DB : 'test'
  },
  deviceInfo: {
    target_id: 'StatusBoard',
    target_name: '현황판',
    target_category: 'statusBoard',
    logOption: {
      hasCommanderResponse: true,
      hasDcError: true,
      hasDcEvent: true,
      hasReceiveData: true,
      hasDcMessage: true,
      hasTransferCommand: true
    },
    protocol_info: {
      mainCategory: 'weathercast',
      subCategory: 'vantagepro2'
    },
    controlInfo: {
      hasErrorHandling: false,
      hasOneAndOne: true,
      hasReconnect: true
    },
    connect_info: {
      type: 'serial',
      baudRate: 19200,
      port: 'COM3'
    },
    // connect_info: {
    //   type: 'socket',
    //   port: 9000
    // },
  }
};
module.exports = config;