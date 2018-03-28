   SELECT
			pv.*,
			ru.connector_ch,
			curr_data.*
	 FROM photovoltaic pv
	JOIN relation_upms ru
	  ON ru.photovoltaic_seq = pv.photovoltaic_seq
	LEFT JOIN saltern_block sb
	  ON sb.saltern_block_seq = ru.saltern_block_seq
	LEFT OUTER JOIN
	(
	  SELECT
				md.photovoltaic_seq,
				ROUND(md.amp / 10, 1) AS amp,
				ROUND(md.vol / 10, 1) AS vol,
				md.writedate
		 FROM module_data md
		INNER JOIN
		(
			SELECT MAX(module_data_seq) AS module_data_seq
			 FROM module_data
			GROUP BY photovoltaic_seq
		) b
	     ON md.module_data_seq = b.module_data_seq
	) curr_data
	  ON curr_data.photovoltaic_seq = pv.photovoltaic_seq
	ORDER BY pv.target_id