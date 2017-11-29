
SELECT 
	ROUND(SUM(sum_d_wh) / 10 / 1000, 3) AS m_kwh
	FROM
	(
	SELECT
		 *,
		DATE_FORMAT(writedate,"%Y-%m") AS group_date,
		SUM(max_d_wh) AS sum_d_wh
		FROM
		(SELECT 
			*,
			MAX(d_wh) AS max_d_wh
			FROM 
			inverter_data
			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), inverter_seq
		) AS step_1
		GROUP BY DATE_FORMAT(writedate,"%Y-%m"), inverter_seq
	) AS step_2
	WHERE group_date = "2017-11"
	GROUP BY group_date