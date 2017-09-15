-- --------------------------------------------------------
-- 호스트:                          121.178.26.48
-- 서버 버전:                        5.7.16-log - MySQL Community Server (GPL)
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- tns 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `tns` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `tns`;

-- 테이블 tns.avg_t 구조 내보내기
CREATE TABLE IF NOT EXISTS `avg_t` (
  `t_id` varchar(50) NOT NULL,
  `t_date` date NOT NULL,
  `t_avg` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장비 일별 평균 온도 테이블 대시보드 test\r\n\r\n';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.common_ct 구조 내보내기
CREATE TABLE IF NOT EXISTS `common_ct` (
  `top_cls_cd` varchar(2) NOT NULL COMMENT '대분류코드',
  `mid_cls_cd` varchar(2) NOT NULL COMMENT '중분류코드',
  `btm_cls_cd` varchar(2) NOT NULL COMMENT '소분류코드',
  `top_cls_cd_nm` varchar(40) NOT NULL COMMENT '대분류코드명',
  `mid_cls_cd_nm` varchar(40) NOT NULL COMMENT '중분류코드명',
  `btm_cls_cd_nm` varchar(40) NOT NULL COMMENT '소분류코드명',
  PRIMARY KEY (`top_cls_cd`,`mid_cls_cd`,`btm_cls_cd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='공통으로 사용하는 코드 정보를 관리하는 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.ctrl_set_it 구조 내보내기
CREATE TABLE IF NOT EXISTS `ctrl_set_it` (
  `divc_id` varchar(5) NOT NULL COMMENT '디바이스ID',
  `prod_id` varchar(7) NOT NULL COMMENT '장비ID',
  `seq` double DEFAULT '0' COMMENT '일련번호',
  `upd_dt` datetime DEFAULT NULL COMMENT '변경일시',
  `chg_val` int(3) DEFAULT NULL COMMENT '변경값',
  PRIMARY KEY (`divc_id`,`prod_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='디바이스에 대한 제어 설정값을 정보를 관리하는 테이블.';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.device 구조 내보내기
CREATE TABLE IF NOT EXISTS `device` (
  `seq` int(4) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `device_id` varchar(5) NOT NULL COMMENT '장비ID',
  `sensor_id` varchar(5) DEFAULT NULL COMMENT '센서ID',
  `item` varchar(5) NOT NULL COMMENT '항목',
  `value` double NOT NULL COMMENT '측정값',
  `sensing_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '측정시간',
  `install_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '설치시간',
  PRIMARY KEY (`seq`),
  UNIQUE KEY `seq` (`seq`),
  KEY `device_id_sensor_id` (`device_id`,`sensor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=349 DEFAULT CHARSET=utf8 COMMENT='장비현황';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.device_it 구조 내보내기
CREATE TABLE IF NOT EXISTS `device_it` (
  `divc_id` varchar(5) NOT NULL COMMENT '디바이스ID',
  `prod_id` varchar(7) NOT NULL COMMENT '장비ID',
  `divc_nm` varchar(40) NOT NULL DEFAULT ' ' COMMENT '디바이스명',
  PRIMARY KEY (`divc_id`,`prod_id`),
  UNIQUE KEY `divc_nm` (`divc_nm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='디바이스에 관한 정보를 관리하는 테이블.';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.member 구조 내보내기
CREATE TABLE IF NOT EXISTS `member` (
  `열 1` int(11) DEFAULT NULL,
  `열 2` int(11) DEFAULT NULL,
  `열 3` int(11) DEFAULT NULL,
  `열 4` int(11) DEFAULT NULL,
  `열 5` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='test';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.prod_it 구조 내보내기
CREATE TABLE IF NOT EXISTS `prod_it` (
  `prod_id` varchar(7) NOT NULL COMMENT '장비ID',
  `prod_nm` varchar(40) NOT NULL DEFAULT ' ' COMMENT '장비명',
  PRIMARY KEY (`prod_id`),
  UNIQUE KEY `prod_nm` (`prod_nm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장비에 대한 정보를 관리하는 테이블.';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.test 구조 내보내기
CREATE TABLE IF NOT EXISTS `test` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) DEFAULT NULL,
  `subject` varchar(50),
  `content` varchar(50) DEFAULT NULL,
  `hit` int(11) unsigned zerofill DEFAULT NULL,
  `post_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `filename` int(11) unsigned zerofill DEFAULT NULL,
  `filesize` int(11) unsigned zerofill DEFAULT NULL,
  `down` int(11) unsigned zerofill DEFAULT NULL,
  `ref` int(11) unsigned zerofill DEFAULT NULL,
  `depth` int(11) unsigned zerofill DEFAULT NULL,
  `reorder` int(11) unsigned zerofill DEFAULT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.tns_adjust 구조 내보내기
CREATE TABLE IF NOT EXISTS `tns_adjust` (
  `adjust_seq` int(4) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `trouble_case_id` varchar(15) NOT NULL COMMENT '장애유형ID',
  `adjust_depth` varchar(6) NOT NULL COMMENT '제어위치 RMA=1, TNS=2',
  `adjust_item` varchar(5) NOT NULL COMMENT '조치항목',
  `adjust_value` double unsigned NOT NULL COMMENT '조치값',
  `device_id` varchar(5) DEFAULT NULL COMMENT '제어장비',
  `sensor_id` varchar(5) DEFAULT NULL COMMENT '제어센서',
  `adjust_user_id` varchar(100) NOT NULL COMMENT '제어자id',
  `adjust_state` varchar(5) DEFAULT NULL COMMENT '처리상태',
  `adjust_message` varchar(500) DEFAULT NULL COMMENT '제어메세지',
  `adjust_compl_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '제어완료시간',
  `adjust_update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정된 시간',
  PRIMARY KEY (`adjust_seq`),
  UNIQUE KEY `seq` (`adjust_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8 COMMENT='제어 현황 테이블\r\n';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.tns_adjust_write 구조 내보내기
CREATE TABLE IF NOT EXISTS `tns_adjust_write` (
  `adjust_write_seq` int(11) NOT NULL AUTO_INCREMENT,
  `trouble_case_id` varchar(4) DEFAULT NULL COMMENT 'case_id',
  `comment_user_nm` varchar(10) DEFAULT NULL COMMENT '처리자',
  `adjust_comment` varchar(200) DEFAULT NULL COMMENT '코멘트',
  `comment_input_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '처리일자',
  PRIMARY KEY (`adjust_write_seq`),
  UNIQUE KEY `trbl_type_id` (`trouble_case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8 COMMENT='조치테이블\r\n';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.tns_device 구조 내보내기
CREATE TABLE IF NOT EXISTS `tns_device` (
  `device_seq` int(4) unsigned NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `device_id` varchar(5) NOT NULL COMMENT '장비ID',
  `sensor_id` varchar(5) DEFAULT NULL COMMENT '센서ID',
  `item` varchar(5) NOT NULL COMMENT '항목 01:V, 02:A, 03:T, 04:스위치, 05:DcV, 06:AcV 추가 가능',
  `sensing_value` double unsigned NOT NULL COMMENT '측정값 V, A, T 는 value값, 스위치는 0:off, 1:on',
  `status` varchar(4) NOT NULL COMMENT '장비 상태 00:장애, 01:정상, 02:오류',
  `sensing_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '측정시간',
  `install_time` timestamp NOT NULL COMMENT '설치시간',
  PRIMARY KEY (`device_seq`),
  UNIQUE KEY `seq` (`device_seq`),
  KEY `device_id_sensor_id` (`device_id`,`sensor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8 COMMENT='장비현황';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.tns_trouble 구조 내보내기
CREATE TABLE IF NOT EXISTS `tns_trouble` (
  `trouble_seq` int(4) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `trouble_case_id` varchar(5) NOT NULL COMMENT '트러블id',
  `trouble_case_item` varchar(10) NOT NULL COMMENT '항목',
  `begin_value` double NOT NULL COMMENT '측정값',
  `trouble_case_state` varchar(5) NOT NULL COMMENT '상태값',
  `device_id` varchar(5) NOT NULL COMMENT '장비ID',
  `sensor_id` varchar(5) NOT NULL COMMENT '센서ID',
  `release_message` varchar(50) DEFAULT NULL COMMENT '해결메세지',
  `begin_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발생시간',
  PRIMARY KEY (`trouble_seq`),
  UNIQUE KEY `seq` (`trouble_seq`),
  KEY `device_id_sensor_id` (`device_id`,`sensor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COMMENT='장애 현황';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.tns_trouble_case 구조 내보내기
CREATE TABLE IF NOT EXISTS `tns_trouble_case` (
  `trouble_case_seq` int(4) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `trouble_case_id` varchar(15) NOT NULL COMMENT '장애유형id',
  `trouble_case_item` varchar(5) DEFAULT NULL COMMENT '항목',
  `trouble_value` double NOT NULL COMMENT '장애기준측정값(ex 300이상, 20이하)',
  `trouble_case_state` varchar(10) DEFAULT NULL COMMENT '상태값',
  `device_id` varchar(5) DEFAULT NULL COMMENT '장비ID',
  `sensor_id` varchar(5) DEFAULT NULL COMMENT '센서ID',
  `release_message` varchar(500) NOT NULL COMMENT '해결메세지',
  `reg_id` varchar(100) NOT NULL COMMENT '등록한 사용자 id',
  `reg_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 시간',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`trouble_case_seq`),
  UNIQUE KEY `seq` (`trouble_case_seq`),
  UNIQUE KEY `trouble_case_id` (`trouble_case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COMMENT='장애 유형 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.tns_user 구조 내보내기
CREATE TABLE IF NOT EXISTS `tns_user` (
  `seq` int(4) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `user_id` varchar(100) NOT NULL COMMENT '사용자ID',
  `pswd` varchar(50) NOT NULL COMMENT '비밀번호',
  `cont_numb` varchar(30) DEFAULT NULL COMMENT '전화번호',
  `user_nm` varchar(50) NOT NULL COMMENT '이름',
  `user_em` varchar(200) DEFAULT NULL COMMENT '이메일',
  `user_pt` varchar(200) DEFAULT NULL COMMENT '소속부서',
  `rgt_cd` varchar(5) NOT NULL COMMENT '사용자권한',
  `user_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `seq` (`seq`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='mg-tns 사용자 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.trbl_adjust_insert 구조 내보내기
CREATE TABLE IF NOT EXISTS `trbl_adjust_insert` (
  `adjust_insert_idx` int(11) NOT NULL AUTO_INCREMENT COMMENT '제어 인덱스',
  `trbl_type_id` varchar(10) DEFAULT NULL COMMENT '사고유형ID',
  `trbl_object` varchar(10) DEFAULT NULL COMMENT '변경항목',
  `trbl_value` varchar(10) DEFAULT NULL COMMENT '변경내용',
  `proc_exp` varchar(200) DEFAULT NULL COMMENT '처리내용',
  `adjust_nm` varchar(10) DEFAULT NULL COMMENT '처리자',
  `proc_dt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '처리일시',
  PRIMARY KEY (`adjust_insert_idx`),
  UNIQUE KEY `trbl_type_id` (`trbl_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8 COMMENT='제어페이지에서 내용 insert하는 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.trbl_case_insert 구조 내보내기
CREATE TABLE IF NOT EXISTS `trbl_case_insert` (
  `case_insert_idx` int(11) NOT NULL AUTO_INCREMENT,
  `trbl_type_id` varchar(10) DEFAULT NULL COMMENT '사고유형ID',
  `trbl_object` varchar(10) DEFAULT NULL COMMENT '항목',
  `trbl_value` varchar(10) DEFAULT NULL COMMENT '변경내용',
  `stat_gb_cd` varchar(5) DEFAULT NULL COMMENT '상태구분코드 1=높음 2=낮음  3=ON 4=OFF',
  `det_exp` varchar(200) DEFAULT NULL COMMENT '메세지(상세내용)',
  `user_nm` varchar(10) DEFAULT NULL COMMENT '등록자',
  `trbl_dt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록일자',
  PRIMARY KEY (`case_insert_idx`),
  UNIQUE KEY `trbl_type_id` (`trbl_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8 COMMENT='트러블케이스 등록\r\n\r\n상태구분코드 1=높음 2=낮음  3=ON 4=OFF';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.trbl_ht 구조 내보내기
CREATE TABLE IF NOT EXISTS `trbl_ht` (
  `ocur_seq` int(11) NOT NULL AUTO_INCREMENT COMMENT '발생일련번호',
  `ocur_ymd` datetime NOT NULL COMMENT '발생일자',
  `divc_id` varchar(5) NOT NULL COMMENT '디바이스ID',
  `prod_id` varchar(7) NOT NULL COMMENT '장비ID',
  `trbl_type_id` varchar(4) NOT NULL COMMENT '사고유형ID',
  `val_cnt` int(3) NOT NULL DEFAULT '0' COMMENT '측정값',
  `stat_gb_cd` varchar(2) NOT NULL DEFAULT '99' COMMENT '상태구분코드',
  `proc_dt` datetime DEFAULT NULL COMMENT '처리일시',
  `chg_cnt` int(3) NOT NULL DEFAULT '0' COMMENT '변경값',
  `user_nm` varchar(11) NOT NULL COMMENT '처리자ID',
  `proc_exp` varchar(200) DEFAULT NULL COMMENT '처리내용',
  `comment` varchar(200) NOT NULL COMMENT '코멘트내용',
  `trbl_object` varchar(10) DEFAULT NULL COMMENT '항목',
  `trbl_value` varchar(10) DEFAULT NULL COMMENT '변경내용',
  PRIMARY KEY (`ocur_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COMMENT='Trouble 사고이력에 대한 정보를 관리하는 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.trbl_type_it 구조 내보내기
CREATE TABLE IF NOT EXISTS `trbl_type_it` (
  `trbl_type_id` varchar(4) NOT NULL COMMENT '사고유형ID',
  `trbl_type_id_nm` varchar(40) NOT NULL COMMENT '사고유형ID명',
  `det_exp` varchar(200) DEFAULT NULL COMMENT '사고유형 상세설명',
  PRIMARY KEY (`trbl_type_id`),
  UNIQUE KEY `trbl_type_id_nm` (`trbl_type_id_nm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='사고유형에 대한 정보를 관리하는 테이블.';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 tns.user_it 구조 내보내기
CREATE TABLE IF NOT EXISTS `user_it` (
  `user_id` varchar(11) NOT NULL COMMENT '사용자ID',
  `pswd` varchar(50) NOT NULL COMMENT '사용자패스워드',
  `rgt_cd` varchar(2) NOT NULL COMMENT '권한코드',
  `user_nm` varchar(20) DEFAULT NULL COMMENT '사용자명',
  `cont_numb` varchar(14) DEFAULT NULL COMMENT '연락처',
  `user_em` varchar(50) DEFAULT NULL COMMENT '이메일',
  `user_pt` varchar(14) DEFAULT NULL COMMENT '부서',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='사용자 정보를 관리하는 테이블.';

-- 내보낼 데이터가 선택되어 있지 않습니다.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
