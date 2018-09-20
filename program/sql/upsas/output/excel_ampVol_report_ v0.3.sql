
SELECT 
		-- m.인버터명, m.제조회사, m.모듈타입,
		m.inverter_seq, m.place_seq, m.group_date,
		-- ROUND(SUM(interval_wh), 1) AS sum_interval_wh,
		-- SUM(total_interval_solar) AS sum_day_solar,
		-- ROUND(AVG(avg_temp), 1) AS avg_temp,
		-- ROUND(AVG(avg_sky), 1) as avg_sky,
		DATE_FORMAT(m.group_date, "%Y-%m-%d") AS writedate
 FROM
	(
	SELECT 
				-- ivt.target_name AS 인버터명, 
				-- vup.pv_manufacturer AS 제조회사, vup.pv_target_name AS 모듈타입, 
				id_report.inverter_seq, id_report.group_date, 
				rp.place_seq
				-- CASE
				-- 	WHEN id_report.inverter_seq = 1
				-- 	THEN id_report.interval_wh * 1.018183004
				-- 	WHEN id_report.inverter_seq = 2
				-- 	THEN id_report.interval_wh * 1.025786841
				-- 	WHEN id_report.inverter_seq = 3
				-- 	THEN id_report.interval_wh * 0.939450921
				-- 	WHEN id_report.inverter_seq = 4
				-- 	THEN id_report.interval_wh * 0.987561
				-- 	ELSE id_report.interval_wh
				-- END AS interval_wh,
				-- wdd.avg_temp, wdd.total_interval_solar,
				-- kd.avg_sky,
				-- twl.water_level,
				-- nsd.avg_num_data
	 FROM
		(	
		SELECT
	            inverter_seq,
	            DATE_FORMAT(writedate,"%Y-%m-%d") AS day_date,
	            DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
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
			WHERE writedate>= "2018-08-22 00:00:00" and writedate<"2018-08-24 00:00:00"
			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
			ORDER BY inverter_seq, writedate
	    ) AS id_group
		GROUP BY inverter_seq, DATE_FORMAT(writedate,"%Y-%m-%d")
		) AS id_report
	JOIN inverter AS ivt
	 ON ivt.inverter_seq = id_report.inverter_seq
	JOIN v_upsas_profile AS vup 
	 ON vup.inverter_seq = id_report.inverter_seq
	JOIN `relation_power` AS rp 
	 ON rp.inverter_seq = ivt.inverter_seq
	) AS m
JOIN
	(
	SELECT 
				sd.group_date, sd.avg_num_data, dpr.place_seq
	FROM `v_dv_place_relation` AS dpr
	RIGHT OUTER JOIN `relation_power` AS sub_rp
	ON sub_rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'moduleRearTemperature'
	JOIN
		(
		SELECT 
						node_seq,
						DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
						ROUND(AVG(num_data), 1) AS avg_num_data
		FROM `v_dv_sensor_data` AS dsd
		WHERE writedate>="2018-08-22 00:00:00" AND writedate<"2018-08-24 00:00:00"
		AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
		GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
		ORDER BY node_seq, writedate
		) AS sd
	ON sd.node_seq = dpr.node_seq	
	) AS nsd
ON nsd.place_seq = m.place_seq AND nsd.group_date = m.group_date



	-- JOIN
	-- 	(
	-- 	SELECT
	-- 				DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
	-- 				ROUND(AVG(avg_sm_infrared), 1) AS avg_sm_infrared,
	-- 				ROUND(AVG(avg_temp), 1) AS avg_temp,
	-- 				ROUND(AVG(avg_reh), 1) AS avg_reh,
	-- 				ROUND(AVG(avg_solar), 0) AS avg_solar,
	-- 				ROUND(SUM(interval_solar), 1) AS total_interval_solar,
	-- 				ROUND(AVG(avg_wd), 0) AS avg_wd,
	-- 				ROUND(AVG(avg_ws), 1) AS avg_ws,
	-- 				ROUND(AVG(avg_uv), 0) AS avg_uv
	-- 	FROM
	-- 		(
	-- 		SELECT
	-- 					writedate,
	-- 					AVG(sm_infrared) AS avg_sm_infrared,
	-- 					AVG(temp) AS avg_temp,
	-- 					AVG(reh) AS avg_reh,
	-- 					AVG(solar) AS avg_solar,
	-- 					AVG(solar) AS interval_solar,
	-- 					AVG(wd) AS avg_wd,
	-- 					AVG(ws) AS avg_ws,
	-- 					AVG(uv) AS avg_uv,
	-- 					COUNT(*) AS first_count
	-- 		 FROM weather_device_data
	-- 		WHERE writedate>= "2018-08-22 00:00:00" and writedate<"2018-08-24 00:00:00"
	-- 		 AND DATE_FORMAT(writedate, '%H') > '05' AND DATE_FORMAT(writedate, '%H') < '21'
	-- 		GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H")
	-- 		) AS result_wdd
	-- 	GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d")
	-- 	) wdd
	--  ON wdd.group_date = id_report.group_date
	-- JOIN 
	-- 	(
	-- 	SELECT
	-- 				DATE_FORMAT(kd.writedate,"%Y-%m-%d") AS group_date,
	-- 				ROUND(AVG(kd.scale_sky), 1) AS avg_sky
	-- 	 FROM
	-- 		(
	-- 		SELECT
	-- 		 			*,
	-- 		 			CASE
	-- 			        WHEN sky = 1 THEN 1
	-- 			        WHEN sky = 2 THEN 4
	-- 			        WHEN sky = 3 THEN 7
	-- 			        WHEN sky = 4 THEN 9.5
	-- 			      END AS scale_sky
	-- 		 FROM kma_data
	-- 		) kd
	-- 	WHERE applydate>= "2018-08-22 00:00:00" and applydate<"2018-08-24 00:00:00"
	-- 	 AND DATE_FORMAT(applydate, '%H') > '05' AND DATE_FORMAT(applydate, '%H') < '21'
	-- 	GROUP BY DATE_FORMAT(applydate,"%Y-%m-%d")
	-- 	) AS kd
	--  ON kd.group_date = id_report.group_date

	-- JOIN temp_water_level twl
	--  ON twl.inverter_seq = id_report.inverter_seq AND DATE_FORMAT(applydate,"%Y-%m-%d") = id_report.day_date

	-- ) AS m
	-- INNER JOIN
	-- 		(
	-- 		SELECT 
	-- 					sd.group_date, sd.avg_num_data, dpr.place_seq
	-- 		FROM `v_dv_place_relation` AS dpr
	-- 		RIGHT OUTER JOIN `relation_power` AS rp
	-- 		ON rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'moduleRearTemperature'
	-- 		JOIN
	-- 			(
	-- 			SELECT 
	-- 							node_seq,
	-- 							DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
	-- 							ROUND(AVG(num_data), 1) AS avg_num_data
	-- 			FROM `v_dv_sensor_data` AS dsd
	-- 			WHERE writedate>="2018-08-22 00:00:00" AND writedate<"2018-08-24 00:00:00"
	-- 			AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
	-- 			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
	-- 			ORDER BY node_seq, writedate
	-- 			) AS sd
	-- 		ON sd.node_seq = dpr.node_seq	
	-- 		) AS nsd
	-- 	ON nsd.place_seq = m.place_seq AND nsd.group_date = m.group_date
-- GROUP BY DATE_FORMAT(m.group_date,"%Y-%m-%d"), m.inverter_seq
	      
	       