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

-- 테이블 pv_led.connector 구조 내보내기
CREATE TABLE IF NOT EXISTS `connector` (
  `connector_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 정보 시퀀스',
  `target_id` varchar(30) NOT NULL COMMENT '접속반 id',
  `target_name` varchar(20) NOT NULL COMMENT '인버터 명',
  `target_category` varchar(30) DEFAULT NULL COMMENT '장치 카테고리',
  `connect_info` longtext COMMENT '장치 접속 정보',
  `protocol_info` longtext COMMENT '장치 프로토콜 정보',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `director_name` varchar(20) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  PRIMARY KEY (`connector_seq`),
  UNIQUE KEY `UIX_connector` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='접속반 상세 정보';

-- 테이블 데이터 pv_led.connector:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `connector` DISABLE KEYS */;
/*!40000 ALTER TABLE `connector` ENABLE KEYS */;

-- 테이블 pv_led.connector_trouble_data 구조 내보내기
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

-- 테이블 데이터 pv_led.connector_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `connector_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `connector_trouble_data` ENABLE KEYS */;

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

-- 테이블 데이터 pv_led.inverter:~2 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter` DISABLE KEYS */;
INSERT INTO `inverter` (`inverter_seq`, `target_id`, `target_name`, `target_category`, `protocol_info`, `connect_info`, `code`, `amount`, `director_name`, `director_tel`, `chart_color`, `chart_sort_rank`) VALUES
	(1, 'PCS_001', '600W 급', 'PCS', '{"mainCategory":"ess","subCategory":"das_pv_led","deviceId":"000","protocolOptionInfo":{"hasTrackingData":true},"option":{"isUseKw":false}}', '{"type":"serial","baudRate":9600,"port":"COM4"}', '123', 0.6, '에스엠소프트', '061-285-3411', 'black', 1),
	(2, 'PCS_002', '3.3 kW 급', 'PCS', '{"mainCategory":"ess","subCategory":"das_pv_led","deviceId":"002","protocolOptionInfo":{"hasTrackingData":true},"option":{"isUseKw":true}}', '{"type":"serial","baudRate":9600,"port":"COM4"}', '234', 3.3, '에스엠소프트', '061-285-3411', 'red', 2);
/*!40000 ALTER TABLE `inverter` ENABLE KEYS */;

-- 테이블 pv_led.inverter_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter_data` (
  `inverter_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 데이터 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `in_a` float NOT NULL COMMENT '10:1 Scale',
  `in_v` float NOT NULL COMMENT '10:1 Scale',
  `in_kw` float NOT NULL COMMENT '입력 전력',
  `out_a` float NOT NULL COMMENT '10:1 Scale',
  `out_v` float NOT NULL COMMENT '10:1 Scale',
  `out_kw` float NOT NULL COMMENT '출력 전력',
  `c_kwh` float NOT NULL COMMENT 'Cumulative Power, 단위:Wh (10:1 Scale)',
  `operation_has_v` varchar(50) DEFAULT NULL COMMENT '계통 전압 여부',
  `operation_mode` varchar(50) DEFAULT NULL COMMENT '동작 모드',
  `operation_status` varchar(255) DEFAULT NULL COMMENT '동작 상태',
  `battery_v` float DEFAULT NULL COMMENT '배터리 저압',
  `battery_a` float DEFAULT NULL COMMENT '배터리 전류',
  `battery_charging_kw` float DEFAULT NULL COMMENT '배터리 충전 출력',
  `battery_discharging_kw` float DEFAULT NULL COMMENT '배터리 방전 출력',
  `battery_total_charging_kwh` float DEFAULT NULL COMMENT '배터리 누적 충전 전력',
  `battery_total_discharging_kwh` float DEFAULT NULL COMMENT '배터리 누적 방전 전력',
  `led_dc_v` float DEFAULT NULL COMMENT 'LED DC 전압',
  `led_dc_a` float DEFAULT NULL COMMENT 'LED DC 전류',
  `led_using_kw` float DEFAULT NULL COMMENT 'LED 사용 전력',
  `led_total_using_kwh` float DEFAULT NULL COMMENT 'LED 누적 소모 전력',
  `input_line_kw` float DEFAULT NULL COMMENT '입력 라인 전력',
  `input_total_line_kwh` float DEFAULT NULL COMMENT '계통 충전 전체 누적',
  `writedate` datetime NOT NULL COMMENT '등록일',
  PRIMARY KEY (`inverter_data_seq`,`inverter_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=521 DEFAULT CHARSET=utf8 COMMENT='인버터에서 측정된 데이터';

-- 테이블 데이터 pv_led.inverter_data:~520 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `inverter_data` ENABLE KEYS */;

-- 테이블 pv_led.inverter_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter_trouble_data` (
  `inverter_trouble_data_seq` mediumint(9) NOT NULL COMMENT '인버터 문제 이력 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `is_system_error` tinyint(4) DEFAULT NULL COMMENT 'isSystemError',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 코드',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`inverter_trouble_data_seq`,`inverter_seq`),
  KEY `FK_inverter_TO_inverter_trouble_data` (`inverter_seq`),
  CONSTRAINT `FK_inverter_TO_inverter_trouble_data` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 pv_led.inverter_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `inverter_trouble_data` ENABLE KEYS */;

-- 테이블 pv_led.kma_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `kma_data` (
  `kma_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상청 일기 예보 시퀀스',
  `x` tinyint(3) DEFAULT NULL COMMENT '위도',
  `y` tinyint(3) DEFAULT NULL COMMENT '경도',
  `temp` float DEFAULT NULL COMMENT '℃',
  `pty` tinyint(4) DEFAULT NULL COMMENT '(0 : 없음, 1:비, 2:비/눈, 3:눈/비, 4:눈)',
  `pop` tinyint(4) DEFAULT NULL COMMENT '%',
  `r12` float DEFAULT NULL COMMENT 'mm (① 0 <= x < 0.1, ② 0.1 <= x < 1, ③ 1 <= x < 5, ④ 5 <= x < 10, ⑤ 10 <= x < 25, ⑥ 25 <= x < 50, ⑦ 50 <= x)',
  `wf_kor` varchar(20) DEFAULT NULL COMMENT '① 맑음 ② 구름 조금 ③ 구름 많음 ④ 흐림 ⑤ 비 ⑥ 눈/비 ⑦ 눈',
  `wf_en` varchar(20) DEFAULT NULL COMMENT '① Clear ② Partly Cloudy ③ Mostly Cloudy ④ Cloudy ⑤ Rain ⑥ Snow/Rain ⑦ Snow',
  `ws` float DEFAULT NULL COMMENT 'm/s',
  `wd` tinyint(4) DEFAULT NULL COMMENT '풍향 0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)',
  `reh` float DEFAULT NULL COMMENT '%',
  `applydate` datetime DEFAULT NULL COMMENT '적용시간',
  `writedate` datetime DEFAULT NULL COMMENT '작성일',
  `updatedate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`kma_data_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='기상청에서 발표한 일기예보를 저장';

-- 테이블 데이터 pv_led.kma_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `kma_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `kma_data` ENABLE KEYS */;

-- 테이블 pv_led.member 구조 내보내기
CREATE TABLE IF NOT EXISTS `member` (
  `member_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '회원정보 시퀀스',
  `upsas_seq` mediumint(9) DEFAULT NULL COMMENT 'UPSAS 시퀀스',
  `id` varchar(255) NOT NULL COMMENT '아이디',
  `grade` enum('최고관리자','관리자','염주','방문자') DEFAULT NULL COMMENT '회원 등급',
  `name` varchar(20) DEFAULT NULL COMMENT '이름',
  `address` varchar(100) DEFAULT NULL COMMENT '주소',
  `tel` varchar(13) DEFAULT NULL COMMENT '전화번호',
  `password_salt` varchar(255) DEFAULT NULL COMMENT '암호화소금',
  `password` varchar(255) DEFAULT NULL COMMENT '암호화비밀번호',
  `is_deleted` tinyint(4) DEFAULT NULL COMMENT '삭제여부',
  `writedate` datetime DEFAULT NULL COMMENT '생성일',
  `updatedate` timestamp NULL DEFAULT NULL COMMENT '수정일',
  PRIMARY KEY (`member_seq`),
  UNIQUE KEY `UIX_member` (`id`),
  KEY `FK_upsas_TO_member` (`upsas_seq`),
  CONSTRAINT `FK_upsas_TO_member` FOREIGN KEY (`upsas_seq`) REFERENCES `upsas` (`upsas_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='가입한 회원의 정보';

-- 테이블 데이터 pv_led.member:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
/*!40000 ALTER TABLE `member` ENABLE KEYS */;

-- 테이블 pv_led.module_data 구조 내보내기
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

-- 테이블 데이터 pv_led.module_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `module_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_data` ENABLE KEYS */;

-- 테이블 pv_led.photovoltaic 구조 내보내기
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='수중 태양광 모듈 상세 정보';

-- 테이블 데이터 pv_led.photovoltaic:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `photovoltaic` DISABLE KEYS */;
/*!40000 ALTER TABLE `photovoltaic` ENABLE KEYS */;

-- 테이블 pv_led.photovoltaic_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `photovoltaic_trouble_data` (
  `photovoltaic_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '모듈 문제 이력 시퀀스',
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT '고장 여부',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 code',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`photovoltaic_trouble_data_seq`,`photovoltaic_seq`),
  KEY `FK_photovoltaic_TO_photovoltaic_trouble_data` (`photovoltaic_seq`),
  CONSTRAINT `FK_photovoltaic_TO_photovoltaic_trouble_data` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 pv_led.photovoltaic_trouble_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `photovoltaic_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `photovoltaic_trouble_data` ENABLE KEYS */;

-- 테이블 pv_led.relation_upms 구조 내보내기
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

-- 테이블 데이터 pv_led.relation_upms:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `relation_upms` DISABLE KEYS */;
/*!40000 ALTER TABLE `relation_upms` ENABLE KEYS */;

-- 테이블 pv_led.upsas 구조 내보내기
CREATE TABLE IF NOT EXISTS `upsas` (
  `upsas_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT 'UPSAS 시퀀스',
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

-- 테이블 데이터 pv_led.upsas:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `upsas` DISABLE KEYS */;
/*!40000 ALTER TABLE `upsas` ENABLE KEYS */;

-- 뷰 pv_led.v_inverter_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_inverter_status` (
	`target_id` VARCHAR(30) NULL COMMENT '인버터 id' COLLATE 'utf8_general_ci',
	`target_name` VARCHAR(20) NULL COMMENT '인버터 명' COLLATE 'utf8_general_ci',
	`target_category` VARCHAR(30) NULL COMMENT '장치 카테고리' COLLATE 'utf8_general_ci',
	`protocol_info` LONGTEXT NULL COMMENT '장치 프로토콜 정보' COLLATE 'utf8_general_ci',
	`connect_info` LONGTEXT NULL COMMENT '접속 정보' COLLATE 'utf8_general_ci',
	`amount` FLOAT NULL COMMENT '단위: Wh (10:1 Scale)',
	`chart_color` VARCHAR(20) NULL COMMENT '차트 라인 색상' COLLATE 'utf8_general_ci',
	`chart_sort_rank` TINYINT(4) NULL COMMENT '차트 정렬 우선 순위',
	`inverter_data_seq` MEDIUMINT(9) NOT NULL COMMENT '인버터 데이터 시퀀스',
	`inverter_seq` MEDIUMINT(9) NOT NULL COMMENT '인버터 정보 시퀀스',
	`in_a` FLOAT NOT NULL COMMENT '10:1 Scale',
	`in_v` FLOAT NOT NULL COMMENT '10:1 Scale',
	`in_kw` FLOAT NOT NULL COMMENT '입력 전력',
	`out_a` FLOAT NOT NULL COMMENT '10:1 Scale',
	`out_v` FLOAT NOT NULL COMMENT '10:1 Scale',
	`out_kw` FLOAT NOT NULL COMMENT '출력 전력',
	`c_kwh` FLOAT NOT NULL COMMENT 'Cumulative Power, 단위:Wh (10:1 Scale)',
	`operation_has_v` VARCHAR(50) NULL COMMENT '계통 전압 여부' COLLATE 'utf8_general_ci',
	`operation_mode` VARCHAR(50) NULL COMMENT '동작 모드' COLLATE 'utf8_general_ci',
	`operation_status` VARCHAR(255) NULL COMMENT '동작 상태' COLLATE 'utf8_general_ci',
	`battery_v` FLOAT NULL COMMENT '배터리 저압',
	`battery_a` FLOAT NULL COMMENT '배터리 전류',
	`battery_charging_kw` FLOAT NULL COMMENT '배터리 충전 출력',
	`battery_discharging_kw` FLOAT NULL COMMENT '배터리 방전 출력',
	`battery_total_charging_kwh` FLOAT NULL COMMENT '배터리 누적 충전 전력',
	`battery_total_discharging_kwh` FLOAT NULL COMMENT '배터리 누적 방전 전력',
	`led_dc_v` FLOAT NULL COMMENT 'LED DC 전압',
	`led_dc_a` FLOAT NULL COMMENT 'LED DC 전류',
	`led_using_kw` FLOAT NULL COMMENT 'LED 사용 전력',
	`led_total_using_kwh` FLOAT NULL COMMENT 'LED 누적 소모 전력',
	`input_line_kw` FLOAT NULL COMMENT '입력 라인 전력',
	`input_total_line_kwh` FLOAT NULL COMMENT '계통 충전 전체 누적',
	`writedate` DATETIME NOT NULL COMMENT '등록일'
) ENGINE=MyISAM;

-- 뷰 pv_led.v_module_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_module_status` (
	`photovoltaic_seq` MEDIUMINT(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
	`target_id` VARCHAR(6) NOT NULL COMMENT '모듈 id' COLLATE 'utf8_general_ci',
	`target_name` VARCHAR(20) NOT NULL COMMENT '모듈 명' COLLATE 'utf8_general_ci',
	`install_place` VARCHAR(50) NOT NULL COMMENT '설치장소' COLLATE 'utf8_general_ci',
	`module_type` ENUM('normal','g2g') NOT NULL COMMENT '모듈 타입' COLLATE 'utf8_general_ci',
	`compose_count` TINYINT(4) NOT NULL COMMENT '직렬구성 개수',
	`amount` FLOAT NOT NULL COMMENT '단위: kW (10:1 Scale)',
	`manufacturer` VARCHAR(20) NOT NULL COMMENT '제조사' COLLATE 'utf8_general_ci',
	`connector_ch` TINYINT(4) NULL COMMENT '접속반 연결 채널',
	`amp` DECIMAL(12,1) NULL,
	`vol` DECIMAL(12,1) NULL,
	`writedate` DATETIME NULL
) ENGINE=MyISAM;

-- 테이블 pv_led.weather_location 구조 내보내기
CREATE TABLE IF NOT EXISTS `weather_location` (
  `weather_location_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상청 정보 위치 시퀀스',
  `province` varchar(50) DEFAULT NULL COMMENT '도',
  `city` varchar(50) DEFAULT NULL COMMENT '시',
  `town` varchar(50) DEFAULT NULL COMMENT '읍',
  `latitude` float DEFAULT NULL COMMENT '위도',
  `longitude` float DEFAULT NULL COMMENT '경도',
  `x` int(11) DEFAULT NULL COMMENT 'X',
  `y` int(11) DEFAULT NULL COMMENT 'Y',
  PRIMARY KEY (`weather_location_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='기상청의 날씨 API를 가져올 위치값 테이블';

-- 테이블 데이터 pv_led.weather_location:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `weather_location` DISABLE KEYS */;
/*!40000 ALTER TABLE `weather_location` ENABLE KEYS */;

-- 뷰 pv_led.v_inverter_status 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_inverter_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_inverter_status` AS SELECT ivt.target_id, ivt.target_name, ivt.target_category, ivt.protocol_info, ivt.connect_info, ivt.amount, ivt.chart_color, ivt.chart_sort_rank,
	id.*

	FROM inverter_data id
	LEFT JOIN inverter ivt
		ON ivt.inverter_seq = id.inverter_seq
	LEFT JOIN relation_upms ru
		ON ru.inverter_seq = id.inverter_seq
		
	WHERE inverter_data_seq IN (
		SELECT MAX(inverter_data_seq)
		FROM inverter_data
		GROUP BY inverter_seq
	)
	ORDER BY chart_sort_rank ;

-- 뷰 pv_led.v_module_status 구조 내보내기
-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_module_status`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_module_status` AS SELECT	 	pv.*,	 	ru.connector_ch,	 	(SELECT ROUND(amp / 10, 1)  FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS amp,	 	(SELECT ROUND(vol / 10, 1) FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS vol,	 	(SELECT writedate FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS writedate	 	FROM	 	photovoltaic pv	 		 	LEFT JOIN relation_upms ru	 		ON ru.photovoltaic_seq = pv.photovoltaic_seq	 	ORDER BY ru.connector_seq, ru.connector_ch ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
