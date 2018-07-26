

select 
		CONCAT(dld.target_prefix, "_", dl.main_seq, "_", dl.target_code) AS dl_real_id,
		CONCAT(dld.target_prefix, "_", dl.target_code) AS dl_id,
		dld.target_alias,
		m.name AS m_name,
		dl.*
 from dv_data_logger dl
join dv_data_logger_def dld
on dld.data_logger_def_seq = dl.data_logger_def_seq
JOIN main m
on m.main_seq = dl.main_seq