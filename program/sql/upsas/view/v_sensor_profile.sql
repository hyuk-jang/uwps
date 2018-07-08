

select 
		sen.sensor_seq, CONCAT(sd.target_prefix, "_", vdl.main_seq, "_", sen.target_code) AS sensor_real_id, CONCAT(sd.target_prefix, "_", sen.target_code) AS sensor_id, sen.target_code, sen.data_logger_index, sen.serial_number,
		vdl.sdl_real_id, vdl.sdl_id,
		sd.target_prefix AS sd_target_prefix, sd.target_alias AS sd_target_alias, sd.purpose_use AS sd_purpose_use,
		sc.target_id AS sc_target_id, sc.target_name AS sc_target_name, sc.data_unit AS sc_data_unit, sc.description AS sc_description,
 		vdl.m_name,
		sd.sensor_def_seq, sd.sensor_class_seq, vdl.main_seq, vdl.sensor_data_logger_seq, vdl.sensor_data_logger_def_seq
		
from SENSOR sen
left outer join sensor_def sd
on sd.sensor_def_seq = sen.sensor_def_seq
left outer join sensor_class sc
on sc.sensor_class_seq = sd.sensor_class_seq
left outer join v_data_logger vdl
on vdl.sensor_data_logger_seq = sen.sensor_data_logger_seq
