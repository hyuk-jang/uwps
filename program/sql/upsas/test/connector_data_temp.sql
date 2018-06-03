	SELECT relation_upms.photovoltaic_seq, inverter_seq,
		round(amp / 10, 1) AS amp, round(vol / 10, 1) AS vol, writedate, CONCAT(LEFT(DATE_FORMAT(writedate,"%Y-%m-%d %H:%i:%s"), 18), "0") strDate
	 FROM relation_upms
	LEFT JOIN module_data
	 ON module_data.photovoltaic_seq = relation_upms.photovoltaic_seq AND module_data.writedate > '2018-05-21'