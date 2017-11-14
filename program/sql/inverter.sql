SELECT inverter.*, 
	inverter_data_seq,in_a,in_v,in_w,out_a,out_v,out_w,p_f,d_wh,c_wh,writedate
	FROM inverter_data
	LEFT JOIN inverter
		ON inverter.inverter_seq = inverter_data.inverter_seq
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)