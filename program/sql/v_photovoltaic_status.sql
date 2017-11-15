
SELECT pt.*, cs.connector_seq, cs.channel,
      CONCAT("ch_",cs.channel) AS t_channel,
      (SELECT target_name FROM connector WHERE connector_seq=cs.connector_seq) AS con_name,
      CASE 
      	WHEN cs.channel = 1
      	THEN (SELECT ch_1 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
			WHEN cs.channel = 2
      	THEN (SELECT ch_2 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
			WHEN cs.channel = 3
      	THEN (SELECT ch_3 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
			WHEN cs.channel = 4
      	THEN (SELECT ch_4 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
      END AS amp,
      (SELECT v FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1) AS vol
      FROM photovoltaic pt ,connector_structure cs
       WHERE pt.photovoltaic_seq=cs.photovoltaic_seq  ORDER BY connector_seq,cs.channel