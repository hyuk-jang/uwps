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

-- 테이블 power_monitoring.inverter_trouble_data 구조 내보내기
CREATE TABLE IF NOT EXISTS `inverter_trouble_data` (
  `inverter_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 문제 이력 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT 'isSystemError',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 코드',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`inverter_trouble_data_seq`,`inverter_seq`),
  KEY `FK_inverter_TO_inverter_trouble_data` (`inverter_seq`),
  CONSTRAINT `FK_inverter_TO_inverter_trouble_data` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=814 DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 테이블 데이터 power_monitoring.inverter_trouble_data:~382 rows (대략적) 내보내기
/*!40000 ALTER TABLE `inverter_trouble_data` DISABLE KEYS */;
INSERT INTO `inverter_trouble_data` (`inverter_trouble_data_seq`, `inverter_seq`, `is_error`, `msg`, `code`, `occur_date`, `fix_date`) VALUES
	(418, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-27 23:14:51', '2018-05-28 22:20:22'),
	(419, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-27 23:14:52', '2018-05-28 22:20:22'),
	(420, 1, 1, '장치 연결 해제', 'Disconnect', '2018-05-28 22:20:21', '2018-05-28 22:22:34'),
	(421, 2, 1, '장치 연결 해제', 'Disconnect', '2018-05-28 22:20:21', '2018-05-28 22:22:34'),
	(422, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:22:35', '2018-05-28 22:24:02'),
	(423, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:22:35', '2018-05-28 22:24:02'),
	(424, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 22:24:01', '2018-05-28 22:25:02'),
	(425, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:25:01', '2018-05-28 22:26:02'),
	(426, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:25:02', '2018-05-28 22:26:02'),
	(427, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 22:26:01', '2018-05-28 22:27:01'),
	(428, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:26:02', '2018-05-28 22:27:01'),
	(429, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:27:01', '2018-05-28 22:28:01'),
	(430, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:27:01', '2018-05-28 22:28:01'),
	(431, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:28:01', '2018-05-28 22:29:02'),
	(432, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:29:01', '2018-05-28 22:30:01'),
	(433, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:30:01', '2018-05-28 22:31:01'),
	(434, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:30:01', '2018-05-28 22:32:02'),
	(435, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 22:32:01', '2018-05-28 22:33:01'),
	(436, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 22:32:01', '2018-05-28 22:33:01'),
	(437, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:33:01', '2018-05-28 22:34:01'),
	(438, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:33:01', '2018-05-28 22:34:01'),
	(439, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:34:01', '2018-05-28 22:35:01'),
	(440, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:34:01', '2018-05-28 22:35:01'),
	(441, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:35:01', '2018-05-28 22:36:01'),
	(442, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:35:01', '2018-05-28 22:36:01'),
	(443, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 22:36:01', '2018-05-28 22:37:02'),
	(444, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 22:36:01', '2018-05-28 22:37:02'),
	(445, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:37:01', '2018-05-28 22:39:02'),
	(446, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:37:01', '2018-05-28 22:38:02'),
	(447, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:38:02', '2018-05-28 22:39:02'),
	(448, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:39:01', '2018-05-28 22:41:01'),
	(449, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:39:02', '2018-05-28 22:40:02'),
	(450, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:40:02', '2018-05-28 22:41:01'),
	(451, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 22:41:01', '2018-05-28 22:42:02'),
	(452, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:41:01', '2018-05-28 22:42:02'),
	(453, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:42:01', '2018-05-28 22:43:02'),
	(454, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:43:01', '2018-05-28 22:44:01'),
	(455, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:43:01', '2018-05-28 22:44:01'),
	(456, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 22:44:01', '2018-05-28 22:45:01'),
	(457, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 22:44:01', '2018-05-28 22:45:01'),
	(458, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:45:01', '2018-05-28 22:47:01'),
	(459, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:45:01', '2018-05-28 22:46:02'),
	(460, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:46:02', '2018-05-28 22:48:01'),
	(461, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:47:01', '2018-05-28 22:48:01'),
	(462, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:48:01', '2018-05-28 22:49:02'),
	(463, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:48:01', '2018-05-28 22:49:02'),
	(464, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:49:01', '2018-05-28 22:50:02'),
	(465, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:49:01', '2018-05-28 22:50:02'),
	(466, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 22:50:01', '2018-05-28 22:51:01'),
	(467, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:50:02', '2018-05-28 22:51:01'),
	(468, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:51:01', '2018-05-28 22:52:01'),
	(469, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:51:01', '2018-05-28 22:52:01'),
	(470, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 22:52:01', '2018-05-28 22:53:01'),
	(471, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:52:01', '2018-05-28 22:53:01'),
	(472, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 22:53:01', '2018-05-28 22:54:01'),
	(473, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 22:53:01', '2018-05-28 22:54:01'),
	(474, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:54:01', '2018-05-28 22:56:01'),
	(475, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:54:01', '2018-05-28 22:55:01'),
	(476, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 22:55:01', '2018-05-28 22:56:01'),
	(477, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 22:56:01', '2018-05-28 22:57:01'),
	(478, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:56:01', '2018-05-28 22:57:01'),
	(479, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:57:01', '2018-05-28 22:58:01'),
	(480, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 22:57:01', '2018-05-28 22:58:01'),
	(481, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 22:58:01', '2018-05-28 22:59:01'),
	(482, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 22:58:01', '2018-05-28 22:59:01'),
	(483, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:59:01', '2018-05-28 23:00:01'),
	(484, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 22:59:01', '2018-05-28 23:00:01'),
	(485, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:00:01', '2018-05-28 23:01:01'),
	(486, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:00:01', '2018-05-28 23:01:01'),
	(487, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 23:01:01', '2018-05-28 23:03:02'),
	(488, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:01:01', '2018-05-28 23:02:01'),
	(489, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:02:01', '2018-05-28 23:03:02'),
	(490, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:03:01', '2018-05-28 23:04:02'),
	(491, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:03:01', '2018-05-28 23:04:02'),
	(492, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:04:01', '2018-05-28 23:05:01'),
	(493, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:04:01', '2018-05-28 23:05:01'),
	(494, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:05:01', '2018-05-28 23:06:01'),
	(495, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:05:01', '2018-05-28 23:07:02'),
	(496, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:06:01', '2018-05-28 23:07:02'),
	(497, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:07:01', '2018-05-28 23:08:01'),
	(498, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 23:07:02', '2018-05-28 23:08:01'),
	(499, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:08:01', '2018-05-28 23:09:02'),
	(500, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:08:01', '2018-05-28 23:09:02'),
	(501, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:09:01', '2018-05-28 23:10:01'),
	(502, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 23:09:02', '2018-05-28 23:10:01'),
	(503, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:10:01', '2018-05-28 23:11:02'),
	(504, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:10:01', '2018-05-28 23:11:02'),
	(505, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:11:01', '2018-05-28 23:12:02'),
	(506, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:11:02', '2018-05-28 23:13:01'),
	(507, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:13:01', '2018-05-28 23:14:01'),
	(508, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 23:13:01', '2018-05-28 23:14:01'),
	(509, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:14:01', '2018-05-28 23:15:02'),
	(510, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:14:01', '2018-05-28 23:16:01'),
	(511, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:15:01', '2018-05-28 23:17:01'),
	(512, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:17:01', '2018-05-28 23:19:02'),
	(513, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:17:01', '2018-05-28 23:18:01'),
	(514, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:18:01', '2018-05-28 23:19:02'),
	(515, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:19:01', '2018-05-28 23:20:02'),
	(516, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:19:01', '2018-05-28 23:20:02'),
	(517, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:20:01', '2018-05-28 23:21:02'),
	(518, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:21:01', '2018-05-28 23:22:02'),
	(519, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:22:01', '2018-05-28 23:24:02'),
	(520, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:22:02', '2018-05-28 23:23:02'),
	(521, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:23:02', '2018-05-28 23:24:02'),
	(522, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:24:02', '2018-05-28 23:25:02'),
	(523, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:25:01', '2018-05-28 23:26:01'),
	(524, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 23:25:02', '2018-05-28 23:26:01'),
	(525, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:26:01', '2018-05-28 23:28:02'),
	(526, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:26:01', '2018-05-28 23:27:01'),
	(527, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:28:01', '2018-05-28 23:29:01'),
	(528, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:28:02', '2018-05-28 23:29:01'),
	(529, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:29:01', '2018-05-28 23:30:02'),
	(530, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:30:01', '2018-05-28 23:31:02'),
	(531, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:30:02', '2018-05-28 23:31:02'),
	(532, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:31:02', '2018-05-28 23:32:01'),
	(533, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:32:01', '2018-05-28 23:34:02'),
	(534, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:32:01', '2018-05-28 23:33:02'),
	(535, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:34:01', '2018-05-28 23:35:01'),
	(536, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:34:02', '2018-05-28 23:35:01'),
	(537, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:35:01', '2018-05-28 23:36:01'),
	(538, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:36:01', '2018-05-28 23:37:02'),
	(539, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-28 23:36:01', '2018-05-28 23:37:02'),
	(540, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:37:02', '2018-05-28 23:38:01'),
	(541, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:38:01', '2018-05-28 23:39:01'),
	(542, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:39:01', '2018-05-28 23:40:01'),
	(543, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:39:01', '2018-05-28 23:40:01'),
	(544, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:40:01', '2018-05-28 23:41:01'),
	(545, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:40:01', '2018-05-28 23:41:01'),
	(546, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:41:01', '2018-05-28 23:42:02'),
	(547, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:41:01', '2018-05-28 23:42:02'),
	(548, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:42:01', '2018-05-28 23:43:01'),
	(549, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:42:02', '2018-05-28 23:43:01'),
	(550, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:43:01', '2018-05-28 23:44:02'),
	(551, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:43:01', '2018-05-28 23:44:02'),
	(552, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:44:02', '2018-05-28 23:45:02'),
	(553, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:45:01', '2018-05-28 23:47:02'),
	(554, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:45:02', '2018-05-28 23:46:02'),
	(555, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:46:02', '2018-05-28 23:47:02'),
	(556, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:47:01', '2018-05-28 23:48:02'),
	(557, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:47:01', '2018-05-28 23:48:02'),
	(558, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:48:01', '2018-05-28 23:49:02'),
	(559, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:48:01', '2018-05-28 23:49:02'),
	(560, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:49:02', '2018-05-28 23:50:02'),
	(561, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:50:01', '2018-05-28 23:51:01'),
	(562, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:50:01', '2018-05-28 23:51:01'),
	(563, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:51:01', '2018-05-28 23:52:01'),
	(564, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:51:01', '2018-05-28 23:52:01'),
	(565, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:52:01', '2018-05-28 23:53:02'),
	(566, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:53:01', '2018-05-28 23:54:02'),
	(567, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:53:02', '2018-05-28 23:54:02'),
	(568, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:54:01', '2018-05-28 23:55:02'),
	(569, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-28 23:54:02', '2018-05-28 23:55:02'),
	(570, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:55:01', '2018-05-28 23:56:02'),
	(571, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-28 23:55:02', '2018-05-28 23:56:02'),
	(572, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:56:01', '2018-05-28 23:57:02'),
	(573, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:56:02', '2018-05-28 23:57:02'),
	(574, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-28 23:57:01', '2018-05-28 23:58:01'),
	(575, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-28 23:57:02', '2018-05-28 23:58:01'),
	(576, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-28 23:58:01', '2018-05-28 23:59:02'),
	(577, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-28 23:58:01', '2018-05-28 23:59:02'),
	(578, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-28 23:59:01', '2018-05-29 00:00:02'),
	(579, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-28 23:59:02', '2018-05-29 00:00:02'),
	(580, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:00:01', '2018-05-29 00:01:02'),
	(581, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:00:02', '2018-05-29 00:01:02'),
	(582, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:01:01', '2018-05-29 00:02:02'),
	(583, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:01:02', '2018-05-29 00:02:02'),
	(584, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:02:01', '2018-05-29 00:03:01'),
	(585, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:02:02', '2018-05-29 00:03:01'),
	(586, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:03:01', '2018-05-29 00:04:02'),
	(587, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:03:01', '2018-05-29 00:04:02'),
	(588, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:04:01', '2018-05-29 00:05:02'),
	(589, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:04:02', '2018-05-29 00:05:02'),
	(590, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:05:01', '2018-05-29 00:06:02'),
	(591, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:05:02', '2018-05-29 00:06:02'),
	(592, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:06:01', '2018-05-29 00:07:02'),
	(593, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:06:02', '2018-05-29 00:07:02'),
	(594, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:07:01', '2018-05-29 00:08:02'),
	(595, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:07:02', '2018-05-29 00:08:02'),
	(596, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:08:01', '2018-05-29 00:09:02'),
	(597, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:08:02', '2018-05-29 00:09:02'),
	(598, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:09:02', '2018-05-29 00:10:02'),
	(599, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:10:01', '2018-05-29 00:11:02'),
	(600, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:10:02', '2018-05-29 00:11:02'),
	(601, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:11:01', '2018-05-29 00:12:02'),
	(602, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:11:02', '2018-05-29 00:12:02'),
	(603, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:12:01', '2018-05-29 00:13:02'),
	(604, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:12:02', '2018-05-29 00:13:02'),
	(605, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:13:01', '2018-05-29 00:14:02'),
	(606, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:13:02', '2018-05-29 00:14:02'),
	(607, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:14:01', '2018-05-29 00:15:02'),
	(608, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:14:02', '2018-05-29 00:15:02'),
	(609, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:15:01', '2018-05-29 00:16:02'),
	(610, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:16:01', '2018-05-29 00:17:02'),
	(611, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:16:02', '2018-05-29 00:17:02'),
	(612, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:17:01', '2018-05-29 00:18:02'),
	(613, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:17:02', '2018-05-29 00:18:02'),
	(614, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:18:01', '2018-05-29 00:20:02'),
	(615, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:18:02', '2018-05-29 00:19:02'),
	(616, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:19:02', '2018-05-29 00:20:02'),
	(617, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:20:01', '2018-05-29 00:21:02'),
	(618, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:20:02', '2018-05-29 00:22:02'),
	(619, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:21:01', '2018-05-29 00:22:02'),
	(620, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:22:01', '2018-05-29 00:23:02'),
	(621, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:22:02', '2018-05-29 00:23:02'),
	(622, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:23:01', '2018-05-29 00:24:02'),
	(623, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:23:02', '2018-05-29 00:24:02'),
	(624, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:24:01', '2018-05-29 00:27:02'),
	(625, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:24:02', '2018-05-29 00:25:02'),
	(626, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:25:02', '2018-05-29 00:26:02'),
	(627, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:27:01', '2018-05-29 00:28:02'),
	(628, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:27:02', '2018-05-29 00:28:02'),
	(629, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:28:01', '2018-05-29 00:29:02'),
	(630, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:28:02', '2018-05-29 00:29:02'),
	(631, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:30:01', '2018-05-29 00:32:02'),
	(632, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:30:02', '2018-05-29 00:31:02'),
	(633, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:31:02', '2018-05-29 00:32:02'),
	(634, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:32:01', '2018-05-29 00:33:02'),
	(635, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:32:02', '2018-05-29 00:33:02'),
	(636, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:33:02', '2018-05-29 00:34:01'),
	(637, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:34:01', '2018-05-29 00:35:02'),
	(638, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:34:01', '2018-05-29 00:35:02'),
	(639, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:35:01', '2018-05-29 00:36:01'),
	(640, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:35:02', '2018-05-29 00:36:01'),
	(641, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:36:01', '2018-05-29 00:37:02'),
	(642, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:36:01', '2018-05-29 00:37:02'),
	(643, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:37:01', '2018-05-29 00:38:02'),
	(644, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:37:02', '2018-05-29 00:38:02'),
	(645, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:38:01', '2018-05-29 00:39:02'),
	(646, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:38:02', '2018-05-29 00:39:02'),
	(647, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:39:01', '2018-05-29 00:40:02'),
	(648, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:39:02', '2018-05-29 00:40:02'),
	(649, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:40:01', '2018-05-29 00:41:02'),
	(650, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:40:02', '2018-05-29 00:41:02'),
	(651, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:41:01', '2018-05-29 00:42:02'),
	(652, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:41:02', '2018-05-29 00:43:02'),
	(653, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:42:01', '2018-05-29 00:43:02'),
	(654, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:43:02', '2018-05-29 00:44:02'),
	(655, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:44:01', '2018-05-29 00:46:02'),
	(656, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:44:02', '2018-05-29 00:45:02'),
	(657, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:45:02', '2018-05-29 00:46:02'),
	(658, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:46:01', '2018-05-29 00:47:02'),
	(659, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:46:02', '2018-05-29 00:47:02'),
	(660, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:47:01', '2018-05-29 00:48:02'),
	(661, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:47:02', '2018-05-29 00:48:02'),
	(662, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:48:01', '2018-05-29 00:49:02'),
	(663, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:48:02', '2018-05-29 00:49:02'),
	(664, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:49:01', '2018-05-29 00:50:02'),
	(665, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:49:02', '2018-05-29 00:50:02'),
	(666, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 00:50:01', '2018-05-29 00:51:02'),
	(667, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:50:02', '2018-05-29 00:51:02'),
	(668, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:51:01', '2018-05-29 00:52:02'),
	(669, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:51:02', '2018-05-29 00:52:02'),
	(670, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 00:52:01', '2018-05-29 00:53:02'),
	(671, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 00:52:02', '2018-05-29 00:53:02'),
	(672, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:53:01', '2018-05-29 00:54:02'),
	(673, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:53:02', '2018-05-29 00:55:01'),
	(674, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:54:01', '2018-05-29 00:55:01'),
	(675, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:55:01', '2018-05-29 00:56:02'),
	(676, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 00:55:01', '2018-05-29 00:56:02'),
	(677, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:56:01', '2018-05-29 00:57:02'),
	(678, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 00:56:02', '2018-05-29 00:57:02'),
	(679, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:57:01', '2018-05-29 00:58:02'),
	(680, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 00:57:02', '2018-05-29 00:58:02'),
	(681, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:58:01', '2018-05-29 00:59:02'),
	(682, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 00:58:02', '2018-05-29 00:59:02'),
	(683, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 00:59:01', '2018-05-29 01:00:02'),
	(684, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 00:59:02', '2018-05-29 01:01:02'),
	(685, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:00:01', '2018-05-29 01:01:02'),
	(686, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:01:01', '2018-05-29 01:02:02'),
	(687, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:01:02', '2018-05-29 01:02:02'),
	(688, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:02:01', '2018-05-29 01:03:02'),
	(689, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:02:02', '2018-05-29 01:04:02'),
	(690, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:03:01', '2018-05-29 01:04:02'),
	(691, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:04:01', '2018-05-29 01:05:01'),
	(692, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:04:02', '2018-05-29 01:05:01'),
	(693, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:05:01', '2018-05-29 01:06:02'),
	(694, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:05:01', '2018-05-29 01:06:02'),
	(695, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:06:01', '2018-05-29 01:07:02'),
	(696, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:06:02', '2018-05-29 01:07:02'),
	(697, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:07:01', '2018-05-29 01:08:02'),
	(698, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:07:02', '2018-05-29 01:08:02'),
	(699, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:08:01', '2018-05-29 01:09:02'),
	(700, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:08:02', '2018-05-29 01:09:02'),
	(701, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:09:02', '2018-05-29 01:10:02'),
	(702, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:10:01', '2018-05-29 01:11:02'),
	(703, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:10:02', '2018-05-29 01:11:02'),
	(704, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:11:01', '2018-05-29 01:12:02'),
	(705, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:11:02', '2018-05-29 01:13:02'),
	(706, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:12:01', '2018-05-29 01:13:02'),
	(707, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:13:01', '2018-05-29 01:14:02'),
	(708, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:13:02', '2018-05-29 01:14:02'),
	(709, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:14:01', '2018-05-29 01:15:02'),
	(710, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:14:02', '2018-05-29 01:15:02'),
	(711, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:15:01', '2018-05-29 01:16:02'),
	(712, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:15:02', '2018-05-29 01:16:02'),
	(713, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:16:01', '2018-05-29 01:17:02'),
	(714, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:16:02', '2018-05-29 01:17:02'),
	(715, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:17:01', '2018-05-29 01:18:02'),
	(716, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:17:02', '2018-05-29 01:18:02'),
	(717, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:18:01', '2018-05-29 01:19:02'),
	(718, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:18:02', '2018-05-29 01:19:02'),
	(719, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:19:01', '2018-05-29 01:20:02'),
	(720, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:19:02', '2018-05-29 01:21:02'),
	(721, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:20:01', '2018-05-29 01:21:02'),
	(722, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:21:01', '2018-05-29 01:22:02'),
	(723, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:21:02', '2018-05-29 01:22:02'),
	(724, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:22:01', '2018-05-29 01:23:02'),
	(725, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:22:02', '2018-05-29 01:23:02'),
	(726, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:23:01', '2018-05-29 01:24:02'),
	(727, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:23:02', '2018-05-29 01:24:02'),
	(728, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:24:01', '2018-05-29 01:26:02'),
	(729, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:24:02', '2018-05-29 01:26:02'),
	(730, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:26:01', '2018-05-29 01:27:02'),
	(731, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:27:01', '2018-05-29 01:28:02'),
	(732, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:27:02', '2018-05-29 01:28:02'),
	(733, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:28:01', '2018-05-29 01:29:02'),
	(734, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:28:02', '2018-05-29 01:29:02'),
	(735, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:29:01', '2018-05-29 01:30:02'),
	(736, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:30:01', '2018-05-29 01:31:02'),
	(737, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:30:02', '2018-05-29 01:31:02'),
	(738, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:31:01', '2018-05-29 01:32:02'),
	(739, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:31:02', '2018-05-29 01:32:02'),
	(740, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:32:01', '2018-05-29 01:33:02'),
	(741, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:32:02', '2018-05-29 01:34:02'),
	(742, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:33:01', '2018-05-29 01:34:02'),
	(743, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:34:01', '2018-05-29 01:35:02'),
	(744, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:34:02', '2018-05-29 01:35:02'),
	(745, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:35:01', '2018-05-29 01:37:02'),
	(746, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:35:02', '2018-05-29 01:36:02'),
	(747, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:36:02', '2018-05-29 01:37:02'),
	(748, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:37:01', '2018-05-29 01:39:02'),
	(749, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:37:02', '2018-05-29 01:38:02'),
	(750, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:38:02', '2018-05-29 01:39:02'),
	(751, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:39:01', '2018-05-29 01:40:02'),
	(752, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:39:02', '2018-05-29 01:41:02'),
	(753, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:40:01', '2018-05-29 01:41:02'),
	(754, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:41:01', '2018-05-29 01:42:02'),
	(755, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:41:02', '2018-05-29 01:42:02'),
	(756, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:42:01', '2018-05-29 01:43:02'),
	(757, 2, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 01:42:02', '2018-05-29 01:43:02'),
	(758, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:43:01', '2018-05-29 01:44:02'),
	(759, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:43:02', '2018-05-29 01:44:02'),
	(760, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:44:01', '2018-05-29 01:45:02'),
	(761, 2, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:44:02', '2018-05-29 01:45:02'),
	(762, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:45:01', '2018-05-29 01:46:02'),
	(763, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:45:02', '2018-05-29 01:46:02'),
	(764, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:46:01', '2018-05-29 01:47:02'),
	(765, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:46:02', '2018-05-29 01:47:02'),
	(766, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 01:47:01', '2018-05-29 01:48:02'),
	(767, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:48:01', '2018-05-29 01:49:02'),
	(768, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:48:02', '2018-05-29 01:50:02'),
	(769, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:49:01', '2018-05-29 01:50:02'),
	(770, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:50:01', '2018-05-29 01:51:02'),
	(771, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:51:01', '2018-05-29 01:52:02'),
	(772, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:51:02', '2018-05-29 01:52:02'),
	(773, 1, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:52:01', '2018-05-29 01:53:02'),
	(774, 2, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:52:02', '2018-05-29 01:55:02'),
	(775, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 01:53:01', '2018-05-29 01:54:02'),
	(776, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 01:54:01', '2018-05-29 01:56:02'),
	(777, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 01:55:02', '2018-05-29 01:57:02'),
	(778, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-29 01:56:01', '2018-05-29 01:57:02'),
	(779, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:57:01', '2018-05-29 01:58:02'),
	(780, 1, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:58:01', '2018-05-29 01:59:02'),
	(781, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 01:58:02', '2018-05-29 01:59:02'),
	(782, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 01:59:01', '2018-05-29 02:00:02'),
	(783, 2, 0, 'STAND ALONE시 계통 연결', 'LINE CONNECTED', '2018-05-29 01:59:02', '2018-05-29 02:00:02'),
	(784, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 02:00:01', '2018-05-29 02:01:02'),
	(785, 2, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 02:00:02', '2018-05-29 02:01:02'),
	(786, 1, 0, '누설 전류 검출 (일종의 누전상태)', 'EARTH FAULT', '2018-05-29 02:01:01', '2018-05-29 02:02:02'),
	(787, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 02:01:02', '2018-05-29 02:02:02'),
	(788, 1, 0, '계통과 연결하는 MC 의 오작동', 'MC ERROR', '2018-05-29 02:02:01', '2018-05-29 02:03:02'),
	(789, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 02:02:02', '2018-05-29 02:03:02'),
	(790, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 02:03:02', '2018-05-29 02:04:02'),
	(791, 1, 0, '출력 IGBT 과전류', 'OVER CUR.2', '2018-05-29 02:04:01', '2018-05-29 02:05:02'),
	(792, 2, 0, 'DC-LINK 과전압', 'DC OVER VOLTAGE', '2018-05-29 02:04:02', '2018-05-29 02:05:02'),
	(793, 1, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 02:05:01', '2018-05-29 02:06:02'),
	(794, 2, 0, 'PV 모듈 배선의 역결선', 'PV ERROR', '2018-05-29 02:05:02', '2018-05-29 02:06:02'),
	(795, 1, 0, 'AC 출력 과전류', 'AC OVER CURRENT', '2018-05-29 02:06:01', '2018-05-29 02:07:02'),
	(796, 1, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 02:07:01', '2018-05-31 00:20:21'),
	(797, 2, 0, 'DC-LINK 센싱 불량', 'DC LINK ERROR', '2018-05-29 02:07:02', '2018-05-31 00:20:21'),
	(798, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 00:20:21', '2018-05-31 01:13:01'),
	(799, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 00:20:22', '2018-05-31 01:13:01'),
	(800, 1, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:13:00', '2018-05-31 01:13:16'),
	(801, 2, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:13:00', '2018-05-31 01:13:16'),
	(802, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 01:13:17', '2018-05-31 01:13:22'),
	(803, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 01:13:18', '2018-05-31 01:13:22'),
	(804, 1, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:13:21', '2018-05-31 01:16:38'),
	(805, 2, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:13:21', '2018-05-31 01:16:38'),
	(806, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 01:16:39', '2018-05-31 01:16:58'),
	(807, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 01:16:40', '2018-05-31 01:16:58'),
	(808, 1, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:16:57', '2018-05-31 01:50:24'),
	(809, 2, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:16:57', '2018-05-31 01:50:24'),
	(810, 1, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 01:50:25', '2018-05-31 01:51:00'),
	(811, 2, 0, '시스템 과열(단상 95도, 삼상 85도)', 'OVER HEAT', '2018-05-31 01:50:26', '2018-05-31 01:51:00'),
	(812, 1, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:50:26', NULL),
	(813, 2, 1, '장치 연결 해제', 'Disconnect', '2018-05-31 01:50:26', NULL);
/*!40000 ALTER TABLE `inverter_trouble_data` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
