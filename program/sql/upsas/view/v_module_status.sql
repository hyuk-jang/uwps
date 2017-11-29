

SELECT
	pv.*,
	ru.connector_ch,
	(SELECT ROUND(amp / 10, 1)  FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS amp,
	(SELECT ROUND(vol / 10, 1) FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS vol,
	(SELECT writedate FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS writedate
	FROM
	photovoltaic pv
	
	LEFT JOIN relation_upms ru
		ON ru.photovoltaic_seq = pv.photovoltaic_seq
	LEFT JOIN saltern_block sb
		ON sb.saltern_block_seq = ru.saltern_block_seq

	ORDER BY ru.connector_seq, ru.connector_ch		
	
	