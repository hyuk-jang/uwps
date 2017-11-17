SELECT 
	connector.*,
	ROUND(v / 10, 1) AS v,
	ROUND(ch_1 / 10, 1) AS ch_1,
	ROUND(ch_2 / 10, 1) AS ch_2,
	ROUND(ch_3 / 10, 1) AS ch_3,
	ROUND(ch_4 / 10, 1) AS ch_4,

	writedate
	FROM connector_data 
	LEFT JOIN connector
		ON connector.connector_seq = connector_data.connector_seq
	WHERE connector_data_seq IN (
		SELECT MAX(connector_data_seq)
		FROM connector_data
		GROUP BY connector_seq
	)