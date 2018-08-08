

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
			CASE
          WHEN dnc.is_sensor = 0
            THEN r_ddd.str_data
          ELSE 
            r_dsd.num_data
          END AS node_data,
			CASE
          WHEN dnc.is_sensor = 0
            THEN r_ddd.writedate
          ELSE 
            r_dsd.writedate
          END AS writedate,          
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
 LEFT OUTER JOIN 
 (
	  SELECT 
	  			dsd.node_seq,
	  			dsd.num_data,
	  			dsd.writedate
		FROM dv_sensor_data dsd
		INNER JOIN
		(
			SELECT MAX(sensor_data_seq) AS sensor_data_seq
			 FROM dv_sensor_data
			 GROUP BY node_seq
		) temp
		 ON dsd.sensor_data_seq = temp.sensor_data_seq
 ) r_dsd
  ON r_dsd.node_seq = dn.node_seq
 LEFT OUTER JOIN 
 (
	  SELECT 
	  			ddd.node_seq,
	  			ddd.str_data,
	  			ddd.writedate
		FROM dv_device_data ddd
		INNER JOIN
		(
			SELECT MAX(device_data_seq) AS device_data_seq
			 FROM dv_device_data
			 GROUP BY node_seq
		) temp
		 ON ddd.device_data_seq = temp.device_data_seq
 ) r_ddd
  ON r_ddd.node_seq = dn.node_seq