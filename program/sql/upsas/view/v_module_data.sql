	SELECT

		md.photovoltaic_seq,
		writedate,
		ROUND(AVG(amp / 10), 1) AS avg_amp,
		ROUND(AVG(vol / 10), 1) AS avg_vol,
		DATE_FORMAT(writedate,"%H-%i") AS hour_time
	   FROM module_data md
	   	GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H-%i'), photovoltaic_seq
			ORDER BY writedate DESC, photovoltaic_seq