SELECT 
		itd.inverter_seq AS device_seq,
		itd.is_error AS is_error,
		itd.code AS code,
		itd.msg AS msg,
		itd.occur_date AS occur_date,
		itd.fix_date AS fix_date,
		ivt.target_name AS target_name,
		'inverter' AS device_e_name,
		'인버터' AS device_k_name
 FROM
	(
	SELECT * FROM inverter_trouble_data
	WHERE occur_date>= "2018-02-01 00:00:00" and occur_date<"2018-02-23 00:00:00"
		AND is_error = "0"
	) AS itd
JOIN inverter ivt
	ON ivt.inverter_seq = itd.inverter_seq 
ORDER BY itd.occur_date DESC	