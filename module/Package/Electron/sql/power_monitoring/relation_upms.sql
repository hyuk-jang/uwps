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

-- 테이블 power_monitoring.relation_upms 구조 내보내기
CREATE TABLE IF NOT EXISTS `relation_upms` (
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `upsas_seq` mediumint(9) NOT NULL COMMENT 'UPSAS 시퀀스',
  `connector_seq` mediumint(9) DEFAULT NULL COMMENT '접속반 정보 시퀀스',
  `inverter_seq` mediumint(9) DEFAULT NULL COMMENT '인버터 정보 시퀀스',
  `connector_ch` tinyint(4) DEFAULT NULL COMMENT '접속반 연결 채널',
  PRIMARY KEY (`photovoltaic_seq`,`upsas_seq`),
  KEY `FK_inverter_TO_relation_upms` (`inverter_seq`),
  KEY `FK_connector_TO_relation_upms` (`connector_seq`),
  KEY `FK_upsas_TO_relation_upms` (`upsas_seq`),
  CONSTRAINT `FK_connector_TO_relation_upms` FOREIGN KEY (`connector_seq`) REFERENCES `connector` (`connector_seq`),
  CONSTRAINT `FK_inverter_TO_relation_upms` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`),
  CONSTRAINT `FK_photovoltaic_TO_relation_upms` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`),
  CONSTRAINT `FK_upsas_TO_relation_upms` FOREIGN KEY (`upsas_seq`) REFERENCES `upsas` (`upsas_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='태양광 모니터링 관계';

-- 테이블 데이터 power_monitoring.relation_upms:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `relation_upms` DISABLE KEYS */;
INSERT INTO `relation_upms` (`photovoltaic_seq`, `upsas_seq`, `connector_seq`, `inverter_seq`, `connector_ch`) VALUES
	(1, 1, NULL, 1, NULL);
/*!40000 ALTER TABLE `relation_upms` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
