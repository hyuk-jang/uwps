-- --------------------------------------------------------
-- 호스트:                          121.178.26.59
-- 서버 버전:                        5.5.35-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.4.0.5184
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- upsas 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `upsas` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `upsas`;

-- 테이블 upsas.inverter_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter_trouble_data` (
  `inverter_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 문제 이력 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT 'isError',
  `trouble_code` varchar(100) DEFAULT NULL COMMENT '고장 code',
  `trouble_msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_msg` varchar(100) DEFAULT NULL COMMENT '해결 내용',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`inverter_trouble_data_seq`,`inverter_seq`),
  KEY `FK_inverter_TO_inverter_trouble_data` (`inverter_seq`),
  CONSTRAINT `FK_inverter_TO_inverter_trouble_data` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 upsas.inverter_trouble_data:~1 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter_trouble_data` DISABLE KEYS */;
INSERT INTO `inverter_trouble_data` (`inverter_trouble_data_seq`, `inverter_seq`, `is_error`, `trouble_code`, `trouble_msg`, `occur_date`, `fix_msg`, `fix_date`) VALUES
	(1, 1, 1, 'Soloar Cell OV Fault', '태양전지 과전압', '2017-11-09 15:05:48', NULL, '2017-11-11 07:06:01'),
	(2, 3, 1, 'Solar Cell OV limit fault', '태양전지 과전압 제한초과', '2017-11-10 10:01:52', NULL, '2017-11-10 15:01:52'),
	(3, 4, 1, 'Solar Cell UV fault', '태양전지 저전압 (변압기 type Only)', '2017-11-07 10:11:42', NULL, '2017-11-15 15:11:42'),
	(4, 5, 1, 'Solar Cell UV limit fault', '태양전지 저전압 제한초과', '2017-11-13 14:56:49', NULL, '2017-11-23 15:02:30'),
	(5, 5, 1, 'Inverter over current fault', '인버터 과 전류', '2017-11-13 18:07:50', NULL, '2017-11-24 17:06:30'),
	(6, 6, 1, 'Inverter O.C. overtime fault', '인버터 과 전류 시간 초과', '2017-11-12 15:53:27', NULL, '2017-11-28 10:53:26'),
	(7, 4, 1, 'inverter-Line async fault', '계통-인버터 위상 이상', '2017-11-15 16:10:41', NULL, '2017-11-17 16:04:32'),
	(8, 4, 1, 'inverter fuse open', '인버터 퓨즈 단선', '2017-11-18 09:05:49', NULL, '2017-11-21 08:00:29'),
	(9, 4, 1, 'inverter over temperature fault', '인버터 과열', '2017-11-21 17:03:56', NULL, '2017-12-02 13:06:36'),
	(10, 4, 1, 'inverter MC fault', '인버터 MC 이상', '2017-11-11 21:14:24', NULL, '2017-11-22 10:59:28'),
	(11, 1, 1, 'Line over voltage fault', '계통 고 전압', '2017-11-14 18:07:49', NULL, '2017-11-16 13:04:30'),
	(12, 2, 1, 'Line under voltage fault', '계통 저 전압', '2017-11-27 13:13:33', NULL, '2017-11-27 15:05:30'),
	(13, 3, 1, 'Line failure fault', '계통 정전', '2017-11-25 20:11:51', NULL, '2017-12-02 14:05:32'),
	(14, 2, 1, 'Line failure fault', '계통 과 주파수', '2017-12-04 17:03:48', NULL, NULL),
	(15, 3, 1, 'Line under frequency fault', '계통 저 주파수', '2017-12-08 15:02:30', NULL, '2017-12-14 14:05:32'),
	(16, 2, 1, 'Line failure fault', '태양전지 저전압 제한초과', '2017-11-18 09:05:49', NULL, '2017-11-19 13:04:30'),
	(17, 2, 1, 'Inverter O.C. overtime fault', '인버터 과열', '2017-11-15 16:10:41', NULL, '2017-11-21 08:00:29'),
	(18, 4, 1, 'Inverter O.C. overtime fault', '계통-인버터 위상 이상', '2017-11-18 09:05:49', NULL, '2017-11-21 08:00:29'),
	(19, 5, 1, 'Inverter O.C. overtime fault', '태양전지 저전압 제한초과', '2017-11-14 18:07:49', NULL, '2017-11-16 16:01:52'),
	(20, 1, 1, 'Line failure fault', '태양전지 저전압 (변압기 type Only)', '2017-11-18 09:05:49', NULL, '2017-11-21 13:04:30'),
	(21, 5, 1, 'Inverter O.C. overtime fault', '인버터 과 전류 시간 초과', '2017-11-14 18:07:49', NULL, '2017-11-16 13:04:30'),
	(22, 2, 1, 'Inverter O.C. overtime fault', '계통-인버터 위상 이상', '2017-11-25 20:11:51', NULL, '2017-12-09 16:03:31'),
	(23, 6, 1, 'Line failure fault', '계통 고 전압', '2017-11-18 09:05:49', NULL, NULL),
	(24, 6, 1, 'Inverter O.C. overtime fault', '태양전지 과전압 제한초과', '2017-11-13 18:07:50', NULL, '2017-11-13 20:01:52'),
	(25, 6, 1, 'Inverter O.C. overtime fault', '계통 고 전압', '2017-11-12 15:53:27', NULL, '2017-11-21 08:00:29'),
	(26, 5, 1, 'Inverter O.C. overtime fault', '태양전지 과전압 제한초과', '2017-12-04 17:03:48', NULL, '2017-12-09 16:03:31');
/*!40000 ALTER TABLE `inverter_trouble_data` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
