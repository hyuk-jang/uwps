-- --------------------------------------------------------
-- 호스트:                          121.178.26.59
-- 서버 버전:                        5.5.35-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- upsas 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `upsas` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `upsas`;

-- 테이블 upsas.brine_warehouse 구조 내보내기
CREATE TABLE IF NOT EXISTS `brine_warehouse` (
  `brine_warehouse_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '해주 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '해주 id',
  `target_type` enum('concentration','crystalizing') NOT NULL COMMENT '0: 증발지용, 1: 결정지용',
  `target_name` varchar(20) DEFAULT NULL COMMENT '해주 이름',
  `setting_salinity` int(11) NOT NULL COMMENT '설정 염도',
  `min_water_level` tinyint(4) NOT NULL COMMENT '최저 수위 레벨',
  `max_water_level` tinyint(4) NOT NULL COMMENT '최대 수위 레벨',
  `water_cm` varchar(10) NOT NULL COMMENT '단계별 실제 수위',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`brine_warehouse_seq`),
  UNIQUE KEY `UIX_brine_warehouse` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='해주';

-- 테이블 데이터 upsas.brine_warehouse:~3 rows (대략적) 내보내기
/*!40000 ALTER TABLE `brine_warehouse` DISABLE KEYS */;
INSERT INTO `brine_warehouse` (`brine_warehouse_seq`, `target_id`, `target_type`, `target_name`, `setting_salinity`, `min_water_level`, `max_water_level`, `water_cm`, `depth`) VALUES
	(1, 'WT1', 'concentration', '해주1', 5, 1, 4, '', -1),
	(2, 'WT2', 'concentration', '해주2', 15, 1, 4, '', -1),
	(3, 'WT3', 'concentration', '해주3', 20, 1, 4, '', -1);
/*!40000 ALTER TABLE `brine_warehouse` ENABLE KEYS */;

-- 테이블 upsas.connector 구조 내보내기
CREATE TABLE IF NOT EXISTS `connector` (
  `connector_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '접속반 id',
  `target_category` enum('modbus_tcp','modbus_rtu','modbus_ascii','dm_v1','dm_v2') DEFAULT NULL COMMENT '접속반 종류',
  `target_name` varchar(20) NOT NULL COMMENT '인버터 명',
  `dialing` varbinary(50) NOT NULL COMMENT 'connector 접속 국번(1byte): Modbus RTU 기준',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `host` char(16) DEFAULT NULL COMMENT 'host',
  `port` int(11) DEFAULT NULL COMMENT 'port',
  `baud_rate` int(11) DEFAULT NULL COMMENT 'baud_rate',
  `address` varbinary(10) NOT NULL COMMENT '메모리 주소( Hex Code로 변경하여 처리)',
  `director_name` varchar(20) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  PRIMARY KEY (`connector_seq`),
  UNIQUE KEY `UIX_connector` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='접속반 상세 정보';

-- 테이블 데이터 upsas.connector:~1 rows (대략적) 내보내기
/*!40000 ALTER TABLE `connector` DISABLE KEYS */;
INSERT INTO `connector` (`connector_seq`, `target_id`, `target_category`, `target_name`, `dialing`, `code`, `host`, `port`, `baud_rate`, `address`, `director_name`, `director_tel`) VALUES
	(1, 'CNT1', 'dm_v2', '접속반 1', '\0\0', '324f78ff-452c-4a46-844a-ffe47defc1f7', 'localhost', NULL, 9600, '\0\0', '에스엠관리자', '01012345678');
/*!40000 ALTER TABLE `connector` ENABLE KEYS */;

-- 테이블 upsas.connector_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `connector_trouble_data` (
  `connector_trouble_data_seq` mediumint(9) NOT NULL COMMENT '고장 이력 시퀀스',
  `connector_seq` mediumint(9) NOT NULL COMMENT '접속반 정보 시퀀스',
  `is_error` tinyint(4) NOT NULL COMMENT '고장 여부',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 code',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`connector_trouble_data_seq`,`connector_seq`),
  KEY `FK_connector_TO_connector_trouble_data` (`connector_seq`),
  CONSTRAINT `FK_connector_TO_connector_trouble_data` FOREIGN KEY (`connector_seq`) REFERENCES `connector` (`connector_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 upsas.connector_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `connector_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `connector_trouble_data` ENABLE KEYS */;

-- 테이블 upsas.device_structure 구조 내보내기
CREATE TABLE IF NOT EXISTS `device_structure` (
  `device_structure_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '장치 구성 정보 시퀀스',
  `structure_header` varchar(4) NOT NULL COMMENT '장치 접두어',
  `structure_name` varchar(30) NOT NULL COMMENT '그룹 명',
  PRIMARY KEY (`device_structure_seq`),
  UNIQUE KEY `UIX_device_structure` (`structure_header`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COMMENT='장치 구성 정보';

-- 테이블 데이터 upsas.device_structure:~7 rows (대략적) 내보내기
/*!40000 ALTER TABLE `device_structure` DISABLE KEYS */;
INSERT INTO `device_structure` (`device_structure_seq`, `structure_header`, `structure_name`) VALUES
	(1, 'WD', 'WaterDoor'),
	(2, 'WL', 'WaterLevel'),
	(3, 'S', 'Salinity'),
	(4, 'V', 'Valve'),
	(5, 'P', 'Pump'),
	(6, 'UT', 'UnderWaterTemperature'),
	(7, 'MT', 'ModuleTemperature');
/*!40000 ALTER TABLE `device_structure` ENABLE KEYS */;

-- 테이블 upsas.gcm_device 구조 내보내기
CREATE TABLE IF NOT EXISTS `gcm_device` (
  `gcm_device_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT 'GCM 장치 시퀀스',
  `member_seq` mediumint(9) DEFAULT NULL COMMENT 'app 사용자 id (통합서버에서 받음)',
  `device_key` varchar(255) DEFAULT NULL COMMENT '고유 장치 ID',
  `registration_id` varchar(255) DEFAULT NULL COMMENT 'GCM을 보내기 위해 구글에서 받은 모바일 Session ID',
  `writedate` datetime DEFAULT NULL COMMENT '작성일',
  `updatedate` datetime DEFAULT NULL COMMENT '수정일',
  PRIMARY KEY (`gcm_device_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='염전 관리자에게 보낼 중요한 메시지를 보내기 위한 App 식별 정보 저장';

-- 테이블 데이터 upsas.gcm_device:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `gcm_device` DISABLE KEYS */;
/*!40000 ALTER TABLE `gcm_device` ENABLE KEYS */;

-- 테이블 upsas.inverter 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter` (
  `inverter_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '인버터 id',
  `target_name` varchar(20) NOT NULL COMMENT '인버터 명',
  `target_type` enum('third','single') NOT NULL COMMENT '0: 단상, 1: 삼상',
  `target_category` enum('dev','s_hex','s_e&p') DEFAULT NULL COMMENT '인버터 회사 프로토콜',
  `connect_type` enum('socket','serial') NOT NULL COMMENT '연결 종류',
  `dialing` varbinary(50) NOT NULL COMMENT 'inverter 접속 국번(2byte): HexPower 기준',
  `host` char(16) DEFAULT NULL COMMENT 'host',
  `port` int(11) DEFAULT NULL COMMENT 'port',
  `baud_rate` int(11) DEFAULT NULL COMMENT 'baud_rate',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `amount` int(11) NOT NULL COMMENT '단위: Wh (10:1 Scale)',
  `director_name` varchar(20) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  PRIMARY KEY (`inverter_seq`),
  UNIQUE KEY `UIX_inverter` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='인버터 장치 상세 정보';

-- 테이블 데이터 upsas.inverter:~6 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter` DISABLE KEYS */;
INSERT INTO `inverter` (`inverter_seq`, `target_id`, `target_name`, `target_type`, `target_category`, `connect_type`, `dialing`, `host`, `port`, `baud_rate`, `code`, `amount`, `director_name`, `director_tel`) VALUES
	(1, 'IVT1', '인버터 1', 'single', 'dev', 'socket', '01', 'localhost', NULL, 9600, 'e279f4c4-cdc8-4423-97f8-d30a78c5aff1', 30, '홍길동 1', '01011114444'),
	(2, 'IVT2', '인버터 2', 'single', 'dev', 'socket', '02', 'localhost', NULL, 9600, 'd6717789-009c-415e-8dbf-b637e6a45182', 30, '홍길동 2', '01011114444'),
	(3, 'IVT3', '인버터 3', 'single', 'dev', 'socket', '03', 'localhost', NULL, 9600, '1afcb839-78e4-431a-a91c-de2d6e9ff6d4', 30, '홍길동 3', '01011114444'),
	(4, 'IVT4', '인버터 4', 'single', 'dev', 'socket', '04', 'localhost', NULL, 9600, 'aa3e00f6-94b6-4caa-825b-40fd527c47c8', 30, '홍길동 4', '01011114444'),
	(5, 'IVT5', '인버터 5', 'single', 'dev', 'socket', '05', 'localhost', NULL, 9600, 'a8b3b27a-239f-4bd7-8025-b5025c71aedd', 30, '홍길동 5', '01011114444'),
	(6, 'IVT6', '인버터 6', 'single', 'dev', 'socket', '06', 'localhost', NULL, 9600, 'ebbd733e-95df-4e52-8f4d-9ab0a884cb19', 30, '홍길동 6', '01011114444');
/*!40000 ALTER TABLE `inverter` ENABLE KEYS */;

-- 테이블 upsas.inverter_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter_data` (
  `inverter_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 데이터 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `in_a` int(11) DEFAULT NULL COMMENT '10:1 Scale',
  `in_v` int(11) DEFAULT NULL COMMENT '10:1 Scale',
  `in_w` int(11) NOT NULL COMMENT '입력 전력',
  `out_a` int(11) DEFAULT NULL COMMENT '10:1 Scale',
  `out_v` int(11) DEFAULT NULL COMMENT '10:1 Scale',
  `out_w` int(11) NOT NULL COMMENT '출력 전력',
  `p_f` int(11) NOT NULL COMMENT 'Power Factor (10:1 Scale)',
  `d_wh` int(11) NOT NULL COMMENT 'Daily Power, 단위:Wh (10:1 Scale)',
  `c_wh` int(11) NOT NULL COMMENT 'Cumulative Power, 단위:Wh (10:1 Scale)',
  `writedate` datetime NOT NULL COMMENT '등록일',
  PRIMARY KEY (`inverter_data_seq`,`inverter_seq`),
  KEY `FK_inverter_TO_inverter_data` (`inverter_seq`),
  CONSTRAINT `FK_inverter_TO_inverter_data` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=87965 DEFAULT CHARSET=utf8 COMMENT='인버터에서 측정된 데이터';

-- 테이블 upsas.inverter_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter_trouble_data` (
  `inverter_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 문제 이력 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT 'isError',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 code',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`inverter_trouble_data_seq`,`inverter_seq`),
  KEY `FK_inverter_TO_inverter_trouble_data` (`inverter_seq`),
  CONSTRAINT `FK_inverter_TO_inverter_trouble_data` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 upsas.kma_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `kma_data` (
  `kma_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상청 일기 예보 시퀀스',
  `temp` float DEFAULT NULL COMMENT '10:1 Scale',
  `pty` tinyint(4) DEFAULT NULL COMMENT '(0 : 없음, 1:비, 2:비/눈, 3:눈/비, 4:눈)',
  `pop` tinyint(4) DEFAULT NULL COMMENT '강수확율(%)',
  `r12` float DEFAULT NULL COMMENT '(① 0 <= x < 0.1, ② 0.1 <= x < 1, ③ 1 <= x < 5, ④ 5 <= x < 10, ⑤ 10 <= x < 25, ⑥ 25 <= x < 50, ⑦ 50 <= x)',
  `ws` float DEFAULT NULL COMMENT '10:1 Scale',
  `wd` tinyint(4) DEFAULT NULL COMMENT '풍향 0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)',
  `reh` float DEFAULT NULL COMMENT '습도(%)',
  `applydate` datetime DEFAULT NULL COMMENT '적용시간',
  `writedate` datetime DEFAULT NULL COMMENT '작성일',
  `updatedate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`kma_data_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8 COMMENT='기상청에서 발표한 일기예보를 저장';

-- 테이블 upsas.module_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `module_data` (
  `module_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 데이터 시퀀스',
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `amp` int(11) NOT NULL COMMENT '10:1 Scale',
  `vol` int(11) NOT NULL COMMENT '10:1 Scale',
  `writedate` datetime NOT NULL COMMENT '등록일',
  PRIMARY KEY (`module_data_seq`),
  KEY `FK_relation_upms_TO_module_data` (`photovoltaic_seq`),
  CONSTRAINT `FK_relation_upms_TO_module_data` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `relation_upms` (`photovoltaic_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=30229 DEFAULT CHARSET=utf8 COMMENT='접속반에서 측정된 데이터';

-- 테이블 upsas.photovoltaic 구조 내보내기
CREATE TABLE IF NOT EXISTS `photovoltaic` (
  `photovoltaic_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '모듈 세부 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '모듈 id',
  `target_name` varchar(20) NOT NULL COMMENT '모듈 명',
  `install_place` varchar(50) NOT NULL COMMENT '설치장소',
  `module_type` enum('normal','g2g') NOT NULL COMMENT '모듈 타입',
  `compose_count` tinyint(4) NOT NULL COMMENT '직렬구성 개수',
  `amount` int(11) NOT NULL COMMENT '단위: kW (10:1 Scale)',
  `manufacturer` varchar(20) NOT NULL COMMENT '제조사',
  PRIMARY KEY (`photovoltaic_seq`),
  UNIQUE KEY `UIX_photovoltaic` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='수중 태양광 모듈 상세 정보';

-- 테이블 데이터 upsas.photovoltaic:~6 rows (대략적) 내보내기
/*!40000 ALTER TABLE `photovoltaic` DISABLE KEYS */;
INSERT INTO `photovoltaic` (`photovoltaic_seq`, `target_id`, `target_name`, `install_place`, `module_type`, `compose_count`, `amount`, `manufacturer`) VALUES
	(1, 'PV1', 'G2G형', '', 'g2g', 6, 15, '솔라테크'),
	(2, 'PV2', 'G2G형', '', 'g2g', 6, 15, '에스에너지'),
	(3, 'PV3', '일반형', '', 'normal', 6, 15, '솔라테크'),
	(4, 'PV4', '일반형', '', 'normal', 6, 15, '에스에너지'),
	(5, 'PV5', '외부 G2G형', '', 'g2g', 6, 15, '에스에너지'),
	(6, 'PV6', '외부 일반형', '', 'normal', 6, 15, '솔라테크');
/*!40000 ALTER TABLE `photovoltaic` ENABLE KEYS */;

-- 테이블 upsas.photovoltaic_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `photovoltaic_trouble_data` (
  `photovoltaic_trouble_data_seq` mediumint(9) NOT NULL COMMENT '모듈 문제 이력 시퀀스',
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `trouble_msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_msg` varchar(100) DEFAULT NULL COMMENT '해결 내용',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`photovoltaic_trouble_data_seq`,`photovoltaic_seq`),
  KEY `FK_photovoltaic_TO_photovoltaic_trouble_data` (`photovoltaic_seq`),
  CONSTRAINT `FK_photovoltaic_TO_photovoltaic_trouble_data` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 upsas.photovoltaic_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `photovoltaic_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `photovoltaic_trouble_data` ENABLE KEYS */;

-- 테이블 upsas.relation_saltern 구조 내보내기
CREATE TABLE IF NOT EXISTS `relation_saltern` (
  `relation_saltern_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '염판 장치 관계 시퀀스',
  `saltern_device_info_seq` mediumint(9) NOT NULL COMMENT '염전 설정 장비 시퀀스',
  `device_structure_seq` mediumint(9) NOT NULL COMMENT '장치 구성 정보 시퀀스',
  `saltern_block_seq` mediumint(9) DEFAULT NULL COMMENT '염판 시퀀스',
  `sea_seq` mediumint(9) DEFAULT NULL COMMENT '바다 시퀀스',
  `reservoir_seq` mediumint(9) DEFAULT NULL COMMENT '저수지 시퀀스',
  `brine_warehouse_seq` mediumint(9) DEFAULT NULL COMMENT '해주 시퀀스',
  `waterway_seq` mediumint(9) DEFAULT NULL COMMENT '수로 시퀀스',
  PRIMARY KEY (`relation_saltern_seq`,`saltern_device_info_seq`,`device_structure_seq`),
  KEY `FK_saltern_device_info_TO_relation_saltern` (`saltern_device_info_seq`,`device_structure_seq`),
  KEY `FK_saltern_block_TO_relation_saltern` (`saltern_block_seq`),
  KEY `FK_sea_TO_relation_saltern` (`sea_seq`),
  KEY `FK_reservoir_TO_relation_saltern` (`reservoir_seq`),
  KEY `FK_brine_warehouse_TO_relation_saltern` (`brine_warehouse_seq`),
  KEY `FK_waterway_TO_relation_saltern` (`waterway_seq`),
  CONSTRAINT `FK_brine_warehouse_TO_relation_saltern` FOREIGN KEY (`brine_warehouse_seq`) REFERENCES `brine_warehouse` (`brine_warehouse_seq`),
  CONSTRAINT `FK_reservoir_TO_relation_saltern` FOREIGN KEY (`reservoir_seq`) REFERENCES `reservoir` (`reservoir_seq`),
  CONSTRAINT `FK_saltern_block_TO_relation_saltern` FOREIGN KEY (`saltern_block_seq`) REFERENCES `saltern_block` (`saltern_block_seq`),
  CONSTRAINT `FK_saltern_device_info_TO_relation_saltern` FOREIGN KEY (`saltern_device_info_seq`, `device_structure_seq`) REFERENCES `saltern_device_info` (`saltern_device_info_seq`, `device_structure_seq`),
  CONSTRAINT `FK_sea_TO_relation_saltern` FOREIGN KEY (`sea_seq`) REFERENCES `sea` (`sea_seq`),
  CONSTRAINT `FK_waterway_TO_relation_saltern` FOREIGN KEY (`waterway_seq`) REFERENCES `waterway` (`waterway_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8 COMMENT='염전 장치 관계';

-- 테이블 데이터 upsas.relation_saltern:~68 rows (대략적) 내보내기
/*!40000 ALTER TABLE `relation_saltern` DISABLE KEYS */;
INSERT INTO `relation_saltern` (`relation_saltern_seq`, `saltern_device_info_seq`, `device_structure_seq`, `saltern_block_seq`, `sea_seq`, `reservoir_seq`, `brine_warehouse_seq`, `waterway_seq`) VALUES
	(1, 1, 5, NULL, 1, NULL, NULL, NULL),
	(2, 2, 5, NULL, NULL, 1, NULL, NULL),
	(3, 3, 5, NULL, NULL, NULL, 1, NULL),
	(4, 4, 5, NULL, NULL, NULL, 2, NULL),
	(5, 5, 5, NULL, NULL, NULL, 3, NULL),
	(6, 6, 4, 1, NULL, NULL, NULL, NULL),
	(7, 7, 4, 2, NULL, NULL, NULL, NULL),
	(8, 8, 4, 3, NULL, NULL, NULL, NULL),
	(9, 9, 4, 4, NULL, NULL, NULL, NULL),
	(10, 10, 4, 5, NULL, NULL, NULL, NULL),
	(11, 11, 4, NULL, NULL, 1, NULL, NULL),
	(12, 12, 4, NULL, NULL, NULL, 2, NULL),
	(13, 13, 4, 6, NULL, NULL, NULL, NULL),
	(14, 14, 4, 9, NULL, NULL, NULL, NULL),
	(15, 15, 1, 1, NULL, NULL, NULL, 1),
	(16, 16, 1, 2, NULL, NULL, NULL, 1),
	(17, 17, 1, 3, NULL, NULL, NULL, 1),
	(18, 18, 1, 4, NULL, NULL, NULL, 1),
	(19, 19, 1, 5, NULL, NULL, NULL, 1),
	(20, 20, 1, 7, NULL, NULL, NULL, NULL),
	(21, 21, 1, 8, NULL, NULL, NULL, NULL),
	(22, 22, 1, 8, NULL, NULL, NULL, 2),
	(23, 23, 1, 9, NULL, NULL, NULL, 2),
	(24, 24, 1, NULL, NULL, NULL, 1, 1),
	(25, 25, 1, NULL, NULL, NULL, 2, 2),
	(26, 26, 1, NULL, NULL, NULL, 3, 3),
	(27, 27, 1, NULL, NULL, NULL, NULL, 2),
	(28, 28, 1, NULL, NULL, NULL, NULL, 3),
	(29, 29, 1, NULL, 2, NULL, NULL, 3),
	(30, 30, 2, 1, NULL, NULL, NULL, NULL),
	(31, 31, 2, 2, NULL, NULL, NULL, NULL),
	(32, 32, 2, 3, NULL, NULL, NULL, NULL),
	(33, 33, 2, 4, NULL, NULL, NULL, NULL),
	(34, 34, 2, 5, NULL, NULL, NULL, NULL),
	(35, 35, 2, 6, NULL, NULL, NULL, NULL),
	(36, 36, 2, 7, NULL, NULL, NULL, NULL),
	(37, 37, 2, 8, NULL, NULL, NULL, NULL),
	(38, 38, 2, 9, NULL, NULL, NULL, NULL),
	(39, 39, 2, NULL, NULL, NULL, 1, NULL),
	(40, 40, 2, NULL, NULL, NULL, 2, NULL),
	(41, 41, 2, NULL, NULL, NULL, 3, NULL),
	(42, 42, 2, NULL, NULL, 1, NULL, NULL),
	(43, 43, 3, 1, NULL, NULL, NULL, NULL),
	(44, 44, 3, 2, NULL, NULL, NULL, NULL),
	(45, 45, 3, 3, NULL, NULL, NULL, NULL),
	(46, 46, 3, 4, NULL, NULL, NULL, NULL),
	(47, 47, 3, 5, NULL, NULL, NULL, NULL),
	(48, 48, 3, 6, NULL, NULL, NULL, NULL),
	(49, 49, 3, 7, NULL, NULL, NULL, NULL),
	(50, 50, 3, 8, NULL, NULL, NULL, NULL),
	(51, 51, 3, 9, NULL, NULL, NULL, NULL),
	(52, 52, 3, NULL, NULL, NULL, 1, NULL),
	(53, 53, 3, NULL, NULL, NULL, 2, NULL),
	(54, 54, 3, NULL, NULL, NULL, 3, NULL),
	(55, 55, 3, NULL, NULL, 1, NULL, NULL),
	(56, 56, 6, 1, NULL, NULL, NULL, NULL),
	(57, 57, 6, 2, NULL, NULL, NULL, NULL),
	(58, 58, 6, 3, NULL, NULL, NULL, NULL),
	(59, 59, 6, 4, NULL, NULL, NULL, NULL),
	(60, 60, 6, 5, NULL, NULL, NULL, NULL),
	(61, 61, 6, 6, NULL, NULL, NULL, NULL),
	(62, 62, 6, 7, NULL, NULL, NULL, NULL),
	(63, 63, 6, 8, NULL, NULL, NULL, NULL),
	(64, 64, 6, 9, NULL, NULL, NULL, NULL),
	(65, 65, 7, 1, NULL, NULL, NULL, NULL),
	(66, 66, 7, 2, NULL, NULL, NULL, NULL),
	(67, 67, 7, 3, NULL, NULL, NULL, NULL),
	(68, 68, 7, 4, NULL, NULL, NULL, NULL);
/*!40000 ALTER TABLE `relation_saltern` ENABLE KEYS */;

-- 테이블 upsas.relation_upms 구조 내보내기
CREATE TABLE IF NOT EXISTS `relation_upms` (
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `inverter_seq` mediumint(9) DEFAULT NULL COMMENT '인버터 정보 시퀀스',
  `connector_seq` mediumint(9) DEFAULT NULL COMMENT '접속반 정보 시퀀스',
  `saltern_block_seq` mediumint(9) DEFAULT NULL COMMENT '염판 시퀀스',
  `connector_ch` tinyint(4) DEFAULT NULL COMMENT '접속반 연결 채널',
  PRIMARY KEY (`photovoltaic_seq`),
  KEY `FK_inverter_TO_relation_upms` (`inverter_seq`),
  KEY `FK_connector_TO_relation_upms` (`connector_seq`),
  KEY `FK_saltern_block_TO_relation_upms` (`saltern_block_seq`),
  CONSTRAINT `FK_connector_TO_relation_upms` FOREIGN KEY (`connector_seq`) REFERENCES `connector` (`connector_seq`),
  CONSTRAINT `FK_inverter_TO_relation_upms` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`),
  CONSTRAINT `FK_photovoltaic_TO_relation_upms` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`),
  CONSTRAINT `FK_saltern_block_TO_relation_upms` FOREIGN KEY (`saltern_block_seq`) REFERENCES `saltern_block` (`saltern_block_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='수중태양광 관계 정보';

-- 테이블 데이터 upsas.relation_upms:~6 rows (대략적) 내보내기
/*!40000 ALTER TABLE `relation_upms` DISABLE KEYS */;
INSERT INTO `relation_upms` (`photovoltaic_seq`, `inverter_seq`, `connector_seq`, `saltern_block_seq`, `connector_ch`) VALUES
	(1, 1, 1, 1, 1),
	(2, 2, 1, 2, 2),
	(3, 3, 1, 3, 3),
	(4, 4, 1, 4, 4),
	(5, 5, 1, NULL, 5),
	(6, 6, 1, NULL, 6);
/*!40000 ALTER TABLE `relation_upms` ENABLE KEYS */;

-- 테이블 upsas.reservoir 구조 내보내기
CREATE TABLE IF NOT EXISTS `reservoir` (
  `reservoir_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '저수지 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '저수지 id',
  `target_name` varchar(20) DEFAULT NULL COMMENT '저수지 이름',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`reservoir_seq`),
  UNIQUE KEY `UIX_reservoir` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='저수지';

-- 테이블 데이터 upsas.reservoir:~1 rows (대략적) 내보내기
/*!40000 ALTER TABLE `reservoir` DISABLE KEYS */;
INSERT INTO `reservoir` (`reservoir_seq`, `target_id`, `target_name`, `depth`) VALUES
	(1, 'RV1', '저수조', 100);
/*!40000 ALTER TABLE `reservoir` ENABLE KEYS */;

-- 테이블 upsas.saltern_block 구조 내보내기
CREATE TABLE IF NOT EXISTS `saltern_block` (
  `saltern_block_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '염판 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '염판 id',
  `target_type` enum('concentration','crystalizing') NOT NULL COMMENT '0: 증발지, 1: 결정지',
  `target_name` varchar(20) DEFAULT NULL COMMENT '염판 이름',
  `setting_salinity` int(11) DEFAULT NULL COMMENT '설정 염도',
  `water_level_count` tinyint(4) DEFAULT NULL COMMENT '수위 측정 봉 개수',
  `min_water_level` tinyint(4) NOT NULL COMMENT '수위 측정 봉',
  `max_water_level` tinyint(4) NOT NULL COMMENT '최대 수위 레벨',
  `water_cm` varchar(30) DEFAULT NULL COMMENT '수위 측정 봉 개수만큼 '','' 구분으로 파싱 -> 배열 형(각 자료형은 float)',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`saltern_block_seq`),
  UNIQUE KEY `UIX_saltern_block` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COMMENT='염판';

-- 테이블 데이터 upsas.saltern_block:~9 rows (대략적) 내보내기
/*!40000 ALTER TABLE `saltern_block` DISABLE KEYS */;
INSERT INTO `saltern_block` (`saltern_block_seq`, `target_id`, `target_type`, `target_name`, `setting_salinity`, `water_level_count`, `min_water_level`, `max_water_level`, `water_cm`, `depth`) VALUES
	(1, 'SP1', 'concentration', '증발지 1A', -1, 0, 1, 4, '', 5),
	(2, 'SP2', 'concentration', '증발지 1B', -1, 0, 1, 4, '', 5),
	(3, 'SP3', 'concentration', '증발지 1C', -1, 0, 1, 4, '', 5),
	(4, 'SP4', 'concentration', '증발지 1D', -1, 0, 1, 4, '', 5),
	(5, 'SP5', 'concentration', '증발지 일반', -1, 0, 1, 4, '', 5),
	(6, 'SP6', 'concentration', '증발지 2', -1, 0, 1, 4, '', 4),
	(7, 'SP7', 'concentration', '증발지 3', -1, 0, 1, 4, '', 3),
	(8, 'SP8', 'concentration', '증발지 4', 18, 0, 1, 4, '', 2),
	(9, 'SP9', 'crystalizing', '결정지 1', -1, 0, 1, 4, '', 1);
/*!40000 ALTER TABLE `saltern_block` ENABLE KEYS */;

-- 테이블 upsas.saltern_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `saltern_data` (
  `saltern_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '장치 데이터 시퀀스',
  `saltern_device_info_seq` mediumint(9) NOT NULL COMMENT '염전 설정 장비 시퀀스',
  `device_structure_seq` mediumint(9) NOT NULL COMMENT '장치 구성 정보 시퀀스',
  `data` float NOT NULL COMMENT '장치 데이터',
  `writedate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '입력일',
  PRIMARY KEY (`saltern_data_seq`,`saltern_device_info_seq`,`device_structure_seq`),
  KEY `FK_saltern_device_info_TO_saltern_data` (`saltern_device_info_seq`,`device_structure_seq`),
  CONSTRAINT `FK_saltern_device_info_TO_saltern_data` FOREIGN KEY (`saltern_device_info_seq`, `device_structure_seq`) REFERENCES `saltern_device_info` (`saltern_device_info_seq`, `device_structure_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치 데이터';

-- 테이블 데이터 upsas.saltern_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `saltern_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `saltern_data` ENABLE KEYS */;

-- 테이블 upsas.saltern_device_info 구조 내보내기
CREATE TABLE IF NOT EXISTS `saltern_device_info` (
  `saltern_device_info_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '염전 설정 장비 시퀀스',
  `device_structure_seq` mediumint(9) NOT NULL COMMENT '장치 구성 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '장치 id',
  `target_name` varchar(20) NOT NULL COMMENT '장치 이름',
  `device_type` enum('socket','serial') NOT NULL COMMENT '(0: Socket, 1: Serial)',
  `board_id` varchar(10) NOT NULL COMMENT '보드 id',
  `port` int(11) NOT NULL COMMENT 'Port',
  PRIMARY KEY (`saltern_device_info_seq`,`device_structure_seq`),
  UNIQUE KEY `UIX_saltern_device_info` (`target_id`),
  KEY `FK_device_structure_TO_saltern_device_info` (`device_structure_seq`),
  CONSTRAINT `FK_device_structure_TO_saltern_device_info` FOREIGN KEY (`device_structure_seq`) REFERENCES `device_structure` (`device_structure_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8 COMMENT='염전 설정 장비';

-- 테이블 데이터 upsas.saltern_device_info:~68 rows (대략적) 내보내기
/*!40000 ALTER TABLE `saltern_device_info` DISABLE KEYS */;
INSERT INTO `saltern_device_info` (`saltern_device_info_seq`, `device_structure_seq`, `target_id`, `target_name`, `device_type`, `board_id`, `port`) VALUES
	(1, 5, 'P1', '펌프1', 'socket', '', 15001),
	(2, 5, 'P2', '펌프2', 'socket', '', 15002),
	(3, 5, 'P3', '펌프3', 'socket', '', 15003),
	(4, 5, 'P4', '펌프4', 'socket', '', 15004),
	(5, 5, 'P5', '펌프5', 'socket', '', 15005),
	(6, 4, 'V1', '밸브1', 'socket', '', 14001),
	(7, 4, 'V2', '밸브2', 'socket', '', 14002),
	(8, 4, 'V3', '밸브3', 'socket', '', 14003),
	(9, 4, 'V4', '밸브4', 'socket', '', 14004),
	(10, 4, 'V5', '밸브5', 'socket', '', 14005),
	(11, 4, 'V6', '밸브6', 'socket', '', 14006),
	(12, 4, 'V7', '밸브7', 'socket', '', 14007),
	(13, 4, 'V8', '밸브8', 'socket', '', 14008),
	(14, 4, 'V9', '밸브9', 'socket', '', 14009),
	(15, 1, 'WD1', '수문1', 'socket', '', 11001),
	(16, 1, 'WD2', '수문2', 'socket', '', 11002),
	(17, 1, 'WD3', '수문3', 'socket', '', 11003),
	(18, 1, 'WD4', '수문4', 'socket', '', 11004),
	(19, 1, 'WD5', '수문5', 'socket', '', 11005),
	(20, 1, 'WD6', '수문6', 'socket', '', 11006),
	(21, 1, 'WD7', '수문7', 'socket', '', 11007),
	(22, 1, 'WD8', '수문8', 'socket', '', 11008),
	(23, 1, 'WD9', '수문9', 'socket', '', 11009),
	(24, 1, 'WD10', '수문10', 'socket', '', 11010),
	(25, 1, 'WD11', '수문11', 'socket', '', 11011),
	(26, 1, 'WD12', '수문12', 'socket', '', 11012),
	(27, 1, 'WD13', '수문13', 'socket', '', 11013),
	(28, 1, 'WD14', '수문14', 'socket', '', 11014),
	(29, 1, 'WD15', '수문15', 'socket', '', 11015),
	(30, 2, 'WL1', '수위1', 'socket', '', 12001),
	(31, 2, 'WL2', '수위2', 'socket', '', 12002),
	(32, 2, 'WL3', '수위3', 'socket', '', 12003),
	(33, 2, 'WL4', '수위4', 'socket', '', 12004),
	(34, 2, 'WL5', '수위5', 'socket', '', 12005),
	(35, 2, 'WL6', '수위6', 'socket', '', 12006),
	(36, 2, 'WL7', '수위7', 'socket', '', 12007),
	(37, 2, 'WL8', '수위8', 'socket', '', 12008),
	(38, 2, 'WL9', '수위9', 'socket', '', 12009),
	(39, 2, 'WL10', '수위10', 'socket', '', 12010),
	(40, 2, 'WL11', '수위11', 'socket', '', 12011),
	(41, 2, 'WL12', '수위12', 'socket', '', 12012),
	(42, 2, 'WL13', '수위13', 'socket', '', 12013),
	(43, 3, 'S1', '염도1', 'socket', '', 13001),
	(44, 3, 'S2', '염도2', 'socket', '', 13002),
	(45, 3, 'S3', '염도3', 'socket', '', 13003),
	(46, 3, 'S4', '염도4', 'socket', '', 13004),
	(47, 3, 'S5', '염도5', 'socket', '', 13005),
	(48, 3, 'S6', '염도6', 'socket', '', 13006),
	(49, 3, 'S7', '염도7', 'socket', '', 13007),
	(50, 3, 'S8', '염도8', 'socket', '', 13008),
	(51, 3, 'S9', '염도9', 'socket', '', 13009),
	(52, 3, 'S10', '염도10', 'socket', '', 13010),
	(53, 3, 'S11', '염도11', 'socket', '', 13011),
	(54, 3, 'S12', '염도12', 'socket', '', 13012),
	(55, 3, 'S13', '염도13', 'socket', '', 13013),
	(56, 6, 'UT1', '수중온도1', 'socket', '', 16001),
	(57, 6, 'UT2', '수중온도2', 'socket', '', 16002),
	(58, 6, 'UT3', '수중온도3', 'socket', '', 16003),
	(59, 6, 'UT4', '수중온도4', 'socket', '', 16004),
	(60, 6, 'UT5', '수중온도5', 'socket', '', 16005),
	(61, 6, 'UT6', '수중온도6', 'socket', '', 16006),
	(62, 6, 'UT7', '수중온도7', 'socket', '', 16007),
	(63, 6, 'UT8', '수중온도8', 'socket', '', 16008),
	(64, 6, 'UT9', '수중온도9', 'socket', '', 16009),
	(65, 7, 'MT1', '모듈온도1', 'socket', '', 17001),
	(66, 7, 'MT2', '모듈온도2', 'socket', '', 17002),
	(67, 7, 'MT3', '모듈온도3', 'socket', '', 17003),
	(68, 7, 'MT4', '모듈온도4', 'socket', '', 17004);
/*!40000 ALTER TABLE `saltern_device_info` ENABLE KEYS */;

-- 테이블 upsas.saltern_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `saltern_trouble_data` (
  `saltern_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '고장 이력 시퀀스',
  `saltern_device_info_seq` mediumint(9) NOT NULL COMMENT '염전 설정 장비 시퀀스',
  `device_structure_seq` mediumint(9) NOT NULL COMMENT '장치 구성 정보 시퀀스',
  `trouble_msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `fix_msg` varchar(100) DEFAULT NULL COMMENT '해결 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`saltern_trouble_data_seq`,`saltern_device_info_seq`,`device_structure_seq`),
  KEY `FK_saltern_device_info_TO_saltern_trouble_data` (`saltern_device_info_seq`,`device_structure_seq`),
  CONSTRAINT `FK_saltern_device_info_TO_saltern_trouble_data` FOREIGN KEY (`saltern_device_info_seq`, `device_structure_seq`) REFERENCES `saltern_device_info` (`saltern_device_info_seq`, `device_structure_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 upsas.saltern_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `saltern_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `saltern_trouble_data` ENABLE KEYS */;

-- 테이블 upsas.sea 구조 내보내기
CREATE TABLE IF NOT EXISTS `sea` (
  `sea_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '바다 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '바다 id',
  `target_name` varchar(20) DEFAULT NULL COMMENT '바다 이름',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`sea_seq`),
  UNIQUE KEY `UIX_sea` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='바다';

-- 테이블 데이터 upsas.sea:~2 rows (대략적) 내보내기
/*!40000 ALTER TABLE `sea` DISABLE KEYS */;
INSERT INTO `sea` (`sea_seq`, `target_id`, `target_name`, `depth`) VALUES
	(1, 'WO1', '바다', -1),
	(2, 'WO2', '바다', -1);
/*!40000 ALTER TABLE `sea` ENABLE KEYS */;

-- 테이블 upsas.sessions 구조 내보내기
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 upsas.sessions:~8 rows (대략적) 내보내기
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
	('6cZ-ObADRUAtmMPL3tB5G59pNAYhtK6Q', 1517302061, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('RY9pdNxQ0vTfytvqQmLc1lRCTBzaZiYT', 1517301476, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('VF_c167IvuamQwx9yAuj4bR-0ZGEJJnb', 1517303084, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('jYUww2p3xTaPjFrSsoop2VuBzbuK6iRw', 1517301858, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('r737imzSgZ4NXfxYtvs-typBgAYERJzU', 1517303486, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('ssitZG5WZs7egIvsDOr493aC3HyHC3Pc', 1517302035, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('w9gWTKnaFDVtuifnjkKKsUTPlZP0oyLS', 1517301987, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}'),
	('wwy5v4Tu5WY7fJAFCd9hexy2vfD_jgh5', 1517302045, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;

-- 뷰 upsas.v_inverter_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_inverter_status` (
	`inverter_seq` MEDIUMINT(9) NULL COMMENT '인버터 정보 시퀀스',
	`target_id` VARCHAR(6) NULL COMMENT '인버터 id' COLLATE 'utf8_general_ci',
	`target_name` VARCHAR(20) NULL COMMENT '인버터 명' COLLATE 'utf8_general_ci',
	`target_type` ENUM('third','single') NULL COMMENT '0: 단상, 1: 삼상' COLLATE 'utf8_general_ci',
	`target_category` ENUM('dev','s_hex','s_e&p') NULL COMMENT '인버터 회사 프로토콜' COLLATE 'utf8_general_ci',
	`connect_type` ENUM('socket','serial') NULL COMMENT '연결 종류' COLLATE 'utf8_general_ci',
	`dialing` VARBINARY(50) NULL COMMENT 'inverter 접속 국번(2byte): HexPower 기준',
	`host` CHAR(16) NULL COMMENT 'host' COLLATE 'utf8_general_ci',
	`port` INT(11) NULL COMMENT 'port',
	`baud_rate` INT(11) NULL COMMENT 'baud_rate',
	`code` VARCHAR(100) NULL COMMENT '고유 코드' COLLATE 'utf8_general_ci',
	`amount` INT(11) NULL COMMENT '단위: Wh (10:1 Scale)',
	`director_name` VARCHAR(20) NULL COMMENT '담당자' COLLATE 'utf8_general_ci',
	`director_tel` VARCHAR(13) NULL COMMENT '연락처' COLLATE 'utf8_general_ci',
	`inverter_data_seq` MEDIUMINT(9) NOT NULL COMMENT '인버터 데이터 시퀀스',
	`in_a` DECIMAL(12,1) NULL,
	`in_v` DECIMAL(12,1) NULL,
	`in_w` DECIMAL(12,1) NULL,
	`out_a` DECIMAL(12,1) NULL,
	`out_v` DECIMAL(12,1) NULL,
	`out_w` DECIMAL(12,1) NULL,
	`p_f` DECIMAL(12,1) NULL,
	`d_wh` DECIMAL(12,1) NULL,
	`c_wh` DECIMAL(12,1) NULL,
	`writedate` DATETIME NOT NULL COMMENT '등록일'
) ENGINE=MyISAM;

-- 뷰 upsas.v_module_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_module_status` (
	`photovoltaic_seq` MEDIUMINT(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
	`target_id` VARCHAR(6) NOT NULL COMMENT '모듈 id' COLLATE 'utf8_general_ci',
	`target_name` VARCHAR(20) NOT NULL COMMENT '모듈 명' COLLATE 'utf8_general_ci',
	`install_place` VARCHAR(50) NOT NULL COMMENT '설치장소' COLLATE 'utf8_general_ci',
	`module_type` ENUM('normal','g2g') NOT NULL COMMENT '모듈 타입' COLLATE 'utf8_general_ci',
	`compose_count` TINYINT(4) NOT NULL COMMENT '직렬구성 개수',
	`amount` INT(11) NOT NULL COMMENT '단위: kW (10:1 Scale)',
	`manufacturer` VARCHAR(20) NOT NULL COMMENT '제조사' COLLATE 'utf8_general_ci',
	`connector_ch` TINYINT(4) NULL COMMENT '접속반 연결 채널',
	`amp` DECIMAL(12,1) NULL,
	`vol` DECIMAL(12,1) NULL,
	`writedate` DATETIME NULL
) ENGINE=MyISAM;

-- 뷰 upsas.v_upsas_profile 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_upsas_profile` (
	`connector_ch` TINYINT(4) NULL COMMENT '접속반 연결 채널',
	`photovoltaic_seq` MEDIUMINT(9) NULL COMMENT '모듈 세부 정보 시퀀스',
	`pv_target_id` VARCHAR(6) NULL COMMENT '모듈 id' COLLATE 'utf8_general_ci',
	`pv_target_name` VARCHAR(20) NULL COMMENT '모듈 명' COLLATE 'utf8_general_ci',
	`pv_install_place` VARCHAR(50) NULL COMMENT '설치장소' COLLATE 'utf8_general_ci',
	`pv_module_type` ENUM('normal','g2g') NULL COMMENT '모듈 타입' COLLATE 'utf8_general_ci',
	`pv_compose_count` TINYINT(4) NULL COMMENT '직렬구성 개수',
	`pv_amount` INT(11) NULL COMMENT '단위: kW (10:1 Scale)',
	`pv_manufacturer` VARCHAR(20) NULL COMMENT '제조사' COLLATE 'utf8_general_ci',
	`connector_seq` MEDIUMINT(9) NULL COMMENT '접속반 정보 시퀀스',
	`cnt_target_id` VARCHAR(6) NULL COMMENT '접속반 id' COLLATE 'utf8_general_ci',
	`cnt_target_category` ENUM('modbus_tcp','modbus_rtu','modbus_ascii','dm_v1','dm_v2') NULL COMMENT '접속반 종류' COLLATE 'utf8_general_ci',
	`cnt_target_name` VARCHAR(20) NULL COMMENT '인버터 명' COLLATE 'utf8_general_ci',
	`cnt_dialing` VARBINARY(50) NULL COMMENT 'connector 접속 국번(1byte): Modbus RTU 기준',
	`cnt_code` VARCHAR(100) NULL COMMENT '고유 코드' COLLATE 'utf8_general_ci',
	`cnt_host` CHAR(16) NULL COMMENT 'host' COLLATE 'utf8_general_ci',
	`cnt_port` INT(11) NULL COMMENT 'port',
	`cnt_baud_rate` INT(11) NULL COMMENT 'baud_rate',
	`cnt_address` VARBINARY(10) NULL COMMENT '메모리 주소( Hex Code로 변경하여 처리)',
	`cnt_director_name` VARCHAR(20) NULL COMMENT '담당자' COLLATE 'utf8_general_ci',
	`cnt_director_tel` VARCHAR(13) NULL COMMENT '연락처' COLLATE 'utf8_general_ci',
	`inverter_seq` MEDIUMINT(9) NULL COMMENT '인버터 정보 시퀀스',
	`ivt_target_id` VARCHAR(6) NULL COMMENT '인버터 id' COLLATE 'utf8_general_ci',
	`ivt_target_name` VARCHAR(20) NULL COMMENT '인버터 명' COLLATE 'utf8_general_ci',
	`ivt_target_type` ENUM('third','single') NULL COMMENT '0: 단상, 1: 삼상' COLLATE 'utf8_general_ci',
	`ivt_target_category` ENUM('dev','s_hex','s_e&p') NULL COMMENT '인버터 회사 프로토콜' COLLATE 'utf8_general_ci',
	`ivt_connect_type` ENUM('socket','serial') NULL COMMENT '연결 종류' COLLATE 'utf8_general_ci',
	`ivt_dialing` VARBINARY(50) NULL COMMENT 'inverter 접속 국번(2byte): HexPower 기준',
	`ivt_host` CHAR(16) NULL COMMENT 'host' COLLATE 'utf8_general_ci',
	`ivt_port` INT(11) NULL COMMENT 'port',
	`ivt_baud_rate` INT(11) NULL COMMENT 'baud_rate',
	`ivt_code` VARCHAR(100) NULL COMMENT '고유 코드' COLLATE 'utf8_general_ci',
	`ivt_amount` INT(11) NULL COMMENT '단위: Wh (10:1 Scale)',
	`ivt_director_name` VARCHAR(20) NULL COMMENT '담당자' COLLATE 'utf8_general_ci',
	`ivt_director_tel` VARCHAR(13) NULL COMMENT '연락처' COLLATE 'utf8_general_ci',
	`saltern_block_seq` MEDIUMINT(9) NULL COMMENT '염판 시퀀스',
	`sb_target_id` VARCHAR(6) NULL COMMENT '염판 id' COLLATE 'utf8_general_ci',
	`sb_target_type` ENUM('concentration','crystalizing') NULL COMMENT '0: 증발지, 1: 결정지' COLLATE 'utf8_general_ci',
	`sb_target_name` VARCHAR(20) NULL COMMENT '염판 이름' COLLATE 'utf8_general_ci',
	`sb_setting_salinity` INT(11) NULL COMMENT '설정 염도',
	`sb_water_level_count` TINYINT(4) NULL COMMENT '수위 측정 봉 개수',
	`sb_min_water_level` TINYINT(4) NULL COMMENT '수위 측정 봉',
	`sb_max_water_level` TINYINT(4) NULL COMMENT '최대 수위 레벨',
	`sb_water_cm` VARCHAR(30) NULL COMMENT '수위 측정 봉 개수만큼 \',\' 구분으로 파싱 -> 배열 형(각 자료형은 float)' COLLATE 'utf8_general_ci',
	`sb_depth` FLOAT NULL COMMENT '상대적 고도',
	`ch_number` BIGINT(21) NULL
) ENGINE=MyISAM;

-- 테이블 upsas.waterway 구조 내보내기
CREATE TABLE IF NOT EXISTS `waterway` (
  `waterway_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '수로 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '수로 id',
  `target_name` varchar(20) DEFAULT NULL COMMENT '수로 이름',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`waterway_seq`),
  UNIQUE KEY `UIX_waterway` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='수로';

-- 테이블 데이터 upsas.waterway:~3 rows (대략적) 내보내기
/*!40000 ALTER TABLE `waterway` DISABLE KEYS */;
INSERT INTO `waterway` (`waterway_seq`, `target_id`, `target_name`, `depth`) VALUES
	(1, 'WW1', '', 0.9),
	(2, 'WW2', '', 0.8),
	(3, 'WW3', '', 0.7);
/*!40000 ALTER TABLE `waterway` ENABLE KEYS */;

-- 테이블 upsas.weather_device_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `weather_device_data` (
  `weather_device_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상관측장비 측정 정보 시퀀스',
  `rain_status` int(11) DEFAULT NULL COMMENT '0: 맑음, 1: 이슬비, 2: 약한비, 3: 보통비, 4: 폭우',
  `rain_amount` float DEFAULT NULL COMMENT '10:1 Scale',
  `temperature` int(11) DEFAULT NULL COMMENT '섭씨 10:1 Scale',
  `solar` int(11) DEFAULT NULL COMMENT '10:1 Scale',
  `humidity` float DEFAULT NULL COMMENT '%',
  `wind_direction` tinyint(4) DEFAULT NULL COMMENT '0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)',
  `wind_speed` float DEFAULT NULL COMMENT 'm/s',
  `writedate` datetime DEFAULT NULL COMMENT '등록일',
  PRIMARY KEY (`weather_device_data_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='기상관측장비로부터 수집한 데이터를 저장';

-- 테이블 데이터 upsas.weather_device_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `weather_device_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `weather_device_data` ENABLE KEYS */;

-- 뷰 upsas.v_inverter_status 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_inverter_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`upsas`@`%` SQL SECURITY DEFINER VIEW `v_inverter_status` AS select `inverter`.`inverter_seq` AS `inverter_seq`,`inverter`.`target_id` AS `target_id`,`inverter`.`target_name` AS `target_name`,`inverter`.`target_type` AS `target_type`,`inverter`.`target_category` AS `target_category`,`inverter`.`connect_type` AS `connect_type`,`inverter`.`dialing` AS `dialing`,`inverter`.`host` AS `host`,`inverter`.`port` AS `port`,`inverter`.`baud_rate` AS `baud_rate`,`inverter`.`code` AS `code`,`inverter`.`amount` AS `amount`,`inverter`.`director_name` AS `director_name`,`inverter`.`director_tel` AS `director_tel`,`inverter_data`.`inverter_data_seq` AS `inverter_data_seq`,round((`inverter_data`.`in_a` / 10),1) AS `in_a`,round((`inverter_data`.`in_v` / 10),1) AS `in_v`,round((`inverter_data`.`in_w` / 10),1) AS `in_w`,round((`inverter_data`.`out_a` / 10),1) AS `out_a`,round((`inverter_data`.`out_v` / 10),1) AS `out_v`,round((`inverter_data`.`out_w` / 10),1) AS `out_w`,round((`inverter_data`.`p_f` / 10),1) AS `p_f`,round((`inverter_data`.`d_wh` / 10),1) AS `d_wh`,round((`inverter_data`.`c_wh` / 10),1) AS `c_wh`,`inverter_data`.`writedate` AS `writedate` from (`inverter_data` left join `inverter` on((`inverter`.`inverter_seq` = `inverter_data`.`inverter_seq`))) where `inverter_data`.`inverter_data_seq` in (select max(`inverter_data`.`inverter_data_seq`) from `inverter_data` group by `inverter_data`.`inverter_seq`);

-- 뷰 upsas.v_module_status 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_module_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`upsas`@`%` SQL SECURITY DEFINER VIEW `v_module_status` AS select `pv`.`photovoltaic_seq` AS `photovoltaic_seq`,`pv`.`target_id` AS `target_id`,`pv`.`target_name` AS `target_name`,`pv`.`install_place` AS `install_place`,`pv`.`module_type` AS `module_type`,`pv`.`compose_count` AS `compose_count`,`pv`.`amount` AS `amount`,`pv`.`manufacturer` AS `manufacturer`,`ru`.`connector_ch` AS `connector_ch`,(select round((`md`.`amp` / 10),1) from `module_data` `md` where (`md`.`photovoltaic_seq` = `pv`.`photovoltaic_seq`) order by `md`.`writedate` desc limit 1) AS `amp`,(select round((`md`.`vol` / 10),1) from `module_data` `md` where (`md`.`photovoltaic_seq` = `pv`.`photovoltaic_seq`) order by `md`.`writedate` desc limit 1) AS `vol`,(select `md`.`writedate` from `module_data` `md` where (`md`.`photovoltaic_seq` = `pv`.`photovoltaic_seq`) order by `md`.`writedate` desc limit 1) AS `writedate` from ((`photovoltaic` `pv` left join `relation_upms` `ru` on((`ru`.`photovoltaic_seq` = `pv`.`photovoltaic_seq`))) left join `saltern_block` `sb` on((`sb`.`saltern_block_seq` = `ru`.`saltern_block_seq`))) order by `ru`.`connector_seq`,`ru`.`connector_ch`;

-- 뷰 upsas.v_upsas_profile 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_upsas_profile`;
CREATE ALGORITHM=UNDEFINED DEFINER=`upsas`@`%` SQL SECURITY DEFINER VIEW `v_upsas_profile` AS select `ru`.`connector_ch` AS `connector_ch`,`pv`.`photovoltaic_seq` AS `photovoltaic_seq`,`pv`.`target_id` AS `pv_target_id`,`pv`.`target_name` AS `pv_target_name`,`pv`.`install_place` AS `pv_install_place`,`pv`.`module_type` AS `pv_module_type`,`pv`.`compose_count` AS `pv_compose_count`,`pv`.`amount` AS `pv_amount`,`pv`.`manufacturer` AS `pv_manufacturer`,`cnt`.`connector_seq` AS `connector_seq`,`cnt`.`target_id` AS `cnt_target_id`,`cnt`.`target_category` AS `cnt_target_category`,`cnt`.`target_name` AS `cnt_target_name`,`cnt`.`dialing` AS `cnt_dialing`,`cnt`.`code` AS `cnt_code`,`cnt`.`host` AS `cnt_host`,`cnt`.`port` AS `cnt_port`,`cnt`.`baud_rate` AS `cnt_baud_rate`,`cnt`.`address` AS `cnt_address`,`cnt`.`director_name` AS `cnt_director_name`,`cnt`.`director_tel` AS `cnt_director_tel`,`ivt`.`inverter_seq` AS `inverter_seq`,`ivt`.`target_id` AS `ivt_target_id`,`ivt`.`target_name` AS `ivt_target_name`,`ivt`.`target_type` AS `ivt_target_type`,`ivt`.`target_category` AS `ivt_target_category`,`ivt`.`connect_type` AS `ivt_connect_type`,`ivt`.`dialing` AS `ivt_dialing`,`ivt`.`host` AS `ivt_host`,`ivt`.`port` AS `ivt_port`,`ivt`.`baud_rate` AS `ivt_baud_rate`,`ivt`.`code` AS `ivt_code`,`ivt`.`amount` AS `ivt_amount`,`ivt`.`director_name` AS `ivt_director_name`,`ivt`.`director_tel` AS `ivt_director_tel`,`sb`.`saltern_block_seq` AS `saltern_block_seq`,`sb`.`target_id` AS `sb_target_id`,`sb`.`target_type` AS `sb_target_type`,`sb`.`target_name` AS `sb_target_name`,`sb`.`setting_salinity` AS `sb_setting_salinity`,`sb`.`water_level_count` AS `sb_water_level_count`,`sb`.`min_water_level` AS `sb_min_water_level`,`sb`.`max_water_level` AS `sb_max_water_level`,`sb`.`water_cm` AS `sb_water_cm`,`sb`.`depth` AS `sb_depth`,(select count(0) from `relation_upms` where (`cnt`.`connector_seq` = `relation_upms`.`connector_seq`)) AS `ch_number` from ((((`relation_upms` `ru` left join `photovoltaic` `pv` on((`pv`.`photovoltaic_seq` = `ru`.`photovoltaic_seq`))) left join `inverter` `ivt` on((`ivt`.`inverter_seq` = `ru`.`inverter_seq`))) left join `connector` `cnt` on((`cnt`.`connector_seq` = `ru`.`connector_seq`))) left join `saltern_block` `sb` on((`sb`.`saltern_block_seq` = `ru`.`saltern_block_seq`)));

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
