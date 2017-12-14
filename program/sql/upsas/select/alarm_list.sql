
SELECT itd.*
		, ivt.target_name
		, 
 FROM
	(
	SELECT * FROM inverter_trouble_data
	WHERE occur_date>= "2017-11-01 00:00:00" and occur_date<"2017-12-13 00:00:00"
	) AS itd
JOIN inverter ivt
	ON ivt.inverter_seq = itd.inverter_seq 
ORDER BY itd.occur_date DESC	