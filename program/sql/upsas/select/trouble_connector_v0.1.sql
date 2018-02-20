SELECT 
		ctd.connector_seq AS device_seq,
		ctd.is_error AS is_error,
		ctd.code AS code,
		ctd.msg AS msg,
		ctd.occur_date AS occur_date,
		ctd.fix_date AS fix_date,
		cnt.target_name AS target_name,
		'connector' AS device_e_name,
		'접속반' AS device_k_name
 FROM
	(
	SELECT * FROM connector_trouble_data
	WHERE occur_date>= "2018-02-01 00:00:00" and occur_date<"2018-02-23 00:00:00"
		AND is_error = "1"
	) AS ctd
JOIN connector cnt
	ON cnt.connector_seq = ctd.connector_seq 
ORDER BY ctd.occur_date DESC	