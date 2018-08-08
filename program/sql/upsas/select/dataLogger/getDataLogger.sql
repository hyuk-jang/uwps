

SELECT 
			ddl.*,
			CASE
			 WHEN LENGTH(ddl.target_code) > 0
			  THEN CONCAT(ddld.target_prefix, "_", ddl.target_code)
			 ELSE 
			  CONCAT(ddld.target_prefix)
			END AS dataLoggerId
  FROM dv_data_logger ddl
 JOIN dv_data_logger_def ddld
  ON ddld.data_logger_def_seq = ddl.data_logger_def_seq
WHERE ddl.main_seq = 1  
  