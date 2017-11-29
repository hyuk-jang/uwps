SELECT inverter.*, 
	inverter_data_seq,
	ROUND(in_a / 10, 1) AS in_a,
	ROUND(in_v / 10, 1) AS in_v,
	ROUND(in_w / 10, 1) AS in_w,
	ROUND(out_a / 10, 1) AS out_a,
	ROUND(out_v / 10, 1) AS out_v,
	ROUND(out_w / 10, 1) AS out_w,
	ROUND(p_f / 10, 1) AS p_f,
	ROUND(d_wh / 10, 1) AS d_wh,
	ROUND(c_wh / 10, 1) AS c_wh,
	writedate
	FROM inverter_data
	LEFT JOIN inverter
		ON inverter.inverter_seq = inverter_data.inverter_seq
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)