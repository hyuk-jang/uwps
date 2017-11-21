 SELECT calc_cnt.*, DATE_FORMAT(writedate,"%Y-%m") AS group_date
        ,AVG(vol) AS avg_vol
      ,SUM(ch_a_1) AS total_ch_a_1
      ,ROUND(SUM(ch_a_1 * vol), 2) AS total_ch_wh_1
      ,SUM(ch_a_2) AS total_ch_a_2
      ,ROUND(SUM(ch_a_2 * vol), 2) AS total_ch_wh_2
		FROM(
      SELECT
        connector_seq,
        writedate,
        DATE_FORMAT(writedate, "%Y-%m") AS dateFormat
		  ,ROUND(v / 10, 1) AS vol
	    ,ROUND(ch_1/10,1) AS ch_a_1,ROUND(ch_2/10,1) AS ch_a_2
      FROM connector_data
      WHERE writedate>= "2017-09-24 09:00:00" and writedate<"2017-11-16 09:00:00"
        AND connector_seq = 2
      GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), connector_seq
      ORDER BY connector_seq, writedate) calc_cnt
    GROUP BY DATE_FORMAT(writedate,"%Y-%m"), connector_seq