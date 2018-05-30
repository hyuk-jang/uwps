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

-- 뷰 power_monitoring.v_inverter_status 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_inverter_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` VIEW `v_inverter_status` AS SELECT inverter.*, 
	inverter_data_seq,
	ROUND(in_a / 10, 1) AS in_a,
	ROUND(in_v / 10, 1) AS in_v,
	ROUND(in_w / 10, 1) AS in_w,
	ROUND(out_a / 10, 1) AS out_a,
	ROUND(out_v / 10, 1) AS out_v,
	ROUND(out_w / 10, 1) AS out_w,
	ROUND(p_f / 10, 1) AS p_f,
	ROUND(c_wh / 10, 1) AS c_wh,
	ROUND((c_wh - (SELECT MAX(c_wh) FROM inverter_data WHERE inverter_seq = id.inverter_seq AND writedate>= CURDATE() - 1 AND writedate< CURDATE())) / 10, 1) AS daily_power_wh,
	writedate,
	pv.amount AS pv_amount
	FROM inverter_data id
	LEFT JOIN inverter
		ON inverter.inverter_seq = id.inverter_seq
	LEFT JOIN relation_upms ru
		ON ru.inverter_seq = id.inverter_seq
	LEFT JOIN photovoltaic pv
		ON pv.photovoltaic_seq = ru.photovoltaic_seq
		
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)
	ORDER BY chart_sort_rank ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
