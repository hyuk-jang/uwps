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

-- 테이블 power_monitoring.connector_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `connector_trouble_data` (
  `connector_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 문제 이력 시퀀스',
  `connector_seq` mediumint(9) NOT NULL COMMENT '접속반 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT '고장 여부',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 코드',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`connector_trouble_data_seq`,`connector_seq`),
  KEY `FK_connector_TO_connector_trouble_data` (`connector_seq`),
  CONSTRAINT `FK_connector_TO_connector_trouble_data` FOREIGN KEY (`connector_seq`) REFERENCES `connector` (`connector_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 power_monitoring.connector_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `connector_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `connector_trouble_data` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
