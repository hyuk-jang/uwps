
SELECT 
		(SELECT ivt.target_name FROM inverter ivt WHERE ivt.inverter_seq = main.inverter_seq LIMIT 1 )  AS 인버터명, 
		(SELECT vup.sb_target_name FROM v_upsas_profile vup WHERE vup.inverter_seq = main.inverter_seq LIMIT 1 )  AS 설치장소, 
		(SELECT vup.pv_manufacturer FROM v_upsas_profile vup WHERE vup.inverter_seq = main.inverter_seq LIMIT 1 )  AS 제조회사, 
			main.amp, 			main.vol, 			main.writedate
FROM 
(
	SELECT relation_upms.photovoltaic_seq, inverter_seq,
		round(amp / 10, 1) AS amp, round(vol / 10, 1) AS vol, writedate
	 FROM relation_upms
	LEFT OUTER JOIN module_data
	 ON module_data.photovoltaic_seq = relation_upms.photovoltaic_seq AND module_data.writedate > '2018-05-01'

) main
	ORDER BY writedate ASC

