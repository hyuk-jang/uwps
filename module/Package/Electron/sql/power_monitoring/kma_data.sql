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

-- 테이블 power_monitoring.kma_data 구조 내보내기
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
  `updatedate` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`kma_data_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='기상청에서 발표한 일기예보를 저장';

-- 테이블 데이터 power_monitoring.kma_data:~0 rows (대략적) 내보내기
/*!40000 ALTER TABLE `kma_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `kma_data` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
