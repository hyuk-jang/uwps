

select 
		CONCAT(sdlf.target_prefix, "_", sdl.main_seq, "_", sdl.target_code) AS sdl_real_id,
		CONCAT(sdlf.target_prefix, "_", sdl.target_code) AS sdl_id,
		sdlf.target_alias,
		m.name AS m_name,
		sdl.*
 from sensor_data_logger sdl
join sensor_data_logger_def sdlf
on sdlf.sensor_data_logger_def_seq = sdl.sensor_data_logger_def_seq
JOIN main m
on m.main_seq = sdl.main_seq