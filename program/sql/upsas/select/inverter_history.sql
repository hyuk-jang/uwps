SELECT
      inverter_seq,
      writedate,
      DATE_FORMAT(writedate,'%H') AS hour_time,
      ROUND(AVG(in_a) / 10, 1) AS in_a,
      ROUND(AVG(in_v) / 10, 1) AS in_v,
      ROUND(AVG(in_w) / 10, 1) AS in_w,
      ROUND(AVG(out_a) / 10, 1) AS out_a,
      ROUND(AVG(out_v) / 10, 1) AS out_v,
      ROUND(AVG(out_w) / 10, 1) AS out_w,
      ROUND(AVG(p_f) / 10, 1) AS p_f,
      ROUND(d_wh / 10, 1) AS d_wh,
      ROUND(MAX(c_wh) / 10, 1) AS max_c_wh,
      ROUND(MIN(c_wh) / 10, 1) AS min_c_wh,
      ROUND((MAX(c_wh) - MIN(c_wh)) / 10, 1) AS interval_wh
      FROM inverter_data
        WHERE writedate>= CURDATE() AND writedate<CURDATE() + 1

      GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq
      ORDER BY inverter_seq, writedate