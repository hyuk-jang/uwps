	SELECT *
			,ROUND(SUM(sum_wh) / 1000, 2) AS total_sum_kwh	
			,ROUND(SUM(c_wh) / 1000000, 3) AS total_c_mwh
			,COUNT(group_date) AS rows_num
			,COUNT(id_report.group_date) AS t_count
			,COUNT(*) AS t_t
	 FROM
		(SELECT inverter_seq
				,DATE_FORMAT(writedate,'%Y-%m') AS group_date
				,ROUND(AVG(avg_in_a) / 10, 1) AS avg_in_a
				,ROUND(AVG(avg_in_v) / 10, 1) AS avg_in_v
				,ROUND(AVG(in_wh) / 10, 1) AS avg_in_wh
				,ROUND(AVG(avg_out_a) / 10, 1) AS avg_out_a
				,ROUND(AVG(avg_out_v) / 10, 1) AS avg_out_v
				,ROUND(AVG(out_wh) / 10, 1) AS avg_out_wh
				,ROUND(AVG(avg_p_f) / 10, 1) AS avg_p_f
				,ROUND(SUM(wh) / 100, 1) AS sum_wh
				,ROUND(MAX(c_wh) / 10, 1) AS c_wh
		 FROM
			(SELECT id.inverter_seq
					,writedate
					,AVG(in_a) AS avg_in_a
					,AVG(in_v) AS avg_in_v
					,AVG(in_w) AS in_wh
					,AVG(out_a) AS avg_out_a
					,AVG(out_v) AS avg_out_v
					,AVG(out_w) AS out_wh
					,AVG(CASE WHEN p_f > 0 THEN p_f END) AS avg_p_f
					,AVG(out_a) * AVG(out_v) AS wh
					,MAX(c_wh) AS c_wh
					,DATE_FORMAT(writedate,'%H') AS hour_time
			 FROM inverter_data id
         WHERE writedate>= "2017-10-01 00:00:00" and writedate<"2017-12-13 00:00:00"
			GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq
			ORDER BY inverter_seq, writedate) AS id_group
      GROUP BY DATE_FORMAT(writedate,'%Y-%m')
		) AS id_report
	GROUP BY group_date
	ORDER BY group_date DESC
