-- --------------------------------------------------------
-- 호스트:                          localhost
-- 서버 버전:                        10.1.22-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- pv_led 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `pv_led` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `pv_led`;

-- 테이블 pv_led.inverter 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter` (
  `inverter_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 정보 시퀀스',
  `target_id` varchar(30) NOT NULL COMMENT '인버터 id',
  `target_name` varchar(20) NOT NULL COMMENT '인버터 명',
  `target_category` varchar(30) NOT NULL COMMENT '장치 카테고리',
  `protocol_info` longtext COMMENT '장치 프로토콜 정보',
  `connect_info` longtext COMMENT '접속 정보',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `amount` float NOT NULL COMMENT '단위: Wh (10:1 Scale)',
  `director_name` varchar(20) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  `chart_color` varchar(20) DEFAULT NULL COMMENT '차트 라인 색상',
  `chart_sort_rank` tinyint(4) DEFAULT NULL COMMENT '차트 정렬 우선 순위',
  PRIMARY KEY (`inverter_seq`),
  UNIQUE KEY `UIX_inverter` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='인버터 장치 상세 정보';

-- 테이블 데이터 pv_led.inverter:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter` DISABLE KEYS */;
INSERT INTO `inverter` (`inverter_seq`, `target_id`, `target_name`, `target_category`, `protocol_info`, `connect_info`, `code`, `amount`, `director_name`, `director_tel`, `chart_color`, `chart_sort_rank`) VALUES
	(1, 'PCS_001', '600W 급', 'PCS', '{"mainCategory":"ess","subCategory":"das_pv_led","deviceId":"000","protocolOptionInfo":{"hasTrackingData":true},"option":{"isUseKw":false}}', '{"type":"serial","baudRate":9600,"port":"COM4"}', '123', 6000, '에스엠소프트', '061-285-3411', 'black', 1),
	(2, 'PCS_002', '3.3 kW 급', 'PCS', '{"mainCategory":"ess","subCategory":"das_pv_led","deviceId":"002","protocolOptionInfo":{"hasTrackingData":true},"option":{"isUseKw":true}}', '{"type":"serial","baudRate":9600,"port":"COM4"}', '234', 33000, '에스엠소프트', '061-285-3411', 'red', 2);
/*!40000 ALTER TABLE `inverter` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
