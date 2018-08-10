require('dotenv').config();

const config = {
  hasDev: false, // 장치 연결을 실제로 하는지 여부
  socketServerPort: process.env.SOCKET_UPSAS_PORT,
  dbInfo: {
    port: process.env.DB_UPSAS_PORT ? process.env.DB_UPSAS_PORT : '3306',
    host: process.env.DB_UPSAS_HOST ? process.env.DB_UPSAS_HOST : 'localhost',
    user: process.env.DB_UPSAS_USER ? process.env.DB_UPSAS_USER : 'root',
    password: process.env.DB_UPSAS_PW ? process.env.DB_UPSAS_PW : 'test',
    database: process.env.DB_UPSAS_DB ? process.env.DB_UPSAS_DB : 'test',
  },
};
module.exports = config;
