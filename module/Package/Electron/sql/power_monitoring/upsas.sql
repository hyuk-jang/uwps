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

-- 테이블 power_monitoring.upsas 구조 내보내기
CREATE TABLE IF NOT EXISTS `upsas` (
  `upsas_seq` mediumint(9) NOT NULL COMMENT 'UPSAS 시퀀스',
  `weather_location_seq` mediumint(9) DEFAULT NULL COMMENT '기상청 정보 위치 시퀀스',
  `name` varchar(20) DEFAULT NULL COMMENT 'UPSAS 이름',
  `address` varchar(100) DEFAULT NULL COMMENT '주소',
  `ip` varchar(16) DEFAULT NULL COMMENT '아이피',
  `push_port` varchar(8) DEFAULT NULL COMMENT '푸시포트',
  `cmd_port` varchar(8) DEFAULT NULL COMMENT '명령포트',
  `gcm_senderid` varchar(255) DEFAULT NULL COMMENT 'GCM_ID',
  `is_deleted` tinyint(4) DEFAULT NULL COMMENT '삭제여부',
  `writedate` datetime DEFAULT NULL COMMENT '생성일',
  `updatedate` timestamp NULL DEFAULT NULL COMMENT '수정일',
  PRIMARY KEY (`upsas_seq`),
  KEY `FK_weather_location_TO_upsas` (`weather_location_seq`),
  CONSTRAINT `FK_weather_location_TO_upsas` FOREIGN KEY (`weather_location_seq`) REFERENCES `weather_location` (`weather_location_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='현장에 설치되는 서버.	 장치들과의 통신, 모바일 App과의 통신, 통합서버와의 통신 등을 수행함.';

-- 테이블 데이터 power_monitoring.upsas:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `upsas` DISABLE KEYS */;
INSERT INTO `upsas` (`upsas_seq`, `weather_location_seq`, `name`, `address`, `ip`, `push_port`, `cmd_port`, `gcm_senderid`, `is_deleted`, `writedate`, `updatedate`) VALUES
	(1, 7084, '청주 모니터링', '청주시', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
/*!40000 ALTER TABLE `upsas` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
