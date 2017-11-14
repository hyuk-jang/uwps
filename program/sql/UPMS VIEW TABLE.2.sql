SET @except_inverter_seq = (SELECT REPLACE(GROUP_CONCAT(COLUMN_NAME), 'inverter_seq,', '') FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'inverter_data' AND TABLE_SCHEMA = 'spcs');


SET @fullQuery = CONCAT(
	'SELECT inverter.*, ', 
	@except_inverter_seq,
	' FROM inverter_data',
	' LEFT JOIN inverter
		ON inverter.inverter_seq = inverter_data.inverter_seq
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)
');

PREPARE stmt1 FROM @fullQuery;
EXECUTE stmt1;
DROP PREPARE stmt1;