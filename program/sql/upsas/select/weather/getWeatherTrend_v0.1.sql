

SELECT
	ROUND(AVG(sm_infrared), 1) AS avg_sm_infrared,
	ROUND(AVG(temp), 1) AS avg_temp,
	ROUND(AVG(solar), 0) AS avg_solar,
	ROUND(AVG(ws), 1) AS avg_ws,	
	ROUND(AVG(uv), 0) AS avg_uv
 FROM weather_device_data
GROUP BY LEFT(DATE_FORMAT(writedate, "%Y-%m-%d %H:%i"), 15)

 