

SELECT 
			dn.*, 
			dnd.target_prefix, 
			CASE
			 WHEN LENGTH(dn.target_code) > 0
			  THEN CONCAT(dnd.target_prefix, "_", dn.target_code)
			 ELSE 
			  CONCAT(dnd.target_prefix)
			END AS nodeId,
         ddl.main_seq
 FROM dv_node dn
 LEFT JOIN dv_node_def dnd
  ON dnd.node_def_seq = dn.node_def_seq
 LEFT JOIN dv_data_logger ddl
  ON ddl.data_logger_seq = dn.data_logger_seq
WHERE ddl.main_seq = 1  
  