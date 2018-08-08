

SELECT 
			dpr.*,
			vdn.node_id, vdn.node_name, 
			vddl.dl_id, vddl.dl_name,
			vdp.place_id, vdp.place_name,
			vdp.dpd_target_name, 
			vdn.dnc_target_name, vdn.dnd_target_name, vdn.is_sensor,
			vddl.serial_number
			
  FROM dv_place_relation dpr
 JOIN v_dv_place vdp
  ON vdp.place_seq = dpr.place_seq
 JOIN v_dv_node vdn
  ON vdn.node_seq = dpr.node_seq
 JOIN v_dv_data_logger vddl
  ON vddl.data_logger_seq = vdn.data_logger_seq
