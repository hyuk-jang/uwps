SELECT
	md_group.photovoltaic_seq,
	DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
	ROUND(SUM(avg_amp), 1) AS total_amp,
	ROUND(AVG(avg_vol), 1) AS avg_vol,
	ROUND(SUM(avg_amp) * AVG(avg_vol), 1) AS total_wh
	FROM
	(
	SELECT
		md.photovoltaic_seq,
		writedate,
		ROUND(AVG(amp / 10), 1) AS avg_amp,
		ROUND(AVG(vol / 10), 1) AS avg_vol,
		DATE_FORMAT(writedate,"%H") AS hour_time
	   FROM module_data md
	   	WHERE writedate>= "2017-11-27" and writedate< "2017-11-31"
	   	GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), photovoltaic_seq
			ORDER BY photovoltaic_seq, writedate
	) md_group
	GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d'), photovoltaic_seq