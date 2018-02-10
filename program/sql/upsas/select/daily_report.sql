select DATE_FORMAT(writedate,"%H:%i")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w
       from inverter_data
       WHERE writedate>= "2018-01-10 00:00:00" and writedate<"2018-01-10 14:18:56"
       group by DATE_FORMAT(writedate,'%Y-%m-%d %H')