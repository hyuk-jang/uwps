

SELECT 
			n.node_seq, 
			CASE
          WHEN LENGTH(n.target_code) > 0
            THEN CONCAT(nd.target_prefix, "_", vddl.main_seq, "_", n.target_code)
          ELSE 
            CONCAT(nd.target_prefix, "_", vddl.main_seq)
          END AS node_real_id,			
			CASE
          WHEN LENGTH(n.target_code) > 0
            THEN CONCAT(nd.target_prefix, "_", n.target_code)
          ELSE 
            CONCAT(nd.target_prefix)
          END AS node_id,
			CASE
          WHEN LENGTH(n.target_code) > 0
            THEN CONCAT(nd.target_name, "_", n.target_code)
          ELSE 
            CONCAT(nd.target_name)
          END AS node_name,
			n.target_code, n.data_logger_index, 
		
		vddl.dl_real_id, vddl.dl_id,
		nd.target_prefix AS nd_target_prefix, nd.target_id AS nd_target_id, nd.target_name AS nd_target_name,
		nc.target_id AS nc_target_id, nc.is_sensor AS nc_is_sensor, nc.target_name AS nc_target_name, nc.data_unit AS nc_data_unit, nc.description AS nc_description,
 		vddl.m_name,
		nd.node_def_seq, nd.node_class_seq, vddl.main_seq, vddl.data_logger_seq, vddl.data_logger_def_seq
		
from dv_node n
left outer join dv_node_def nd
on nd.node_def_seq = n.node_def_seq
left outer join dv_node_class nc
on nc.node_class_seq = nd.node_class_seq
left outer join v_dv_data_logger vddl
on vddl.data_logger_seq = n.data_logger_seq
