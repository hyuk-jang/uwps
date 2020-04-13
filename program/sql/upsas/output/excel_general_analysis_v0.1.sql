
    SELECT
            power_tbl.inverter_seq, power_tbl.target_id, power_tbl.target_name, power_tbl.target_category, power_tbl.install_place, power_tbl.serial_number,
            power_tbl.group_date, power_tbl.t_amount, power_tbl.t_power_kw, power_tbl.avg_power_eff, power_tbl.peak_power_eff, power_tbl.t_interval_power_cp_kwh, power_tbl.t_interval_power_eff,
            saltern_tbl.avg_water_level, saltern_tbl.avg_salinity, saltern_tbl.avg_module_rear_temp,
            saltern_tbl.module_efficiency, saltern_tbl.module_square, saltern_tbl.module_power, saltern_tbl.module_count,
            wdd_tbl.avg_temp, wdd_tbl.avg_reh, wdd_tbl.avg_horizontal_solar, wdd_tbl.total_horizontal_solar,
            wdd_tbl.avg_inclined_solar, wdd_tbl.total_inclined_solar, wdd_tbl.avg_ws, wdd_tbl.avg_uv
    FROM
      (
        SELECT
              inverter_seq, target_id, target_name, serial_number, target_category, install_place, chart_sort_rank,
              SUM(amount) t_amount,
              SUM(avg_power_kw) AS t_power_kw,
              SUM(avg_power_kw) / SUM(amount) * 100 AS avg_power_eff,
              MAX(peak_power_eff) AS peak_power_eff,
              SUM(interval_power_cp_kwh) AS t_interval_power_cp_kwh,
              SUM(interval_power_cp_kwh) / SUM(amount) * 100 AS t_interval_power_eff,
              group_date
        FROM
          (
            SELECT
                  inv_tbl.inverter_seq, target_id, target_name, serial_number, target_category, install_place, amount, chart_sort_rank,
                  inv_data.writedate,
                  AVG(inv_data.power_kw) AS avg_power_kw,
                  ROUND(MAX(inv_data.power_kw) / amount * 100, 3) AS peak_power_eff,
                  MAX(inv_data.power_cp_kwh) - MIN(inv_data.power_cp_kwh) AS interval_power_cp_kwh,
                  DATE_FORMAT(writedate,"%H:%i") AS view_date,
                  DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date
            FROM pw_inverter_data inv_data
            JOIN
              (
                  SELECT
                      rp.main_seq,
                      inv.*
                  FROM pw_relation_power rp
                  JOIN pw_inverter inv
                  ON inv.inverter_seq = rp.inverter_seq
                  WHERE rp.main_seq = 1
              ) inv_tbl
            ON inv_tbl.inverter_seq = inv_data.inverter_seq
            WHERE writedate>= "2020-03-25 00:00" 
             AND writedate<"2020-03-26 00:00"
             AND inv_data.inverter_seq IN (inv_tbl.inverter_seq)
            GROUP BY inverter_seq, group_date
          ) final
        GROUP BY inverter_seq, group_date
      ) power_tbl
    LEFT JOIN 
      (
        SELECT
            sub_tbl.main_seq,
            ssd.place_seq, sub_tbl.inverter_seq,
            module_efficiency, module_square, module_power, module_count,
            ROUND(AVG(ssd.water_level), 2)  AS avg_water_level,
            ROUND(AVG(ssd.salinity), 2) AS avg_salinity,
            ROUND(AVG(ssd.module_rear_temp), 2) AS avg_module_rear_temp,
            ROUND(AVG(ssd.brine_temp), 2) AS avg_brine_temp,
            DATE_FORMAT(writedate,"%H:%i") AS view_date,
            DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date
        FROM saltern_sensor_data ssd
        JOIN
          (
            SELECT
                  rp.main_seq,
                  sr.place_seq, sr.inverter_seq,
                  SUM(sr.module_max_power) / SUM(sr.module_square) / 10 AS module_efficiency,
                  AVG(sr.module_square) * SUM(sr.module_count) AS module_square,
                  SUM(sr.module_max_power) / SUM(sr.module_square) / 10 * AVG(sr.module_square) * SUM(sr.module_count) / 100 AS module_power,
                  SUM(sr.module_count) AS module_count
            FROM seb_relation sr
            JOIN pw_relation_power rp
            ON rp.inverter_seq = sr.inverter_seq
            JOIN pw_inverter inv
            ON inv.inverter_seq = sr.inverter_seq
            JOIN main
            ON main.main_seq = rp.main_seq
            GROUP BY sr.inverter_seq
          ) sub_tbl
        ON sub_tbl.place_seq = ssd.place_seq
        WHERE writedate>= "2020-03-25 00:00" and writedate<"2020-03-26 00:00"
          AND ssd.place_seq IN (sub_tbl.place_seq)
        GROUP BY sub_tbl.inverter_seq, group_date
      ) saltern_tbl
    ON power_tbl.inverter_seq = saltern_tbl.inverter_seq AND power_tbl.group_date = saltern_tbl.group_date
    LEFT JOIN
      (
        SELECT
              main_seq,
              DATE_FORMAT(writedate,"%Y-%m-%d %H") AS group_date,
              ROUND(AVG(avg_sm_infrared), 2) AS avg_sm_infrared,
              ROUND(AVG(avg_temp), 2) AS avg_temp,
              ROUND(AVG(avg_reh), 2) AS avg_reh,
              ROUND(AVG(avg_horizontal_solar), 2) AS avg_horizontal_solar,
              ROUND(SUM(avg_horizontal_solar), 2) AS total_horizontal_solar,
              ROUND(AVG(avg_inclined_solar), 2) AS avg_inclined_solar,
              ROUND(SUM(avg_inclined_solar) * 1.17, 2) AS total_inclined_solar,
              ROUND(AVG(avg_wd), 0) AS avg_wd,
              ROUND(AVG(avg_ws), 2) AS avg_ws,
              ROUND(AVG(avg_uv), 0) AS avg_uv
        FROM
          (
            SELECT
                  writedate,
                  main_seq,
                  AVG(sm_infrared) AS avg_sm_infrared,
                  AVG(temp) AS avg_temp,
                  AVG(reh) AS avg_reh,
                  AVG(solar) AS avg_horizontal_solar,
                  AVG(inclined_solar) AS avg_inclined_solar,
                  AVG(wd) AS avg_wd,
                  AVG(ws) AS avg_ws,
                  AVG(uv) AS avg_uv,
                  COUNT(*) AS first_count
            FROM weather_device_data
            WHERE writedate>= "2020-03-25 00:00" and writedate<"2020-03-26 00:00"
            GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), main_seq
          ) AS result_wdd
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), main_seq
      ) wdd_tbl
    ON wdd_tbl.group_date = saltern_tbl.group_date AND wdd_tbl.main_seq = saltern_tbl.main_seq
    ORDER BY power_tbl.inverter_seq, power_tbl.group_date 


    
