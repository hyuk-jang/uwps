SELECT 
			sd.sensor_data_seq, sd.node_seq, sd.num_data,
			dn.data_unit, sd.writedate,
			dn.node_id, dn.node_real_id, dn.node_name,
			dn.dl_real_id, dn.dl_id, dn.dl_name
  FROM dv_sensor_data sd
 JOIN v_dv_node dn
  ON dn.node_seq = sd.node_seq
			
