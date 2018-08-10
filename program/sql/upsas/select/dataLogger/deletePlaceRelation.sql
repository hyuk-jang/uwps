

DELETE
			dpr
  FROM dv_place_relation dpr
 JOIN dv_node dn
  ON dn.node_seq = dpr.node_seq
 JOIN dv_data_logger ddl
  ON ddl.data_logger_seq = dn.data_logger_seq
WHERE ddl.main_seq = 1