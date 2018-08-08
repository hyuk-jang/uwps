SELECT 
          p.place_seq, p.place_def_seq, pc.place_class_seq,
          CASE
          WHEN LENGTH(p.target_code) > 0
            THEN CONCAT(pd.target_prefix, "_", p.target_code)
          ELSE 
            CONCAT(pd.target_prefix)
          END AS place_id,
          CASE
          WHEN LENGTH(p.target_code) > 0
            THEN CONCAT(pd.target_name, " ", p.target_code)
          ELSE 
            CONCAT(pd.target_name)
          END AS place_name,          
          p.depth,
          p.place_info,
          p.target_code AS p_target_code,
          pd.target_prefix AS pd_target_prefix,          
          pd.target_id AS pd_target_id,
          pd.target_name AS pd_target_name,
          pc.target_id AS pc_target_id, pc.target_name AS pc_target_name, pc.description AS pc_description
  FROM dv_place p
 JOIN dv_place_def pd
  ON pd.place_def_seq = p.place_def_seq
 JOIN dv_place_class pc
  ON pc.place_class_seq = pd.place_class_seq