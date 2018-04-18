
      SELECT
        DATE_FORMAT(writedate,"%H:%i") AS view_date,
        DATE_FORMAT(writedate,"%Y-%m-%d %H:%i") AS group_date,
          ROUND(AVG(avg_sm_infrared), 1) AS avg_sm_infrared,
          ROUND(AVG(avg_temp), 1) AS avg_temp,
          ROUND(AVG(avg_reh), 1) AS avg_reh,
          ROUND(AVG(avg_solar), 0) AS avg_solar,
          ROUND(SUM(interval_solar), 1) AS total_interval_solar,
          ROUND(AVG(avg_wd), 0) AS avg_wd,
          ROUND(AVG(avg_ws), 1) AS avg_ws,
          ROUND(AVG(avg_uv), 0) AS avg_uv
      FROM
        (SELECT
          writedate,
          AVG(sm_infrared) AS avg_sm_infrared,
          AVG(temp) AS avg_temp,
          AVG(reh) AS avg_reh,
          AVG(solar) AS avg_solar,
          AVG(solar) / 60 AS interval_solar,
          AVG(wd) AS avg_wd,
          AVG(ws) AS avg_ws,
          AVG(uv) AS avg_uv,
          COUNT(*) AS first_count
        FROM weather_device_data
        WHERE writedate>= "2018-04-17 00:00:00" and writedate<"2018-04-18 00:00:00"
        AND DATE_FORMAT(writedate, '%H') > '05' AND DATE_FORMAT(writedate, '%H') < '21'
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H:%i")) AS result_wdd
     GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H:%i")
