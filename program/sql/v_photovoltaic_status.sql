
SELECT 
	pt.*, 
	cs.connector_seq, cs.channel, 
	sb.target_name AS saltern_block_name,
      CONCAT("ch_",cs.channel) AS t_channel,
      (SELECT target_name FROM connector WHERE connector_seq=cs.connector_seq) AS connector_name,
      CASE 
      	WHEN cs.channel = 1
      	THEN ROUND((SELECT ch_1 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1) / 10, 1)
			WHEN cs.channel = 2
      	THEN ROUND((SELECT ch_2 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1) / 10, 1)
			WHEN cs.channel = 3
      	THEN ROUND((SELECT ch_3 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1) / 10, 1)
			WHEN cs.channel = 4
      	THEN ROUND((SELECT ch_4 FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1) / 10, 1)
      END AS  amp,
      ROUND((SELECT v FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1) / 10, 1) AS vol,
      CASE 
      	WHEN cs.channel = 1
      	THEN (SELECT writedate FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
			WHEN cs.channel = 2
      	THEN (SELECT writedate FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
			WHEN cs.channel = 3
      	THEN (SELECT writedate FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
			WHEN cs.channel = 4
      	THEN (SELECT writedate FROM connector_data WHERE connector_seq = cs.connector_seq ORDER BY connector_data.connector_data_seq DESC LIMIT 1)
      END AS writedate
      
      FROM photovoltaic pt
      LEFT JOIN saltern_block sb
      	ON sb.saltern_block_seq = pt.saltern_block_seq
      ,connector_structure cs
      
      
       WHERE pt.photovoltaic_seq=cs.photovoltaic_seq  ORDER BY connector_seq,cs.channel