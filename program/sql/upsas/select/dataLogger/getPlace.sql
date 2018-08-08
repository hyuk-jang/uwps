

SELECT 
			dp.*,
			dpd.target_prefix,
			CASE
			 WHEN LENGTH(dp.target_code) > 0
			  THEN CONCAT(dpd.target_prefix, "_", dp.target_code)
			 ELSE 
			  CONCAT(dpd.target_prefix)
			END AS placeId
  FROM dv_place dp
 JOIN dv_place_def dpd
  ON dpd.place_def_seq = dp.place_def_seq