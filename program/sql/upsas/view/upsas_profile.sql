
SELECT 
	ru.connector_ch,
	pv.photovoltaic_seq, pv.target_id AS pv_target_id, pv.target_name AS pv_target_name, pv.install_place AS pv_install_place, pv.module_type AS pv_module_type, pv.compose_count AS pv_compose_count, pv.amount AS pv_amount, pv.manufacturer AS pv_manufacturer, pv.chart_color AS pv_chart_color, pv.chart_sort_rank AS pv_chart_sort_rank,
	cnt.connector_seq, cnt.target_id AS cnt_target_id, cnt.target_category AS cnt_target_category, cnt.target_name AS cnt_target_name, cnt.dialing AS cnt_dialing, cnt.code AS cnt_code, cnt.host AS cnt_host, cnt.port AS cnt_port, cnt.baud_rate AS cnt_baud_rate, cnt.address AS cnt_address, cnt.director_name AS cnt_director_name, cnt.director_tel AS cnt_director_tel,
	ivt.inverter_seq, ivt.target_id AS ivt_target_id, ivt.target_name AS ivt_target_name, ivt.target_type AS ivt_target_type, ivt.target_category AS ivt_target_category, ivt.connect_type AS ivt_connect_type, ivt.dialing AS ivt_dialing, ivt.host AS ivt_host, ivt.port AS ivt_port, ivt.baud_rate AS ivt_baud_rate, ivt.code AS ivt_code, ivt.amount AS ivt_amount, ivt.director_name AS ivt_director_name, ivt.director_tel AS ivt_director_tel,
	sb.saltern_block_seq, sb.target_id AS sb_target_id, sb.target_type AS sb_target_type, sb.target_name AS sb_target_name, sb.setting_salinity AS sb_setting_salinity, sb.water_level_count AS sb_water_level_count, sb.min_water_level AS sb_min_water_level, sb.max_water_level AS sb_max_water_level, sb.water_cm AS sb_water_cm, sb.depth AS sb_depth,
	(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number
	FROM
	relation_upms ru
	LEFT JOIN photovoltaic pv
      	ON pv.photovoltaic_seq = ru.photovoltaic_seq
	LEFT JOIN inverter ivt
      	ON ivt.inverter_seq = ru.inverter_seq      	
	LEFT JOIN connector cnt
		ON cnt.connector_seq = ru.connector_seq      	
	LEFT JOIN saltern_block sb
		ON sb.saltern_block_seq = ru.saltern_block_seq
ORDER BY pv.chart_sort_rank		
