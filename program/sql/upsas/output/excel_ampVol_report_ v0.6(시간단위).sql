SELECT 
	STRAIGHT_JOIN m.*, nsd.real_module_water_level
 FROM
	(
		(
		SELECT 
					ivt.target_name AS 인버터명, 
					vup.pv_manufacturer AS 제조회사, vup.pv_target_name AS 모듈타입, 
					id_report.inverter_seq, id_report.group_date, 
					rp.place_seq,
					CASE
						WHEN id_report.inverter_seq = 1
						THEN id_report.interval_wh * 1.018183004
						WHEN id_report.inverter_seq = 2
						THEN id_report.interval_wh * 1.025786841
						WHEN id_report.inverter_seq = 3
						THEN id_report.interval_wh * 0.939450921
						WHEN id_report.inverter_seq = 4
						THEN id_report.interval_wh * 0.98756112
						WHEN id_report.inverter_seq = 7
						THEN id_report.interval_wh * 0.906583436
						ELSE id_report.interval_wh
					END AS interval_wh,
					wdd.avg_temp, wdd.total_interval_solar, wdd.total_inclined_solar,
					kd.avg_sky, kd.avg_ws,
					twl.water_level
		FROM
			(
			SELECT
								inverter_seq,
								DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
								DATE_FORMAT(writedate,"%Y-%m-%d %H") AS day_date,
								ROUND(AVG(avg_in_a) / 10, 1) AS avg_in_a,
								ROUND(AVG(avg_in_v) / 10, 1) AS avg_in_v,
								ROUND(AVG(avg_in_w) / 10000, 2) AS avg_in_kw,				            
								ROUND(AVG(avg_out_a) / 10, 1) AS avg_out_a,            
								ROUND(AVG(avg_out_v) / 10, 1) AS avg_out_v,            
								ROUND(AVG(avg_out_w) / 10000, 2) AS avg_out_kw,            				            
								ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_wh
			FROM
				(
				SELECT
								DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
								id.*,
								DATE_FORMAT(writedate,"%H") AS hour_time,
								AVG(id.in_a) AS avg_in_a,
								AVG(id.in_v) AS avg_in_v,
								AVG(id.in_w) AS avg_in_w,
								AVG(id.out_a) AS avg_out_a,
								AVG(id.out_v) AS avg_out_v,
								AVG(id.out_w) AS avg_out_w,				  				  				  				                
								MAX(c_wh) AS max_c_wh,
								MIN(c_wh) AS min_c_wh
				FROM inverter_data id
				WHERE writedate>= "2018-10-14 00:00:00" and writedate<"2018-10-16 00:00:00"
				GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
				ORDER BY inverter_seq, writedate
				) AS id_group
			GROUP BY inverter_seq, DATE_FORMAT(writedate,"%Y-%m-%d %H")
			) AS id_report
		JOIN inverter AS ivt
		 ON ivt.inverter_seq = id_report.inverter_seq
		JOIN v_upsas_profile AS vup 
		 ON vup.inverter_seq = id_report.inverter_seq
		JOIN relation_power AS rp 
		 ON rp.inverter_seq = ivt.inverter_seq
		LEFT JOIN
			(
			SELECT
						DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
						ROUND(AVG(avg_sm_infrared), 1) AS avg_sm_infrared,
						ROUND(AVG(avg_temp), 1) AS avg_temp,
						ROUND(AVG(avg_reh), 1) AS avg_reh,
						ROUND(AVG(avg_solar), 0) AS avg_solar,
						ROUND(SUM(inclined_solar) * 1.17, 1) AS total_inclined_solar,
						ROUND(SUM(interval_solar), 1) AS total_interval_solar,
						ROUND(AVG(avg_wd), 0) AS avg_wd,
						ROUND(AVG(avg_ws), 1) AS avg_ws,
						ROUND(AVG(avg_uv), 0) AS avg_uv
			FROM
				(
				SELECT
							writedate,
							AVG(sm_infrared) AS avg_sm_infrared,
							AVG(temp) AS avg_temp,
							AVG(reh) AS avg_reh,
							AVG(solar) AS avg_solar,
							AVG(inclined_solar) AS inclined_solar,
							AVG(solar) AS interval_solar,
							AVG(wd) AS avg_wd,
							AVG(ws) AS avg_ws,
							AVG(uv) AS avg_uv,
							COUNT(*) AS first_count
				FROM weather_device_data
				WHERE writedate>= "2018-10-14 00:00:00" and writedate<"2018-10-16 00:00:00"
				AND DATE_FORMAT(writedate, '%H') > '05' AND DATE_FORMAT(writedate, '%H') < '21'
				GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H")
				) AS result_wdd
			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H")
			) wdd
		 ON wdd.group_date = id_report.group_date
		LEFT JOIN 
			(
			SELECT
						DATE_FORMAT(kd.applydate,"%Y-%m-%d %H") AS group_date,
						ROUND(AVG(kd.scale_sky), 1) AS avg_sky,
						ROUND(AVG(kd.ws), 1) AS avg_ws
			FROM
				(
				SELECT
							*,
							CASE
									WHEN sky = 1 THEN 1
									WHEN sky = 2 THEN 4
									WHEN sky = 3 THEN 7
									WHEN sky = 4 THEN 9.5
								END AS scale_sky
				FROM kma_data
				) kd
			WHERE applydate>= "2018-10-14 00:00:00" and applydate<"2018-10-16 00:00:00"
			AND DATE_FORMAT(applydate, '%H') > '05' AND DATE_FORMAT(applydate, '%H') < '21'
			GROUP BY DATE_FORMAT(applydate,"%Y-%m-%d %H")
			) AS kd
		 ON kd.group_date = id_report.group_date
		LEFT JOIN temp_water_level AS twl
		 ON twl.inverter_seq = id_report.inverter_seq AND DATE_FORMAT(applydate,"%Y-%m-%d %H") = id_report.day_date
		) AS m
		LEFT JOIN
		(
		SELECT 
					sd.group_date, sd.avg_num_data AS real_module_water_level, dpr.place_seq
		FROM `v_dv_place_relation` AS dpr
		RIGHT OUTER JOIN `relation_power` AS sub_rp
		 ON sub_rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'waterLevel'
		JOIN
			(
			SELECT 
							node_seq,
							DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
							ROUND(AVG(num_data), 1) AS avg_num_data
			FROM `v_dv_sensor_data` AS dsd
			WHERE writedate>="2018-10-14 00:00:00" AND writedate<"2018-10-16 00:00:00"
			 AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
       AND num_data > 0
			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), node_seq
			ORDER BY node_seq, writedate
			) AS sd
		 ON sd.node_seq = dpr.node_seq	
		) AS nsd
		 ON nsd.place_seq = m.place_seq AND nsd.group_date = m.group_date
  )
