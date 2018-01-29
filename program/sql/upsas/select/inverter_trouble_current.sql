SELECT o.*
FROM inverter_trouble_data o                    
  LEFT JOIN inverter_trouble_data b             
      ON o.inverter_seq = b.inverter_seq AND o.code = b.code AND o.inverter_trouble_data_seq < b.inverter_trouble_data_seq 
WHERE b.inverter_trouble_data_seq is NULL AND o.fix_date is NULL
ORDER BY o.inverter_trouble_data_seq ASC