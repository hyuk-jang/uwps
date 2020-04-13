SELECT 
	STRAIGHT_JOIN m.*, nsd.real_module_water_level, nsd_2.real_module_temperature, nsd_3.real_brineTemperature
 FROM
	(
		(
		SELECT 
					ivt.target_name AS 인버터명, 
					-- vup.pv_manufacturer AS 제조회사,
          -- vup.pv_target_name AS 모듈타입, 
					-- id_report.inverter_seq,
          id_report.group_date, 
					rp.place_seq,
          id_report.interval_kwh,
					wdd.avg_temp AS avg_outside_temperature, wdd.total_horizontal_solar, wdd.total_inclined_solar,
					-- kd.avg_sky, kd.avg_ws,
					twl.water_level
		FROM
			(
			SELECT
								inverter_seq,
								DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
								DATE_FORMAT(writedate,"%Y-%m-%d") AS day_date,
								ROUND(AVG(avg_pv_a), 3) AS avg_pv_a,
								ROUND(AVG(avg_pv_v), 3) AS avg_pv_v,
								ROUND(AVG(avg_pv_kw), 3) AS avg_pv_kw,				            
								ROUND(AVG(grid_rs_v), 3) AS grid_rs_v,            
								ROUND(AVG(grid_r_a), 3) AS grid_r_a,            
								ROUND(AVG(avg_power_kw), 3) AS avg_power_kw,
                ROUND(MAX(power_kw), 3) AS max_power_kw,
								ROUND((MAX(max_power_cp_kwh) - MIN(min_power_cp_kwh)), 3) AS interval_kwh
			FROM
				(
				SELECT
								DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
								id.*,
								DATE_FORMAT(writedate,"%H") AS hour_time,
								AVG(id.pv_a) AS avg_pv_a,
								AVG(id.pv_v) AS avg_pv_v,
								AVG(id.pv_kw) AS avg_pv_kw,
								AVG(id.grid_rs_v) AS avg_grid_rs_v,
								AVG(id.grid_r_a) AS avg_grid_r_a,
								AVG(id.power_kw) AS avg_power_kw,
                MAX(power_kw) AS max_power_kw,
								MAX(power_cp_kwh) AS max_power_cp_kwh,
								MIN(power_cp_kwh) AS min_power_cp_kwh
				FROM pw_inverter_data id
				WHERE writedate>= "2020-03-01 00:00:00" and writedate<"2020-03-31 00:00:00"
				GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
				ORDER BY inverter_seq, writedate
				) AS id_group
			GROUP BY inverter_seq, DATE_FORMAT(writedate,"%Y-%m-%d")
			) AS id_report
		JOIN pw_inverter AS ivt
		 ON ivt.inverter_seq = id_report.inverter_seq
		JOIN seb_relation AS seb_rel
		 ON seb_rel.inverter_seq = id_report.inverter_seq
		JOIN pw_relation_power AS rp 
		 ON rp.inverter_seq = ivt.inverter_seq
		LEFT JOIN
			(
			SELECT
						DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
						ROUND(AVG(avg_sm_infrared), 1) AS avg_sm_infrared,
						ROUND(AVG(avg_temp), 1) AS avg_temp,
						ROUND(AVG(avg_reh), 1) AS avg_reh,
						ROUND(AVG(avg_horizontal_solar), 0) AS avg_horizontal_solar,
						ROUND(SUM(avg_horizontal_solar), 0) AS total_horizontal_solar,
						ROUND(AVG(avg_inclined_solar), 0) AS avg_inclined_solar,
						ROUND(SUM(avg_inclined_solar) * 1.17, 1) AS total_inclined_solar,
						ROUND(AVG(avg_wd), 0) AS avg_wd,
						ROUND(AVG(avg_ws), 1) AS avg_ws,
						ROUND(AVG(avg_uv), 0) AS avg_uv
			FROM
				(
				SELECT
							writedate,
              main_seq,
							AVG(sm_infrared) AS avg_sm_infrared,
							AVG(temp) AS avg_temp,
							AVG(reh) AS avg_reh,
							AVG(solar) AS avg_horizontal_solar,
							AVG(inclined_solar) AS avg_inclined_solar,
							AVG(wd) AS avg_wd,
							AVG(ws) AS avg_ws,
							AVG(uv) AS avg_uv,
							COUNT(*) AS first_count
				FROM weather_device_data
				WHERE writedate>= "2020-03-01 00:00:00" and writedate<"2020-03-31 00:00:00"
				AND DATE_FORMAT(writedate, '%H') > '05' AND DATE_FORMAT(writedate, '%H') < '21'
				GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), main_seq
				) AS result_wdd
			GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), main_seq
			) wdd
		 ON wdd.group_date = id_report.group_date
		LEFT JOIN 
			(
			SELECT
						DATE_FORMAT(kd.applydate,"%Y-%m-%d") AS group_date,
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
			WHERE applydate>= "2020-03-01 00:00:00" and applydate<"2020-03-31 00:00:00"
			AND DATE_FORMAT(applydate, '%H') > '05' AND DATE_FORMAT(applydate, '%H') < '21'
			GROUP BY DATE_FORMAT(applydate,"%Y-%m-%d")
			) AS kd
		 ON kd.group_date = id_report.group_date
		LEFT JOIN temp_water_level AS twl
		 ON twl.inverter_seq = id_report.inverter_seq AND DATE_FORMAT(applydate,"%Y-%m-%d") = DATE_FORMAT(id_report.day_date,"%Y-%m-%d")
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
                DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
                ROUND(AVG(num_data), 1) AS avg_num_data
        FROM `dv_sensor_data` AS dsd
        WHERE writedate>="2020-03-01 00:00:00" AND writedate<"2020-03-31 00:00:00"
        AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
        AND num_data > 0
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
        ORDER BY node_seq, writedate
        ) AS sd
       ON sd.node_seq = dpr.node_seq	
		  ) AS nsd
		 ON nsd.place_seq = m.place_seq AND nsd.group_date = m.group_date
    LEFT JOIN
		  (
      SELECT 
            sd.group_date, sd.avg_num_data AS real_module_temperature, dpr.place_seq
      FROM `v_dv_place_relation` AS dpr
      RIGHT OUTER JOIN `relation_power` AS sub_rp
       ON sub_rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'moduleRearTemperature'
      JOIN
        (
        SELECT 
                node_seq,
                DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
                ROUND(AVG(num_data), 1) AS avg_num_data
        FROM `dv_sensor_data` AS dsd
        WHERE writedate>="2020-03-01 00:00:00" AND writedate<"2020-03-31 00:00:00"
        AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
        ORDER BY node_seq, writedate
        ) AS sd
       ON sd.node_seq = dpr.node_seq	
		  ) AS nsd_2
		 ON nsd_2.place_seq = m.place_seq AND nsd_2.group_date = m.group_date 
    LEFT JOIN
		  (
      SELECT 
            sd.group_date, sd.avg_num_data AS real_brineTemperature, dpr.place_seq
      FROM `v_dv_place_relation` AS dpr
      RIGHT OUTER JOIN `relation_power` AS sub_rp
       ON sub_rp.place_seq = dpr.place_seq AND dpr.nd_target_id = 'brineTemperature'
      JOIN
        (
        SELECT 
                node_seq,
                DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
                ROUND(AVG(num_data), 1) AS avg_num_data
        FROM `dv_sensor_data` AS dsd
        WHERE writedate>="2020-03-01 00:00:00" AND writedate<"2020-03-31 00:00:00"
        AND DATE_FORMAT(writedate, '%H') >= '05' AND DATE_FORMAT(writedate, '%H') < '20'
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), node_seq
        ORDER BY node_seq, writedate
        ) AS sd
       ON sd.node_seq = dpr.node_seq	
		  ) AS nsd_3
		 ON nsd_3.place_seq = m.place_seq AND nsd_3.group_date = m.group_date 
  )
