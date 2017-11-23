SELECT trend_ivt_tbl.*, 
	DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
	SUM(in_wh) AS total_in_wh,
	SUM(out_wh) AS total_out_wh
	FROM
		(
		SELECT
	   inverter_seq,
	   writedate,
		DATE_FORMAT(writedate, "%Y-%m-%d %H") AS dateFormat
		,ROUND(in_w / 10, 1) AS in_wh
		,ROUND(in_v / 10, 1) AS in_vol
		,ROUND(out_w / 10, 1) AS out_wh
		,ROUND(out_v / 10, 1) AS out_vol
	   FROM inverter_data
		WHERE writedate>= "2017-11-21 09:00:00" and writedate<"2017-11-22 23:00:00"
		GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
		ORDER BY inverter_seq, writedate
		) trend_ivt_tbl
	GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), inverter_seq