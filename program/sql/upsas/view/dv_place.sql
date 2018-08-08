SELECT 
          dp.place_seq, dp.place_def_seq,
          CASE
          WHEN LENGTH(dp.target_code) > 0
            THEN CONCAT(dpd.target_prefix, "_", dp.target_code)
          ELSE 
            CONCAT(dpd.target_prefix)
          END AS place_id,
          CASE
          WHEN LENGTH(dp.target_code) > 0
            THEN CONCAT(dpd.target_name, " ", dp.target_code)
          ELSE 
            CONCAT(dpd.target_name)
          END AS place_name,          
          dp.depth,
          dp.place_info,
          dp.target_code AS dp_target_code,
          dpd.target_prefix AS dpd_target_prefix,          
          dpd.target_id AS dpd_target_id,
          dpd.target_name AS dpd_target_name
  FROM dv_place dp
 JOIN dv_place_def dpd
  ON dpd.place_def_seq = dp.place_def_seq