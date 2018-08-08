

select 
			dl.data_logger_seq, dld.data_logger_def_seq, dl.main_seq,
			CASE
			 WHEN LENGTH(dl.target_code) > 0
			  THEN CONCAT(dld.target_prefix, "_", dl.main_seq, "_", dl.target_code)
			 ELSE 
			  CONCAT(dld.target_prefix, "_", dl.main_seq)
			END AS dl_real_id,
			CASE
			 WHEN LENGTH(dl.target_code) > 0
			  THEN CONCAT(dld.target_prefix, "_", dl.target_code)
			 ELSE 
			  CONCAT(dld.target_prefix)
			END AS dl_id,
			CASE
			 WHEN LENGTH(dl.target_code) > 0
			  THEN CONCAT(dld.target_name, " ", dl.target_code)
			 ELSE 
			  CONCAT(dld.target_prefix)
			END AS dl_name,			

		m.name AS m_name,
		dl.target_code AS dl_target_code,
		dld.target_name AS dld_target_name, dld.target_prefix AS dld_target_prefix,		
		dl.serial_number, dl.connect_info, dl.protocol_info
 from dv_data_logger dl
join dv_data_logger_def dld
on dld.data_logger_def_seq = dl.data_logger_def_seq
JOIN main m
on m.main_seq = dl.main_seq