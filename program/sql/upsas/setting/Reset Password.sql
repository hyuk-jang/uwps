use mysql
update user set password=PASSWORD('reaper83') WHERE user = 'root'
flush privileges

set password for 'root'@'localhost' = password('reaper83')
flush privileges