

select 
		node.node_seq, CONCAT(nd.target_prefix, "_", vdl.main_seq, "_", node.target_code) AS node_real_id, CONCAT(nd.target_prefix, "_", node.target_code) AS node_id, node.target_code, node.data_logger_index, 
		vdl.dl_real_id, vdl.dl_id,
		nd.target_prefix AS nd_target_prefix, nd.target_id AS nd_target_id, nd.target_name AS nd_target_name,
		nc.target_id AS nc_target_id, nc.is_sensor AS nc_is_sensor, nc.target_name AS nc_target_name, nc.data_unit AS nc_data_unit, nc.description AS nc_description,
 		vdl.m_name,
		nd.node_def_seq, nd.node_class_seq, vdl.main_seq, vdl.data_logger_seq, vdl.data_logger_def_seq
		
from node
left outer join node_def nd
on nd.node_def_seq = node.node_def_seq
left outer join node_class nc
on nc.node_class_seq = nd.node_class_seq
left outer join v_data_logger vdl
on vdl.data_logger_seq = node.data_logger_seq
