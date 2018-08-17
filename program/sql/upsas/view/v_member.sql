

SELECT
			mem.*,
			m.weather_location_seq, m.uuid AS main_uuid, m.name AS main_name, m.address AS main_address, m.is_deleted AS main_is_deleted,
			wl.province, wl.city, wl.town, wl.latitude, wl.longitude, wl.x, wl.y
  FROM member mem
 JOIN main m
  ON mem.main_seq = m.main_seq
 JOIN weather_location wl
  ON wl.weather_location_seq = m.weather_location_seq
