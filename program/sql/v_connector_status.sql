SELECT 
	connector.*,
	v, ch_1, ch_2, ch_3, ch_4, writedate
	FROM connector_data 
	LEFT JOIN connector
		ON connector.connector_seq = connector_data.connector_seq
	WHERE connector_data_seq IN (
		SELECT MAX(connector_data_seq)
		FROM connector_data
		GROUP BY connector_seq
	)