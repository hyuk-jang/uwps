SELECT
  	connector_seq,
	writedate,
	DATE_FORMAT(writedate,'%H:%i') AS hour_time,
	ROUND(v / 10, 1) AS vol,
   ROUND(ch_1/10,1) AS ch_1,
	ROUND(ch_2/10,1) AS ch_2,
   ROUND(ch_3/10,1) AS ch_3,
   ROUND(ch_4/10,1) AS ch_4
   FROM connector_data
   	WHERE writedate>= CURDATE() and writedate<CURDATE() + 1 AND connector_seq = 1
   	GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), connector_seq
		ORDER BY connector_seq, writedate