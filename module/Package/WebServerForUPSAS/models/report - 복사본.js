const dao = require("./dao.js");

function getReport(dailyValue, callback) {
	console.log(dailyValue.checkRadio);
	let sql =`SELECT`;
	if (dailyValue.checkRadio == 'day'){
		sql += ` DATE_FORMAT(inverter_data.writedate, '%y-%m-%d') AS writedate,`;
	} else if (dailyValue.checkRadio == 'month'){
		sql += ` DATE_FORMAT(inverter_data.writedate, '%y-%m') AS writedate,`;
	} else if (dailyValue.checkRadio == 'year'){
		sql += ` DATE_FORMAT(inverter_data.writedate, '%Y') AS writedate,`;
	} else {
		sql += ` DATE_FORMAT(inverter_data.writedate, '%y-%m-%d %H:%i') AS writedate,`;
	}
	
	sql+=` SUM(CASE WHEN inverter_data.inverter_seq = '1' THEN inverter_data.out_w ELSE '-' END) AS ch_w1,
	SUM(CASE WHEN inverter_data.inverter_seq = '2' THEN inverter_data.out_w ELSE '-' END) AS ch_w2,
	SUM(CASE WHEN inverter_data.inverter_seq = '3' THEN inverter_data.out_w ELSE '-' END) AS ch_w3,
	SUM(CASE WHEN inverter_data.inverter_seq = '4' THEN inverter_data.out_w ELSE '-' END) AS ch_w4,
	SUM(CASE WHEN inverter_data.inverter_seq = '5' THEN inverter_data.out_w ELSE '-' END) AS ch_w5,
	SUM(CASE WHEN inverter_data.inverter_seq = '6' THEN inverter_data.out_w ELSE '-' END) AS ch_w6,
	
	ROUND((SUM(CASE WHEN inverter_data.inverter_seq = '1' THEN inverter_data.out_w ELSE '-' END)+
	SUM(CASE WHEN inverter_data.inverter_seq = '2' THEN inverter_data.out_w ELSE '-' END) +
	SUM(CASE WHEN inverter_data.inverter_seq = '3' THEN inverter_data.out_w ELSE '-' END) +
	SUM(CASE WHEN inverter_data.inverter_seq = '4' THEN inverter_data.out_w ELSE '-' END) +
	SUM(CASE WHEN inverter_data.inverter_seq = '5' THEN inverter_data.out_w ELSE '-' END) +
	SUM(CASE WHEN inverter_data.inverter_seq = '6' THEN inverter_data.out_w ELSE '-' END))/6, 1) AS kWh,
	
	ROUND(SUM(inverter_data.p_f)/100, 1) AS p_f,
	
	(SELECT temperature FROM weather_device_data WHERE inverter_data.writedate = writedate) AS tem,
	(SELECT humidity FROM weather_device_data WHERE inverter_data.writedate = writedate) AS hum,
	(SELECT wind_speed FROM weather_device_data WHERE inverter_data.writedate = writedate) AS wind_speed`;

	if (dailyValue.checkRadio == 'day') {
		sql += ` FROM inverter_data WHERE DATE_FORMAT(inverter_data.writedate, '%Y-%m-%d')='${dailyValue.start}' GROUP BY YEAR(inverter_data.writedate), MONTH(inverter_data.writedate), DAYOFMONTH(inverter_data.writedate)`;
	} else if (dailyValue.checkRadio == 'month') {
		sql += ` FROM inverter_data WHERE DATE_FORMAT(inverter_data.writedate, '%Y-%m')='${dailyValue.start}' GROUP BY YEAR(inverter_data.writedate), MONTH(inverter_data.writedate)`;
	} else if (dailyValue.checkRadio == 'year') {
		sql += ` FROM inverter_data WHERE DATE_FORMAT(inverter_data.writedate, '%Y')='${dailyValue.start}' GROUP BY YEAR(inverter_data.writedate)`;
	}else if (dailyValue.checkRadio == 'select') {
		sql += ` FROM inverter_data WHERE DATE_FORMAT(inverter_data.writedate, '%Y-%m-%d %H:%i:%s') BETWEEN '${dailyValue.start}' AND '${dailyValue.end}' GROUP BY inverter_data.writedate`;
	}else{
		sql += ` FROM inverter_data GROUP BY inverter_data.writedate`;
	}
	
	sql += ` ORDER BY inverter_data.writedate DESC`;

	return dao.doQuery(sql, callback);
	}
	exports.getReport = getReport;