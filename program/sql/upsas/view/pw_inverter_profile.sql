SELECT 
		ivt.*,
		rp.photovoltaic_seq, rp.connector_seq, rp.place_seq, rp.connector_ch,
		m.*
  FROM inverter ivt
 LEFT OUTER JOIN relation_power rp
  ON rp.inverter_seq = ivt.inverter_seq
 JOIN main m
  ON m.main_seq = rp.main_seq