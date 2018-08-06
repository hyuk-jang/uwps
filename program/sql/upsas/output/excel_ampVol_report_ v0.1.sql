SELECT 
		(SELECT ivt.target_name FROM inverter ivt WHERE ivt.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 인버터명, 
		(SELECT vup.sb_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 설치장소, 
		(SELECT vup.pv_manufacturer FROM v_upsas_profile vup WHERE vup.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 제조회사, 
		(SELECT vup.pv_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = id_report.inverter_seq LIMIT 1 )  AS 모듈타입, 		
		id_report.*
 FROM
(	
	SELECT
            inverter_seq,
            CONCAT(LEFT(DATE_FORMAT(writedate,"%Y-%m-%d %H:%i"), 15), "0")  AS group_date,
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
        WHERE writedate>= "2018-03-23 00:00:00" and writedate<"2018-08-06 00:00:00"

        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H:%i"), inverter_seq
        ORDER BY inverter_seq, writedate
       ) AS id_group
      GROUP BY inverter_seq, LEFT(DATE_FORMAT(writedate,"%Y-%m-%d %H:%i"), 15)) AS id_report
      
       