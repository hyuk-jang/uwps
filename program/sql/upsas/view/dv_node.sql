

SELECT
			n.node_seq, 
			nd.node_def_seq,
			nc.node_class_seq,
			n.data_logger_seq,
      dl.main_seq,
			CASE
          WHEN LENGTH(n.target_code) > 0
            THEN CONCAT(nd.target_prefix, "_", n.target_code)
          ELSE 
            CONCAT(nd.target_prefix)
          END AS node_id,
			CASE
          WHEN LENGTH(n.target_code) > 0
            THEN CONCAT(nd.target_prefix, "_", dl.main_seq, "_", n.target_code)
          ELSE 
            CONCAT(nd.target_prefix, "_", dl.main_seq)
          END AS node_real_id,
			CASE
          WHEN LENGTH(n.target_code) > 0
            THEN CONCAT(nd.target_name, " ", n.target_code)
          ELSE 
            CONCAT(nd.target_name)
          END AS node_name,
      CASE
			 WHEN LENGTH(dl.target_code) > 0
			  THEN CONCAT(dld.target_prefix, "_", dl.main_seq, "_", dl.target_code)
			 ELSE 
			  CONCAT(dld.target_prefix, "_", dl.main_seq)
			END AS dl_real_id,
			CASE
			 WHEN LENGTH(dl.target_code) > 0
			  THEN CONCAT(dld.target_prefix, "_", dl.target_code)
			 ELSE 
			  CONCAT(dld.target_prefix)
			END AS dl_id,          
			CASE
			 WHEN LENGTH(dl.target_code) > 0
			  THEN CONCAT(dld.target_name, " ", dl.target_code)
			 ELSE 
			  CONCAT(dld.target_prefix)
			END AS dl_name,			
      nc.data_unit, nc.is_sensor, n.data_logger_index,
  		n.target_code AS n_target_code,
			nd.target_id AS nd_target_id,
			nd.target_name AS nd_target_name,
			nd.target_prefix AS nd_target_prefix,
			nd.description AS nd_description,
			nc.target_id AS nc_target_id, 
			nc.target_name AS nc_target_name,
			nc.description AS nc_description
  FROM dv_node n
 JOIN dv_node_def nd
  ON nd.node_def_seq = n.node_def_seq
 JOIN dv_node_class nc
  ON nc.node_class_seq = nd.node_class_seq
 JOIN dv_data_logger dl
  ON dl.data_logger_seq = n.data_logger_seq
 JOIN dv_data_logger_def dld
  ON dld.data_logger_def_seq = dl.data_logger_def_seq  