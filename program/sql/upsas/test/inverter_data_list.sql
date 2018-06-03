

SELECT 
		(SELECT ivt.target_name FROM inverter ivt WHERE ivt.inverter_seq = main.inverter_seq LIMIT 1 )  AS 인버터명, 
		(SELECT vup.sb_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = main.inverter_seq LIMIT 1 )  AS 설치장소, 
		(SELECT vup.pv_manufacturer FROM v_upsas_profile vup WHERE vup.inverter_seq = main.inverter_seq LIMIT 1 )  AS 제조회사, 
			main.in_a, main.in_v, main.in_w, main.out_a, main.out_v, main.out_w, main.c_wh, main.writedate
FROM 
(			
	SELECT inverter_seq, round(in_a / 10, 1) in_a, round(in_v / 10, 1) in_v, round(in_w / 10, 1) in_w, round(out_a / 10, 1) out_a, round(out_v / 10, 1) out_v, round(out_w / 10, 1) out_w, round(c_wh / 10, 1) c_wh, writedate  FROM inverter_data
	WHERE writedate > '2018-05-01'
) main
	ORDER BY writedate ASC
