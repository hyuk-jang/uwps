



SELECT photovoltaic.*,
	connector_structure.connector_seq,
	connector_structure.channel,
	connector.target_id AS cnt_target_id,
	connector.target_category AS cnt_target_category,
	connector.target_name AS cnt_target_name,
	connector.dialing AS cnt_dialing,
	connector.code AS cnt_code,
	connector.ip AS cnt_ip,
	connector.port AS cnt_port,
	connector.baud_rate AS cnt_baud_rate,
	connector.ch_number,
	connector.addr_v,
	connector.addr_a,
	cnt_data.v AS cnt_v,
	cnt_data.ch_1 AS cnt_ch_1,
	cnt_data.ch_2 AS cnt_ch_2,
	cnt_data.ch_3 AS cnt_ch_3,
	cnt_data.ch_4 AS cnt_ch_4
	FROM photovoltaic
	JOIN connector_structure 
		ON connector_structure.photovoltaic_seq = photovoltaic.photovoltaic_seq
	JOIN connector
		ON connector.connector_seq = connector_structure.connector_seq
	LEFT JOIN (
			SELECT cd1.* 
			FROM connector_data cd1,
				(SELECT *, MAX(writedate) AS max_writedate FROM connector_data GROUP BY connector_seq) cd2
				WHERE cd1.writedate = cd2.max_writedate AND cd1.connector_seq = cd2.connector_seq
				ORDER BY cd1.connector_seq
		) cnt_data
		ON cnt_data.connector_seq = connector.connector_seq
