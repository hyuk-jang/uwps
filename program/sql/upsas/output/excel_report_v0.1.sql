SELECT 
		(SELECT ivt.target_name FROM inverter ivt WHERE ivt.inverter_seq = final_report.inverter_seq LIMIT 1 )  AS 인버터명, 
		(SELECT vup.sb_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = final_report.inverter_seq LIMIT 1 )  AS 설치장소, 
		(SELECT vup.pv_manufacturer FROM v_upsas_profile vup WHERE vup.inverter_seq = final_report.inverter_seq LIMIT 1 )  AS 제조회사, 
		(SELECT vup.pv_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = final_report.inverter_seq LIMIT 1 )  AS 모듈타입, 		
		final_report.*,
		ROUND(final_report.total_s_kwh * final_report.scale, 3) AS scale_total_s_kwh,
		ROUND(final_report.total_kwh * final_report.scale, 3) AS scale_total_kwh
 FROM
(
 SELECT
		  inverter_seq,
        group_date,
		  ROUND(SUM(interval_wh) / 1000, 3) AS total_s_kwh,
        ROUND(SUM(max_c_wh) / 1000, 3) AS total_kwh,
        CASE
			WHEN inverter_seq = 1
			THEN 1.008241553
			WHEN inverter_seq = 2
			THEN 1.026608762
			WHEN inverter_seq = 3
			THEN 0.999800133
			WHEN inverter_seq = 4
			THEN 1.026412107
			ELSE 1
		END AS scale
    FROM
      (SELECT
            inverter_seq,
            CONCAT(LEFT(DATE_FORMAT(writedate,"%Y-%m-%d %H:%i"), 15), "0")  AS group_date,
            ROUND(MAX(max_c_wh) / 10, 1) AS max_c_wh,
            ROUND(MIN(min_c_wh) / 10, 1) AS min_c_wh,
            ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_wh
      FROM
        (SELECT
              id.inverter_seq,
              writedate,
              DATE_FORMAT(writedate,"%H") AS hour_time,
              MAX(c_wh) AS max_c_wh,
              MIN(c_wh) AS min_c_wh
        FROM inverter_data id
        WHERE writedate>= "2018-03-23 00:00:00" and writedate<"2018-03-24 00:00:00"

        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H:%i"), inverter_seq
        ORDER BY inverter_seq, writedate) AS id_group
      GROUP BY inverter_seq, LEFT(DATE_FORMAT(writedate,"%Y-%m-%d %H:%i"), 15)) AS id_report
    GROUP BY inverter_seq, group_date
    ORDER BY group_date, inverter_seq ASC
   ) AS final_report