SELECT distinct *
	FROM connector_data 
	LEFT JOIN connector
		ON connector.connector_seq = connector_data.connector_seq
	WHERE connector_data_seq IN (
		SELECT MAX(connector_data_seq)
		FROM connector_data
		GROUP BY connector_seq
	)