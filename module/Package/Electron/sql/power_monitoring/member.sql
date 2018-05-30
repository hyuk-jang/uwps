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

-- 테이블 power_monitoring.member 구조 내보내기
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

-- 테이블 데이터 power_monitoring.member:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
/*!40000 ALTER TABLE `member` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
