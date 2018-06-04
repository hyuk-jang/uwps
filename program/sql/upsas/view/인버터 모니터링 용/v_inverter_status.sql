SELECT ivt.target_id, ivt.target_name, ivt.target_category, ivt.protocol_info, ivt.connect_info, ivt.amount, ivt.chart_color, ivt.chart_sort_rank,
	id.*

	FROM inverter_data id
	LEFT JOIN inverter ivt
		ON ivt.inverter_seq = id.inverter_seq
	LEFT JOIN relation_upms ru
		ON ru.inverter_seq = id.inverter_seq
		
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)
	ORDER BY chart_sort_rank