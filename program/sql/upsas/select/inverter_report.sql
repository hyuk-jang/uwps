	SELECT *
			,ROUND(SUM(c_wh), 1) AS total_c_wh
			,COUNT(group_date) AS rows_num
			,COUNT(id_report.group_date) AS t_count
			,COUNT(*) AS t_t
	 FROM
		(SELECT inverter_seq
				,DATE_FORMAT(writedate,'%Y-%m-%d %H') AS group_date
				,ROUND(AVG(avg_in_a), 1) AS avg_in_a
				,ROUND(AVG(avg_in_v), 1) AS avg_in_v
				,ROUND(AVG(in_wh), 1) AS avg_in_wh
				,ROUND(AVG(avg_out_a), 1) AS avg_out_a
				,ROUND(AVG(avg_out_v), 1) AS avg_out_v
				,ROUND(AVG(out_wh), 1) AS avg_out_wh
				,ROUND(AVG(avg_p_f), 1) AS avg_p_f
				,ROUND(SUM(d_wh), 1) AS sum_d_wh
				,ROUND(MAX(c_wh), 1) AS c_wh
		 FROM
			(SELECT id.inverter_seq,
					writedate,
					AVG(in_a / 10) AS avg_in_a,
					AVG(in_v / 10) AS avg_in_v,
					AVG(in_w / 10) AS in_wh,
					AVG(out_a / 10) AS avg_out_a,
					AVG(out_v / 10) AS avg_out_v,
					AVG(out_w / 10) AS out_wh,
					AVG(p_f / 10) AS avg_p_f,
					AVG(out_a) * AVG(out_v) AS d_wh,
					MAX(c_wh / 10) AS c_wh,
					DATE_FORMAT(writedate,'%H') AS hour_time
			 FROM inverter_data id
			WHERE writedate>= "2017-11-30" and writedate< "2017-11-31"
			GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq
			ORDER BY inverter_seq, writedate) AS id_group
		GROUP BY inverter_seq, DATE_FORMAT(writedate,'%Y-%m-%d %H')
		) AS id_report
	GROUP BY group_date
	ORDER BY group_date DESC
