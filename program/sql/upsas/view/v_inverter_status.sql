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
	ROUND((c_wh - (SELECT MAX(c_wh) FROM inverter_data WHERE inverter_seq = id.inverter_seq AND writedate>= CURDATE() - 1 AND writedate< CURDATE())) / 10, 1) AS daily_power_wh,
	writedate,
	pv.amount AS pv_amount, pv.install_place AS install_place
	FROM inverter_data id
	LEFT JOIN inverter
		ON inverter.inverter_seq = id.inverter_seq
	LEFT JOIN relation_power rp
		ON rp.inverter_seq = id.inverter_seq
	LEFT JOIN photovoltaic pv
		ON pv.photovoltaic_seq = rp.photovoltaic_seq
		
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)
	ORDER BY chart_sort_rank