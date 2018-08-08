

SELECT
			dn.node_seq, 
			dnd.node_def_seq,
			dnc.node_class_seq,
			dn.data_logger_seq,
			CASE
          WHEN LENGTH(dn.target_code) > 0
            THEN CONCAT(dnd.target_prefix, "_", dn.target_code)
          ELSE 
            CONCAT(dnd.target_prefix)
          END AS node_id,
			CASE
          WHEN LENGTH(dn.target_code) > 0
            THEN CONCAT(dnd.target_name, " ", dn.target_code)
          ELSE 
            CONCAT(dnd.target_name)
          END AS node_name,
         dnc.data_unit, dnc.is_sensor, dn.data_logger_index,
  			dn.target_code AS dn_target_code,
			dnc.target_id AS dnc_target_id, 
			dnc.target_name AS dnc_target_name,
			dnc.description AS dnc_description,
			dnd.target_id AS dnd_target_id,
			dnd.target_name AS dnd_target_name,
			dnd.target_prefix AS dnd_target_prefix,
			dnd.description AS dnd_description
  FROM dv_node dn
 JOIN dv_node_def dnd
  ON dnd.node_def_seq = dn.node_def_seq
 JOIN dv_node_class dnc
  ON dnc.node_class_seq = dnd.node_class_seq
