
     SELECT 
          node_seq,
          DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
          ROUND(AVG(num_data), 2)  AS avg_data
      FROM dv_sensor_data
      WHERE writedate>= "2018-09-01 00:00:00" and writedate<"2018-09-02 00:00:00"
      -- ${nodeSeqList.length ? ` AND node_seq IN (${nodeSeqList})` : ''}
      GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), node_seq
      ORDER BY node_seq, writedate