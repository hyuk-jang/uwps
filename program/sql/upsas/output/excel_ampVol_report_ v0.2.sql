SELECT 
		(SELECT ivt.target_name FROM inverter ivt WHERE ivt.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 인버터명, 
		(SELECT vup.pv_manufacturer FROM v_upsas_profile vup WHERE vup.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 제조회사, 
		(SELECT vup.pv_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 모듈타입, 		
		id_report.inverter_seq, id_report.group_date, id_report.interval_wh,
		wdd.avg_temp,
		twl.water_level
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
        WHERE writedate>= "2018-03-23 00:00:00" and writedate<"2018-09-12 00:00:00"

        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
        ORDER BY inverter_seq, writedate
       ) AS id_group
      GROUP BY inverter_seq, DATE_FORMAT(writedate,"%Y-%m-%d")) AS id_report
LEFT JOIN
	(
	   SELECT
        DATE_FORMAT(writedate,"%H:%i") AS view_date,
        DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
          ROUND(AVG(avg_sm_infrared), 1) AS avg_sm_infrared,
          ROUND(AVG(avg_temp), 1) AS avg_temp,
          ROUND(AVG(avg_reh), 1) AS avg_reh,
          ROUND(AVG(avg_solar), 0) AS avg_solar,
          ROUND(SUM(interval_solar), 1) AS total_interval_solar,
          ROUND(AVG(avg_wd), 0) AS avg_wd,
          ROUND(AVG(avg_ws), 1) AS avg_ws,
          ROUND(AVG(avg_uv), 0) AS avg_uv
      FROM
        (SELECT
          writedate,
          AVG(sm_infrared) AS avg_sm_infrared,
          AVG(temp) AS avg_temp,
          AVG(reh) AS avg_reh,
          AVG(solar) AS avg_solar,
          AVG(solar) / 60 AS interval_solar,
          AVG(wd) AS avg_wd,
          AVG(ws) AS avg_ws,
          AVG(uv) AS avg_uv,
          COUNT(*) AS first_count
        FROM weather_device_data
        WHERE writedate>= "2018-03-23 00:00:00" and writedate<"2018-09-12 00:00:00"
        AND DATE_FORMAT(writedate, '%H') > '05' AND DATE_FORMAT(writedate, '%H') < '21'
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H")) AS result_wdd
     GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d")
	) wdd
 ON wdd.group_date = id_report.group_date
LEFT JOIN temp_water_level twl
 ON twl.inverter_seq = id_report.inverter_seq AND DATE_FORMAT(applydate,"%Y-%m-%d") = id_report.day_date
      
       