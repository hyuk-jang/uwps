SELECT 
	*,
	(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number
FROM connector cnt