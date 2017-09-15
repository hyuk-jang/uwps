const dao = require('../dao.js');


// Registration 장치 정보 조회
function getGcmDevice(deviceKey, callback) {
  BU.CLI(deviceKey, BU.MRF(deviceKey))
  let sql = `SELECT * FROM GCM_Device WHERE device_key = ${BU.MRF(deviceKey)}`;

  dao.doQuery(sql, callback);
}
exports.getGcmDevice = getGcmDevice;

// GCM Device 정보 등록
function insertGcmDevice({
  memberidx,
  devicekey,
  registrationid
}, callback) {
  BU.CLIS(memberidx, devicekey, registrationid)
  let sql = `INSERT INTO gcm_device (member_seq, device_key, registration_id, writedate, updatedate)`;
  sql += `VALUES ('${BU.MRF(memberidx)}', '${BU.MRF(devicekey)}', '${BU.MRF(registrationid)}', now(), now()) `;

  dao.doQuery(sql, callback);
}
exports.insertGcmDevice = insertGcmDevice;

// GCM Device 정보 수정
function updateGcmDevice(gcm_device_seq, {
  memberidx,
  devicekey,
  registrationid
}, callback) {
  let sql = `UPDATE gcm_device SET registration_id='${BU.MRF(registrationid)}'`;
  sql += ` ,member_seq = '${BU.MRF(memberidx)}'`;
  sql += ` , device_key='${BU.MRF(devicekey)}'`;
  sql += ` , updatedate=now()`;
  sql += ` WHERE  gcm_device_seq= ${gcm_device_seq}`;

  dao.doQuery(sql, callback);
}
exports.updateGcmDevice = updateGcmDevice;

// Gcm Devie 삭제
function deleteGcmDevice(devicekey, callback) {
  let sql = `DELETE FROM gcm_device WHERE device_key = '${BU.MRF(devicekey)}'`;
  dao.doQuery(sql, callback);
}
exports.deleteGcmDevice = deleteGcmDevice;