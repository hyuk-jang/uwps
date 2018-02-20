SELECT trouble_list.* 
 FROM
( 
	SELECT itd_list.*
	 FROM
	 	(SELECT 
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
			(SELECT * FROM inverter_trouble_data
			WHERE occur_date>= "2018-02-01 00:00:00" AND occur_date<"2018-02-23 00:00:00") AS itd
		JOIN inverter ivt
			ON ivt.inverter_seq = itd.inverter_seq ) AS itd_list
	UNION
	SELECT ctd_list.*
	 FROM
	 	(SELECT 
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
			(SELECT * FROM connector_trouble_data
			WHERE occur_date>= "2018-02-01 00:00:00" AND occur_date<"2018-02-23 00:00:00") AS ctd
		JOIN connector cnt
			ON cnt.connector_seq = ctd.connector_seq 
		) AS ctd_list
) AS trouble_list
ORDER BY trouble_list.occur_date DESC
LIMIT 0, 20