SELECT 
					sd.group_date, sd.avg_num_data, dpr.place_seq
		 FROM `v_dv_place_relation` AS dpr
		RIGHT OUTER JOIN `relation_power` AS rp
		 ON rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'moduleRearTemperature'
		JOIN
			(
			SELECT 
							node_seq,
							DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
							ROUND(AVG(num_data)) AS avg_num_data
			FROM `v_dv_sensor_data` AS dsd
			WHERE writedate>="2018-08-12 00:00:00" AND writedate<"2018-08-24 00:00:00"
			 AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
			ORDER BY node_seq, writedate
			) AS sd
		ON sd.node_seq = dpr.node_seq	


-- JOIN
-- 		(
-- 		SELECT 
-- 					sd.group_date, sd.avg_num_data, dpr.place_seq
-- 		 FROM `v_dv_place_relation` AS dpr
-- 		RIGHT OUTER JOIN `relation_power` AS rp
-- 		 ON rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'moduleRearTemperature'
-- 		JOIN
-- 			(
-- 			SELECT 
-- 							node_seq,
-- 							DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
-- 							ROUND(AVG(num_data), 1) AS avg_num_data
-- 			FROM `v_dv_sensor_data` AS dsd
-- 			WHERE writedate>="2018-08-22 00:00:00" AND writedate<"2018-08-24 00:00:00"
-- 			 AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
-- 			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
-- 			ORDER BY node_seq, writedate
-- 			) AS sd
-- 		ON sd.node_seq = dpr.node_seq	
-- 		) AS nsd
-- 	 ON nsd.place_seq = m.place_seq AND nsd.group_date = m.group_date		