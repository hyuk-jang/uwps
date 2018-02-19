SELECT
	    inverter_seq,
	    DATE_FORMAT(writedate,"%Y-%m-%d") AS group_date,
	    ROUND(AVG(avg_in_a) / 10, 1) AS avg_in_a,
	    ROUND(AVG(avg_in_v) / 10, 1) AS avg_in_v,
	    ROUND(AVG(avg_in_wh) / 10, 1) AS avg_in_wh,
	    ROUND(AVG(avg_out_a) / 10, 1) AS avg_out_a,
	    ROUND(AVG(avg_out_v) / 10, 1) AS avg_out_v,
	    ROUND(AVG(avg_out_wh) / 10, 1) AS avg_out_wh,
	    ROUND(AVG(avg_p_f) / 10, 1) AS avg_p_f,
	    ROUND(MAX(max_c_wh) / 10, 1) AS max_c_wh,
	    ROUND(MIN(min_c_wh) / 10, 1) AS min_c_wh,
	    ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_wh
 FROM
	(SELECT
	        id.inverter_seq,
	        writedate,
	        DATE_FORMAT(writedate,"%H") AS hour_time,
	        AVG(in_a) AS avg_in_a,
	        AVG(in_v) AS avg_in_v,
	        AVG(in_w) AS avg_in_wh,
	        AVG(out_a) AS avg_out_a,
	        AVG(out_v) AS avg_out_v,
	        AVG(out_w) AS avg_out_wh,
	        AVG(CASE WHEN p_f > 0 THEN p_f END) AS avg_p_f,
	        AVG(out_a) * AVG(out_v) AS wh,
	        MAX(c_wh) AS max_c_wh,
	        MIN(c_wh) AS min_c_wh,
	        MAX(c_wh) - MIN(c_wh) AS interval_wh
	 FROM inverter_data id
   WHERE writedate>= "2018-02-01 00:00:00" and writedate<"2018-03-01 00:00:00" AND inverter_seq = 2
	GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
	ORDER BY inverter_seq, writedate) AS id_group
GROUP BY inverter_seq, DATE_FORMAT(writedate,"%Y-%m-%d")