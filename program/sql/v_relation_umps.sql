
SELECT 
	pt.*, 
	cs.connector_seq, cs.channel, 
	sb.target_name AS saltern_block_name,
      CONCAT("ch_",cs.channel) AS t_channel,
      (SELECT target_name FROM connector WHERE connector_seq=cs.connector_seq) AS connector_name

      FROM photovoltaic pt
      LEFT JOIN saltern_block sb
      	ON sb.saltern_block_seq = pt.saltern_block_seq
      ,connector_structure cs
      WHERE pt.photovoltaic_seq=cs.photovoltaic_seq  ORDER BY connector_seq,cs.channel