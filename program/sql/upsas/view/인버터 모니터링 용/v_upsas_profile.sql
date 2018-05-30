
SELECT 
	ru.connector_ch,
	cnt.connector_seq, cnt.target_id AS cnt_target_id, cnt.target_category AS cnt_target_category, cnt.target_name AS cnt_target_name, cnt.code AS cnt_code, cnt.director_name AS cnt_director_name, cnt.director_tel AS cnt_director_tel,
	ivt.inverter_seq, ivt.target_id AS ivt_target_id, ivt.target_name AS ivt_target_name, ivt.target_category AS ivt_target_category, ivt.code AS ivt_code, ivt.amount AS ivt_amount, ivt.director_name AS ivt_director_name, ivt.director_tel AS ivt_director_tel,
	(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number
	FROM
	relation_upms ru
	LEFT JOIN inverter ivt
      	ON ivt.inverter_seq = ru.inverter_seq      	
	LEFT JOIN connector cnt
		ON cnt.connector_seq = ru.connector_seq      	
ORDER BY ivt.chart_sort_rank		
