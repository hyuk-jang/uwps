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

-- 테이블 power_monitoring.connector 구조 내보내기
CREATE TABLE IF NOT EXISTS `connector` (
  `connector_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 정보 시퀀스',
  `target_id` varchar(30) NOT NULL COMMENT '접속반 id',
  `target_name` varchar(20) NOT NULL COMMENT '인버터 명',
  `target_category` varchar(30) DEFAULT NULL COMMENT '장치 카테고리',
  `connect_info` longtext DEFAULT NULL COMMENT '장치 접속 정보',
  `protocol_info` longtext DEFAULT NULL COMMENT '장치 프로토콜 정보',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `director_name` varchar(20) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  PRIMARY KEY (`connector_seq`),
  UNIQUE KEY `UIX_connector` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='접속반 상세 정보';

-- 테이블 데이터 power_monitoring.connector:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `connector` DISABLE KEYS */;
/*!40000 ALTER TABLE `connector` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
