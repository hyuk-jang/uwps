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

-- 테이블 power_monitoring.photovoltaic 구조 내보내기
CREATE TABLE IF NOT EXISTS `photovoltaic` (
  `photovoltaic_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '모듈 세부 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '모듈 id',
  `target_name` varchar(20) NOT NULL COMMENT '모듈 명',
  `install_place` varchar(50) NOT NULL COMMENT '설치장소',
  `module_type` enum('normal','g2g') NOT NULL COMMENT '모듈 타입',
  `compose_count` tinyint(4) NOT NULL COMMENT '직렬구성 개수',
  `amount` float NOT NULL COMMENT '단위: kW (10:1 Scale)',
  `manufacturer` varchar(20) NOT NULL COMMENT '제조사',
  PRIMARY KEY (`photovoltaic_seq`),
  UNIQUE KEY `UIX_photovoltaic` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='수중 태양광 모듈 상세 정보';

-- 테이블 데이터 power_monitoring.photovoltaic:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `photovoltaic` DISABLE KEYS */;
INSERT INTO `photovoltaic` (`photovoltaic_seq`, `target_id`, `target_name`, `install_place`, `module_type`, `compose_count`, `amount`, `manufacturer`) VALUES
	(1, 'PV_001', '모듈 1', '청주 농장', 'normal', 6, 55000, '모듈 회사');
/*!40000 ALTER TABLE `photovoltaic` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
