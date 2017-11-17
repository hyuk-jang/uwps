
SELECT 
	inverter_seq,
	writedate, 
	DATE_FORMAT(writedate,'%H:%i:%S') AS hour_time,
	ROUND(in_a / 10, 1) AS in_a,
	ROUND(in_v / 10, 1) AS in_v,
	ROUND(in_w / 10, 1) AS in_w,
	ROUND(out_a / 10, 1) AS out_a,
	ROUND(out_v / 10, 1) AS out_v,
	ROUND(out_w / 10, 1) AS out_w,
	ROUND(p_f / 10, 1) AS p_f,
	ROUND(d_wh / 10, 1) AS d_wh,
	ROUND(c_wh / 10, 1) AS c_wh

FROM inverter_data
    GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq

    