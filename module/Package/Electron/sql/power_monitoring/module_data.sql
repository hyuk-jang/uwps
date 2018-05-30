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

-- 테이블 power_monitoring.module_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `module_data` (
  `module_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 데이터 시퀀스',
  `writedate` datetime NOT NULL COMMENT '등록일',
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `amp` int(11) NOT NULL COMMENT '10:1 Scale',
  `vol` int(11) NOT NULL COMMENT '10:1 Scale',
  `upsas_seq` mediumint(9) DEFAULT NULL COMMENT 'UPSAS 시퀀스',
  PRIMARY KEY (`module_data_seq`,`writedate`),
  KEY `FK_relation_upms_TO_module_data` (`photovoltaic_seq`,`upsas_seq`),
  CONSTRAINT `FK_relation_upms_TO_module_data` FOREIGN KEY (`photovoltaic_seq`, `upsas_seq`) REFERENCES `relation_upms` (`photovoltaic_seq`, `upsas_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='접속반에서 측정된 데이터';

-- 테이블 데이터 power_monitoring.module_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `module_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_data` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
