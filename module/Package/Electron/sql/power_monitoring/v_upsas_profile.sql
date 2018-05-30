-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        10.2.6-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- 뷰 power_monitoring.v_upsas_profile 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_upsas_profile`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` VIEW `v_upsas_profile` AS SELECT 
	ru.connector_ch,
	cnt.connector_seq, cnt.target_id AS cnt_target_id, cnt.target_category AS cnt_target_category, cnt.target_name AS cnt_target_name, cnt.code AS cnt_code, cnt.director_name AS cnt_director_name, cnt.director_tel AS cnt_director_tel,
	ivt.inverter_seq, ivt.target_id AS ivt_target_id, ivt.target_name AS ivt_target_name, ivt.target_category AS ivt_target_category, ivt.code AS ivt_code, ivt.amount AS ivt_amount, ivt.director_name AS ivt_director_name, ivt.director_tel AS ivt_director_tel,
	(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number
	FROM
	relation_upms ru
	LEFT JOIN inverter ivt
      	ON ivt.inverter_seq = ru.inverter_seq      	
	LEFT JOIN connector cnt
		ON cnt.connector_seq = ru.connector_seq      	
ORDER BY ivt.chart_sort_rank ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
