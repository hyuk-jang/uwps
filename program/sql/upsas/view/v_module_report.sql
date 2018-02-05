

		SELECT
			pv.target_name AS connector_type, pv.manufacturer AS company,
			cnt.target_name AS connect_name,
			ru.connector_ch as channel,
			sb.target_name AS place,
			main.avg_amp AS amp, main.avg_vol AS vol, main.writedate
		 FROM v_module_data main
			LEFT JOIN photovoltaic pv
				ON pv.photovoltaic_seq = main.photovoltaic_seq
			LEFT JOIN relation_upms ru
				ON ru.photovoltaic_seq = main.photovoltaic_seq
			LEFT JOIN saltern_block sb
				ON sb.saltern_block_seq = ru.saltern_block_seq
			LEFT JOIN connector cnt
				ON cnt.connector_seq = ru.connector_seq

		ORDER BY main.writedate DESC, channel 
