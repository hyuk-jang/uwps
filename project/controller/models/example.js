const dao = require("./dao.js");

function getServer(saltpond_info_seq, callback) {
  let sql = `SELECT main.*, `;
  sql += `	(SELECT sub.path FROM saltpond_map sub WHERE sub.saltpond_info_seq = ${saltpond_info_seq})  as path`;
  sql += `	FROM saltpond_info main `;
  sql += `	WHERE main.saltpond_info_seq = ${saltpond_info_seq} AND main.is_deleted = 0`;

  return dao.doQuery(sql, callback);
}
exports.getServer = getServer;