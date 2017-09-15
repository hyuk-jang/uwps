

SELECT *, AVG(avgVoltage) as resVoltage, AVG(avgCurrent) as resCurrent, AVG(avgTemperature) as resTemperature, count(*) as resCount FROM
(
	
	SELECT *, AVG(voltage) as avgVoltage, AVG(current) as avgCurrent, AVG(temperature) as avgTemperature, DATE_FORMAT(main.sensing_time, '%Y-%m-%d %H:%i') as targetTime, count(*) as countNum
	FROM
		
		(select device_id, sensor_id, item, `status`, sensing_time,
			CASE
				WHEN item = "V"
				THEN sensing_value
				ELSE null
			END AS voltage,
			CASE
				WHEN item = "A"
				THEN sensing_value
				ELSE null
			END AS current,
			CASE
				WHEN item = "T"
				THEN sensing_value
				ELSE null
			END AS temperature
			FROM tns_device) main
		group by main.device_id, main.sensor_id, DATE_FORMAT(main.sensing_time, '%Y-%m-%d %H:%i')
		
) res
group by res.device_id, res.targetTime
		
