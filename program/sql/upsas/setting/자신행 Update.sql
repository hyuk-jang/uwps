UPDATE dv_data_logger
	SET
		connect_info= CONCAT('{"id":"', serial_number, '","type":"socket","subType":"parser","baudRate":9600,"port":9000,"addConfigInfo":{"parser":"delimiterParser","option":"}}"}}')