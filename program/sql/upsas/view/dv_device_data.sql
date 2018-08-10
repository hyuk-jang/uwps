SELECT 
			dd.device_data_seq, dd.node_seq, dd.str_data,
			dn.data_unit, dd.writedate,
			dn.node_id, dn.node_real_id, dn.node_name,
			dn.dl_real_id, dn.dl_id, dn.dl_name
  FROM dv_device_data dd
 JOIN v_dv_node dn
  ON dn.node_seq = dd.node_seq
			
