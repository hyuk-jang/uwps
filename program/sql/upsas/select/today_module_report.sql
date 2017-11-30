SELECT
	md.photovoltaic_seq,
	ROUND(AVG(amp / 10), 1) AS amp,
	ROUND(AVG(vol / 10), 1) AS vol,
	ROUND(AVG(amp) * AVG(vol) / 100, 1) AS wh,
	DATE_FORMAT(writedate,'%H') AS hour_time
   FROM module_data md
   	WHERE writedate>= CURDATE() and writedate<CURDATE() + 1
   	GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), photovoltaic_seq
		ORDER BY photovoltaic_seq, writedate