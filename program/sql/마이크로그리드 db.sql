-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        5.5.41-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- mobiusdb 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `mobiusdb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `mobiusdb`;

-- 테이블 mobiusdb.acp 구조 내보내기
CREATE TABLE IF NOT EXISTS `acp` (
  `ri` varchar(200) NOT NULL,
  `pv` mediumtext,
  `pvs` mediumtext,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  CONSTRAINT `acp_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.acp:~0 rows (대략적) 내보내기
DELETE FROM `acp`;
/*!40000 ALTER TABLE `acp` DISABLE KEYS */;
/*!40000 ALTER TABLE `acp` ENABLE KEYS */;

-- 테이블 mobiusdb.ae 구조 내보내기
CREATE TABLE IF NOT EXISTS `ae` (
  `ri` varchar(200) NOT NULL,
  `apn` varchar(45) DEFAULT NULL,
  `api` varchar(45) DEFAULT NULL,
  `aei` varchar(200) DEFAULT NULL,
  `poa` varchar(200) DEFAULT NULL,
  `or` varchar(45) DEFAULT NULL,
  `rr` varchar(45) DEFAULT NULL,
  `nl` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `resourceid_UNIQUE` (`ri`),
  CONSTRAINT `ae_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.ae:~1 rows (대략적) 내보내기
DELETE FROM `ae`;
/*!40000 ALTER TABLE `ae` DISABLE KEYS */;
INSERT INTO `ae` (`ri`, `apn`, `api`, `aei`, `poa`, `or`, `rr`, `nl`) VALUES
	('/mobius-yt/ae-edu1', '', '0.2.481.1.1', 'ae-edu1', '[]', '', 'true', '');
/*!40000 ALTER TABLE `ae` ENABLE KEYS */;

-- 테이블 mobiusdb.cb 구조 내보내기
CREATE TABLE IF NOT EXISTS `cb` (
  `ri` varchar(200) NOT NULL,
  `cst` varchar(45) DEFAULT NULL,
  `csi` varchar(45) DEFAULT NULL,
  `srt` varchar(100) DEFAULT NULL,
  `poa` varchar(200) DEFAULT NULL,
  `nl` varchar(45) DEFAULT NULL,
  `ncp` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `resourceid_UNIQUE` (`ri`),
  CONSTRAINT `cb_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.cb:~1 rows (대략적) 내보내기
DELETE FROM `cb`;
/*!40000 ALTER TABLE `cb` DISABLE KEYS */;
INSERT INTO `cb` (`ri`, `cst`, `csi`, `srt`, `poa`, `nl`, `ncp`) VALUES
	('/mobius-yt', '1', '/mobius-yt', '["1","2","3","4","10","16","23","24","25","26"]', '["http://121.178.26.33:7579"]', '', '');
/*!40000 ALTER TABLE `cb` ENABLE KEYS */;

-- 테이블 mobiusdb.cin 구조 내보내기
CREATE TABLE IF NOT EXISTS `cin` (
  `ri` varchar(200) NOT NULL,
  `cr` varchar(45) DEFAULT NULL,
  `cnf` varchar(45) DEFAULT NULL,
  `cs` varchar(45) DEFAULT NULL,
  `or` varchar(45) DEFAULT NULL,
  `con` longtext,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  KEY `cin_ri_idx` (`ri`),
  CONSTRAINT `cin_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.cin:~0 rows (대략적) 내보내기
DELETE FROM `cin`;
/*!40000 ALTER TABLE `cin` DISABLE KEYS */;
/*!40000 ALTER TABLE `cin` ENABLE KEYS */;

-- 테이블 mobiusdb.cnt 구조 내보내기
CREATE TABLE IF NOT EXISTS `cnt` (
  `ri` varchar(200) NOT NULL,
  `cr` varchar(45) DEFAULT NULL,
  `mni` varchar(45) DEFAULT NULL,
  `mbs` varchar(45) DEFAULT NULL,
  `mia` varchar(45) DEFAULT NULL,
  `cni` varchar(45) DEFAULT NULL,
  `cbs` varchar(45) DEFAULT NULL,
  `li` varchar(45) DEFAULT NULL,
  `or` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `resourceid_UNIQUE` (`ri`),
  CONSTRAINT `cnt_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.cnt:~0 rows (대략적) 내보내기
DELETE FROM `cnt`;
/*!40000 ALTER TABLE `cnt` DISABLE KEYS */;
/*!40000 ALTER TABLE `cnt` ENABLE KEYS */;

-- 테이블 mobiusdb.csr 구조 내보내기
CREATE TABLE IF NOT EXISTS `csr` (
  `ri` varchar(200) NOT NULL,
  `cst` varchar(45) DEFAULT NULL,
  `poa` varchar(200) DEFAULT NULL,
  `cb` varchar(200) DEFAULT NULL,
  `csi` varchar(200) DEFAULT NULL,
  `mei` varchar(45) DEFAULT NULL,
  `tri` varchar(45) DEFAULT NULL,
  `rr` varchar(45) DEFAULT NULL,
  `nl` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  KEY `csr_ri_idx` (`ri`),
  CONSTRAINT `csr_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.csr:~1 rows (대략적) 내보내기
DELETE FROM `csr`;
/*!40000 ALTER TABLE `csr` DISABLE KEYS */;
INSERT INTO `csr` (`ri`, `cst`, `poa`, `cb`, `csi`, `mei`, `tri`, `rr`, `nl`) VALUES
	('/mobius-yt/rosemary', '1', '["http://203.254.173.104:7579"]', 'rosemary', '0.2.481.1.0001.001.000111', '', '', 'true', '');
/*!40000 ALTER TABLE `csr` ENABLE KEYS */;

-- 테이블 mobiusdb.grp 구조 내보내기
CREATE TABLE IF NOT EXISTS `grp` (
  `ri` varchar(200) NOT NULL,
  `cr` varchar(45) DEFAULT NULL,
  `mt` varchar(45) NOT NULL,
  `cnm` varchar(45) NOT NULL,
  `mnm` varchar(45) NOT NULL,
  `mid` mediumtext,
  `macp` mediumtext,
  `mtv` varchar(45) DEFAULT NULL,
  `csy` varchar(45) DEFAULT NULL,
  `gn` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  CONSTRAINT `grp_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.grp:~0 rows (대략적) 내보내기
DELETE FROM `grp`;
/*!40000 ALTER TABLE `grp` DISABLE KEYS */;
/*!40000 ALTER TABLE `grp` ENABLE KEYS */;

-- 테이블 mobiusdb.lcp 구조 내보내기
CREATE TABLE IF NOT EXISTS `lcp` (
  `ri` varchar(200) NOT NULL,
  `los` varchar(45) DEFAULT NULL,
  `lou` varchar(45) DEFAULT NULL,
  `lot` varchar(45) DEFAULT NULL,
  `lor` varchar(45) DEFAULT NULL,
  `loi` varchar(45) DEFAULT NULL,
  `lon` varchar(45) DEFAULT NULL,
  `lost` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  CONSTRAINT `lcp_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.lcp:~0 rows (대략적) 내보내기
DELETE FROM `lcp`;
/*!40000 ALTER TABLE `lcp` DISABLE KEYS */;
/*!40000 ALTER TABLE `lcp` ENABLE KEYS */;

-- 테이블 mobiusdb.lookup 구조 내보내기
CREATE TABLE IF NOT EXISTS `lookup` (
  `pi` varchar(200) NOT NULL,
  `ty` varchar(8) NOT NULL,
  `ct` varchar(15) NOT NULL,
  `ri` varchar(200) NOT NULL,
  `rn` varchar(45) NOT NULL,
  `lbl` varchar(45) DEFAULT NULL,
  `lt` varchar(15) NOT NULL,
  `et` varchar(15) DEFAULT NULL,
  `acpi` varchar(200) DEFAULT NULL,
  `at` varchar(45) DEFAULT NULL,
  `aa` varchar(45) DEFAULT NULL,
  `st` varchar(45) DEFAULT NULL,
  `mni` varchar(45) DEFAULT NULL,
  `cs` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`pi`,`ty`,`ct`,`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  KEY `idx_lookup_pi` (`pi`),
  KEY `idx_lookup_ty` (`ty`),
  KEY `idx_lookup_ct` (`ct`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.lookup:~3 rows (대략적) 내보내기
DELETE FROM `lookup`;
/*!40000 ALTER TABLE `lookup` DISABLE KEYS */;
INSERT INTO `lookup` (`pi`, `ty`, `ct`, `ri`, `rn`, `lbl`, `lt`, `et`, `acpi`, `at`, `aa`, `st`, `mni`, `cs`) VALUES
	('', '5', '20170221T055936', '/mobius-yt', 'mobius-yt', '["mobius-yt"]', '20170221T055936', '', '[]', '[]', '[]', '0', '', ''),
	('/mobius-yt', '16', '20170221T065040', '/mobius-yt/rosemary', 'rosemary', '[]', '20170221T065040', '20180221T065040', '[]', '[]', '[]', '0', '', ''),
	('/mobius-yt', '2', '20170221T092105', '/mobius-yt/ae-edu1', 'ae-edu1', '[]', '20170221T092105', '20180221T092105', '[]', '[]', '[]', '0', '', '');
/*!40000 ALTER TABLE `lookup` ENABLE KEYS */;

-- 테이블 mobiusdb.mms 구조 내보내기
CREATE TABLE IF NOT EXISTS `mms` (
  `ri` varchar(200) NOT NULL,
  `sid` varchar(45) DEFAULT NULL,
  `soid` varchar(45) DEFAULT NULL,
  `stid` varchar(45) DEFAULT NULL,
  `asd` varchar(45) DEFAULT NULL,
  `osd` varchar(45) DEFAULT NULL,
  `sst` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  CONSTRAINT `mms_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.mms:~0 rows (대략적) 내보내기
DELETE FROM `mms`;
/*!40000 ALTER TABLE `mms` DISABLE KEYS */;
/*!40000 ALTER TABLE `mms` ENABLE KEYS */;

-- 테이블 mobiusdb.sd 구조 내보내기
CREATE TABLE IF NOT EXISTS `sd` (
  `ri` varchar(200) NOT NULL,
  `cr` varchar(45) DEFAULT NULL,
  `dspt` longtext,
  `or` mediumtext,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  CONSTRAINT `sd_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.sd:~0 rows (대략적) 내보내기
DELETE FROM `sd`;
/*!40000 ALTER TABLE `sd` DISABLE KEYS */;
/*!40000 ALTER TABLE `sd` ENABLE KEYS */;

-- 테이블 mobiusdb.sub 구조 내보내기
CREATE TABLE IF NOT EXISTS `sub` (
  `ri` varchar(200) NOT NULL,
  `pi` varchar(200) DEFAULT NULL,
  `enc` varchar(45) DEFAULT NULL,
  `exc` varchar(45) DEFAULT NULL,
  `nu` varchar(200) DEFAULT NULL,
  `gpi` varchar(45) DEFAULT NULL,
  `nfu` varchar(45) DEFAULT NULL,
  `bn` varchar(45) DEFAULT NULL,
  `rl` varchar(45) DEFAULT NULL,
  `psn` varchar(45) DEFAULT NULL,
  `pn` varchar(45) DEFAULT NULL,
  `nsp` varchar(45) DEFAULT NULL,
  `ln` varchar(45) DEFAULT NULL,
  `nct` varchar(45) DEFAULT NULL,
  `nec` varchar(45) DEFAULT NULL,
  `cr` varchar(45) DEFAULT NULL,
  `su` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `resourceid_UNIQUE` (`ri`),
  CONSTRAINT `sub_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.sub:~0 rows (대략적) 내보내기
DELETE FROM `sub`;
/*!40000 ALTER TABLE `sub` DISABLE KEYS */;
/*!40000 ALTER TABLE `sub` ENABLE KEYS */;

-- 테이블 mobiusdb.ts 구조 내보내기
CREATE TABLE IF NOT EXISTS `ts` (
  `ri` varchar(200) NOT NULL,
  `cr` varchar(45) DEFAULT NULL,
  `mni` varchar(45) DEFAULT NULL,
  `mbs` varchar(45) DEFAULT NULL,
  `mia` varchar(45) DEFAULT NULL,
  `cni` varchar(45) DEFAULT NULL,
  `cbs` varchar(45) DEFAULT NULL,
  `or` varchar(45) DEFAULT NULL,
  `pin` varchar(45) DEFAULT NULL,
  `mdd` varchar(45) DEFAULT NULL,
  `mdmn` varchar(45) DEFAULT NULL,
  `mdl` longtext,
  `mdcn` varchar(45) DEFAULT NULL,
  `mddt` varchar(45) DEFAULT NULL,
  KEY `ts_ri_idx` (`ri`),
  CONSTRAINT `ts_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.ts:~0 rows (대략적) 내보내기
DELETE FROM `ts`;
/*!40000 ALTER TABLE `ts` DISABLE KEYS */;
/*!40000 ALTER TABLE `ts` ENABLE KEYS */;

-- 테이블 mobiusdb.tsi 구조 내보내기
CREATE TABLE IF NOT EXISTS `tsi` (
  `ri` varchar(200) NOT NULL,
  `dgt` varchar(45) DEFAULT NULL,
  `con` varchar(45) DEFAULT NULL,
  `sqn` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ri`),
  UNIQUE KEY `ri_UNIQUE` (`ri`),
  CONSTRAINT `tsi_ri` FOREIGN KEY (`ri`) REFERENCES `lookup` (`ri`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 테이블 데이터 mobiusdb.tsi:~0 rows (대략적) 내보내기
DELETE FROM `tsi`;
/*!40000 ALTER TABLE `tsi` DISABLE KEYS */;
/*!40000 ALTER TABLE `tsi` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
