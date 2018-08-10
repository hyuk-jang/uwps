-- MySQL dump 10.16  Distrib 10.3.8-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: upsas
-- ------------------------------------------------------
-- Server version	10.3.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `calendar`
--

DROP TABLE IF EXISTS `calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calendar` (
  `calendar_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '실험 달력 시퀀스',
  `main_seq` mediumint(9) NOT NULL COMMENT 'MAIN 시퀀스',
  `comment` varchar(100) DEFAULT NULL COMMENT '0: 정상, 1: 시스템 오류, 2: 비',
  `is_error` tinyint(4) DEFAULT NULL COMMENT '에러 여부',
  `writedate` datetime DEFAULT NULL COMMENT '작성일',
  PRIMARY KEY (`calendar_seq`,`main_seq`),
  KEY `FK_MAIN_TO_CALENDAR` (`main_seq`),
  CONSTRAINT `FK_MAIN_TO_CALENDAR` FOREIGN KEY (`main_seq`) REFERENCES `main` (`main_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='실험 달력';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

LOCK TABLES `calendar` WRITE;
/*!40000 ALTER TABLE `calendar` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `connector`
--

DROP TABLE IF EXISTS `connector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `connector` (
  `connector_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '접속반 id',
  `target_category` enum('dm_v1','dm_v2') DEFAULT NULL COMMENT '접속반 종류',
  `target_name` varchar(50) NOT NULL COMMENT '인버터 명',
  `connect_type` enum('socket','serial') NOT NULL COMMENT '연결 종류',
  `dialing` varbinary(50) NOT NULL COMMENT 'connector 접속 국번(1byte): Modbus RTU 기준',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `host` char(16) DEFAULT NULL COMMENT 'host',
  `port` varchar(10) DEFAULT NULL COMMENT 'port',
  `baud_rate` int(11) DEFAULT NULL COMMENT 'baud_rate',
  `director_name` varchar(50) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  PRIMARY KEY (`connector_seq`),
  UNIQUE KEY `UIX_CONNECTOR` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='접속반 상세 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connector`
--

LOCK TABLES `connector` WRITE;
/*!40000 ALTER TABLE `connector` DISABLE KEYS */;
INSERT INTO `connector` VALUES (1,'CNT2','dm_v2','수중','serial','002','324f78ff-452c-4a46-844a-ffe47defc1f7','localhost','COM10',9600,'디엠테크','01012345678'),(3,'CNT1','dm_v2','육상','serial','001',NULL,'','COM9',9600,'디엠테크','01012345678');
/*!40000 ALTER TABLE `connector` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `connector_trouble_data`
--

DROP TABLE IF EXISTS `connector_trouble_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `connector_trouble_data` (
  `connector_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 문제 이력 시퀀스',
  `connector_seq` mediumint(9) NOT NULL COMMENT '접속반 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT '고장 여부',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 코드',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`connector_trouble_data_seq`,`connector_seq`),
  KEY `FK_CONNECTOR_TO_CONNECTOR_TROUBLE_DATA` (`connector_seq`),
  CONSTRAINT `FK_CONNECTOR_TO_CONNECTOR_TROUBLE_DATA` FOREIGN KEY (`connector_seq`) REFERENCES `connector` (`connector_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connector_trouble_data`
--

LOCK TABLES `connector_trouble_data` WRITE;
/*!40000 ALTER TABLE `connector_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `connector_trouble_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_data_logger`
--

DROP TABLE IF EXISTS `dv_data_logger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_data_logger` (
  `data_logger_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '데이타 로거 시퀀스',
  `main_seq` mediumint(9) DEFAULT NULL COMMENT 'MAIN 시퀀스',
  `data_logger_def_seq` mediumint(9) DEFAULT NULL COMMENT '데이터 로거 개요 시퀀스',
  `target_id` varchar(20) DEFAULT NULL COMMENT 'Data Logger에 접속할 수 있는 ID',
  `target_code` varchar(30) DEFAULT NULL COMMENT '데이타 로거 식별 번호',
  `connect_info` longtext DEFAULT NULL COMMENT '장치 접속 정보',
  `protocol_info` longtext DEFAULT NULL COMMENT '장치 프로토콜 정보',
  PRIMARY KEY (`data_logger_seq`),
  KEY `FK_MAIN_TO_DATA_LOGGER` (`main_seq`),
  KEY `FK_DATA_LOGGER_DEF_TO_DATA_LOGGER` (`data_logger_def_seq`),
  CONSTRAINT `FK_DATA_LOGGER_DEF_TO_DATA_LOGGER` FOREIGN KEY (`data_logger_def_seq`) REFERENCES `dv_data_logger_def` (`data_logger_def_seq`),
  CONSTRAINT `FK_MAIN_TO_DATA_LOGGER` FOREIGN KEY (`main_seq`) REFERENCES `main` (`main_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8 COMMENT='데이타 로거';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_data_logger`
--

LOCK TABLES `dv_data_logger` WRITE;
/*!40000 ALTER TABLE `dv_data_logger` DISABLE KEYS */;
INSERT INTO `dv_data_logger` VALUES (1,1,4,'0013A20040F7AB81','001','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB81\"}'),(2,1,4,'0013A20040F7AB76','002','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB76\"}'),(3,1,4,'0013A20040F7AB69','003','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB69\"}'),(4,1,4,'0013A20040F7AB96','004','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB96\"}'),(5,1,1,'0013A20040F7ACC8','005','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7ACC8\"}'),(6,1,1,'0013A20040F7B486','006','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B486\"}'),(7,1,1,'0013A20040F7B47C','007','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B47C\"}'),(8,1,1,'0013A20040F7AB9C','008','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB9C\"}'),(9,1,1,'0013A20040F7B430','009','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B430\"}'),(10,1,1,'0013A20040F7AB7D','010','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB7D\"}'),(11,1,1,'0013A20040F7B4A9','011','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B4A9\"}'),(12,1,1,'0013A20040F7B460','012','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B460\"}'),(13,1,1,'0013A20040F7B49B','013','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B49B\"}'),(14,1,1,'0013A20040F7B453','014','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B453\"}'),(15,1,1,'0013A20040F7B474','015','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B474\"}'),(16,1,1,'0013A20040F7AB98','016','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB98\"}'),(17,1,2,'0013A20040F7B47F','001','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B47F\"}'),(18,1,2,'0013A20040F7B4A4','002','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B4A4\"}'),(19,1,2,'0013A20040F7B455','003','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B455\"}'),(20,1,2,'0013A20040F7B43C','004','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B43C\"}'),(21,1,2,'0013A20040F7B469','006','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B469\"}'),(22,1,2,'0013A20040F7B4A7','007','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B4A7\"}'),(23,1,3,'0013A20040F7B451','001','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B451\"}'),(24,1,3,'0013A20040F7B446','002','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B446\"}'),(25,1,3,'0013A20040F7B44A','003','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7B44A\"}'),(26,1,3,'0013A20040F7A4E0','004','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7A4E0\"}'),(27,1,3,'0013A20040F7A4D8','005','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7A4D8\"}'),(28,1,5,'0013A20040F7AB86','001','{\"type\":\"socket\",\"subType\":\"\",\"baudRate\":9600,\"host\":\"localhost\",\"port\":9000}','{\"mainCategory\":\"UPSAS\",\"subCategory\":\"xbee\",\"deviceId\":\"0013A20040F7AB86\"}');
/*!40000 ALTER TABLE `dv_data_logger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_data_logger_def`
--

DROP TABLE IF EXISTS `dv_data_logger_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_data_logger_def` (
  `data_logger_def_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '데이터 로거 개요 시퀀스',
  `target_prefix` varchar(15) DEFAULT NULL COMMENT '데이터 로거 접두사(D_WD, D_P, ...)',
  `target_alias` varchar(50) DEFAULT NULL COMMENT '데이터 로거를 부를 일반 명칭',
  PRIMARY KEY (`data_logger_def_seq`),
  UNIQUE KEY `UIX_DATA_LOGGER_DEF` (`target_prefix`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COMMENT='데이터 로거 개요';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_data_logger_def`
--

LOCK TABLES `dv_data_logger_def` WRITE;
/*!40000 ALTER TABLE `dv_data_logger_def` DISABLE KEYS */;
INSERT INTO `dv_data_logger_def` VALUES (1,'R_G','수문 DL'),(2,'R_V','밸브 DL'),(3,'R_P','펌프 DL'),(4,'R_GV','게이트형 밸브 DL'),(5,'R_EP','육상 모듈 DL');
/*!40000 ALTER TABLE `dv_data_logger_def` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_data_logger_trouble_data`
--

DROP TABLE IF EXISTS `dv_data_logger_trouble_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_data_logger_trouble_data` (
  `data_logger_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '고장 이력 시퀀스',
  `data_logger_seq` mediumint(9) DEFAULT NULL COMMENT '데이타 로거 시퀀스',
  `trouble_msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `fix_msg` varchar(100) DEFAULT NULL COMMENT '해결 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`data_logger_trouble_data_seq`),
  KEY `FK_DATA_LOGGER_TO_DATA_LOGGER_TROUBLE_DATA` (`data_logger_seq`),
  CONSTRAINT `FK_DATA_LOGGER_TO_DATA_LOGGER_TROUBLE_DATA` FOREIGN KEY (`data_logger_seq`) REFERENCES `dv_data_logger` (`data_logger_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_data_logger_trouble_data`
--

LOCK TABLES `dv_data_logger_trouble_data` WRITE;
/*!40000 ALTER TABLE `dv_data_logger_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `dv_data_logger_trouble_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_device_state_data`
--

DROP TABLE IF EXISTS `dv_device_state_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_device_state_data` (
  `device_state_data_seq` mediumint(9) NOT NULL COMMENT '장치 상태 데이터 시퀀스',
  `node_seq` mediumint(9) NOT NULL COMMENT '노드 정보 시퀀스',
  `str_data` varchar(30) NOT NULL COMMENT '장치 데이터',
  `writedate` datetime NOT NULL COMMENT '입력일',
  PRIMARY KEY (`device_state_data_seq`,`node_seq`),
  KEY `FK_NODE_TO_DEVICE_DATA` (`node_seq`),
  CONSTRAINT `FK_NODE_TO_DEVICE_DATA` FOREIGN KEY (`node_seq`) REFERENCES `dv_node` (`node_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치 상태 \r\n데이터';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_device_state_data`
--

LOCK TABLES `dv_device_state_data` WRITE;
/*!40000 ALTER TABLE `dv_device_state_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `dv_device_state_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_node`
--

DROP TABLE IF EXISTS `dv_node`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_node` (
  `node_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '센서 정보 시퀀스',
  `node_def_seq` mediumint(9) DEFAULT NULL COMMENT '노드 개요 정보 시퀀스',
  `data_logger_seq` mediumint(9) DEFAULT NULL COMMENT '데이타 로거 시퀀스',
  `target_code` varchar(30) NOT NULL COMMENT '센서 ID(001, 002, ...)',
  `data_logger_index` tinyint(4) NOT NULL DEFAULT 0 COMMENT '해당 센서 데이터의 데이터 로거 인덱스(Default 0)',
  `serial_number` varchar(100) DEFAULT NULL COMMENT '센서 뒷면에 나와있는 S/N',
  PRIMARY KEY (`node_seq`),
  KEY `FK_NODE_DEF_TO_NODE` (`node_def_seq`),
  KEY `FK_DATA_LOGGER_TO_NODE` (`data_logger_seq`),
  CONSTRAINT `FK_DATA_LOGGER_TO_NODE` FOREIGN KEY (`data_logger_seq`) REFERENCES `dv_data_logger` (`data_logger_seq`),
  CONSTRAINT `FK_NODE_DEF_TO_NODE` FOREIGN KEY (`node_def_seq`) REFERENCES `dv_node_def` (`node_def_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8 COMMENT='센서 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_node`
--

LOCK TABLES `dv_node` WRITE;
/*!40000 ALTER TABLE `dv_node` DISABLE KEYS */;
INSERT INTO `dv_node` VALUES (1,1,5,'005',0,NULL),(2,1,6,'006',0,NULL),(3,1,7,'007',0,NULL),(4,1,8,'008',0,NULL),(5,1,9,'009',0,NULL),(6,1,10,'010',0,NULL),(7,1,11,'011',0,NULL),(8,1,12,'012',0,NULL),(9,1,13,'013',0,NULL),(10,1,14,'014',0,NULL),(11,1,15,'015',0,NULL),(12,1,16,'016',0,NULL),(13,4,17,'001',0,NULL),(14,4,18,'002',0,NULL),(15,4,19,'003',0,NULL),(16,4,20,'004',0,NULL),(17,4,NULL,'005',0,NULL),(18,4,21,'006',0,NULL),(19,4,22,'007',0,NULL),(20,8,1,'001',0,NULL),(21,8,2,'002',0,NULL),(22,8,3,'003',0,NULL),(23,8,4,'004',0,NULL),(24,5,23,'001',0,NULL),(25,5,24,'002',0,NULL),(26,5,25,'003',0,NULL),(27,5,26,'004',0,NULL),(28,5,27,'005',0,NULL),(29,2,1,'001',0,NULL),(30,2,2,'002',0,NULL),(31,2,3,'003',0,NULL),(32,2,4,'004',0,NULL),(33,7,17,'001',0,NULL),(34,7,18,'002',0,NULL),(35,7,19,'003',0,NULL),(36,7,20,'004',0,NULL),(37,7,28,'005',1,NULL),(38,7,28,'006',0,NULL);
/*!40000 ALTER TABLE `dv_node` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_node_class`
--

DROP TABLE IF EXISTS `dv_node_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_node_class` (
  `node_class_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '노드 대분류 시퀀스',
  `target_id` varchar(255) NOT NULL COMMENT '노드를 가르키는 고유 명',
  `target_name` varchar(50) NOT NULL COMMENT '장치 명(한글)',
  `is_sensor` tinyint(4) NOT NULL DEFAULT 0 COMMENT '센서 여부(0: Device, 1: Sensor)',
  `data_unit` varchar(10) DEFAULT NULL COMMENT 'cm, kWh, m/s, m 등등',
  `description` varchar(255) DEFAULT NULL COMMENT '부연 설명이 필요한 경우',
  PRIMARY KEY (`node_class_seq`),
  UNIQUE KEY `UIX_NODE_CLASS` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COMMENT='지정된 센서 목록으로 온도 센서(Temperature), 풍향 센서(WindSpeed) 등등을 표기한 ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_node_class`
--

LOCK TABLES `dv_node_class` WRITE;
/*!40000 ALTER TABLE `dv_node_class` DISABLE KEYS */;
INSERT INTO `dv_node_class` VALUES (1,'temp','온도',1,'℃','섭씨'),(2,'reh','습도',1,'%','습도 센서'),(3,'ws','풍속',1,'m/s','초당 바람이 이동하는 거리(m)'),(4,'solar','일사량',1,'W/m²','1평방 미터당 조사되는 일사에너지의 양이 1W'),(5,'co2','이산화탄소',1,'ppm','백만분의 1. 이산화탄소 농도 395ppm = 395/1,000,000 * 100 = 0.0395 %'),(6,'uv','자외선',1,'mJ/c㎡','1평방 센치당 조사되는 uv 에너지가 1mJ'),(7,'lux','조도',1,'lx','1㎡의 면적 위에 1m의 광속이 균일하게 비춰질 때'),(8,'vol','전압',1,'V',NULL),(9,'amp','전류',1,'A',NULL),(10,'salinity','염도',1,'%',NULL),(11,'waterLevel','수위',1,'cm',NULL),(12,'waterDoor','수문',0,NULL,NULL),(13,'valve','밸브',0,NULL,NULL),(14,'pump','펌프',0,NULL,NULL);
/*!40000 ALTER TABLE `dv_node_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_node_def`
--

DROP TABLE IF EXISTS `dv_node_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_node_def` (
  `node_def_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '노드 개요 정보 시퀀스',
  `node_class_seq` mediumint(9) DEFAULT NULL COMMENT '노드 목록 시퀀스',
  `target_prefix` varchar(15) NOT NULL COMMENT '해당 프로젝트에서 쓸 접두사',
  `target_id` varchar(50) DEFAULT NULL COMMENT '사용 목적에 따라 달리 부를 센서 명으로 데이터 Key를 결정',
  `target_name` varchar(50) DEFAULT NULL COMMENT '필요시 세부 사용 목적 기술',
  `description` varchar(255) DEFAULT NULL COMMENT '노드 데이터 단위에 대한 부연 설명이 필요한 경우',
  PRIMARY KEY (`node_def_seq`),
  UNIQUE KEY `UIX_NODE_DEF` (`target_prefix`),
  UNIQUE KEY `UIX_NODE_DEF2` (`target_id`),
  KEY `FK_NODE_CLASS_TO_NODE_DEF` (`node_class_seq`),
  CONSTRAINT `FK_NODE_CLASS_TO_NODE_DEF` FOREIGN KEY (`node_class_seq`) REFERENCES `dv_node_class` (`node_class_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COMMENT='노드 개요 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_node_def`
--

LOCK TABLES `dv_node_def` WRITE;
/*!40000 ALTER TABLE `dv_node_def` DISABLE KEYS */;
INSERT INTO `dv_node_def` VALUES (1,12,'WD','waterDoor','수문','0: Stop, 2: Open, 3: Closing, 4: Close, 5: Opening'),(2,11,'WL','waterLevel','수위',NULL),(3,10,'S','salinity','염도',NULL),(4,13,'V','valve','밸브','0: UNDEF, 1: Close, 2: Open, 3: Busy'),(5,14,'P','pump','펌프','0: Off, 1: On'),(6,1,'MFT','moduleFrontTemperature','모듈 앞면 온도',NULL),(7,1,'MRT','moduleRearTemperature','모듈 뒷면 온도',NULL),(8,13,'GV','gateValve','수문 용 밸브',NULL);
/*!40000 ALTER TABLE `dv_node_def` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dv_sensor_data`
--

DROP TABLE IF EXISTS `dv_sensor_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dv_sensor_data` (
  `sensor_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '센서 데이터 시퀀스',
  `node_seq` mediumint(9) NOT NULL COMMENT '센서 정보 시퀀스',
  `num_data` float NOT NULL COMMENT '장치 데이터',
  `writedate` datetime NOT NULL COMMENT '입력일',
  PRIMARY KEY (`sensor_data_seq`,`node_seq`),
  KEY `FK_NODE_TO_SENSOR_DATA` (`node_seq`),
  CONSTRAINT `FK_NODE_TO_SENSOR_DATA` FOREIGN KEY (`node_seq`) REFERENCES `dv_node` (`node_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='수치 데이터를 가지고 있는 센서의 데이터를 기록';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dv_sensor_data`
--

LOCK TABLES `dv_sensor_data` WRITE;
/*!40000 ALTER TABLE `dv_sensor_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `dv_sensor_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inverter`
--

DROP TABLE IF EXISTS `inverter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inverter` (
  `inverter_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '인버터 id',
  `target_name` varchar(50) NOT NULL COMMENT '인버터 명',
  `target_type` enum('third','single') NOT NULL COMMENT '0: 단상, 1: 삼상',
  `target_category` enum('dev','s_hex','s_e&p') DEFAULT NULL COMMENT '인버터 회사 프로토콜',
  `connect_type` enum('socket','serial') NOT NULL COMMENT '연결 종류',
  `dialing` varbinary(50) NOT NULL COMMENT 'inverter 접속 국번(2byte): HexPower 기준',
  `host` char(16) DEFAULT NULL COMMENT 'host',
  `port` varchar(10) DEFAULT NULL COMMENT 'port',
  `baud_rate` int(11) DEFAULT NULL COMMENT 'baud_rate',
  `code` varchar(100) DEFAULT NULL COMMENT '고유 코드',
  `amount` float NOT NULL COMMENT '단위: Wh (10:1 Scale)',
  `director_name` varchar(50) NOT NULL COMMENT '담당자',
  `director_tel` varchar(13) NOT NULL COMMENT '연락처',
  `chart_color` varchar(13) DEFAULT NULL COMMENT '대시 보드 차트 색상',
  `chart_sort_rank` tinyint(4) DEFAULT NULL COMMENT '대시 보드 차트 정렬 순위',
  `compare_inverter_seq` tinyint(4) DEFAULT NULL COMMENT '성능 비교를 위한 인버터',
  PRIMARY KEY (`inverter_seq`),
  UNIQUE KEY `UIX_INVERTER` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='인버터 장치 상세 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inverter`
--

LOCK TABLES `inverter` WRITE;
/*!40000 ALTER TABLE `inverter` DISABLE KEYS */;
INSERT INTO `inverter` VALUES (1,'IVT3','수중 G2G (다)','single','s_hex','serial','03','localhost','COM13',9600,'e279f4c4-cdc8-4423-97f8-d30a78c5aff1',15,'홍길동 1','01011114444','skyblue',6,5),(2,'IVT4','수중 일반 (다)','single','s_hex','serial','04','localhost','COM14',9600,'d6717789-009c-415e-8dbf-b637e6a45182',15,'홍길동 2','01011114444','yellow',4,6),(3,'IVT5','수중 G2G (단)','single','s_hex','serial','05','localhost','COM15',9600,'1afcb839-78e4-431a-a91c-de2d6e9ff6d4',15,'홍길동 3','01011114444','blue',5,5),(4,'IVT6','수중 일반 (단)','single','s_hex','serial','06','localhost','COM16',9600,'aa3e00f6-94b6-4caa-825b-40fd527c47c8',15,'홍길동 4','01011114444','orange',3,6),(5,'IVT1','육상 G2G (다)','single','s_hex','serial','01','localhost','COM11',9600,'a8b3b27a-239f-4bd7-8025-b5025c71aedd',15,'홍길동 5','01011114444','black',2,5),(6,'IVT2','육상 일반 (다)','single','s_hex','serial','02','localhost','COM12',9600,'ebbd733e-95df-4e52-8f4d-9ab0a884cb19',15,'홍길동 6','01011114444','gray',1,6);
/*!40000 ALTER TABLE `inverter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inverter_data`
--

DROP TABLE IF EXISTS `inverter_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inverter_data` (
  `inverter_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 데이터 시퀀스',
  `inverter_seq` mediumint(9) DEFAULT NULL COMMENT '인버터 정보 시퀀스',
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
  PRIMARY KEY (`inverter_data_seq`),
  KEY `FK_INVERTER_TO_INVERTER_DATA` (`inverter_seq`),
  CONSTRAINT `FK_INVERTER_TO_INVERTER_DATA` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='인버터에서 측정된 데이터';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inverter_data`
--

LOCK TABLES `inverter_data` WRITE;
/*!40000 ALTER TABLE `inverter_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `inverter_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inverter_trouble_data`
--

DROP TABLE IF EXISTS `inverter_trouble_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inverter_trouble_data` (
  `inverter_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '인버터 문제 이력 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT 'isSystemError',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 코드',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`inverter_trouble_data_seq`,`inverter_seq`),
  KEY `FK_INVERTER_TO_INVERTER_TROUBLE_DATA` (`inverter_seq`),
  CONSTRAINT `FK_INVERTER_TO_INVERTER_TROUBLE_DATA` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inverter_trouble_data`
--

LOCK TABLES `inverter_trouble_data` WRITE;
/*!40000 ALTER TABLE `inverter_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `inverter_trouble_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kma_data`
--

DROP TABLE IF EXISTS `kma_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kma_data` (
  `kma_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상청 일기 예보 시퀀스',
  `weather_location_seq` mediumint(9) NOT NULL COMMENT '기상청 정보 위치 시퀀스',
  `temp` float DEFAULT NULL COMMENT '℃',
  `sky` tinyint(4) DEFAULT NULL COMMENT '① 1 : 맑음 ② 2 : 구름조금 ③ 3 : 구름많음 ④ 4 : 흐림',
  `pty` tinyint(4) DEFAULT NULL COMMENT '(0 : 없음, 1:비, 2:비/눈, 3:눈/비, 4:눈)',
  `wf` tinyint(4) DEFAULT NULL COMMENT '① 맑음 ② 구름 조금 ③ 구름 많음 ④ 흐림 ⑤ 비 ⑥ 눈/비 ⑦ 눈',
  `pop` tinyint(4) DEFAULT NULL COMMENT '%',
  `r12` float DEFAULT NULL COMMENT 'mm (① 0 <= x < 0.1, ② 0.1 <= x < 1, ③ 1 <= x < 5, ④ 5 <= x < 10, ⑤ 10 <= x < 25, ⑥ 25 <= x < 50, ⑦ 50 <= x)',
  `ws` float DEFAULT NULL COMMENT 'm/s',
  `wd` tinyint(4) DEFAULT NULL COMMENT '풍향 0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)',
  `reh` float DEFAULT NULL COMMENT '%',
  `applydate` datetime NOT NULL COMMENT '적용시간',
  `writedate` datetime DEFAULT NULL COMMENT '작성일',
  `updatedate` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`kma_data_seq`,`weather_location_seq`),
  KEY `FK_WEATHER_LOCATION_TO_KMA_DATA` (`weather_location_seq`),
  CONSTRAINT `FK_WEATHER_LOCATION_TO_KMA_DATA` FOREIGN KEY (`weather_location_seq`) REFERENCES `weather_location` (`weather_location_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8 COMMENT='기상청에서 발표한 일기예보를 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kma_data`
--

LOCK TABLES `kma_data` WRITE;
/*!40000 ALTER TABLE `kma_data` DISABLE KEYS */;
INSERT INTO `kma_data` VALUES (1,659,35,3,0,3,20,0,4,2,55,'2018-07-30 15:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(2,659,33,2,0,2,10,0,2.3,2,65,'2018-07-30 18:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(3,659,29,2,0,2,10,0,1.6,2,80,'2018-07-30 21:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(4,659,25,2,0,2,10,0,1.1,1,90,'2018-07-31 00:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(5,659,24,2,0,2,10,0,1,1,90,'2018-07-31 03:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(6,659,23,2,0,2,10,0,1,1,90,'2018-07-31 06:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(7,659,28,2,0,2,10,0,1.2,1,80,'2018-07-31 09:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(8,659,34,2,0,2,10,0,0.4,0,55,'2018-07-31 12:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(9,659,37,2,0,2,10,0,0.9,0,50,'2018-07-31 15:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(10,659,34,2,0,2,10,0,0.7,6,60,'2018-07-31 18:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(11,659,29,2,0,2,10,0,1.8,6,85,'2018-07-31 21:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(12,659,26,2,0,2,10,0,0.4,4,90,'2018-08-01 00:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(13,659,26,1,0,1,0,0,0.4,2,95,'2018-08-01 03:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(14,659,25,1,0,1,0,0,0.4,1,95,'2018-08-01 06:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(15,659,28,1,0,1,0,0,0.8,1,80,'2018-08-01 09:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(16,659,34,1,0,1,0,0,1.7,0,65,'2018-08-01 12:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(17,2659,32,4,0,4,30,0,2.6,7,60,'2018-07-30 15:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(18,2659,32,4,0,4,20,0,3.7,7,65,'2018-07-30 18:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(19,2659,29,3,0,3,20,0,0.4,5,75,'2018-07-30 21:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(20,2659,27,3,0,3,20,0,0.5,7,90,'2018-07-31 00:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(21,2659,27,2,0,2,10,0,1.1,0,85,'2018-07-31 03:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(22,2659,25,2,0,2,10,0,1.6,1,90,'2018-07-31 06:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(23,2659,30,2,0,2,10,0,1.4,1,70,'2018-07-31 09:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(24,2659,33,2,0,2,10,0,0.2,1,55,'2018-07-31 12:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(25,2659,33,3,0,3,20,0,1.7,5,55,'2018-07-31 15:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(26,2659,32,2,0,2,10,0,2.4,0,70,'2018-07-31 18:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(27,2659,28,2,0,2,10,0,1.3,3,80,'2018-07-31 21:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(28,2659,27,2,0,2,10,0,1.6,5,90,'2018-08-01 00:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(29,2659,27,2,0,2,10,0,0.7,1,90,'2018-08-01 03:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(30,2659,25,2,0,2,10,0,1.2,0,90,'2018-08-01 06:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(31,2659,30,2,0,2,10,0,0.9,1,65,'2018-08-01 09:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46'),(32,2659,32,2,0,2,10,0,1.2,7,55,'2018-08-01 12:00:00','2018-07-30 11:25:46','2018-07-30 02:25:46');
/*!40000 ALTER TABLE `kma_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `main`
--

DROP TABLE IF EXISTS `main`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `main` (
  `main_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT 'MAIN 시퀀스',
  `weather_location_seq` mediumint(9) DEFAULT NULL COMMENT '기상청 정보 위치 시퀀스',
  `uuid` varchar(250) DEFAULT NULL COMMENT 'UUID',
  `name` varchar(50) DEFAULT NULL COMMENT 'UPSAS 이름',
  `address` varchar(100) DEFAULT NULL COMMENT '주소',
  `ip` varchar(16) DEFAULT NULL COMMENT '아이피',
  `push_port` varchar(8) DEFAULT NULL COMMENT '푸시포트',
  `cmd_port` varchar(8) DEFAULT NULL COMMENT '명령포트',
  `gcm_senderid` varchar(255) DEFAULT NULL COMMENT 'GCM_ID',
  `is_deleted` tinyint(4) DEFAULT NULL COMMENT '삭제여부',
  `writedate` datetime DEFAULT NULL COMMENT '생성일',
  `updatedate` timestamp NULL DEFAULT NULL COMMENT '수정일',
  PRIMARY KEY (`main_seq`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `FK_WEATHER_LOCATION_TO_MAIN` (`weather_location_seq`),
  CONSTRAINT `FK_WEATHER_LOCATION_TO_MAIN` FOREIGN KEY (`weather_location_seq`) REFERENCES `weather_location` (`weather_location_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='설치되고 운용중인 UPSAS 목록 정보 ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `main`
--

LOCK TABLES `main` WRITE;
/*!40000 ALTER TABLE `main` DISABLE KEYS */;
INSERT INTO `main` VALUES (1,2659,'aaaaa','6kW 급 TB','전남 무안군 현경면','smtb.iptime.org',NULL,NULL,NULL,0,'2018-06-18 11:29:03','2018-06-17 08:29:05'),(2,659,'bbbbb',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `main` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `main_map`
--

DROP TABLE IF EXISTS `main_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `main_map` (
  `main_seq` mediumint(9) NOT NULL COMMENT 'MAIN 시퀀스',
  `path` varchar(255) DEFAULT NULL COMMENT '경로',
  `url` varchar(255) DEFAULT NULL COMMENT 'URL',
  `name` varchar(50) DEFAULT NULL COMMENT '파일이름',
  `writedate` datetime DEFAULT NULL COMMENT '등록일',
  PRIMARY KEY (`main_seq`),
  CONSTRAINT `FK_MAIN_TO_MAIN_MAP` FOREIGN KEY (`main_seq`) REFERENCES `main` (`main_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='염전맵이 저장되어 있는 경로';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `main_map`
--

LOCK TABLES `main_map` WRITE;
/*!40000 ALTER TABLE `main_map` DISABLE KEYS */;
/*!40000 ALTER TABLE `main_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `member` (
  `member_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '회원정보 시퀀스',
  `main_seq` mediumint(9) DEFAULT NULL COMMENT 'MAIN 시퀀스',
  `user_id` varchar(255) NOT NULL COMMENT '아이디',
  `pw_salt` varchar(255) DEFAULT NULL COMMENT '암호화소금',
  `pw_hash` varchar(255) DEFAULT NULL COMMENT '암호화비밀번호',
  `name` varchar(50) DEFAULT NULL COMMENT '이름',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '별칭',
  `grade` enum('admin','manager','owner','guest') DEFAULT NULL COMMENT '회원 등급',
  `address` varchar(100) DEFAULT NULL COMMENT '주소',
  `tel` varchar(13) DEFAULT NULL COMMENT '전화번호',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0 COMMENT '삭제여부',
  `writedate` datetime DEFAULT NULL COMMENT '생성일',
  `updatedate` timestamp NULL DEFAULT NULL COMMENT '수정일',
  PRIMARY KEY (`member_seq`),
  UNIQUE KEY `UIX_MEMBER` (`user_id`),
  KEY `FK_MAIN_TO_MEMBER` (`main_seq`),
  CONSTRAINT `FK_MAIN_TO_MEMBER` FOREIGN KEY (`main_seq`) REFERENCES `main` (`main_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='가입한 회원의 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES (1,1,'tester','a1df0aec828d797151d675710cf806b9','798756cd1958e2efe21925c634eda5dbaad3202b2aaa07b0a1040dbb3f3dd7f59bcb7dca3d2d2968b5239207516f82273b34b5b8fc69e812fe5c8d8b23fb2f54',NULL,NULL,NULL,NULL,NULL,0,'2018-08-02 09:27:17','2018-08-02 00:27:19');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_data`
--

DROP TABLE IF EXISTS `module_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `module_data` (
  `module_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '접속반 데이터 시퀀스',
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `amp` int(11) NOT NULL COMMENT '10:1 Scale',
  `vol` int(11) NOT NULL COMMENT '10:1 Scale',
  `writedate` datetime NOT NULL COMMENT '등록일',
  PRIMARY KEY (`module_data_seq`,`photovoltaic_seq`),
  KEY `FK_PHOTOVOLTAIC_TO_MODULE_DATA` (`photovoltaic_seq`),
  CONSTRAINT `FK_PHOTOVOLTAIC_TO_MODULE_DATA` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='접속반에서 측정된 데이터';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_data`
--

LOCK TABLES `module_data` WRITE;
/*!40000 ALTER TABLE `module_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photovoltaic`
--

DROP TABLE IF EXISTS `photovoltaic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photovoltaic` (
  `photovoltaic_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '모듈 세부 정보 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '모듈 id',
  `target_name` varchar(50) NOT NULL COMMENT '모듈 명',
  `install_place` varchar(50) NOT NULL COMMENT '설치장소',
  `module_type` enum('단결정','다결정') NOT NULL COMMENT '모듈 타입',
  `compose_count` tinyint(4) NOT NULL COMMENT '직렬구성 개수',
  `amount` float NOT NULL COMMENT '단위: kW (10:1 Scale)',
  `manufacturer` varchar(50) NOT NULL COMMENT '제조사',
  `chart_color` varchar(13) DEFAULT NULL COMMENT '대시 보드 차트 색상',
  `chart_sort_rank` tinyint(4) DEFAULT NULL COMMENT '대시 보드 차트 정렬 순위',
  PRIMARY KEY (`photovoltaic_seq`),
  UNIQUE KEY `UIX_PHOTOVOLTAIC` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='수중 태양광 모듈 상세 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photovoltaic`
--

LOCK TABLES `photovoltaic` WRITE;
/*!40000 ALTER TABLE `photovoltaic` DISABLE KEYS */;
INSERT INTO `photovoltaic` VALUES (1,'PV3','G2G','수중','다결정',6,1498.8,'에스에너지','skyblue',6),(2,'PV4','일반','수중','다결정',6,1599.61,'에스에너지','yellow',4),(3,'PV5','G2G','수중','단결정',6,1498.8,'에스에너지','blue',5),(4,'PV6','일반','수중','단결정',6,1599.61,'에스에너지','orange',3),(5,'PV1','G2G','육상','다결정',6,1498.8,'쏠라테크','black',2),(6,'PV2','일반','육상','다결정',6,1599.61,'에스에너지','gray',1);
/*!40000 ALTER TABLE `photovoltaic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photovoltaic_trouble_data`
--

DROP TABLE IF EXISTS `photovoltaic_trouble_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photovoltaic_trouble_data` (
  `photovoltaic_trouble_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '모듈 문제 이력 시퀀스',
  `photovoltaic_seq` mediumint(9) NOT NULL COMMENT '모듈 세부 정보 시퀀스',
  `is_error` tinyint(4) DEFAULT NULL COMMENT '고장 여부',
  `code` varchar(100) DEFAULT NULL COMMENT '고장 code',
  `msg` varchar(100) DEFAULT NULL COMMENT '고장 내용',
  `occur_date` datetime DEFAULT NULL COMMENT '발생 일자',
  `fix_date` datetime DEFAULT NULL COMMENT '해결 일자',
  PRIMARY KEY (`photovoltaic_trouble_data_seq`,`photovoltaic_seq`),
  KEY `FK_PHOTOVOLTAIC_TO_PHOTOVOLTAIC_TROUBLE_DATA` (`photovoltaic_seq`),
  CONSTRAINT `FK_PHOTOVOLTAIC_TO_PHOTOVOLTAIC_TROUBLE_DATA` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photovoltaic_trouble_data`
--

LOCK TABLES `photovoltaic_trouble_data` WRITE;
/*!40000 ALTER TABLE `photovoltaic_trouble_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `photovoltaic_trouble_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pl_brine_warehouse`
--

DROP TABLE IF EXISTS `pl_brine_warehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pl_brine_warehouse` (
  `brine_warehouse_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '해주 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '해주 id',
  `target_type` enum('concentration','crystalizing') NOT NULL COMMENT '0: 증발지용, 1: 결정지용',
  `target_name` varchar(50) DEFAULT NULL COMMENT '해주 이름',
  `setting_salinity` float NOT NULL COMMENT '설정 염도',
  `min_water_level` float NOT NULL COMMENT '최저 수위 레벨',
  `max_water_level` float NOT NULL COMMENT '최대 수위 레벨',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`brine_warehouse_seq`),
  UNIQUE KEY `UIX_BRINE_WAREHOUSE` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='해주';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pl_brine_warehouse`
--

LOCK TABLES `pl_brine_warehouse` WRITE;
/*!40000 ALTER TABLE `pl_brine_warehouse` DISABLE KEYS */;
INSERT INTO `pl_brine_warehouse` VALUES (1,'WT1','concentration','해주1',5,1,4,-1),(2,'WT2','concentration','해주2',15,1,4,-1),(3,'WT3','concentration','해주3',20,1,4,-1);
/*!40000 ALTER TABLE `pl_brine_warehouse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pl_relation_node`
--

DROP TABLE IF EXISTS `pl_relation_node`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pl_relation_node` (
  `node_seq` mediumint(9) NOT NULL COMMENT '센서 정보 시퀀스',
  `saltern_block_seq` mediumint(9) DEFAULT NULL COMMENT '염판 시퀀스',
  `sea_seq` mediumint(9) DEFAULT NULL COMMENT '바다 시퀀스',
  `reservoir_seq` mediumint(9) DEFAULT NULL COMMENT '저수지 시퀀스',
  `brine_warehouse_seq` mediumint(9) DEFAULT NULL COMMENT '해주 시퀀스',
  `waterway_seq` mediumint(9) DEFAULT NULL COMMENT '수로 시퀀스',
  PRIMARY KEY (`node_seq`),
  KEY `FK_SALTERN_BLOCK_TO_RELATION_NODE` (`saltern_block_seq`),
  KEY `FK_SEA_TO_RELATION_NODE` (`sea_seq`),
  KEY `FK_RESERVOIR_TO_RELATION_NODE` (`reservoir_seq`),
  KEY `FK_BRINE_WAREHOUSE_TO_RELATION_NODE` (`brine_warehouse_seq`),
  KEY `FK_WATERWAY_TO_RELATION_NODE` (`waterway_seq`),
  CONSTRAINT `FK_BRINE_WAREHOUSE_TO_RELATION_NODE` FOREIGN KEY (`brine_warehouse_seq`) REFERENCES `pl_brine_warehouse` (`brine_warehouse_seq`),
  CONSTRAINT `FK_NODE_TO_RELATION_NODE` FOREIGN KEY (`node_seq`) REFERENCES `dv_node` (`node_seq`),
  CONSTRAINT `FK_RESERVOIR_TO_RELATION_NODE` FOREIGN KEY (`reservoir_seq`) REFERENCES `pl_reservoir` (`reservoir_seq`),
  CONSTRAINT `FK_SALTERN_BLOCK_TO_RELATION_NODE` FOREIGN KEY (`saltern_block_seq`) REFERENCES `pl_saltern_block` (`saltern_block_seq`),
  CONSTRAINT `FK_SEA_TO_RELATION_NODE` FOREIGN KEY (`sea_seq`) REFERENCES `pl_sea` (`sea_seq`),
  CONSTRAINT `FK_WATERWAY_TO_RELATION_NODE` FOREIGN KEY (`waterway_seq`) REFERENCES `pl_waterway` (`waterway_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='센서 관계';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pl_relation_node`
--

LOCK TABLES `pl_relation_node` WRITE;
/*!40000 ALTER TABLE `pl_relation_node` DISABLE KEYS */;
/*!40000 ALTER TABLE `pl_relation_node` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pl_reservoir`
--

DROP TABLE IF EXISTS `pl_reservoir`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pl_reservoir` (
  `reservoir_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '저수지 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '저수지 id',
  `target_name` varchar(50) DEFAULT NULL COMMENT '저수지 이름',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`reservoir_seq`),
  UNIQUE KEY `UIX_RESERVOIR` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='저수지';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pl_reservoir`
--

LOCK TABLES `pl_reservoir` WRITE;
/*!40000 ALTER TABLE `pl_reservoir` DISABLE KEYS */;
/*!40000 ALTER TABLE `pl_reservoir` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pl_saltern_block`
--

DROP TABLE IF EXISTS `pl_saltern_block`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pl_saltern_block` (
  `saltern_block_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '염판 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '염판 id',
  `target_type` enum('concentration','crystalizing') NOT NULL COMMENT '0: 증발지, 1: 결정지',
  `target_name` varchar(50) DEFAULT NULL COMMENT '염판 이름',
  `setting_salinity` float DEFAULT NULL COMMENT '설정 염도',
  `min_water_level` float NOT NULL COMMENT '수위 측정 봉',
  `max_water_level` float NOT NULL COMMENT '최대 수위 레벨',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`saltern_block_seq`),
  UNIQUE KEY `UIX_SALTERN_BLOCK` (`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COMMENT='염판';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pl_saltern_block`
--

LOCK TABLES `pl_saltern_block` WRITE;
/*!40000 ALTER TABLE `pl_saltern_block` DISABLE KEYS */;
INSERT INTO `pl_saltern_block` VALUES (1,'SP1','concentration','증발지 1D',-1,1,4,5),(2,'SP2','concentration','증발지 1C',-1,1,4,5),(3,'SP3','concentration','증발지 1B',-1,1,4,5),(4,'SP4','concentration','증발지 1A',-1,1,4,5),(5,'SP5','concentration','증발지 일반',-1,1,4,5),(6,'SP6','concentration','증발지 2',-1,1,4,4),(7,'SP7','concentration','증발지 3',-1,1,4,3),(8,'SP8','concentration','증발지 4',18,1,4,2),(9,'SP9','crystalizing','결정지 1',-1,1,4,1);
/*!40000 ALTER TABLE `pl_saltern_block` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pl_sea`
--

DROP TABLE IF EXISTS `pl_sea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pl_sea` (
  `sea_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '바다 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '바다 id',
  `target_name` varchar(50) DEFAULT NULL COMMENT '바다 이름',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`sea_seq`),
  UNIQUE KEY `UIX_SEA` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='바다';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pl_sea`
--

LOCK TABLES `pl_sea` WRITE;
/*!40000 ALTER TABLE `pl_sea` DISABLE KEYS */;
/*!40000 ALTER TABLE `pl_sea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pl_waterway`
--

DROP TABLE IF EXISTS `pl_waterway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pl_waterway` (
  `waterway_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '수로 시퀀스',
  `target_id` varchar(6) NOT NULL COMMENT '수로 id',
  `target_name` varchar(50) DEFAULT NULL COMMENT '수로 이름',
  `depth` float NOT NULL COMMENT '상대적 고도',
  PRIMARY KEY (`waterway_seq`),
  UNIQUE KEY `UIX_WATERWAY` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='수로';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pl_waterway`
--

LOCK TABLES `pl_waterway` WRITE;
/*!40000 ALTER TABLE `pl_waterway` DISABLE KEYS */;
/*!40000 ALTER TABLE `pl_waterway` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relation_power`
--

DROP TABLE IF EXISTS `relation_power`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `relation_power` (
  `main_seq` mediumint(9) NOT NULL COMMENT 'MAIN 시퀀스',
  `inverter_seq` mediumint(9) NOT NULL COMMENT '인버터 정보 시퀀스',
  `photovoltaic_seq` mediumint(9) DEFAULT NULL COMMENT '모듈 세부 정보 시퀀스',
  `connector_seq` mediumint(9) DEFAULT NULL COMMENT '접속반 정보 시퀀스',
  `saltern_block_seq` mediumint(9) DEFAULT NULL COMMENT '염판 시퀀스',
  `connector_ch` tinyint(4) DEFAULT NULL COMMENT '접속반 연결 채널',
  PRIMARY KEY (`main_seq`,`inverter_seq`),
  KEY `FK_CONNECTOR_TO_RELATION_POWER` (`connector_seq`),
  KEY `FK_SALTERN_BLOCK_TO_RELATION_POWER` (`saltern_block_seq`),
  KEY `FK_PHOTOVOLTAIC_TO_RELATION_POWER` (`photovoltaic_seq`),
  KEY `FK_INVERTER_TO_RELATION_POWER` (`inverter_seq`),
  CONSTRAINT `FK_CONNECTOR_TO_RELATION_POWER` FOREIGN KEY (`connector_seq`) REFERENCES `connector` (`connector_seq`),
  CONSTRAINT `FK_INVERTER_TO_RELATION_POWER` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`),
  CONSTRAINT `FK_MAIN_TO_RELATION_POWER` FOREIGN KEY (`main_seq`) REFERENCES `main` (`main_seq`),
  CONSTRAINT `FK_PHOTOVOLTAIC_TO_RELATION_POWER` FOREIGN KEY (`photovoltaic_seq`) REFERENCES `photovoltaic` (`photovoltaic_seq`),
  CONSTRAINT `FK_SALTERN_BLOCK_TO_RELATION_POWER` FOREIGN KEY (`saltern_block_seq`) REFERENCES `pl_saltern_block` (`saltern_block_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='태양광 계측 시스템 관계 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relation_power`
--

LOCK TABLES `relation_power` WRITE;
/*!40000 ALTER TABLE `relation_power` DISABLE KEYS */;
INSERT INTO `relation_power` VALUES (1,1,1,1,1,1),(1,2,2,1,2,2),(1,3,3,1,3,3),(1,4,4,1,4,4),(1,5,5,3,NULL,1),(1,6,6,3,NULL,2);
/*!40000 ALTER TABLE `relation_power` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('1WGOcQc_cqYp1aBEXM5zH15tOgzh40iI',1533609600,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:39:12.716Z\",\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"passport\":{\"user\":\"tester\"}}'),('Bb6-NrigD6b_C9wgpUV_GtQvHOH4Gvnh',1533617942,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T04:59:02.280Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('DckHkhB5h7TpgkVVGooaNuDwSD4CTc38',1533605812,'{\"cookie\":{\"originalMaxAge\":86399999,\"expires\":\"2018-08-07T01:36:51.748Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('EybRq-EXel_jLP5mrLrxRmRVdO2nVDFP',1533609973,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:40:02.641Z\",\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),('FUINAhrivOjRlyashJNiXSP1ZAd5qjHn',1533624582,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T06:49:41.696Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('HysVloK7HIWql_xn_9ZwWS2_y5mohtZd',1533608198,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:16:38.017Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('JpEfsi3LPb2Cf2xaXEgyvt90giPbpVJ1',1533609981,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:46:20.746Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('KVAyqiIIJemEevW2YS-nnoaLB_B7WhYk',1533605812,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T01:36:51.696Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('O0Rh8Yrm3kUtC3TQ4BATcWhFLspSmR3T',1533609479,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:37:59.084Z\",\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),('ORdVElk3bNsRWpDAjoC1PjoCXPb1js_P',1533609501,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:38:20.632Z\",\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),('QhyT87FblXGP90tJaXY6ciBGYefqqwiH',1533608198,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:16:38.209Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('V3CRVUHz3ztOgmPIs_DoLM5wbwio-seK',1533624582,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T06:48:41.043Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('VjnZxNILhOTn9_aC5pIsHUqONCHAbqGY',1533605594,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T01:33:14.322Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('WTAKMr5pDxLJo6oBnsKwu_qEhFJpbQ9k',1533609986,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:46:26.291Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('ZpmccSovw9SSc2L_LsyJQgurn4SJyEj5',1533624582,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T06:49:41.800Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('anOiicTYZTROHFe-DftNhOhEVuCOrpER',1533608198,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T01:36:51.358Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('fdNIYIOZZn4BhNrPZBzp5L-czJVUVd1b',1533617943,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T04:59:02.723Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('fjc9-Bro9S9rfpi-tKyePS9LfNqsom46',1533605803,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T01:36:42.593Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('iFlUnh5w_reCusdJHV-rfSYVLAChz4rv',1533605595,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T01:33:15.155Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('jn7hrVZb8f66bmKRq2Lr2AGK6OcEk8NA',1533609986,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:46:25.491Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('ksc2sbxtd9LwpwgzqYR68M8eafxKkcAj',1533609985,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:46:25.358Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('lwWVm3YdmNwZjITTfj82IpIAiTJC11d6',1533609981,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:46:20.698Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"tester\"}}'),('o4FNCSFzoRZD1JdoutCzkcuy2eIJtNHQ',1533624521,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T06:48:41.456Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('qaE7kYSMgJFwEU1q-5y-qek2OkRXQT5H',1533624522,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T06:48:41.583Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('svdZTl0dNE558uqTLJTM1z1GVAeLosB8',1533605595,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T01:33:15.025Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('xI5C0DH698eDdqi-weQSg4vdMSHdp_O9',1533617943,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T04:59:03.320Z\",\"httpOnly\":true,\"path\":\"/\"}}'),('yFGD229T8a0V7nSWONE6XSM32pQFwvjn',1533609986,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2018-08-07T02:46:25.934Z\",\"httpOnly\":true,\"path\":\"/\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_water_level`
--

DROP TABLE IF EXISTS `temp_water_level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temp_water_level` (
  `temp_water_level_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '임시 수위 테이블 시퀀스',
  `inverter_seq` mediumint(9) DEFAULT NULL COMMENT '인버터 정보 시퀀스',
  `water_level` float DEFAULT NULL COMMENT '수위',
  `applydate` datetime NOT NULL COMMENT '적용시간',
  PRIMARY KEY (`temp_water_level_seq`),
  KEY `FK_INVERTER_TO_TEMP_WATER_LEVEL` (`inverter_seq`),
  CONSTRAINT `FK_INVERTER_TO_TEMP_WATER_LEVEL` FOREIGN KEY (`inverter_seq`) REFERENCES `inverter` (`inverter_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='임시 수위 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_water_level`
--

LOCK TABLES `temp_water_level` WRITE;
/*!40000 ALTER TABLE `temp_water_level` DISABLE KEYS */;
/*!40000 ALTER TABLE `temp_water_level` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_data_logger`
--

DROP TABLE IF EXISTS `v_data_logger`;
/*!50001 DROP VIEW IF EXISTS `v_data_logger`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_data_logger` (
  `dl_real_id` tinyint NOT NULL,
  `dl_id` tinyint NOT NULL,
  `target_alias` tinyint NOT NULL,
  `m_name` tinyint NOT NULL,
  `data_logger_seq` tinyint NOT NULL,
  `main_seq` tinyint NOT NULL,
  `data_logger_def_seq` tinyint NOT NULL,
  `target_id` tinyint NOT NULL,
  `target_code` tinyint NOT NULL,
  `connect_info` tinyint NOT NULL,
  `protocol_info` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_inverter_status`
--

DROP TABLE IF EXISTS `v_inverter_status`;
/*!50001 DROP VIEW IF EXISTS `v_inverter_status`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_inverter_status` (
  `inverter_seq` tinyint NOT NULL,
  `target_id` tinyint NOT NULL,
  `target_name` tinyint NOT NULL,
  `target_type` tinyint NOT NULL,
  `target_category` tinyint NOT NULL,
  `connect_type` tinyint NOT NULL,
  `dialing` tinyint NOT NULL,
  `host` tinyint NOT NULL,
  `port` tinyint NOT NULL,
  `baud_rate` tinyint NOT NULL,
  `code` tinyint NOT NULL,
  `amount` tinyint NOT NULL,
  `director_name` tinyint NOT NULL,
  `director_tel` tinyint NOT NULL,
  `chart_color` tinyint NOT NULL,
  `chart_sort_rank` tinyint NOT NULL,
  `compare_inverter_seq` tinyint NOT NULL,
  `inverter_data_seq` tinyint NOT NULL,
  `in_a` tinyint NOT NULL,
  `in_v` tinyint NOT NULL,
  `in_w` tinyint NOT NULL,
  `out_a` tinyint NOT NULL,
  `out_v` tinyint NOT NULL,
  `out_w` tinyint NOT NULL,
  `p_f` tinyint NOT NULL,
  `d_wh` tinyint NOT NULL,
  `c_wh` tinyint NOT NULL,
  `daily_power_wh` tinyint NOT NULL,
  `writedate` tinyint NOT NULL,
  `pv_amount` tinyint NOT NULL,
  `install_place` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_module_status`
--

DROP TABLE IF EXISTS `v_module_status`;
/*!50001 DROP VIEW IF EXISTS `v_module_status`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_module_status` (
  `photovoltaic_seq` tinyint NOT NULL,
  `target_id` tinyint NOT NULL,
  `target_name` tinyint NOT NULL,
  `install_place` tinyint NOT NULL,
  `module_type` tinyint NOT NULL,
  `compose_count` tinyint NOT NULL,
  `amount` tinyint NOT NULL,
  `manufacturer` tinyint NOT NULL,
  `chart_color` tinyint NOT NULL,
  `chart_sort_rank` tinyint NOT NULL,
  `connector_ch` tinyint NOT NULL,
  `amp` tinyint NOT NULL,
  `vol` tinyint NOT NULL,
  `writedate` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_node_profile`
--

DROP TABLE IF EXISTS `v_node_profile`;
/*!50001 DROP VIEW IF EXISTS `v_node_profile`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_node_profile` (
  `node_seq` tinyint NOT NULL,
  `node_real_id` tinyint NOT NULL,
  `node_id` tinyint NOT NULL,
  `node_name` tinyint NOT NULL,
  `target_code` tinyint NOT NULL,
  `data_logger_index` tinyint NOT NULL,
  `dl_real_id` tinyint NOT NULL,
  `dl_id` tinyint NOT NULL,
  `nd_target_prefix` tinyint NOT NULL,
  `nd_target_id` tinyint NOT NULL,
  `nd_target_name` tinyint NOT NULL,
  `nc_target_id` tinyint NOT NULL,
  `nc_is_sensor` tinyint NOT NULL,
  `nc_target_name` tinyint NOT NULL,
  `nc_data_unit` tinyint NOT NULL,
  `nc_description` tinyint NOT NULL,
  `m_name` tinyint NOT NULL,
  `node_def_seq` tinyint NOT NULL,
  `node_class_seq` tinyint NOT NULL,
  `main_seq` tinyint NOT NULL,
  `data_logger_seq` tinyint NOT NULL,
  `data_logger_def_seq` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_upsas_profile`
--

DROP TABLE IF EXISTS `v_upsas_profile`;
/*!50001 DROP VIEW IF EXISTS `v_upsas_profile`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_upsas_profile` (
  `connector_ch` tinyint NOT NULL,
  `photovoltaic_seq` tinyint NOT NULL,
  `pv_target_id` tinyint NOT NULL,
  `pv_target_name` tinyint NOT NULL,
  `pv_install_place` tinyint NOT NULL,
  `pv_module_type` tinyint NOT NULL,
  `pv_compose_count` tinyint NOT NULL,
  `pv_amount` tinyint NOT NULL,
  `pv_manufacturer` tinyint NOT NULL,
  `pv_chart_color` tinyint NOT NULL,
  `pv_chart_sort_rank` tinyint NOT NULL,
  `connector_seq` tinyint NOT NULL,
  `cnt_target_id` tinyint NOT NULL,
  `cnt_target_category` tinyint NOT NULL,
  `cnt_target_name` tinyint NOT NULL,
  `cnt_dialing` tinyint NOT NULL,
  `cnt_code` tinyint NOT NULL,
  `cnt_host` tinyint NOT NULL,
  `cnt_port` tinyint NOT NULL,
  `cnt_baud_rate` tinyint NOT NULL,
  `cnt_director_name` tinyint NOT NULL,
  `cnt_director_tel` tinyint NOT NULL,
  `inverter_seq` tinyint NOT NULL,
  `ivt_target_id` tinyint NOT NULL,
  `ivt_target_name` tinyint NOT NULL,
  `ivt_target_type` tinyint NOT NULL,
  `ivt_target_category` tinyint NOT NULL,
  `ivt_connect_type` tinyint NOT NULL,
  `ivt_dialing` tinyint NOT NULL,
  `ivt_host` tinyint NOT NULL,
  `ivt_port` tinyint NOT NULL,
  `ivt_baud_rate` tinyint NOT NULL,
  `ivt_code` tinyint NOT NULL,
  `ivt_amount` tinyint NOT NULL,
  `ivt_director_name` tinyint NOT NULL,
  `ivt_director_tel` tinyint NOT NULL,
  `saltern_block_seq` tinyint NOT NULL,
  `sb_target_id` tinyint NOT NULL,
  `sb_target_type` tinyint NOT NULL,
  `sb_target_name` tinyint NOT NULL,
  `sb_setting_salinity` tinyint NOT NULL,
  `sb_min_water_level` tinyint NOT NULL,
  `sb_max_water_level` tinyint NOT NULL,
  `sb_depth` tinyint NOT NULL,
  `ch_number` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `weather_device_data`
--

DROP TABLE IF EXISTS `weather_device_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weather_device_data` (
  `weather_device_data_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상관측장비 측정 정보 시퀀스',
  `main_seq` mediumint(9) NOT NULL COMMENT 'MAIN 시퀀스',
  `sm_infrared` int(11) DEFAULT NULL COMMENT '0: 맑음, 1: 이슬비, 2: 약한비, 3: 보통비, 4: 폭우',
  `temp` int(11) DEFAULT NULL COMMENT '℃',
  `reh` float DEFAULT NULL COMMENT '%',
  `wd` tinyint(4) DEFAULT NULL COMMENT '0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)',
  `ws` float DEFAULT NULL COMMENT 'm/s',
  `rain_h` float DEFAULT NULL COMMENT 'mm',
  `rain_d` float DEFAULT NULL COMMENT 'mm',
  `solar` float DEFAULT NULL COMMENT 'W/mﾲ',
  `uv` float DEFAULT NULL COMMENT '자외선',
  `writedate` datetime DEFAULT NULL COMMENT '등록일',
  PRIMARY KEY (`weather_device_data_seq`,`main_seq`),
  KEY `FK_MAIN_TO_WEATHER_DEVICE_DATA` (`main_seq`),
  CONSTRAINT `FK_MAIN_TO_WEATHER_DEVICE_DATA` FOREIGN KEY (`main_seq`) REFERENCES `main` (`main_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='기상관측장비로부터 수집한 데이터를 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weather_device_data`
--

LOCK TABLES `weather_device_data` WRITE;
/*!40000 ALTER TABLE `weather_device_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `weather_device_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weather_location`
--

DROP TABLE IF EXISTS `weather_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weather_location` (
  `weather_location_seq` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '기상청 정보 위치 시퀀스',
  `province` varchar(50) DEFAULT NULL COMMENT '도',
  `city` varchar(50) DEFAULT NULL COMMENT '시',
  `town` varchar(50) DEFAULT NULL COMMENT '읍',
  `latitude` float DEFAULT NULL COMMENT '위도',
  `longitude` float DEFAULT NULL COMMENT '경도',
  `x` int(11) DEFAULT NULL COMMENT 'X',
  `y` int(11) DEFAULT NULL COMMENT 'Y',
  PRIMARY KEY (`weather_location_seq`)
) ENGINE=InnoDB AUTO_INCREMENT=3479 DEFAULT CHARSET=utf8 COMMENT='기상청의 날씨 API를 가져올 위치값 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weather_location`
--

LOCK TABLES `weather_location` WRITE;
/*!40000 ALTER TABLE `weather_location` DISABLE KEYS */;
INSERT INTO `weather_location` VALUES (1,'강원도','강릉시','강남동',37.7733,128.919,93,132),(2,'강원도','강릉시','강동면',37.7254,128.957,94,131),(3,'강원도','강릉시','경포동',37.781,128.883,92,132),(4,'강원도','강릉시','교1동',37.7617,128.88,92,132),(5,'강원도','강릉시','교2동',37.7599,128.902,93,132),(6,'강원도','강릉시','구정면',37.7155,128.882,92,131),(7,'강원도','강릉시','내곡동',37.7362,128.883,92,131),(8,'강원도','강릉시','사천면',37.8208,128.851,92,133),(9,'강원도','강릉시','성덕동',37.7606,128.916,93,132),(10,'강원도','강릉시','성산면',37.7159,128.834,92,131),(11,'강원도','강릉시','송정동',37.7717,128.93,93,132),(12,'강원도','강릉시','연곡면',37.8574,128.839,92,134),(13,'강원도','강릉시','옥계면',37.6099,129.04,95,129),(14,'강원도','강릉시','옥천동',37.7573,128.905,93,132),(15,'강원도','강릉시','왕산면',37.6699,128.84,92,130),(16,'강원도','강릉시','주문진읍',37.8898,128.829,91,134),(17,'강원도','강릉시','중앙동',37.7519,128.897,93,132),(18,'강원도','강릉시','초당동',37.7891,128.918,93,132),(19,'강원도','강릉시','포남1동',37.7651,128.911,93,132),(20,'강원도','강릉시','포남2동',37.77,128.916,93,132),(21,'강원도','강릉시','홍제동',37.7455,128.886,92,131),(22,'강원도','고성군','간성읍',38.3756,128.469,85,145),(23,'강원도','고성군','거진읍',38.4335,128.455,85,146),(24,'강원도','고성군','수동면',38.4229,128.285,82,146),(25,'강원도','고성군','죽왕면',38.3261,128.528,86,144),(26,'강원도','고성군','토성면',38.2545,128.561,87,142),(27,'강원도','고성군','현내면',38.4916,128.43,84,147),(28,'강원도','동해시','동호동',37.543,129.103,96,127),(29,'강원도','동해시','망상동',37.5551,129.107,96,127),(30,'강원도','동해시','묵호동',37.5499,129.118,97,127),(31,'강원도','동해시','발한동',37.5456,129.11,96,127),(32,'강원도','동해시','부곡동',37.534,129.107,96,127),(33,'강원도','동해시','북삼동',37.4899,129.111,97,126),(34,'강원도','동해시','북평동',37.4809,129.127,97,126),(35,'강원도','동해시','삼화동',37.4878,129.071,96,126),(36,'강원도','동해시','송정동',37.4969,129.131,97,126),(37,'강원도','동해시','천곡동',37.5201,129.118,97,127),(38,'강원도','삼척시','가곡면',37.1469,129.208,98,119),(39,'강원도','삼척시','교동',37.4451,129.167,98,125),(40,'강원도','삼척시','근덕면',37.3764,129.228,99,124),(41,'강원도','삼척시','남양동',37.4397,129.171,98,125),(42,'강원도','삼척시','노곡면',37.345,129.166,98,123),(43,'강원도','삼척시','도계읍',37.2336,129.047,96,120),(44,'강원도','삼척시','미로면',37.4147,129.115,97,124),(45,'강원도','삼척시','성내동',37.4433,129.165,97,125),(46,'강원도','삼척시','신기면',37.3469,129.085,96,123),(47,'강원도','삼척시','원덕읍',37.1736,129.338,101,119),(48,'강원도','삼척시','정라동',37.4332,129.187,98,125),(49,'강원도','삼척시','하장면',37.3466,128.945,94,123),(50,'강원도','속초시','교동',38.1998,128.585,87,141),(51,'강원도','속초시','금호동',38.2042,128.59,87,141),(52,'강원도','속초시','노학동',38.1943,128.578,87,141),(53,'강원도','속초시','대포동',38.163,128.559,87,140),(54,'강원도','속초시','동명동',38.21,128.598,87,141),(55,'강원도','속초시','영랑동',38.2209,128.59,87,141),(56,'강원도','속초시','조양동',38.1849,128.593,87,141),(57,'강원도','속초시','청호동',38.1953,128.598,87,141),(58,'강원도','양구군','남면',38.1058,128.037,78,139),(59,'강원도','양구군','동면',38.1997,128.046,78,141),(60,'강원도','양구군','방산면',38.2063,127.952,76,141),(61,'강원도','양구군','양구읍',38.1052,127.993,77,139),(62,'강원도','양구군','해안면',38.2825,128.139,79,143),(63,'강원도','양양군','강현면',38.1472,128.61,87,140),(64,'강원도','양양군','서면',38.0687,128.588,87,138),(65,'강원도','양양군','손양면',38.0578,128.643,88,138),(66,'강원도','양양군','양양읍',38.0778,128.626,88,138),(67,'강원도','양양군','현남면',37.9664,128.762,90,136),(68,'강원도','양양군','현북면',38.0163,128.725,89,137),(69,'강원도','영월군','김삿갓면',37.1362,128.601,88,118),(70,'강원도','영월군','남면',37.1837,128.407,85,119),(71,'강원도','영월군','북면',37.2516,128.457,85,120),(72,'강원도','영월군','상동읍',37.1243,128.829,92,118),(73,'강원도','영월군','수주면',37.2855,128.271,82,121),(74,'강원도','영월군','영월읍',37.1846,128.468,86,119),(75,'강원도','영월군','주천면',37.2694,128.271,82,121),(76,'강원도','영월군','중동면',37.1424,128.683,89,118),(77,'강원도','영월군','한반도면',37.2353,128.316,83,120),(78,'강원도','원주시','개운동',37.3374,127.958,77,122),(79,'강원도','원주시','귀래면',37.1672,127.887,76,118),(80,'강원도','원주시','단계동',37.3498,127.937,76,122),(81,'강원도','원주시','단구동',37.3234,127.963,77,122),(82,'강원도','원주시','명륜1동',37.3384,127.956,77,122),(83,'강원도','원주시','명륜2동',37.3288,127.946,77,122),(84,'강원도','원주시','무실동',37.3346,127.929,76,122),(85,'강원도','원주시','문막읍',37.3098,127.819,74,121),(86,'강원도','원주시','반곡관설동',37.3157,127.974,77,122),(87,'강원도','원주시','봉산동',37.3447,127.959,77,122),(88,'강원도','원주시','부론면',37.2048,127.753,73,119),(89,'강원도','원주시','소초면',37.4151,128.005,78,124),(90,'강원도','원주시','신림면',37.2279,128.082,79,120),(91,'강원도','원주시','우산동',37.3687,127.942,76,123),(92,'강원도','원주시','원인동',37.3428,127.949,77,122),(93,'강원도','원주시','일산동',37.3468,127.944,77,122),(94,'강원도','원주시','중앙동',37.35,127.95,77,122),(95,'강원도','원주시','지정면',37.3593,127.842,75,122),(96,'강원도','원주시','태장1동',37.3523,127.957,77,122),(97,'강원도','원주시','태장2동',37.3795,127.954,77,123),(98,'강원도','원주시','판부면',37.2713,128.014,78,121),(99,'강원도','원주시','학성동',37.3507,127.946,77,122),(100,'강원도','원주시','행구동',37.3397,127.986,77,122),(101,'강원도','원주시','호저면',37.4082,127.928,76,124),(102,'강원도','원주시','흥업면',37.2998,127.923,76,121),(103,'강원도','인제군','기린면',37.9528,128.322,83,136),(104,'강원도','인제군','남면',37.9632,128.086,79,136),(105,'강원도','인제군','북면',38.1219,128.206,81,139),(106,'강원도','인제군','상남면',37.8714,128.262,82,134),(107,'강원도','인제군','서화면',38.2157,128.211,81,141),(108,'강원도','인제군','인제읍',38.0676,128.174,80,138),(109,'강원도','정선군','고한읍',37.2057,128.846,92,120),(110,'강원도','정선군','남면',37.266,128.743,90,121),(111,'강원도','정선군','북평면',37.446,128.673,89,125),(112,'강원도','정선군','사북읍',37.2249,128.824,92,120),(113,'강원도','정선군','신동읍',37.2093,128.644,89,120),(114,'강원도','정선군','여량면',38.1141,128.23,81,139),(115,'강원도','정선군','임계면',37.492,128.854,92,126),(116,'강원도','정선군','정선읍',37.377,128.664,89,123),(117,'강원도','정선군','화암면',37.3157,128.782,91,122),(118,'강원도','철원군','갈말읍',38.145,127.31,65,139),(119,'강원도','철원군','근남면',38.2342,127.473,68,141),(120,'강원도','철원군','근동면',38.3042,127.54,69,143),(121,'강원도','철원군','근북면',38.3097,127.409,67,143),(122,'강원도','철원군','김화읍',38.247,127.424,67,142),(123,'강원도','철원군','동송읍',38.2045,127.21,64,141),(124,'강원도','철원군','서면',38.1619,127.418,67,140),(125,'강원도','철원군','원남면',38.2994,127.636,71,143),(126,'강원도','철원군','원동면',38.3046,127.754,73,143),(127,'강원도','철원군','임남면',38.2919,127.856,75,143),(128,'강원도','철원군','철원읍',38.2094,127.215,64,141),(129,'강원도','춘천시','강남동',37.8625,127.722,72,133),(130,'강원도','춘천시','교동',37.8779,127.738,73,134),(131,'강원도','춘천시','근화동',37.878,127.714,72,134),(132,'강원도','춘천시','남면',37.7294,127.602,70,130),(133,'강원도','춘천시','남산면',37.7891,127.648,71,132),(134,'강원도','춘천시','동내면',37.8451,127.763,73,133),(135,'강원도','춘천시','동면',37.9075,127.783,73,134),(136,'강원도','춘천시','동산면',37.7495,127.798,74,131),(137,'강원도','춘천시','북산면',37.9846,127.888,75,136),(138,'강원도','춘천시','사북면',38.0272,127.643,71,137),(139,'강원도','춘천시','서면',37.896,127.695,72,134),(140,'강원도','춘천시','석사동',37.8558,127.744,73,133),(141,'강원도','춘천시','소양동',37.8801,127.727,73,134),(142,'강원도','춘천시','신동면',37.8149,127.718,72,132),(143,'강원도','춘천시','신북읍',37.9231,127.748,73,135),(144,'강원도','춘천시','신사우동',37.9031,127.73,73,134),(145,'강원도','춘천시','약사명동',37.8738,127.727,73,134),(146,'강원도','춘천시','조운동',37.8767,127.732,73,134),(147,'강원도','춘천시','퇴계동',37.8617,127.728,73,133),(148,'강원도','춘천시','효자1동',37.8694,127.73,73,133),(149,'강원도','춘천시','효자2동',37.8697,127.739,73,133),(150,'강원도','춘천시','효자3동',37.8736,127.744,73,134),(151,'강원도','춘천시','후평1동',37.8823,127.751,73,134),(152,'강원도','춘천시','후평2동',37.8748,127.753,73,134),(153,'강원도','춘천시','후평3동',37.8739,127.756,73,134),(154,'강원도','태백시','구문소동',37.0972,129.024,95,117),(155,'강원도','태백시','문곡소도동',37.1286,128.963,94,118),(156,'강원도','태백시','삼수동',37.1776,128.98,95,119),(157,'강원도','태백시','상장동',37.1505,128.993,95,119),(158,'강원도','태백시','장성동',37.0976,129.01,95,117),(159,'강원도','태백시','철암동',37.1144,129.042,96,118),(160,'강원도','태백시','황연동',37.1759,128.989,95,119),(161,'강원도','태백시','황지동',37.168,128.994,95,119),(162,'강원도','평창군','대관령면',37.6709,128.708,89,130),(163,'강원도','평창군','대화면',37.4981,128.46,85,126),(164,'강원도','평창군','미탄면',37.3392,128.498,86,122),(165,'강원도','평창군','방림면',37.4236,128.396,84,124),(166,'강원도','평창군','봉평면',37.6134,128.382,84,128),(167,'강원도','평창군','용평면',37.6039,128.442,85,128),(168,'강원도','평창군','진부면',37.6346,128.555,87,129),(169,'강원도','평창군','평창읍',37.366,128.4,84,123),(170,'강원도','홍천군','남면',37.6153,127.77,73,128),(171,'강원도','홍천군','내면',37.771,128.392,84,132),(172,'강원도','홍천군','내촌면',37.8134,128.089,79,132),(173,'강원도','홍천군','동면',37.6753,127.937,76,129),(174,'강원도','홍천군','두촌면',37.8659,128.021,78,134),(175,'강원도','홍천군','북방면',37.7028,127.855,75,130),(176,'강원도','홍천군','서면',37.6858,127.666,72,129),(177,'강원도','홍천군','서석면',37.7108,128.188,81,130),(178,'강원도','홍천군','홍천읍',37.6918,127.891,75,130),(179,'강원도','홍천군','화촌면',37.7681,127.969,77,131),(180,'강원도','화천군','간동면',38.0525,127.792,74,137),(181,'강원도','화천군','사내면',38.0674,127.526,69,138),(182,'강원도','화천군','상서면',38.1551,127.657,71,140),(183,'강원도','화천군','하남면',38.0561,127.67,71,138),(184,'강원도','화천군','화천읍',38.1016,127.709,72,139),(185,'강원도','횡성군','갑천면',37.5582,128.112,79,127),(186,'강원도','횡성군','강림면',37.3574,128.128,80,123),(187,'강원도','횡성군','공근면',37.5337,127.964,77,126),(188,'강원도','횡성군','둔내면',37.5094,128.221,81,126),(189,'강원도','횡성군','서원면',37.4843,127.853,75,125),(190,'강원도','횡성군','안흥면',37.4097,128.158,80,124),(191,'강원도','횡성군','우천면',37.4566,128.065,79,125),(192,'강원도','횡성군','청일면',37.5809,128.153,80,127),(193,'강원도','횡성군','횡성읍',37.4896,127.995,77,125),(194,'경기도','가평군','가평읍',37.8226,127.519,69,132),(195,'경기도','가평군','북면',37.8829,127.552,70,134),(196,'경기도','가평군','상면',37.8019,127.359,66,132),(197,'경기도','가평군','설악면',37.6735,127.497,69,129),(198,'경기도','가평군','청평면',37.7377,127.426,67,131),(199,'경기도','가평군','하면',37.8148,127.355,66,132),(200,'경기도','고양시덕양구','고양동',37.7005,126.906,59,130),(201,'경기도','고양시덕양구','관산동',37.6852,126.865,58,129),(202,'경기도','고양시덕양구','능곡동',37.6223,126.819,57,128),(203,'경기도','고양시덕양구','대덕동',37.5827,126.877,58,127),(204,'경기도','고양시덕양구','성사1동',37.6517,126.843,57,129),(205,'경기도','고양시덕양구','성사2동',37.6501,126.835,57,128),(206,'경기도','고양시덕양구','신도동',37.6498,126.896,58,128),(207,'경기도','고양시덕양구','원신동',37.6747,126.878,58,129),(208,'경기도','고양시덕양구','주교동',37.6567,126.832,57,129),(209,'경기도','고양시덕양구','창릉동',37.6428,126.889,58,128),(210,'경기도','고양시덕양구','행신1동',37.6195,126.838,57,128),(211,'경기도','고양시덕양구','행신2동',37.6123,126.835,57,128),(212,'경기도','고양시덕양구','행신3동',37.6238,126.841,57,128),(213,'경기도','고양시덕양구','행주동',37.6156,126.827,57,128),(214,'경기도','고양시덕양구','화전동',37.5973,126.875,58,127),(215,'경기도','고양시덕양구','화정1동',37.6418,126.836,57,128),(216,'경기도','고양시덕양구','화정2동',37.6277,126.838,57,128),(217,'경기도','고양시덕양구','효자동',37.649,126.923,59,128),(218,'경기도','고양시덕양구','흥도동',37.6422,126.856,58,128),(219,'경기도','고양시일산동구','고봉동',37.6991,126.829,57,130),(220,'경기도','고양시일산동구','마두1동',37.653,126.792,57,129),(221,'경기도','고양시일산동구','마두2동',37.6508,126.787,57,128),(222,'경기도','고양시일산동구','백석1동',37.6469,126.795,57,128),(223,'경기도','고양시일산동구','백석2동',37.6401,126.789,57,128),(224,'경기도','고양시일산동구','식사동',37.6712,126.812,57,129),(225,'경기도','고양시일산동구','장항1동',37.6388,126.773,56,128),(226,'경기도','고양시일산동구','장항2동',37.6471,126.78,56,128),(227,'경기도','고양시일산동구','정발산동',37.6697,126.782,56,129),(228,'경기도','고양시일산동구','중산동',37.6912,126.783,56,129),(229,'경기도','고양시일산동구','풍산동',37.6613,126.802,57,129),(230,'경기도','고양시일산서구','대화동',37.6802,126.757,56,129),(231,'경기도','고양시일산서구','송산동',37.6881,126.756,56,129),(232,'경기도','고양시일산서구','송포동',37.6687,126.738,56,129),(233,'경기도','고양시일산서구','일산1동',37.6843,126.771,56,129),(234,'경기도','고양시일산서구','일산2동',37.6818,126.779,56,129),(235,'경기도','고양시일산서구','일산3동',37.6742,126.772,56,129),(236,'경기도','고양시일산서구','주엽1동',37.6673,126.765,56,129),(237,'경기도','고양시일산서구','주엽2동',37.6713,126.762,56,129),(238,'경기도','고양시일산서구','탄현동',37.6915,126.771,56,129),(239,'경기도','과천시','갈현동',37.4165,126.991,60,123),(240,'경기도','과천시','과천동',37.4456,126.998,60,124),(241,'경기도','과천시','문원동',37.4273,127.005,60,124),(242,'경기도','과천시','별양동',37.4214,126.996,60,124),(243,'경기도','과천시','부림동',37.4307,127.001,60,124),(244,'경기도','과천시','중앙동',37.4333,126.995,60,124),(245,'경기도','광명시','광명1동',37.4858,126.865,58,125),(246,'경기도','광명시','광명2동',37.4806,126.858,58,125),(247,'경기도','광명시','광명3동',37.4774,126.859,58,125),(248,'경기도','광명시','광명4동',37.4743,126.858,58,125),(249,'경기도','광명시','광명5동',37.476,126.849,58,125),(250,'경기도','광명시','광명6동',37.4688,126.851,58,125),(251,'경기도','광명시','광명7동',37.4665,126.856,58,125),(252,'경기도','광명시','소하1동',37.4458,126.888,58,124),(253,'경기도','광명시','소하2동',37.4374,126.88,58,124),(254,'경기도','광명시','철산1동',37.488,126.87,58,125),(255,'경기도','광명시','철산2동',37.4819,126.869,58,125),(256,'경기도','광명시','철산3동',37.4781,126.872,58,125),(257,'경기도','광명시','철산4동',37.4713,126.867,58,125),(258,'경기도','광명시','하안1동',37.4623,126.871,58,124),(259,'경기도','광명시','하안2동',37.4619,126.877,58,124),(260,'경기도','광명시','하안3동',37.4559,126.884,58,124),(261,'경기도','광명시','하안4동',37.4629,126.88,58,124),(262,'경기도','광명시','학온동',37.4129,126.853,58,123),(263,'경기도','광주시','경안동',37.4081,127.259,65,123),(264,'경기도','광주시','곤지암읍',37.3459,127.346,66,122),(265,'경기도','광주시','광남동',37.3866,127.232,64,123),(266,'경기도','광주시','남종면',37.4915,127.304,65,125),(267,'경기도','광주시','도척면',37.3017,127.333,66,121),(268,'경기도','광주시','송정동',37.4168,127.248,65,124),(269,'경기도','광주시','오포읍',37.3634,127.231,64,122),(270,'경기도','광주시','중부면',37.4605,127.247,64,124),(271,'경기도','광주시','초월읍',37.3827,127.291,65,123),(272,'경기도','광주시','퇴촌면',37.4639,127.309,66,125),(273,'경기도','구리시','갈매동',37.6323,127.118,62,128),(274,'경기도','구리시','교문1동',37.5984,127.13,62,127),(275,'경기도','구리시','교문2동',37.5842,127.136,63,127),(276,'경기도','구리시','동구동',37.609,127.142,63,128),(277,'경기도','구리시','수택1동',37.5937,127.151,63,127),(278,'경기도','구리시','수택2동',37.5904,127.142,63,127),(279,'경기도','구리시','수택3동',37.589,127.143,63,127),(280,'경기도','구리시','인창동',37.6017,127.137,63,128),(281,'경기도','군포시','광정동',37.3592,126.93,59,122),(282,'경기도','군포시','군포1동',37.3508,126.948,59,122),(283,'경기도','군포시','군포2동',37.3436,126.945,59,122),(284,'경기도','군포시','궁내동',37.3568,126.924,59,122),(285,'경기도','군포시','금정동',37.3626,126.941,59,122),(286,'경기도','군포시','대야동',37.3274,126.917,59,122),(287,'경기도','군포시','산본1동',37.3705,126.941,59,122),(288,'경기도','군포시','산본2동',37.3672,126.935,59,122),(289,'경기도','군포시','수리동',37.3532,126.923,59,122),(290,'경기도','군포시','오금동',37.3482,126.932,59,122),(291,'경기도','군포시','재궁동',37.3557,126.941,59,122),(292,'경기도','김포시','고촌읍',37.5819,126.757,56,127),(293,'경기도','김포시','김포1동',37.6246,126.708,55,128),(294,'경기도','김포시','김포2동',37.6496,126.674,55,128),(295,'경기도','김포시','대곶면',37.6464,126.584,53,128),(296,'경기도','김포시','사우동',37.6165,126.719,55,128),(297,'경기도','김포시','양촌면',37.6546,126.628,54,129),(298,'경기도','김포시','월곶면',37.7143,126.555,53,130),(299,'경기도','김포시','통진읍',37.6889,126.599,53,129),(300,'경기도','김포시','풍무동',37.602,126.726,55,127),(301,'경기도','김포시','하성면',37.7174,126.633,54,130),(302,'경기도','남양주시','금곡동',37.6293,127.208,64,128),(303,'경기도','남양주시','도농동',37.6044,127.161,63,128),(304,'경기도','남양주시','별내면',37.6614,127.121,62,129),(305,'경기도','남양주시','수동면',37.7008,127.328,66,130),(306,'경기도','남양주시','양정동',37.6135,127.189,63,128),(307,'경기도','남양주시','오남읍',37.6962,127.207,64,130),(308,'경기도','남양주시','와부읍',37.585,127.213,64,127),(309,'경기도','남양주시','조안면',37.5331,127.306,65,126),(310,'경기도','남양주시','지금동',37.6066,127.171,63,128),(311,'경기도','남양주시','진건읍',37.6541,127.182,63,129),(312,'경기도','남양주시','진접읍',37.7236,127.192,63,130),(313,'경기도','남양주시','퇴계원면',37.6466,127.147,63,128),(314,'경기도','남양주시','평내동',37.6457,127.238,64,128),(315,'경기도','남양주시','호평동',37.6517,127.251,64,129),(316,'경기도','남양주시','화도읍',37.6496,127.311,65,129),(317,'경기도','동두천시','보산동',37.9149,127.063,61,134),(318,'경기도','동두천시','불현동',37.8958,127.065,61,134),(319,'경기도','동두천시','상패동',37.9032,127.047,61,134),(320,'경기도','동두천시','생연1동',37.9047,127.068,61,134),(321,'경기도','동두천시','생연2동',37.8988,127.051,61,134),(322,'경기도','동두천시','소요동',37.9267,127.059,61,135),(323,'경기도','동두천시','송내동',37.8876,127.057,61,134),(324,'경기도','동두천시','중앙동',37.905,127.055,61,134),(325,'경기도','부천시소사구','괴안동',37.4753,126.809,57,125),(326,'경기도','부천시소사구','범박동',37.4678,126.812,57,125),(327,'경기도','부천시소사구','소사본1동',37.4733,126.794,57,125),(328,'경기도','부천시소사구','소사본2동',37.4791,126.796,57,125),(329,'경기도','부천시소사구','소사본3동',37.47,126.8,57,125),(330,'경기도','부천시소사구','송내1동',37.4815,126.758,56,125),(331,'경기도','부천시소사구','송내2동',37.4798,126.772,56,125),(332,'경기도','부천시소사구','심곡본1동',37.4796,126.781,56,125),(333,'경기도','부천시소사구','심곡본동',37.4779,126.782,56,125),(334,'경기도','부천시소사구','역곡3동',37.4798,126.812,57,125),(335,'경기도','부천시오정구','고강1동',37.5267,126.814,57,126),(336,'경기도','부천시오정구','고강본동',37.5242,126.827,57,126),(337,'경기도','부천시오정구','성곡동',37.5139,126.805,57,126),(338,'경기도','부천시오정구','신흥동',37.5171,126.776,56,126),(339,'경기도','부천시오정구','오정동',37.5264,126.794,57,126),(340,'경기도','부천시오정구','원종1동',37.5236,126.808,57,126),(341,'경기도','부천시오정구','원종2동',37.5224,126.801,57,126),(342,'경기도','부천시원미구','도당동',37.5134,126.788,57,126),(343,'경기도','부천시원미구','상1동',37.489,126.755,56,125),(344,'경기도','부천시원미구','상2동',37.4977,126.756,56,125),(345,'경기도','부천시원미구','상3동',37.5055,126.753,56,125),(346,'경기도','부천시원미구','상동',37.492,126.763,56,125),(347,'경기도','부천시원미구','소사동',37.483,126.797,57,125),(348,'경기도','부천시원미구','심곡1동',37.488,126.783,56,125),(349,'경기도','부천시원미구','심곡2동',37.4846,126.789,57,125),(350,'경기도','부천시원미구','심곡3동',37.4846,126.776,56,125),(351,'경기도','부천시원미구','약대동',37.5106,126.773,56,125),(352,'경기도','부천시원미구','역곡1동',37.4865,126.819,57,125),(353,'경기도','부천시원미구','역곡2동',37.4833,126.809,57,125),(354,'경기도','부천시원미구','원미1동',37.4916,126.791,57,125),(355,'경기도','부천시원미구','원미2동',37.4892,126.79,57,125),(356,'경기도','부천시원미구','중1동',37.4951,126.774,56,125),(357,'경기도','부천시원미구','중2동',37.4912,126.772,56,125),(358,'경기도','부천시원미구','중3동',37.501,126.78,56,125),(359,'경기도','부천시원미구','중4동',37.5033,126.765,56,125),(360,'경기도','부천시원미구','중동',37.485,126.77,56,125),(361,'경기도','부천시원미구','춘의동',37.4998,126.788,57,125),(362,'경기도','성남시분당구','구미1동',37.3481,127.102,62,122),(363,'경기도','성남시분당구','구미동',37.3368,127.123,62,122),(364,'경기도','성남시분당구','금곡동',37.3481,127.102,62,122),(365,'경기도','성남시분당구','백현동',37.3942,127.103,62,123),(366,'경기도','성남시분당구','분당동',37.3673,127.133,63,122),(367,'경기도','성남시분당구','삼평동',37.3942,127.103,62,123),(368,'경기도','성남시분당구','서현1동',37.3798,127.128,62,123),(369,'경기도','성남시분당구','서현2동',37.3732,127.137,63,123),(370,'경기도','성남시분당구','수내1동',37.3726,127.12,62,123),(371,'경기도','성남시분당구','수내2동',37.3696,127.123,62,122),(372,'경기도','성남시분당구','수내3동',37.364,127.128,62,122),(373,'경기도','성남시분당구','야탑1동',37.4092,127.132,63,123),(374,'경기도','성남시분당구','야탑2동',37.4066,127.129,62,123),(375,'경기도','성남시분당구','야탑3동',37.408,127.14,63,123),(376,'경기도','성남시분당구','운중동',37.392,127.08,62,123),(377,'경기도','성남시분당구','이매1동',37.3967,127.129,62,123),(378,'경기도','성남시분당구','이매2동',37.3968,127.124,62,123),(379,'경기도','성남시분당구','정자1동',37.3587,127.114,62,122),(380,'경기도','성남시분당구','정자2동',37.3631,127.117,62,122),(381,'경기도','성남시분당구','정자3동',37.358,127.122,62,122),(382,'경기도','성남시분당구','판교동',37.3792,127.103,62,123),(383,'경기도','성남시수정구','고등동',37.4222,127.104,62,124),(384,'경기도','성남시수정구','단대동',37.4467,127.157,63,124),(385,'경기도','성남시수정구','복정동',37.4627,127.129,62,124),(386,'경기도','성남시수정구','산성동',37.4495,127.152,63,124),(387,'경기도','성남시수정구','수진1동',37.4357,127.141,63,124),(388,'경기도','성남시수정구','수진2동',37.4346,127.131,62,124),(389,'경기도','성남시수정구','시흥동',37.4192,127.11,62,124),(390,'경기도','성남시수정구','신촌동',37.4519,127.107,62,124),(391,'경기도','성남시수정구','신흥1동',37.4402,127.143,63,124),(392,'경기도','성남시수정구','신흥2동',37.4459,127.148,63,124),(393,'경기도','성남시수정구','신흥3동',37.4407,127.151,63,124),(394,'경기도','성남시수정구','양지동',37.4521,127.163,63,124),(395,'경기도','성남시수정구','태평1동',37.4379,127.128,62,124),(396,'경기도','성남시수정구','태평2동',37.4449,127.141,63,124),(397,'경기도','성남시수정구','태평3동',37.4426,127.135,63,124),(398,'경기도','성남시수정구','태평4동',37.4451,127.143,63,124),(399,'경기도','성남시중원구','금광1동',37.4422,127.165,63,124),(400,'경기도','성남시중원구','금광2동',37.4435,127.166,63,124),(401,'경기도','성남시중원구','도촌동',37.4162,127.154,63,123),(402,'경기도','성남시중원구','상대원1동',37.4305,127.166,63,124),(403,'경기도','성남시중원구','상대원2동',37.4361,127.16,63,124),(404,'경기도','성남시중원구','상대원3동',37.4369,127.168,63,124),(405,'경기도','성남시중원구','성남동',37.4291,127.134,63,124),(406,'경기도','성남시중원구','은행1동',37.4492,127.171,63,124),(407,'경기도','성남시중원구','은행2동',37.4543,127.169,63,124),(408,'경기도','성남시중원구','중동',37.4412,127.16,63,124),(409,'경기도','성남시중원구','하대원동',37.4255,127.148,63,124),(410,'경기도','수원시권선구','곡선동',37.2404,127.035,61,120),(411,'경기도','수원시권선구','구운동',37.2743,126.974,60,120),(412,'경기도','수원시권선구','권선1동',37.2538,127.037,61,120),(413,'경기도','수원시권선구','권선2동',37.2485,127.032,61,120),(414,'경기도','수원시권선구','금호동',37.2647,126.958,60,120),(415,'경기도','수원시권선구','서둔동',37.2697,126.988,60,120),(416,'경기도','수원시권선구','세류1동',37.2594,127.01,60,120),(417,'경기도','수원시권선구','세류2동',37.2505,127.015,61,120),(418,'경기도','수원시권선구','세류3동',37.2562,127.014,61,120),(419,'경기도','수원시권선구','입북동',37.2904,126.962,60,121),(420,'경기도','수원시권선구','평동',37.2552,126.996,60,120),(421,'경기도','수원시영통구','매탄1동',37.2676,127.043,61,120),(422,'경기도','수원시영통구','매탄2동',37.2673,127.049,61,120),(423,'경기도','수원시영통구','매탄3동',37.2538,127.045,61,120),(424,'경기도','수원시영통구','매탄4동',37.2623,127.051,61,120),(425,'경기도','수원시영통구','영통1동',37.2635,127.083,62,120),(426,'경기도','수원시영통구','영통2동',37.2441,127.058,61,120),(427,'경기도','수원시영통구','원천동',37.2709,127.06,61,120),(428,'경기도','수원시영통구','태장동',37.2365,127.057,61,120),(429,'경기도','수원시장안구','송죽동',37.2977,127.009,60,121),(430,'경기도','수원시장안구','연무동',37.2877,127.024,61,121),(431,'경기도','수원시장안구','영화동',37.2903,127.016,61,121),(432,'경기도','수원시장안구','율천동',37.2948,126.974,60,121),(433,'경기도','수원시장안구','정자1동',37.2994,126.993,60,121),(434,'경기도','수원시장안구','정자2동',37.2923,127.003,60,121),(435,'경기도','수원시장안구','정자3동',37.2938,126.998,60,121),(436,'경기도','수원시장안구','조원1동',37.299,127.018,61,121),(437,'경기도','수원시장안구','조원2동',37.3028,127.012,60,121),(438,'경기도','수원시장안구','파장동',37.3056,126.997,60,121),(439,'경기도','수원시팔달구','고등동',37.2705,127.003,60,120),(440,'경기도','수원시팔달구','매교동',37.2657,127.016,61,120),(441,'경기도','수원시팔달구','매산동',37.2659,127.008,60,120),(442,'경기도','수원시팔달구','우만1동',37.2825,127.031,61,121),(443,'경기도','수원시팔달구','우만2동',37.2751,127.042,61,120),(444,'경기도','수원시팔달구','인계동',37.2676,127.023,61,120),(445,'경기도','수원시팔달구','지동',37.2792,127.031,61,120),(446,'경기도','수원시팔달구','행궁동',37.2813,127.015,61,121),(447,'경기도','수원시팔달구','화서1동',37.2738,126.997,60,120),(448,'경기도','수원시팔달구','화서2동',37.2805,126.996,60,121),(449,'경기도','시흥시','과림동',37.434,126.835,57,124),(450,'경기도','시흥시','군자동',37.3371,126.787,57,122),(451,'경기도','시흥시','대야동',37.4402,126.791,57,124),(452,'경기도','시흥시','매화동',37.4149,126.818,57,123),(453,'경기도','시흥시','목감동',37.3817,126.859,58,123),(454,'경기도','시흥시','신천동',37.4356,126.787,57,124),(455,'경기도','시흥시','신현동',37.4034,126.787,57,123),(456,'경기도','시흥시','연성동',37.3788,126.806,57,123),(457,'경기도','시흥시','은행동',37.4335,126.8,57,124),(458,'경기도','시흥시','정왕1동',37.3372,126.746,56,122),(459,'경기도','시흥시','정왕2동',37.3482,126.731,56,122),(460,'경기도','시흥시','정왕3동',37.3549,126.728,56,122),(461,'경기도','시흥시','정왕4동',37.3628,126.734,56,122),(462,'경기도','시흥시','정왕본동',37.3425,126.75,56,122),(463,'경기도','안산시단원구','고잔1동',37.3243,126.821,57,121),(464,'경기도','안산시단원구','고잔2동',37.3209,126.84,57,121),(465,'경기도','안산시단원구','대부동',37.2409,126.587,53,120),(466,'경기도','안산시단원구','선부1동',37.3314,126.806,57,122),(467,'경기도','안산시단원구','선부2동',37.3357,126.805,57,122),(468,'경기도','안산시단원구','선부3동',37.3422,126.815,57,122),(469,'경기도','안산시단원구','와동',37.3386,126.828,57,122),(470,'경기도','안산시단원구','원곡1동',37.3251,126.799,57,121),(471,'경기도','안산시단원구','원곡2동',37.3288,126.804,57,122),(472,'경기도','안산시단원구','원곡본동',37.3284,126.794,57,122),(473,'경기도','안산시단원구','초지동',37.322,126.811,57,121),(474,'경기도','안산시단원구','호수동',37.3075,126.827,57,121),(475,'경기도','안산시상록구','반월동',37.3032,126.904,59,121),(476,'경기도','안산시상록구','본오1동',37.2864,126.867,58,121),(477,'경기도','안산시상록구','본오2동',37.2935,126.874,58,121),(478,'경기도','안산시상록구','본오3동',37.2985,126.866,58,121),(479,'경기도','안산시상록구','부곡동',37.3291,126.863,58,122),(480,'경기도','안산시상록구','사1동',37.2943,126.853,58,121),(481,'경기도','안산시상록구','사2동',37.2868,126.854,58,121),(482,'경기도','안산시상록구','사3동',37.2981,126.841,58,121),(483,'경기도','안산시상록구','성포동',37.3179,126.852,58,121),(484,'경기도','안산시상록구','안산동',37.3589,126.875,58,122),(485,'경기도','안산시상록구','월피동',37.3307,126.859,58,122),(486,'경기도','안산시상록구','이동',37.3027,126.863,58,121),(487,'경기도','안산시상록구','일동',37.3126,126.874,58,121),(488,'경기도','안성시','고삼면',37.0799,127.265,65,116),(489,'경기도','안성시','공도읍',36.9959,127.174,63,114),(490,'경기도','안성시','금광면',36.9943,127.32,66,114),(491,'경기도','안성시','대덕면',37.0096,127.24,64,115),(492,'경기도','안성시','미양면',36.9724,127.217,64,114),(493,'경기도','안성시','보개면',37.0203,127.293,65,115),(494,'경기도','안성시','삼죽면',37.0702,127.377,67,116),(495,'경기도','안성시','서운면',36.9402,127.261,65,113),(496,'경기도','안성시','안성1동',37.0028,127.276,65,115),(497,'경기도','안성시','안성2동',36.9977,127.272,65,114),(498,'경기도','안성시','안성3동',37.0113,127.26,65,115),(499,'경기도','안성시','양성면',37.057,127.197,64,116),(500,'경기도','안성시','원곡면',37.0369,127.132,63,115),(501,'경기도','안성시','일죽면',37.0877,127.479,69,116),(502,'경기도','안성시','죽산면',37.0757,127.425,68,116),(503,'경기도','안양시동안구','갈산동',37.3733,126.968,60,123),(504,'경기도','안양시동안구','관양1동',37.4019,126.967,60,123),(505,'경기도','안양시동안구','관양2동',37.3995,126.973,60,123),(506,'경기도','안양시동안구','귀인동',37.3827,126.972,60,123),(507,'경기도','안양시동안구','달안동',37.3933,126.952,59,123),(508,'경기도','안양시동안구','범계동',37.3869,126.955,59,123),(509,'경기도','안양시동안구','부림동',37.3959,126.962,60,123),(510,'경기도','안양시동안구','부흥동',37.3908,126.949,59,123),(511,'경기도','안양시동안구','비산1동',37.397,126.936,59,123),(512,'경기도','안양시동안구','비산2동',37.3943,126.944,59,123),(513,'경기도','안양시동안구','비산3동',37.4016,126.947,59,123),(514,'경기도','안양시동안구','신촌동',37.3792,126.958,60,123),(515,'경기도','안양시동안구','평안동',37.3876,126.966,60,123),(516,'경기도','안양시동안구','평촌동',37.3866,126.976,60,123),(517,'경기도','안양시동안구','호계1동',37.3681,126.96,60,122),(518,'경기도','안양시동안구','호계2동',37.3784,126.955,59,123),(519,'경기도','안양시동안구','호계3동',37.3647,126.961,60,122),(520,'경기도','안양시만안구','박달1동',37.4009,126.911,59,123),(521,'경기도','안양시만안구','박달2동',37.3989,126.904,59,123),(522,'경기도','안양시만안구','석수1동',37.4167,126.913,59,123),(523,'경기도','안양시만안구','석수2동',37.4143,126.909,59,123),(524,'경기도','안양시만안구','석수3동',37.4062,126.897,58,123),(525,'경기도','안양시만안구','안양1동',37.3963,126.928,59,123),(526,'경기도','안양시만안구','안양2동',37.4022,126.92,59,123),(527,'경기도','안양시만안구','안양3동',37.3932,126.917,59,123),(528,'경기도','안양시만안구','안양4동',37.3936,126.92,59,123),(529,'경기도','안양시만안구','안양5동',37.3915,126.923,59,123),(530,'경기도','안양시만안구','안양6동',37.3872,126.933,59,123),(531,'경기도','안양시만안구','안양7동',37.3897,126.938,59,123),(532,'경기도','안양시만안구','안양8동',37.3814,126.934,59,123),(533,'경기도','안양시만안구','안양9동',37.3887,126.911,59,123),(534,'경기도','양주시','광적면',37.822,126.986,60,132),(535,'경기도','양주시','남면',37.8954,126.979,60,134),(536,'경기도','양주시','백석읍',37.7923,126.988,60,132),(537,'경기도','양주시','양주1동',37.7706,127.046,61,131),(538,'경기도','양주시','양주2동',37.8035,127.099,62,132),(539,'경기도','양주시','은현면',37.8722,127.027,61,133),(540,'경기도','양주시','장흥면',37.7151,126.943,59,130),(541,'경기도','양주시','회천1동',37.8414,127.068,61,133),(542,'경기도','양주시','회천2동',37.8197,127.05,61,132),(543,'경기도','양주시','회천3동',37.8349,127.071,61,133),(544,'경기도','양주시','회천4동',37.8301,127.093,62,132),(545,'경기도','양평군','강상면',37.4744,127.488,69,125),(546,'경기도','양평군','강하면',37.4922,127.413,67,125),(547,'경기도','양평군','개군면',37.4232,127.539,70,124),(548,'경기도','양평군','단월면',37.5357,127.675,72,126),(549,'경기도','양평군','서종면',37.6038,127.351,66,128),(550,'경기도','양평군','양동면',37.4163,127.757,73,124),(551,'경기도','양평군','양서면',37.5411,127.328,66,126),(552,'경기도','양평군','양평읍',37.484,127.496,69,125),(553,'경기도','양평군','옥천면',37.5155,127.458,68,126),(554,'경기도','양평군','용문면',37.4839,127.598,70,125),(555,'경기도','양평군','지평면',37.4717,127.641,71,125),(556,'경기도','양평군','청운면',37.5535,127.713,72,127),(557,'경기도','여주군','가남면',37.1989,127.547,70,119),(558,'경기도','여주군','강천면',37.2701,127.714,73,120),(559,'경기도','여주군','금사면',37.3898,127.535,69,123),(560,'경기도','여주군','능서면',37.2974,127.576,70,121),(561,'경기도','여주군','대신면',37.3723,127.589,70,123),(562,'경기도','여주군','북내면',37.3265,127.681,72,122),(563,'경기도','여주군','산북면',37.3987,127.445,68,123),(564,'경기도','여주군','여주읍',37.2922,127.642,71,121),(565,'경기도','여주군','점동면',37.2032,127.665,72,119),(566,'경기도','여주군','흥천면',37.3302,127.544,70,122),(567,'경기도','연천군','군남면',38.0826,127.021,60,138),(568,'경기도','연천군','미산면',38.0449,126.995,60,137),(569,'경기도','연천군','백학면',38.0276,126.919,59,137),(570,'경기도','연천군','신서면',38.1802,127.109,62,140),(571,'경기도','연천군','연천읍',38.1015,127.078,61,138),(572,'경기도','연천군','왕징면',38.0561,127.015,60,137),(573,'경기도','연천군','장남면',37.979,126.886,58,136),(574,'경기도','연천군','전곡읍',38.0253,127.065,61,137),(575,'경기도','연천군','중면',38.1332,127.021,60,139),(576,'경기도','연천군','청산면',37.9791,127.07,61,136),(577,'경기도','오산시','남촌동',37.1517,127.066,61,118),(578,'경기도','오산시','대원동',37.1357,127.074,62,117),(579,'경기도','오산시','세마동',37.1839,127.04,61,118),(580,'경기도','오산시','신장동',37.1572,127.066,61,118),(581,'경기도','오산시','중앙동',37.1464,127.073,62,118),(582,'경기도','오산시','초평동',37.137,127.043,61,117),(583,'경기도','용인시기흥구','구갈동',37.27,127.129,63,120),(584,'경기도','용인시기흥구','구성동',37.294,127.121,62,121),(585,'경기도','용인시기흥구','기흥동',37.2403,127.105,62,120),(586,'경기도','용인시기흥구','동백동',37.2694,127.153,63,120),(587,'경기도','용인시기흥구','마북동',37.3011,127.126,62,121),(588,'경기도','용인시기흥구','보정동',37.3167,127.117,62,121),(589,'경기도','용인시기흥구','상갈동',37.2589,127.107,62,120),(590,'경기도','용인시기흥구','상하동',37.2716,127.143,63,120),(591,'경기도','용인시기흥구','서농동',37.244,127.076,62,120),(592,'경기도','용인시기흥구','신갈동',37.2697,127.109,62,120),(593,'경기도','용인시수지구','동천동',37.3389,127.101,62,122),(594,'경기도','용인시수지구','상현1동',37.3018,127.083,62,121),(595,'경기도','용인시수지구','상현2동',37.3066,127.088,62,121),(596,'경기도','용인시수지구','성복동',37.3103,127.083,62,121),(597,'경기도','용인시수지구','신봉동',37.3224,127.075,62,121),(598,'경기도','용인시수지구','죽전1동',37.3282,127.116,62,122),(599,'경기도','용인시수지구','죽전2동',37.332,127.112,62,122),(600,'경기도','용인시수지구','풍덕천1동',37.3251,127.097,62,121),(601,'경기도','용인시수지구','풍덕천2동',37.3166,127.091,62,121),(602,'경기도','용인시처인구','남사면',37.1129,127.153,63,117),(603,'경기도','용인시처인구','동부동',37.23,127.221,64,119),(604,'경기도','용인시처인구','모현면',37.3266,127.245,64,122),(605,'경기도','용인시처인구','백암면',37.1605,127.378,67,118),(606,'경기도','용인시처인구','양지면',37.2327,127.282,65,120),(607,'경기도','용인시처인구','역삼동',37.2313,127.189,64,119),(608,'경기도','용인시처인구','원삼면',37.1635,127.315,66,118),(609,'경기도','용인시처인구','유림동',37.2496,127.214,64,120),(610,'경기도','용인시처인구','이동면',37.1382,127.198,64,117),(611,'경기도','용인시처인구','중앙동',37.2313,127.207,64,119),(612,'경기도','용인시처인구','포곡읍',37.2751,127.233,64,120),(613,'경기도','의왕시','고천동',37.3451,126.978,60,122),(614,'경기도','의왕시','내손1동',37.3839,126.977,60,123),(615,'경기도','의왕시','내손2동',37.3839,126.983,60,123),(616,'경기도','의왕시','부곡동',37.3159,126.959,60,121),(617,'경기도','의왕시','오전동',37.3507,126.974,60,122),(618,'경기도','의왕시','청계동',37.3858,126.998,60,123),(619,'경기도','의정부시','가능1동',37.7463,127.044,61,131),(620,'경기도','의정부시','가능2동',37.738,127.038,61,130),(621,'경기도','의정부시','가능3동',37.7406,127.032,61,130),(622,'경기도','의정부시','녹양동',37.7574,127.034,61,131),(623,'경기도','의정부시','송산1동',37.7283,127.089,62,130),(624,'경기도','의정부시','송산2동',37.7369,127.092,62,130),(625,'경기도','의정부시','신곡1동',37.7287,127.059,61,130),(626,'경기도','의정부시','신곡2동',37.7409,127.06,61,131),(627,'경기도','의정부시','의정부1동',37.7437,127.05,61,131),(628,'경기도','의정부시','의정부2동',37.738,127.045,61,130),(629,'경기도','의정부시','의정부3동',37.7299,127.051,61,130),(630,'경기도','의정부시','자금동',37.7475,127.06,61,131),(631,'경기도','의정부시','장암동',37.7236,127.056,61,130),(632,'경기도','의정부시','호원1동',37.7092,127.051,61,130),(633,'경기도','의정부시','호원2동',37.7237,127.045,61,130),(634,'경기도','이천시','관고동',37.2798,127.443,68,121),(635,'경기도','이천시','대월면',37.227,127.494,69,119),(636,'경기도','이천시','마장면',37.2461,127.36,66,120),(637,'경기도','이천시','모가면',37.1689,127.482,69,118),(638,'경기도','이천시','백사면',37.3362,127.493,69,122),(639,'경기도','이천시','부발읍',37.2808,127.489,69,121),(640,'경기도','이천시','설성면',37.1297,127.524,69,117),(641,'경기도','이천시','신둔면',37.3035,127.406,67,121),(642,'경기도','이천시','율면',37.0914,127.549,70,117),(643,'경기도','이천시','장호원읍',37.1121,127.619,71,117),(644,'경기도','이천시','중리동',37.2754,127.444,68,121),(645,'경기도','이천시','증포동',37.2875,127.455,68,121),(646,'경기도','이천시','창전동',37.2801,127.443,68,121),(647,'경기도','이천시','호법면',37.2203,127.427,68,119),(648,'경기도','파주시','광탄면',37.7732,126.853,58,131),(649,'경기도','파주시','교하읍',37.7503,126.749,56,131),(650,'경기도','파주시','군내면',37.902,126.733,56,134),(651,'경기도','파주시','금촌1동',37.7635,126.778,56,131),(652,'경기도','파주시','금촌2동',37.7488,126.779,56,131),(653,'경기도','파주시','문산읍',37.8502,126.786,56,133),(654,'경기도','파주시','법원읍',37.8464,126.885,58,133),(655,'경기도','파주시','월롱면',37.7933,126.792,57,132),(656,'경기도','파주시','장단면',37.8716,126.711,55,133),(657,'경기도','파주시','적성면',37.9517,126.92,59,135),(658,'경기도','파주시','조리읍',37.742,126.807,57,130),(659,'경기도','파주시','진동면',37.9384,126.803,57,135),(660,'경기도','파주시','진서면',37.9619,126.71,55,135),(661,'경기도','파주시','탄현면',37.7997,126.718,55,132),(662,'경기도','파주시','파주읍',37.8302,126.819,57,132),(663,'경기도','파주시','파평면',37.9193,126.84,57,134),(664,'경기도','평택시','고덕면',37.0394,127.02,61,115),(665,'경기도','평택시','비전1동',36.9977,127.097,62,114),(666,'경기도','평택시','비전2동',36.9932,127.105,62,114),(667,'경기도','평택시','서정동',37.0633,127.058,61,116),(668,'경기도','평택시','서탄면',37.1054,127.037,61,117),(669,'경기도','평택시','세교동',36.9971,127.085,62,114),(670,'경기도','평택시','송북동',37.0788,127.062,61,116),(671,'경기도','평택시','송탄동',37.0398,127.088,62,115),(672,'경기도','평택시','신장1동',37.0798,127.055,61,116),(673,'경기도','평택시','신장2동',37.0736,127.055,61,116),(674,'경기도','평택시','신평동',36.9872,127.095,62,114),(675,'경기도','평택시','안중읍',36.9829,126.934,59,114),(676,'경기도','평택시','오성면',37.0048,126.983,60,115),(677,'경기도','평택시','원평동',36.9865,127.083,62,114),(678,'경기도','평택시','중앙동',37.0525,127.058,61,116),(679,'경기도','평택시','지산동',37.0748,127.06,61,116),(680,'경기도','평택시','진위면',37.0973,127.093,62,117),(681,'경기도','평택시','청북면',37.0371,126.936,59,115),(682,'경기도','평택시','통복동',36.998,127.089,62,114),(683,'경기도','평택시','팽성읍',36.9624,127.064,61,114),(684,'경기도','평택시','포승읍',36.98,126.887,58,114),(685,'경기도','평택시','현덕면',36.9645,126.924,59,114),(686,'경기도','포천시','가산면',37.8458,127.188,63,133),(687,'경기도','포천시','관인면',38.155,127.253,64,140),(688,'경기도','포천시','군내면',37.8862,127.22,64,134),(689,'경기도','포천시','내촌면',37.7835,127.231,64,131),(690,'경기도','포천시','선단동',37.8514,127.161,63,133),(691,'경기도','포천시','소흘읍',37.8207,127.141,63,132),(692,'경기도','포천시','신북면',37.9311,127.229,64,135),(693,'경기도','포천시','영북면',38.0864,127.278,65,138),(694,'경기도','포천시','영중면',37.9998,127.246,64,136),(695,'경기도','포천시','이동면',38.0279,127.369,66,137),(696,'경기도','포천시','일동면',37.9586,127.319,66,135),(697,'경기도','포천시','창수면',37.989,127.191,63,136),(698,'경기도','포천시','포천동',37.8954,127.202,64,134),(699,'경기도','포천시','화현면',37.8984,127.29,65,134),(700,'경기도','하남시','감북동',37.5134,127.164,63,126),(701,'경기도','하남시','덕풍1동',37.5307,127.203,64,126),(702,'경기도','하남시','덕풍2동',37.5395,127.2,64,126),(703,'경기도','하남시','덕풍3동',37.541,127.209,64,126),(704,'경기도','하남시','신장1동',37.5359,127.212,64,126),(705,'경기도','하남시','신장2동',37.5389,127.216,64,126),(706,'경기도','하남시','천현동',37.5165,127.226,64,126),(707,'경기도','하남시','초이동',37.5337,127.173,63,126),(708,'경기도','하남시','춘궁동',37.5194,127.196,64,126),(709,'경기도','하남시','풍산동',37.5462,127.187,63,126),(710,'경기도','화성시','기배동',37.2212,126.986,60,119),(711,'경기도','화성시','남양동',37.2089,126.826,57,119),(712,'경기도','화성시','동탄1동',37.2037,127.074,62,119),(713,'경기도','화성시','동탄2동',37.1942,127.074,62,119),(714,'경기도','화성시','동탄3동',37.2099,127.099,62,119),(715,'경기도','화성시','동탄면',37.1848,127.089,62,118),(716,'경기도','화성시','마도면',37.2029,126.772,56,119),(717,'경기도','화성시','매송면',37.2494,126.911,59,120),(718,'경기도','화성시','반월동',37.2318,127.064,61,119),(719,'경기도','화성시','병점1동',37.2036,127.039,61,119),(720,'경기도','화성시','병점2동',37.2087,127.045,61,119),(721,'경기도','화성시','봉담읍',37.2173,126.952,59,119),(722,'경기도','화성시','비봉면',37.2324,126.876,58,119),(723,'경기도','화성시','서신면',37.1637,126.711,55,118),(724,'경기도','화성시','송산면',37.2151,126.741,56,119),(725,'경기도','화성시','양감면',37.0785,126.947,59,116),(726,'경기도','화성시','우정읍',37.087,126.817,57,116),(727,'경기도','화성시','장안면',37.077,126.833,57,116),(728,'경기도','화성시','정남면',37.1656,126.985,60,118),(729,'경기도','화성시','진안동',37.2102,127.041,61,119),(730,'경기도','화성시','팔탄면',37.1584,126.905,59,118),(731,'경기도','화성시','향남읍',37.1295,126.922,59,117),(732,'경기도','화성시','화산동',37.2026,127.016,61,119),(733,'경상남도','거제시','거제면',34.8479,128.593,89,68),(734,'경상남도','거제시','고현동',34.8836,128.624,90,69),(735,'경상남도','거제시','남부면',34.729,128.612,90,66),(736,'경상남도','거제시','능포동',34.8761,128.737,92,69),(737,'경상남도','거제시','동부면',34.8184,128.61,90,68),(738,'경상남도','거제시','둔덕면',34.8336,128.507,88,68),(739,'경상남도','거제시','마전동',34.857,128.725,92,68),(740,'경상남도','거제시','사등면',34.9158,128.524,88,70),(741,'경상남도','거제시','상문동',34.8836,128.624,90,69),(742,'경상남도','거제시','수양동',34.8836,128.624,90,69),(743,'경상남도','거제시','아주동',34.8629,128.694,91,69),(744,'경상남도','거제시','연초면',34.9114,128.659,91,70),(745,'경상남도','거제시','옥포1동',34.8879,128.695,91,69),(746,'경상남도','거제시','옥포2동',34.8935,128.691,91,69),(747,'경상남도','거제시','일운면',34.8265,128.705,92,68),(748,'경상남도','거제시','장목면',34.9835,128.685,91,71),(749,'경상남도','거제시','장승포동',34.8643,128.729,92,69),(750,'경상남도','거제시','장평동',34.8836,128.624,90,69),(751,'경상남도','거제시','하청면',34.9522,128.658,91,71),(752,'경상남도','거창군','가북면',35.7598,127.995,78,88),(753,'경상남도','거창군','가조면',35.708,128.017,79,87),(754,'경상남도','거창군','거창읍',35.6849,127.906,77,86),(755,'경상남도','거창군','고제면',35.8118,127.874,76,89),(756,'경상남도','거창군','남상면',35.6402,127.912,77,85),(757,'경상남도','거창군','남하면',35.6647,127.946,77,86),(758,'경상남도','거창군','마리면',35.6982,127.857,76,86),(759,'경상남도','거창군','북상면',35.7744,127.821,75,88),(760,'경상남도','거창군','신원면',35.5647,127.927,77,84),(761,'경상남도','거창군','웅양면',35.8024,127.92,77,89),(762,'경상남도','거창군','위천면',35.7466,127.835,75,87),(763,'경상남도','거창군','주상면',35.7466,127.915,77,87),(764,'경상남도','고성군','개천면',35.0956,128.261,83,73),(765,'경상남도','고성군','거류면',34.9887,128.406,86,71),(766,'경상남도','고성군','고성읍',34.9711,128.327,85,71),(767,'경상남도','고성군','구만면',35.0848,128.337,85,73),(768,'경상남도','고성군','대가면',35.0143,128.301,84,72),(769,'경상남도','고성군','동해면',35.0383,128.423,86,72),(770,'경상남도','고성군','마암면',35.0521,128.339,85,73),(771,'경상남도','고성군','삼산면',34.9336,128.276,84,70),(772,'경상남도','고성군','상리면',34.9967,128.189,82,71),(773,'경상남도','고성군','영오면',35.1048,128.24,83,74),(774,'경상남도','고성군','영현면',35.051,128.208,82,72),(775,'경상남도','고성군','하이면',34.9256,128.125,81,70),(776,'경상남도','고성군','하일면',34.9403,128.195,82,70),(777,'경상남도','고성군','회화면',35.0571,128.376,85,73),(778,'경상남도','김해시','내외동',35.2319,128.867,94,77),(779,'경상남도','김해시','대동면',35.2392,128.982,96,77),(780,'경상남도','김해시','동상동',35.2338,128.886,94,77),(781,'경상남도','김해시','부원동',35.2257,128.889,94,77),(782,'경상남도','김해시','북부동',35.2593,128.87,94,77),(783,'경상남도','김해시','불암동',35.219,128.929,95,77),(784,'경상남도','김해시','삼안동',35.2408,128.91,95,77),(785,'경상남도','김해시','상동면',35.3046,128.933,95,78),(786,'경상남도','김해시','생림면',35.3249,128.852,94,79),(787,'경상남도','김해시','장유면',35.1982,128.815,93,76),(788,'경상남도','김해시','주촌면',35.2327,128.833,93,77),(789,'경상남도','김해시','진례면',35.246,128.75,92,77),(790,'경상남도','김해시','진영읍',35.3012,128.736,92,78),(791,'경상남도','김해시','칠산서부동',35.2198,128.873,94,76),(792,'경상남도','김해시','한림면',35.3175,128.805,93,79),(793,'경상남도','김해시','활천동',35.2259,128.902,95,77),(794,'경상남도','김해시','회현동',35.2285,128.881,94,77),(795,'경상남도','남해군','고현면',34.8926,127.876,77,69),(796,'경상남도','남해군','남면',34.7683,127.889,77,66),(797,'경상남도','남해군','남해읍',34.8354,127.896,77,68),(798,'경상남도','남해군','미조면',34.709,128.049,80,65),(799,'경상남도','남해군','삼동면',34.8279,128.003,79,67),(800,'경상남도','남해군','상주면',34.7206,127.988,79,65),(801,'경상남도','남해군','서면',34.8069,127.84,76,67),(802,'경상남도','남해군','설천면',34.9218,127.916,77,69),(803,'경상남도','남해군','이동면',34.7963,127.957,78,67),(804,'경상남도','남해군','창선면',34.8547,128.014,79,68),(805,'경상남도','밀양시','가곡동',35.4757,128.767,92,82),(806,'경상남도','밀양시','교동',35.5079,128.759,92,83),(807,'경상남도','밀양시','내이동',35.494,128.748,92,82),(808,'경상남도','밀양시','내일동',35.4913,128.756,92,82),(809,'경상남도','밀양시','단장면',35.5122,128.878,94,83),(810,'경상남도','밀양시','무안면',35.4676,128.654,90,82),(811,'경상남도','밀양시','부북면',35.5082,128.732,91,83),(812,'경상남도','밀양시','산내면',35.5812,128.883,94,84),(813,'경상남도','밀양시','산외면',35.4996,128.817,93,83),(814,'경상남도','밀양시','삼랑진읍',35.3927,128.84,93,80),(815,'경상남도','밀양시','삼문동',35.48,128.755,92,82),(816,'경상남도','밀양시','상남면',35.4453,128.756,92,81),(817,'경상남도','밀양시','상동면',35.5498,128.766,92,84),(818,'경상남도','밀양시','청도면',35.5458,128.627,90,83),(819,'경상남도','밀양시','초동면',35.4186,128.675,91,81),(820,'경상남도','밀양시','하남읍',35.3724,128.713,91,80),(821,'경상남도','사천시','곤명면',35.1089,127.944,78,74),(822,'경상남도','사천시','곤양면',35.0544,127.962,78,72),(823,'경상남도','사천시','남양동',34.9665,128.065,80,71),(824,'경상남도','사천시','동서금동',34.9279,128.081,80,70),(825,'경상남도','사천시','동서동',34.9254,128.071,80,70),(826,'경상남도','사천시','벌룡동',34.9406,128.082,80,70),(827,'경상남도','사천시','사남면',35.0494,128.077,80,72),(828,'경상남도','사천시','사천읍',35.0797,128.093,80,73),(829,'경상남도','사천시','서포면',35.0043,127.979,78,71),(830,'경상남도','사천시','선구동',34.9266,128.074,80,70),(831,'경상남도','사천시','용현면',35.0104,128.063,80,71),(832,'경상남도','사천시','정동면',35.053,128.126,81,72),(833,'경상남도','사천시','축동면',35.1041,128.091,80,74),(834,'경상남도','사천시','향촌동',34.9306,128.096,81,70),(835,'경상남도','산청군','금서면',35.4141,127.865,76,80),(836,'경상남도','산청군','단성면',35.2958,127.96,78,78),(837,'경상남도','산청군','산청읍',35.4103,127.88,76,80),(838,'경상남도','산청군','삼장면',35.2952,127.834,76,78),(839,'경상남도','산청군','생비량면',35.342,128.047,79,79),(840,'경상남도','산청군','생초면',35.4901,127.835,76,82),(841,'경상남도','산청군','시천면',35.2753,127.843,76,77),(842,'경상남도','산청군','신등면',35.3797,128.009,79,80),(843,'경상남도','산청군','신안면',35.3009,127.975,78,78),(844,'경상남도','산청군','오부면',35.4557,127.864,76,81),(845,'경상남도','산청군','차황면',35.4607,127.93,77,81),(846,'경상남도','양산시','강서동',35.3421,129.028,97,79),(847,'경상남도','양산시','덕계동',35.3704,129.152,99,80),(848,'경상남도','양산시','동면',35.3204,129.064,98,79),(849,'경상남도','양산시','물금읍',35.308,128.991,96,78),(850,'경상남도','양산시','삼호동',35.3498,129.043,97,79),(851,'경상남도','양산시','상북면',35.4153,129.067,97,81),(852,'경상남도','양산시','서창동',35.4132,129.175,99,81),(853,'경상남도','양산시','소주동',35.4166,129.156,99,81),(854,'경상남도','양산시','양주동',35.3301,129.035,97,79),(855,'경상남도','양산시','원동면',35.3616,128.921,95,80),(856,'경상남도','양산시','중앙동',35.3427,129.043,97,79),(857,'경상남도','양산시','평산동',35.3803,129.151,99,80),(858,'경상남도','양산시','하북면',35.4862,129.089,98,82),(859,'경상남도','의령군','가례면',35.3236,128.247,83,78),(860,'경상남도','의령군','궁류면',35.4443,128.251,83,81),(861,'경상남도','의령군','낙서면',35.4811,128.379,85,82),(862,'경상남도','의령군','대의면',35.3688,128.11,81,79),(863,'경상남도','의령군','봉수면',35.4692,128.268,83,82),(864,'경상남도','의령군','부림면',35.4634,128.327,84,81),(865,'경상남도','의령군','용덕면',35.3451,128.293,84,79),(866,'경상남도','의령군','유곡면',35.4302,128.316,84,81),(867,'경상남도','의령군','의령읍',35.318,128.263,83,78),(868,'경상남도','의령군','정곡면',35.3775,128.329,84,80),(869,'경상남도','의령군','지정면',35.3795,128.388,85,80),(870,'경상남도','의령군','칠곡면',35.3383,128.195,82,79),(871,'경상남도','의령군','화정면',35.2746,128.213,82,77),(872,'경상남도','진주시','가호동',35.1569,128.109,81,75),(873,'경상남도','진주시','강남동',35.1842,128.088,80,75),(874,'경상남도','진주시','금곡면',35.0913,128.19,82,73),(875,'경상남도','진주시','금산면',35.2109,128.15,81,76),(876,'경상남도','진주시','내동면',35.1624,128.07,80,75),(877,'경상남도','진주시','대곡면',35.2612,128.172,82,77),(878,'경상남도','진주시','대평면',35.2296,127.963,78,76),(879,'경상남도','진주시','망경동',35.1777,128.087,80,75),(880,'경상남도','진주시','명석면',35.2165,128.043,79,76),(881,'경상남도','진주시','문산읍',35.166,128.167,82,75),(882,'경상남도','진주시','미천면',35.2961,128.118,81,78),(883,'경상남도','진주시','봉수동',35.1967,128.084,80,76),(884,'경상남도','진주시','봉안동',35.1926,128.08,80,75),(885,'경상남도','진주시','사봉면',35.1852,128.273,84,75),(886,'경상남도','진주시','상대1동',35.1802,128.114,81,75),(887,'경상남도','진주시','상대2동',35.1825,128.121,81,75),(888,'경상남도','진주시','상봉동동',35.1952,128.08,80,76),(889,'경상남도','진주시','상봉서동',35.1955,128.077,80,76),(890,'경상남도','진주시','상평동',35.1731,128.111,81,75),(891,'경상남도','진주시','성지동',35.188,128.078,80,75),(892,'경상남도','진주시','수곡면',35.1956,127.934,77,75),(893,'경상남도','진주시','신안동',35.1815,128.071,80,75),(894,'경상남도','진주시','옥봉동',35.1895,128.093,80,75),(895,'경상남도','진주시','이반성면',35.1662,128.329,85,75),(896,'경상남도','진주시','이현동',35.1897,128.064,80,75),(897,'경상남도','진주시','일반성면',35.168,128.279,84,75),(898,'경상남도','진주시','정촌면',35.1281,128.105,81,74),(899,'경상남도','진주시','중앙동',35.189,128.088,80,75),(900,'경상남도','진주시','지수면',35.2319,128.272,83,76),(901,'경상남도','진주시','진성면',35.1819,128.226,83,75),(902,'경상남도','진주시','집현면',35.236,128.089,80,76),(903,'경상남도','진주시','초장동',35.1984,128.117,81,76),(904,'경상남도','진주시','칠암동',35.1805,128.094,80,75),(905,'경상남도','진주시','판문동',35.165,128.054,80,75),(906,'경상남도','진주시','평거동',35.1638,128.04,79,75),(907,'경상남도','진주시','하대1동',35.1866,128.122,81,75),(908,'경상남도','진주시','하대2동',35.1862,128.13,81,75),(909,'경상남도','창녕군','계성면',35.4657,128.515,88,82),(910,'경상남도','창녕군','고암면',35.5734,128.513,88,84),(911,'경상남도','창녕군','길곡면',35.384,128.571,89,80),(912,'경상남도','창녕군','남지읍',35.386,128.479,87,80),(913,'경상남도','창녕군','대지면',35.5525,128.47,87,84),(914,'경상남도','창녕군','대합면',35.6106,128.474,87,85),(915,'경상남도','창녕군','도천면',35.432,128.52,88,81),(916,'경상남도','창녕군','부곡면',35.4317,128.605,89,81),(917,'경상남도','창녕군','성산면',35.6257,128.496,87,85),(918,'경상남도','창녕군','영산면',35.4506,128.53,88,81),(919,'경상남도','창녕군','유어면',35.5051,128.413,86,82),(920,'경상남도','창녕군','이방면',35.5741,128.39,85,84),(921,'경상남도','창녕군','장마면',35.4551,128.475,87,81),(922,'경상남도','창녕군','창녕읍',35.5377,128.503,87,83),(923,'경상남도','창원시 마산합포구','가포동',35.1598,128.579,89,75),(924,'경상남도','창원시 마산합포구','교방동',35.2056,128.581,89,76),(925,'경상남도','창원시 마산합포구','구산면',35.114,128.577,89,74),(926,'경상남도','창원시 마산합포구','노산동',35.2056,128.581,89,76),(927,'경상남도','창원시 마산합포구','동서동',35.2056,128.581,89,76),(928,'경상남도','창원시 마산합포구','문화동',35.1598,128.579,89,75),(929,'경상남도','창원시 마산합포구','반월동',35.2056,128.581,89,76),(930,'경상남도','창원시 마산합포구','산호동',35.2056,128.581,89,76),(931,'경상남도','창원시 마산합포구','성호동',35.2056,128.581,89,76),(932,'경상남도','창원시 마산합포구','오동동',35.2056,128.581,89,76),(933,'경상남도','창원시 마산합포구','완월동',35.2056,128.581,89,76),(934,'경상남도','창원시 마산합포구','월영동',35.1598,128.579,89,75),(935,'경상남도','창원시 마산합포구','자산동',35.2056,128.581,89,76),(936,'경상남도','창원시 마산합포구','중앙동',35.2056,128.581,89,76),(937,'경상남도','창원시 마산합포구','진동면',35.1169,128.465,87,74),(938,'경상남도','창원시 마산합포구','진북면',35.1169,128.465,87,74),(939,'경상남도','창원시 마산합포구','진전면',35.1182,128.409,86,74),(940,'경상남도','창원시 마산합포구','합포동',35.2056,128.581,89,76),(941,'경상남도','창원시 마산합포구','현동',35.1598,128.579,89,75),(942,'경상남도','창원시 마산회원구','구암1동',35.2514,128.582,89,77),(943,'경상남도','창원시 마산회원구','구암2동',35.2514,128.582,89,77),(944,'경상남도','창원시 마산회원구','내서읍',35.2528,128.526,88,77),(945,'경상남도','창원시 마산회원구','봉암동',35.2056,128.581,89,76),(946,'경상남도','창원시 마산회원구','석전1동',35.2056,128.581,89,76),(947,'경상남도','창원시 마산회원구','석전2동',35.2056,128.581,89,76),(948,'경상남도','창원시 마산회원구','양덕1동',35.2514,128.582,89,77),(949,'경상남도','창원시 마산회원구','양덕2동',35.2056,128.581,89,76),(950,'경상남도','창원시 마산회원구','합성1동',35.2514,128.582,89,77),(951,'경상남도','창원시 마산회원구','합성2동',35.2514,128.582,89,77),(952,'경상남도','창원시 마산회원구','회성동',35.2514,128.582,89,77),(953,'경상남도','창원시 마산회원구','회원1동',35.2056,128.581,89,76),(954,'경상남도','창원시 마산회원구','회원2동',35.2056,128.581,89,76),(955,'경상남도','창원시 성산구','가음정동',35.2026,128.693,91,76),(956,'경상남도','창원시 성산구','반송동',35.2499,128.639,90,77),(957,'경상남도','창원시 성산구','사파동',35.2026,128.693,91,76),(958,'경상남도','창원시 성산구','상남동',35.2026,128.693,91,76),(959,'경상남도','창원시 성산구','성주동',35.2026,128.693,91,76),(960,'경상남도','창원시 성산구','웅남동',35.2041,128.637,90,76),(961,'경상남도','창원시 성산구','중앙동',35.2026,128.693,91,76),(962,'경상남도','창원시 의창구','대산면',35.34,128.698,91,79),(963,'경상남도','창원시 의창구','동읍',35.2942,128.697,91,78),(964,'경상남도','창원시 의창구','명곡동',35.2499,128.639,90,77),(965,'경상남도','창원시 의창구','봉림동',35.2499,128.639,90,77),(966,'경상남도','창원시 의창구','북면',35.343,128.586,89,79),(967,'경상남도','창원시 의창구','용지동',35.2484,128.695,91,77),(968,'경상남도','창원시 의창구','의창동',35.2499,128.639,90,77),(969,'경상남도','창원시 의창구','팔룡동',35.2499,128.639,90,77),(970,'경상남도','창원시 진해구','경화동',35.1567,128.691,91,75),(971,'경상남도','창원시 진해구','덕산동',35.1567,128.691,91,75),(972,'경상남도','창원시 진해구','병암동',35.1567,128.691,91,75),(973,'경상남도','창원시 진해구','석동',35.1567,128.691,91,75),(974,'경상남도','창원시 진해구','여좌동',35.1583,128.635,90,75),(975,'경상남도','창원시 진해구','웅동1동',35.1078,128.801,93,74),(976,'경상남도','창원시 진해구','웅동2동',35.1078,128.801,93,74),(977,'경상남도','창원시 진해구','웅천동',35.1094,128.745,92,74),(978,'경상남도','창원시 진해구','이동',35.1567,128.691,91,75),(979,'경상남도','창원시 진해구','자은동',35.1567,128.691,91,75),(980,'경상남도','창원시 진해구','중앙동',35.1583,128.635,90,75),(981,'경상남도','창원시 진해구','충무동',35.1567,128.691,91,75),(982,'경상남도','창원시 진해구','태백동',35.1567,128.691,91,75),(983,'경상남도','창원시 진해구','태평동',35.1567,128.691,91,75),(984,'경상남도','창원시 진해구','풍호동',35.1567,128.691,91,75),(985,'경상남도','통영시','광도면',34.8966,128.409,86,69),(986,'경상남도','통영시','도남동',34.8265,128.427,87,68),(987,'경상남도','통영시','도산면',34.9001,128.364,85,69),(988,'경상남도','통영시','도천동',34.8339,128.416,86,68),(989,'경상남도','통영시','명정동',34.8395,128.422,86,68),(990,'경상남도','통영시','무전동',34.8543,128.435,87,68),(991,'경상남도','통영시','미수1동',34.8202,128.403,86,67),(992,'경상남도','통영시','미수2동',34.8301,128.411,86,68),(993,'경상남도','통영시','봉평동',34.8296,128.417,86,68),(994,'경상남도','통영시','북신동',34.8539,128.428,87,68),(995,'경상남도','통영시','사량면',34.8424,128.222,83,68),(996,'경상남도','통영시','산양읍',34.8003,128.398,86,67),(997,'경상남도','통영시','욕지면',34.6332,128.266,84,63),(998,'경상남도','통영시','용남면',34.8646,128.445,87,68),(999,'경상남도','통영시','인평동',34.8362,128.403,86,68),(1000,'경상남도','통영시','정량동',34.8399,128.432,87,68),(1001,'경상남도','통영시','중앙동',34.8434,128.429,87,68),(1002,'경상남도','통영시','한산면',34.764,128.51,88,66),(1003,'경상남도','하동군','고전면',35.0191,127.819,76,72),(1004,'경상남도','하동군','금남면',34.9474,127.861,76,70),(1005,'경상남도','하동군','금성면',34.9607,127.792,75,70),(1006,'경상남도','하동군','북천면',35.1116,127.895,77,74),(1007,'경상남도','하동군','악양면',35.1593,127.711,74,75),(1008,'경상남도','하동군','양보면',35.0442,127.848,76,72),(1009,'경상남도','하동군','옥종면',35.1799,127.882,77,75),(1010,'경상남도','하동군','적량면',35.0801,127.779,75,73),(1011,'경상남도','하동군','진교면',35.0274,127.903,77,72),(1012,'경상남도','하동군','청암면',35.153,127.802,75,74),(1013,'경상남도','하동군','하동읍',35.069,127.747,74,73),(1014,'경상남도','하동군','화개면',35.1853,127.628,72,75),(1015,'경상남도','하동군','횡천면',35.1067,127.816,75,73),(1016,'경상남도','함안군','가야읍',35.2691,128.41,86,77),(1017,'경상남도','함안군','군북면',35.2586,128.347,85,77),(1018,'경상남도','함안군','대산면',35.3471,128.434,86,79),(1019,'경상남도','함안군','법수면',35.3125,128.358,85,78),(1020,'경상남도','함안군','산인면',35.2763,128.426,86,77),(1021,'경상남도','함안군','여항면',35.2071,128.437,86,76),(1022,'경상남도','함안군','칠북면',35.3435,128.524,88,79),(1023,'경상남도','함안군','칠서면',35.3304,128.5,87,79),(1024,'경상남도','함안군','칠원면',35.3058,128.521,88,78),(1025,'경상남도','함안군','함안면',35.239,128.426,86,77),(1026,'경상남도','함양군','마천면',35.3939,127.665,73,80),(1027,'경상남도','함양군','백전면',35.5486,127.638,72,83),(1028,'경상남도','함양군','병곡면',35.5254,127.684,73,83),(1029,'경상남도','함양군','서상면',35.6804,127.688,73,86),(1030,'경상남도','함양군','서하면',35.6446,127.698,73,85),(1031,'경상남도','함양군','수동면',35.5191,127.79,75,82),(1032,'경상남도','함양군','안의면',35.6256,127.813,75,85),(1033,'경상남도','함양군','유림면',35.4632,127.795,75,81),(1034,'경상남도','함양군','지곡면',35.5632,127.776,74,83),(1035,'경상남도','함양군','함양읍',35.5166,127.729,74,82),(1036,'경상남도','함양군','휴천면',35.4776,127.752,74,82),(1037,'경상남도','합천군','가야면',35.7597,128.142,81,88),(1038,'경상남도','합천군','가회면',35.4321,128.036,79,81),(1039,'경상남도','합천군','대병면',35.5182,128.017,79,83),(1040,'경상남도','합천군','대양면',35.5136,128.177,82,83),(1041,'경상남도','합천군','덕곡면',35.612,128.361,85,85),(1042,'경상남도','합천군','묘산면',35.6554,128.116,80,86),(1043,'경상남도','합천군','봉산면',35.623,128.044,79,85),(1044,'경상남도','합천군','삼가면',35.4113,128.124,81,80),(1045,'경상남도','합천군','쌍백면',35.4386,128.148,81,81),(1046,'경상남도','합천군','쌍책면',35.5728,128.284,83,84),(1047,'경상남도','합천군','야로면',35.7022,128.17,81,87),(1048,'경상남도','합천군','용주면',35.5377,128.116,81,83),(1049,'경상남도','합천군','율곡면',35.5693,128.22,82,84),(1050,'경상남도','합천군','적중면',35.5445,128.281,83,83),(1051,'경상남도','합천군','청덕면',35.5563,128.324,84,84),(1052,'경상남도','합천군','초계면',35.5569,128.268,83,83),(1053,'경상남도','합천군','합천읍',35.5629,128.16,81,84),(1054,'경상북도','경산시','남부동',35.8107,128.741,91,89),(1055,'경상북도','경산시','남산면',35.7904,128.84,93,89),(1056,'경상북도','경산시','남천면',35.7637,128.729,91,88),(1057,'경상북도','경산시','동부동',35.8164,128.756,92,89),(1058,'경상북도','경산시','북부동',35.8303,128.749,92,90),(1059,'경상북도','경산시','서부1동',35.8176,128.73,91,89),(1060,'경상북도','경산시','서부2동',35.8315,128.728,91,90),(1061,'경상북도','경산시','압량면',35.8403,128.762,92,90),(1062,'경상북도','경산시','와촌면',35.9433,128.839,93,92),(1063,'경상북도','경산시','용성면',35.7902,128.878,94,89),(1064,'경상북도','경산시','자인면',35.8179,128.825,93,89),(1065,'경상북도','경산시','중방동',35.8241,128.736,91,90),(1066,'경상북도','경산시','중앙동',35.8171,128.743,91,89),(1067,'경상북도','경산시','진량읍',35.871,128.819,93,91),(1068,'경상북도','경산시','하양읍',35.9102,128.821,93,91),(1069,'경상북도','경주시','감포읍',35.8044,129.504,105,90),(1070,'경상북도','경주시','강동면',35.9847,129.276,101,93),(1071,'경상북도','경주시','건천읍',35.847,129.105,98,90),(1072,'경상북도','경주시','내남면',35.7495,129.202,100,88),(1073,'경상북도','경주시','동천동',35.8517,129.225,100,90),(1074,'경상북도','경주시','보덕동',35.8317,129.29,101,90),(1075,'경상북도','경주시','불국동',35.772,129.303,101,89),(1076,'경상북도','경주시','산내면',35.7546,129.05,97,88),(1077,'경상북도','경주시','서면',35.8884,129.055,97,91),(1078,'경상북도','경주시','선도동',35.823,129.191,99,90),(1079,'경상북도','경주시','성건동',35.8478,129.21,100,90),(1080,'경상북도','경주시','성동동',35.844,129.218,100,90),(1081,'경상북도','경주시','안강읍',35.9872,129.229,100,93),(1082,'경상북도','경주시','양남면',35.6748,129.463,104,87),(1083,'경상북도','경주시','양북면',35.7881,129.445,104,89),(1084,'경상북도','경주시','외동읍',35.713,129.327,102,88),(1085,'경상북도','경주시','용강동',35.8612,129.225,100,91),(1086,'경상북도','경주시','월성동',35.8336,129.222,100,90),(1087,'경상북도','경주시','중부동',35.839,129.209,100,90),(1088,'경상북도','경주시','천북면',35.8923,129.273,101,91),(1089,'경상북도','경주시','탑정동',35.8302,129.21,100,90),(1090,'경상북도','경주시','현곡면',35.8633,129.205,100,91),(1091,'경상북도','경주시','황남동',35.8323,129.213,100,90),(1092,'경상북도','경주시','황성동',35.8568,129.221,100,91),(1093,'경상북도','경주시','황오동',35.8381,129.217,100,90),(1094,'경상북도','고령군','개진면',35.7052,128.352,85,87),(1095,'경상북도','고령군','고령읍',35.7276,128.27,83,87),(1096,'경상북도','고령군','다산면',35.8228,128.457,86,89),(1097,'경상북도','고령군','덕곡면',35.7763,128.235,82,88),(1098,'경상북도','고령군','성산면',35.7469,128.362,85,88),(1099,'경상북도','고령군','쌍림면',35.6768,128.244,83,86),(1100,'경상북도','고령군','우곡면',35.6749,128.344,84,86),(1101,'경상북도','고령군','운수면',35.7661,128.293,84,88),(1102,'경상북도','구미시','고아읍',36.1533,128.352,84,97),(1103,'경상북도','구미시','공단1동',36.1163,128.374,85,96),(1104,'경상북도','구미시','공단2동',36.0984,128.387,85,95),(1105,'경상북도','구미시','광평동',36.1017,128.368,85,95),(1106,'경상북도','구미시','도개면',36.2965,128.333,84,100),(1107,'경상북도','구미시','도량동',36.1376,128.335,84,96),(1108,'경상북도','구미시','무을면',36.2578,128.2,82,99),(1109,'경상북도','구미시','비산동',36.1207,128.383,85,96),(1110,'경상북도','구미시','산동면',36.1668,128.436,86,97),(1111,'경상북도','구미시','상모사곡동',36.0967,128.36,84,95),(1112,'경상북도','구미시','선산읍',36.2399,128.301,83,98),(1113,'경상북도','구미시','선주원남동',36.1214,128.339,84,96),(1114,'경상북도','구미시','송정동',36.1154,128.35,84,96),(1115,'경상북도','구미시','신평1동',36.1179,128.361,85,96),(1116,'경상북도','구미시','신평2동',36.1201,128.368,85,96),(1117,'경상북도','구미시','양포동',36.1339,128.428,86,96),(1118,'경상북도','구미시','옥성면',36.2929,128.281,83,100),(1119,'경상북도','구미시','원평1동',36.1249,128.341,84,96),(1120,'경상북도','구미시','원평2동',36.1279,128.328,84,96),(1121,'경상북도','구미시','인동동',36.104,128.423,86,95),(1122,'경상북도','구미시','임오동',36.0863,128.371,85,95),(1123,'경상북도','구미시','장천면',36.1229,128.497,87,96),(1124,'경상북도','구미시','지산동',36.1367,128.348,84,96),(1125,'경상북도','구미시','진미동',36.103,128.421,86,95),(1126,'경상북도','구미시','해평면',36.1968,128.394,85,97),(1127,'경상북도','구미시','형곡1동',36.111,128.337,84,96),(1128,'경상북도','구미시','형곡2동',36.1033,128.338,84,95),(1129,'경상북도','군위군','고로면',36.118,128.791,92,96),(1130,'경상북도','군위군','군위읍',36.2369,128.571,88,98),(1131,'경상북도','군위군','부계면',36.0979,128.666,90,95),(1132,'경상북도','군위군','산성면',36.1201,128.697,90,96),(1133,'경상북도','군위군','소보면',36.2519,128.478,86,99),(1134,'경상북도','군위군','우보면',36.192,128.664,90,98),(1135,'경상북도','군위군','의흥면',36.1729,128.717,91,97),(1136,'경상북도','군위군','효령면',36.1539,128.588,88,97),(1137,'경상북도','김천시','감문면',36.2113,128.183,81,98),(1138,'경상북도','김천시','감천면',36.0631,128.128,80,94),(1139,'경상북도','김천시','개령면',36.1648,128.188,81,97),(1140,'경상북도','김천시','구성면',36.0295,128.05,79,94),(1141,'경상북도','김천시','남면',36.105,128.192,82,95),(1142,'경상북도','김천시','농소면',36.1031,128.175,81,95),(1143,'경상북도','김천시','대곡동',36.1216,128.091,80,96),(1144,'경상북도','김천시','대덕면',35.9149,127.971,78,91),(1145,'경상북도','김천시','대신동',36.1321,128.12,80,96),(1146,'경상북도','김천시','대항면',36.1215,128.024,79,96),(1147,'경상북도','김천시','봉산면',36.1385,128.062,79,96),(1148,'경상북도','김천시','부항면',35.9872,127.957,77,93),(1149,'경상북도','김천시','아포읍',36.1569,128.256,83,97),(1150,'경상북도','김천시','양금동',36.1104,128.126,80,95),(1151,'경상북도','김천시','어모면',36.1777,128.121,80,97),(1152,'경상북도','김천시','자산동',36.1351,128.105,80,96),(1153,'경상북도','김천시','조마면',36.032,128.101,80,94),(1154,'경상북도','김천시','증산면',35.899,128.037,79,91),(1155,'경상북도','김천시','지례면',35.9818,128.029,79,93),(1156,'경상북도','김천시','지좌동',36.1167,128.147,81,96),(1157,'경상북도','김천시','평화남산동',36.1351,128.105,80,96),(1158,'경상북도','문경시','가은읍',36.6398,128.064,79,107),(1159,'경상북도','문경시','농암면',36.5978,128.006,78,106),(1160,'경상북도','문경시','동로면',36.7705,128.317,83,110),(1161,'경상북도','문경시','마성면',36.6898,128.119,80,108),(1162,'경상북도','문경시','문경읍',36.7344,128.109,80,109),(1163,'경상북도','문경시','산북면',36.6531,128.262,82,107),(1164,'경상북도','문경시','산양면',36.6088,128.261,82,106),(1165,'경상북도','문경시','영순면',36.5792,128.238,82,106),(1166,'경상북도','문경시','점촌1동',36.5957,128.2,81,106),(1167,'경상북도','문경시','점촌2동',36.5872,128.198,81,106),(1168,'경상북도','문경시','점촌3동',36.6,128.209,82,106),(1169,'경상북도','문경시','점촌4동',36.6363,128.173,81,107),(1170,'경상북도','문경시','점촌5동',36.5882,128.19,81,106),(1171,'경상북도','문경시','호계면',36.6283,128.208,82,107),(1172,'경상북도','봉화군','명호면',36.856,128.902,93,112),(1173,'경상북도','봉화군','물야면',36.9723,128.738,90,115),(1174,'경상북도','봉화군','법전면',36.9079,128.879,93,113),(1175,'경상북도','봉화군','봉성면',36.883,128.82,92,113),(1176,'경상북도','봉화군','봉화읍',36.8849,128.742,91,113),(1177,'경상북도','봉화군','상운면',36.8309,128.757,91,111),(1178,'경상북도','봉화군','석포면',37.0458,129.067,96,116),(1179,'경상북도','봉화군','소천면',36.9348,129.005,95,114),(1180,'경상북도','봉화군','재산면',36.8131,128.964,95,111),(1181,'경상북도','봉화군','춘양면',36.9322,128.917,94,114),(1182,'경상북도','상주시','계림동',36.4192,128.167,81,102),(1183,'경상북도','상주시','공검면',36.5092,128.161,81,104),(1184,'경상북도','상주시','공성면',36.2805,128.095,80,99),(1185,'경상북도','상주시','낙동면',36.3721,128.25,82,101),(1186,'경상북도','상주시','남원동',36.4125,128.155,81,102),(1187,'경상북도','상주시','내서면',36.4093,128.069,79,102),(1188,'경상북도','상주시','동문동',36.4144,128.171,81,102),(1189,'경상북도','상주시','동성동',36.4123,128.172,81,102),(1190,'경상북도','상주시','모동면',36.3171,127.962,77,100),(1191,'경상북도','상주시','모서면',36.3395,127.962,77,100),(1192,'경상북도','상주시','북문동',36.4261,128.16,81,102),(1193,'경상북도','상주시','사벌면',36.4634,128.211,82,103),(1194,'경상북도','상주시','신흥동',36.4007,128.162,81,102),(1195,'경상북도','상주시','외남면',36.3545,128.092,80,101),(1196,'경상북도','상주시','외서면',36.4764,128.11,80,103),(1197,'경상북도','상주시','은척면',36.5288,128.074,79,105),(1198,'경상북도','상주시','이안면',36.5765,128.148,80,106),(1199,'경상북도','상주시','중동면',36.4234,128.274,83,102),(1200,'경상북도','상주시','청리면',36.3357,128.133,80,100),(1201,'경상북도','상주시','함창읍',36.5672,128.182,81,105),(1202,'경상북도','상주시','화남면',36.4454,127.908,76,103),(1203,'경상북도','상주시','화동면',36.3866,127.956,77,101),(1204,'경상북도','상주시','화북면',36.5604,127.919,77,105),(1205,'경상북도','상주시','화서면',36.4425,127.954,77,103),(1206,'경상북도','성주군','가천면',35.8813,128.168,81,91),(1207,'경상북도','성주군','금수면',35.9166,128.178,81,91),(1208,'경상북도','성주군','대가면',35.9073,128.231,82,91),(1209,'경상북도','성주군','벽진면',35.9455,128.219,82,92),(1210,'경상북도','성주군','선남면',35.8978,128.354,85,91),(1211,'경상북도','성주군','성주읍',35.916,128.292,83,91),(1212,'경상북도','성주군','수륜면',35.8299,128.195,82,89),(1213,'경상북도','성주군','용암면',35.8333,128.339,84,90),(1214,'경상북도','성주군','월항면',35.9426,128.318,84,92),(1215,'경상북도','성주군','초전면',35.9716,128.266,83,93),(1216,'경상북도','안동시','강남동',36.5493,128.722,91,105),(1217,'경상북도','안동시','길안면',36.453,128.897,94,103),(1218,'경상북도','안동시','남선면',36.5232,128.772,91,105),(1219,'경상북도','안동시','남후면',36.5207,128.692,90,105),(1220,'경상북도','안동시','녹전면',36.7399,128.776,91,110),(1221,'경상북도','안동시','도산면',36.739,128.836,92,110),(1222,'경상북도','안동시','명륜동',36.5794,128.737,91,106),(1223,'경상북도','안동시','북후면',36.6822,128.705,90,108),(1224,'경상북도','안동시','서구동',36.5614,128.72,90,106),(1225,'경상북도','안동시','서후면',36.614,128.666,90,107),(1226,'경상북도','안동시','송하동',36.5676,128.699,90,106),(1227,'경상북도','안동시','안기동',36.58,128.717,90,106),(1228,'경상북도','안동시','예안면',36.6584,128.887,93,108),(1229,'경상북도','안동시','옥동',36.5586,128.704,90,106),(1230,'경상북도','안동시','와룡면',36.6135,128.769,91,107),(1231,'경상북도','안동시','용상동',36.5562,128.752,91,105),(1232,'경상북도','안동시','일직면',36.4724,128.662,90,104),(1233,'경상북도','안동시','임동면',36.5659,128.92,94,106),(1234,'경상북도','안동시','임하면',36.5219,128.833,92,105),(1235,'경상북도','안동시','중구동',36.5638,128.732,91,106),(1236,'경상북도','안동시','태화동',36.5597,128.716,90,106),(1237,'경상북도','안동시','평화동',36.5662,128.715,90,106),(1238,'경상북도','안동시','풍산읍',36.5772,128.574,88,106),(1239,'경상북도','안동시','풍천면',36.5533,128.509,87,105),(1240,'경상북도','영덕군','강구면',36.3589,129.381,102,102),(1241,'경상북도','영덕군','남정면',36.2831,129.375,102,100),(1242,'경상북도','영덕군','달산면',36.3962,129.306,101,102),(1243,'경상북도','영덕군','병곡면',36.5994,129.413,103,107),(1244,'경상북도','영덕군','영덕읍',36.4065,129.375,102,103),(1245,'경상북도','영덕군','영해면',36.5346,129.409,103,105),(1246,'경상북도','영덕군','지품면',36.4456,129.284,100,103),(1247,'경상북도','영덕군','창수면',36.5433,129.351,102,106),(1248,'경상북도','영덕군','축산면',36.506,129.417,103,105),(1249,'경상북도','영양군','석보면',36.5552,129.127,98,106),(1250,'경상북도','영양군','수비면',36.7623,129.205,99,110),(1251,'경상북도','영양군','영양읍',36.6642,129.116,97,108),(1252,'경상북도','영양군','일월면',36.6995,129.131,98,109),(1253,'경상북도','영양군','입암면',36.5903,129.093,97,106),(1254,'경상북도','영양군','청기면',36.6583,129.065,96,108),(1255,'경상북도','영주시','가흥1동',36.8158,128.62,89,111),(1256,'경상북도','영주시','가흥2동',36.8265,128.614,88,111),(1257,'경상북도','영주시','단산면',36.9484,128.622,88,114),(1258,'경상북도','영주시','문수면',36.7692,128.633,89,110),(1259,'경상북도','영주시','봉현면',36.8586,128.527,87,112),(1260,'경상북도','영주시','부석면',36.976,128.656,89,115),(1261,'경상북도','영주시','상망동',36.8258,128.632,89,111),(1262,'경상북도','영주시','순흥면',36.9129,128.577,88,113),(1263,'경상북도','영주시','안정면',36.8428,128.559,87,112),(1264,'경상북도','영주시','영주1동',36.8236,128.622,89,111),(1265,'경상북도','영주시','영주2동',36.8179,128.621,89,111),(1266,'경상북도','영주시','이산면',36.8189,128.658,89,111),(1267,'경상북도','영주시','장수면',36.7718,128.581,88,110),(1268,'경상북도','영주시','평은면',36.7402,128.678,90,109),(1269,'경상북도','영주시','풍기읍',36.868,128.527,87,112),(1270,'경상북도','영주시','하망동',36.821,128.633,89,111),(1271,'경상북도','영주시','휴천1동',36.8156,128.632,89,111),(1272,'경상북도','영주시','휴천2동',36.8072,128.624,89,111),(1273,'경상북도','영주시','휴천3동',36.8096,128.63,89,111),(1274,'경상북도','영천시','고경면',35.9986,129.048,97,94),(1275,'경상북도','영천시','금호읍',35.9303,128.88,94,92),(1276,'경상북도','영천시','남부동',35.9542,128.935,95,93),(1277,'경상북도','영천시','대창면',35.8729,128.897,94,91),(1278,'경상북도','영천시','동부동',35.9716,128.945,95,93),(1279,'경상북도','영천시','북안면',35.9123,129.011,96,92),(1280,'경상북도','영천시','서부동',35.9606,128.924,95,93),(1281,'경상북도','영천시','신녕면',36.0423,128.792,92,94),(1282,'경상북도','영천시','완산동',35.9619,128.942,95,93),(1283,'경상북도','영천시','임고면',36.0181,128.976,95,94),(1284,'경상북도','영천시','자양면',36.0755,129.02,96,95),(1285,'경상북도','영천시','중앙동',35.9704,128.932,95,93),(1286,'경상북도','영천시','청통면',35.9891,128.825,93,93),(1287,'경상북도','영천시','화남면',36.0562,128.891,94,95),(1288,'경상북도','영천시','화북면',36.1053,128.922,94,96),(1289,'경상북도','영천시','화산면',36.0174,128.855,93,94),(1290,'경상북도','예천군','감천면',36.7182,128.529,87,109),(1291,'경상북도','예천군','개포면',36.6055,128.369,84,106),(1292,'경상북도','예천군','보문면',36.6624,128.513,87,108),(1293,'경상북도','예천군','상리면',36.7685,128.421,85,110),(1294,'경상북도','예천군','예천읍',36.6541,128.456,86,107),(1295,'경상북도','예천군','용궁면',36.6057,128.28,83,106),(1296,'경상북도','예천군','용문면',36.6873,128.413,85,108),(1297,'경상북도','예천군','유천면',36.6325,128.392,85,107),(1298,'경상북도','예천군','지보면',36.5453,128.393,85,105),(1299,'경상북도','예천군','풍양면',36.5077,128.301,83,104),(1300,'경상북도','예천군','하리면',36.7422,128.445,86,109),(1301,'경상북도','예천군','호명면',36.5914,128.471,86,106),(1302,'경상북도','울릉군','독도',37.2301,131.851,144,123),(1303,'경상북도','울릉군','북면',37.5368,130.873,127,129),(1304,'경상북도','울릉군','서면',37.4638,130.836,126,127),(1305,'경상북도','울릉군','울릉읍',37.4811,130.902,127,127),(1306,'경상북도','울진군','근남면',36.9599,129.397,102,115),(1307,'경상북도','울진군','기성면',36.7953,129.454,103,111),(1308,'경상북도','울진군','북면',37.102,129.375,101,118),(1309,'경상북도','울진군','서면',36.9327,129.249,99,114),(1310,'경상북도','울진군','온정면',36.7212,129.348,101,109),(1311,'경상북도','울진군','울진읍',36.9943,129.405,102,115),(1312,'경상북도','울진군','원남면',36.9103,129.385,102,114),(1313,'경상북도','울진군','죽변면',37.0569,129.425,102,117),(1314,'경상북도','울진군','평해읍',36.7252,129.444,103,110),(1315,'경상북도','울진군','후포면',36.6756,129.442,103,109),(1316,'경상북도','의성군','가음면',36.2312,128.727,91,98),(1317,'경상북도','의성군','구천면',36.3444,128.435,86,101),(1318,'경상북도','의성군','금성면',36.2584,128.683,90,99),(1319,'경상북도','의성군','다인면',36.4474,128.356,84,103),(1320,'경상북도','의성군','단밀면',36.3731,128.384,85,101),(1321,'경상북도','의성군','단북면',36.3846,128.407,85,102),(1322,'경상북도','의성군','단촌면',36.4191,128.676,90,102),(1323,'경상북도','의성군','봉양면',36.2978,128.579,88,100),(1324,'경상북도','의성군','비안면',36.3344,128.492,87,101),(1325,'경상북도','의성군','사곡면',36.3034,128.79,92,100),(1326,'경상북도','의성군','신평면',36.4707,128.505,87,103),(1327,'경상북도','의성군','안계면',36.3809,128.442,86,102),(1328,'경상북도','의성군','안사면',36.428,128.464,86,103),(1329,'경상북도','의성군','안평면',36.3738,128.586,88,101),(1330,'경상북도','의성군','옥산면',36.3899,128.812,92,102),(1331,'경상북도','의성군','의성읍',36.353,128.697,90,101),(1332,'경상북도','의성군','점곡면',36.4212,128.77,91,103),(1333,'경상북도','의성군','춘산면',36.2346,128.814,92,99),(1334,'경상북도','청도군','각남면',35.6388,128.661,90,85),(1335,'경상북도','청도군','각북면',35.6843,128.591,89,86),(1336,'경상북도','청도군','금천면',35.6838,128.895,94,87),(1337,'경상북도','청도군','매전면',35.664,128.858,94,86),(1338,'경상북도','청도군','운문면',35.7126,128.915,95,87),(1339,'경상북도','청도군','이서면',35.6602,128.673,90,86),(1340,'경상북도','청도군','청도읍',35.6424,128.744,92,86),(1341,'경상북도','청도군','풍각면',35.6358,128.621,89,85),(1342,'경상북도','청도군','화양읍',35.6469,128.708,91,86),(1343,'경상북도','청송군','부남면',36.3417,129.066,97,101),(1344,'경상북도','청송군','부동면',36.3539,129.162,98,101),(1345,'경상북도','청송군','안덕면',36.286,128.962,95,100),(1346,'경상북도','청송군','진보면',36.5265,129.049,96,105),(1347,'경상북도','청송군','청송읍',36.4312,129.059,97,103),(1348,'경상북도','청송군','파천면',36.4601,129.04,96,104),(1349,'경상북도','청송군','현동면',36.2877,129.019,96,100),(1350,'경상북도','청송군','현서면',36.2729,128.898,94,99),(1351,'경상북도','칠곡군','가산면',36.083,128.541,88,95),(1352,'경상북도','칠곡군','기산면',35.9834,128.385,85,93),(1353,'경상북도','칠곡군','동명면',35.981,128.556,88,93),(1354,'경상북도','칠곡군','북삼읍',36.0599,128.345,84,94),(1355,'경상북도','칠곡군','석적읍',36.0484,128.411,85,94),(1356,'경상북도','칠곡군','약목면',36.0298,128.366,85,94),(1357,'경상북도','칠곡군','왜관읍',35.986,128.4,85,93),(1358,'경상북도','칠곡군','지천면',35.9531,128.493,87,92),(1359,'경상북도','포항시남구','구룡포읍',35.9821,129.549,105,94),(1360,'경상북도','포항시남구','대송면',35.9655,129.362,102,93),(1361,'경상북도','포항시남구','대이동',36.0142,129.345,102,94),(1362,'경상북도','포항시남구','동해면',35.9855,129.443,104,94),(1363,'경상북도','포항시남구','상대동',36.0088,129.351,102,94),(1364,'경상북도','포항시남구','송도동',36.0289,129.378,102,94),(1365,'경상북도','포항시남구','연일읍',35.9886,129.346,102,94),(1366,'경상북도','포항시남구','오천읍',35.9602,129.417,103,93),(1367,'경상북도','포항시남구','장기면',35.8928,129.495,105,92),(1368,'경상북도','포항시남구','제철동',35.9893,129.399,103,94),(1369,'경상북도','포항시남구','청림동',35.9944,129.408,103,94),(1370,'경상북도','포항시남구','해도동',36.0088,129.351,102,94),(1371,'경상북도','포항시남구','호미곶면',36.0927,129.583,106,96),(1372,'경상북도','포항시남구','효곡동',36.005,129.333,102,94),(1373,'경상북도','포항시북구','기계면',36.0695,129.213,100,95),(1374,'경상북도','포항시북구','기북면',36.1256,129.169,99,96),(1375,'경상북도','포항시북구','두호동',36.0579,129.382,102,95),(1376,'경상북도','포항시북구','송라면',36.2259,129.359,102,99),(1377,'경상북도','포항시북구','신광면',36.1271,129.265,100,97),(1378,'경상북도','포항시북구','양학동',36.0223,129.353,102,94),(1379,'경상북도','포항시북구','용흥동',36.0354,129.36,102,95),(1380,'경상북도','포항시북구','우창동',36.0517,129.364,102,95),(1381,'경상북도','포항시북구','장량동',36.0672,129.381,102,95),(1382,'경상북도','포항시북구','죽도동',36.0088,129.351,102,94),(1383,'경상북도','포항시북구','죽장면',36.1572,129.098,97,97),(1384,'경상북도','포항시북구','중앙동',36.0368,129.366,102,95),(1385,'경상북도','포항시북구','청하면',36.1962,129.34,102,98),(1386,'경상북도','포항시북구','환여동',36.067,129.4,103,95),(1387,'경상북도','포항시북구','흥해읍',36.1041,129.344,102,96),(1388,'광주광역시','광산구','도산동',35.1263,126.794,57,74),(1389,'광주광역시','광산구','동곡동',35.0956,126.774,57,73),(1390,'광주광역시','광산구','본량동',35.1777,126.731,56,75),(1391,'광주광역시','광산구','비아동',35.219,126.826,58,76),(1392,'광주광역시','광산구','삼도동',35.1591,126.7,55,74),(1393,'광주광역시','광산구','송정1동',35.1377,126.801,57,74),(1394,'광주광역시','광산구','송정2동',35.136,126.797,57,74),(1395,'광주광역시','광산구','신가동',35.1785,126.83,58,75),(1396,'광주광역시','광산구','신창동',35.1901,126.841,58,75),(1397,'광주광역시','광산구','신흥동',35.1421,126.803,57,74),(1398,'광주광역시','광산구','어룡동',35.1394,126.797,57,74),(1399,'광주광역시','광산구','우산동',35.1547,126.812,57,74),(1400,'광주광역시','광산구','운남동',35.1703,126.824,58,75),(1401,'광주광역시','광산구','월곡1동',35.1688,126.812,57,75),(1402,'광주광역시','광산구','월곡2동',35.1713,126.81,57,75),(1403,'광주광역시','광산구','임곡동',35.2166,126.747,56,76),(1404,'광주광역시','광산구','첨단1동',35.2165,126.844,58,76),(1405,'광주광역시','광산구','첨단2동',35.2132,126.845,58,76),(1406,'광주광역시','광산구','평동',35.1217,126.762,57,73),(1407,'광주광역시','광산구','하남동',35.1819,126.796,57,75),(1408,'광주광역시','남구','대촌동',35.0783,126.836,58,73),(1409,'광주광역시','남구','방림1동',35.1313,126.92,59,74),(1410,'광주광역시','남구','방림2동',35.1289,126.924,59,74),(1411,'광주광역시','남구','백운1동',35.1352,126.906,59,74),(1412,'광주광역시','남구','백운2동',35.133,126.904,59,74),(1413,'광주광역시','남구','봉선1동',35.1275,126.913,59,74),(1414,'광주광역시','남구','봉선2동',35.1204,126.916,59,73),(1415,'광주광역시','남구','사직동',35.1427,126.91,59,74),(1416,'광주광역시','남구','송암동',35.1084,126.879,59,73),(1417,'광주광역시','남구','양림동',35.1338,126.918,59,74),(1418,'광주광역시','남구','월산4동',35.1436,126.893,59,74),(1419,'광주광역시','남구','월산5동',35.1371,126.895,59,74),(1420,'광주광역시','남구','월산동',35.1445,126.905,59,74),(1421,'광주광역시','남구','주월1동',35.1289,126.895,59,74),(1422,'광주광역시','남구','주월2동',35.1316,126.896,59,74),(1423,'광주광역시','남구','효덕동',35.1094,126.901,59,73),(1424,'광주광역시','동구','계림1동',35.1555,126.922,59,74),(1425,'광주광역시','동구','계림2동',35.1551,126.925,60,74),(1426,'광주광역시','동구','동명동',35.1481,126.927,60,74),(1427,'광주광역시','동구','산수1동',35.1543,126.933,60,74),(1428,'광주광역시','동구','산수2동',35.1515,126.938,60,74),(1429,'광주광역시','동구','서남동',35.1419,126.925,60,74),(1430,'광주광역시','동구','지산1동',35.1459,126.935,60,74),(1431,'광주광역시','동구','지산2동',35.1449,126.937,60,74),(1432,'광주광역시','동구','지원1동',35.1161,126.933,60,73),(1433,'광주광역시','동구','지원2동',35.1174,126.935,60,73),(1434,'광주광역시','동구','충장동',35.1463,126.919,59,74),(1435,'광주광역시','동구','학동',35.1314,126.926,60,74),(1436,'광주광역시','동구','학운동',35.1294,126.936,60,74),(1437,'광주광역시','북구','건국동',35.2198,126.884,59,76),(1438,'광주광역시','북구','동림동',35.1839,126.869,58,75),(1439,'광주광역시','북구','두암1동',35.168,126.931,60,75),(1440,'광주광역시','북구','두암2동',35.171,126.934,60,75),(1441,'광주광역시','북구','두암3동',35.16,126.937,60,74),(1442,'광주광역시','북구','매곡동',35.1864,126.894,59,75),(1443,'광주광역시','북구','문화동',35.1784,126.939,60,75),(1444,'광주광역시','북구','문흥1동',35.1837,126.924,59,75),(1445,'광주광역시','북구','문흥2동',35.1812,126.924,59,75),(1446,'광주광역시','북구','삼각동',35.1962,126.902,59,75),(1447,'광주광역시','북구','석곡동',35.2119,126.952,60,75),(1448,'광주광역시','북구','신안동',35.1644,126.901,59,74),(1449,'광주광역시','북구','오치1동',35.1861,126.91,59,75),(1450,'광주광역시','북구','오치2동',35.187,126.903,59,75),(1451,'광주광역시','북구','용봉동',35.1773,126.903,59,75),(1452,'광주광역시','북구','우산동',35.1672,126.923,59,75),(1453,'광주광역시','북구','운암1동',35.1718,126.876,59,75),(1454,'광주광역시','북구','운암2동',35.171,126.885,59,75),(1455,'광주광역시','북구','운암3동',35.1797,126.876,59,75),(1456,'광주광역시','북구','일곡동',35.203,126.899,59,75),(1457,'광주광역시','북구','임동',35.1628,126.896,59,74),(1458,'광주광역시','북구','중앙동',35.1544,126.908,59,74),(1459,'광주광역시','북구','중흥1동',35.1586,126.916,59,74),(1460,'광주광역시','북구','중흥2동',35.1652,126.911,59,74),(1461,'광주광역시','북구','중흥3동',35.1692,126.919,59,75),(1462,'광주광역시','북구','풍향동',35.1614,126.925,60,74),(1463,'광주광역시','서구','광천동',35.1613,126.882,59,74),(1464,'광주광역시','서구','금호1동',35.1321,126.859,58,74),(1465,'광주광역시','서구','금호2동',35.1291,126.861,58,74),(1466,'광주광역시','서구','농성1동',35.1536,126.892,59,74),(1467,'광주광역시','서구','농성2동',35.1473,126.892,59,74),(1468,'광주광역시','서구','상무1동',35.1507,126.869,59,74),(1469,'광주광역시','서구','상무2동',35.1434,126.868,58,74),(1470,'광주광역시','서구','서창동',35.1114,126.832,58,73),(1471,'광주광역시','서구','양3동',35.1543,126.896,59,74),(1472,'광주광역시','서구','양동',35.1517,126.903,59,74),(1473,'광주광역시','서구','유덕동',35.1622,126.854,58,74),(1474,'광주광역시','서구','치평동',35.147,126.845,58,74),(1475,'광주광역시','서구','풍암동',35.1217,126.881,59,74),(1476,'광주광역시','서구','화정1동',35.1531,126.88,59,74),(1477,'광주광역시','서구','화정2동',35.1425,126.884,59,74),(1478,'광주광역시','서구','화정3동',35.1404,126.879,59,74),(1479,'광주광역시','서구','화정4동',35.1388,126.876,59,74),(1480,'대구광역시','남구','대명10동',35.8371,128.571,88,90),(1481,'대구광역시','남구','대명11동',35.8332,128.563,88,90),(1482,'대구광역시','남구','대명1동',35.8373,128.579,89,90),(1483,'대구광역시','남구','대명2동',35.8523,128.589,89,90),(1484,'대구광역시','남구','대명3동',35.8494,128.581,89,90),(1485,'대구광역시','남구','대명4동',35.845,128.575,88,90),(1486,'대구광역시','남구','대명5동',35.8403,128.59,89,90),(1487,'대구광역시','남구','대명6동',35.8321,128.568,88,90),(1488,'대구광역시','남구','대명9동',35.8343,128.581,89,90),(1489,'대구광역시','남구','봉덕1동',35.8426,128.6,89,90),(1490,'대구광역시','남구','봉덕2동',35.8409,128.603,89,90),(1491,'대구광역시','남구','봉덕3동',35.8387,128.6,89,90),(1492,'대구광역시','남구','이천동',35.8507,128.602,89,90),(1493,'대구광역시','달서구','감삼동',35.8481,128.544,88,90),(1494,'대구광역시','달서구','도원동',35.8045,128.534,88,89),(1495,'대구광역시','달서구','두류1동',35.8527,128.574,88,90),(1496,'대구광역시','달서구','두류2동',35.8551,128.57,88,90),(1497,'대구광역시','달서구','두류3동',35.8507,128.558,88,90),(1498,'대구광역시','달서구','본동',35.8315,128.543,88,90),(1499,'대구광역시','달서구','본리동',35.8391,128.54,88,90),(1500,'대구광역시','달서구','상인1동',35.8113,128.547,88,89),(1501,'대구광역시','달서구','상인2동',35.8095,128.539,88,89),(1502,'대구광역시','달서구','상인3동',35.8071,128.552,88,89),(1503,'대구광역시','달서구','성당1동',35.8362,128.56,88,90),(1504,'대구광역시','달서구','성당2동',35.84,128.552,88,90),(1505,'대구광역시','달서구','송현1동',35.8264,128.556,88,90),(1506,'대구광역시','달서구','송현2동',35.8298,128.548,88,90),(1507,'대구광역시','달서구','신당동',35.856,128.501,87,90),(1508,'대구광역시','달서구','용산1동',35.8537,128.534,88,90),(1509,'대구광역시','달서구','용산2동',35.8554,128.525,88,90),(1510,'대구광역시','달서구','월성1동',35.8167,128.525,88,89),(1511,'대구광역시','달서구','월성2동',35.828,128.531,88,90),(1512,'대구광역시','달서구','이곡1동',35.8487,128.513,87,90),(1513,'대구광역시','달서구','이곡2동',35.8528,128.503,87,90),(1514,'대구광역시','달서구','장기동',35.8404,128.532,88,90),(1515,'대구광역시','달서구','죽전동',35.8528,128.542,88,90),(1516,'대구광역시','달서구','진천동',35.8122,128.527,88,89),(1517,'대구광역시','달성군','가창면',35.7998,128.625,89,89),(1518,'대구광역시','달성군','구지면',35.6558,128.416,86,86),(1519,'대구광역시','달성군','논공읍',35.7711,128.423,86,88),(1520,'대구광역시','달성군','다사읍',35.8588,128.456,86,90),(1521,'대구광역시','달성군','옥포면',35.7866,128.466,87,89),(1522,'대구광역시','달성군','유가면',35.6744,128.458,86,86),(1523,'대구광역시','달성군','하빈면',35.8979,128.448,86,91),(1524,'대구광역시','달성군','현풍면',35.6943,128.45,86,87),(1525,'대구광역시','달성군','화원읍',35.8011,128.503,87,89),(1526,'대구광역시','동구','공산동',35.9372,128.646,90,92),(1527,'대구광역시','동구','도평동',35.9079,128.656,90,91),(1528,'대구광역시','동구','동촌동',35.8839,128.652,90,91),(1529,'대구광역시','동구','방촌동',35.8771,128.667,90,91),(1530,'대구광역시','동구','불로.봉무동',35.9073,128.642,90,91),(1531,'대구광역시','동구','신암1동',35.8813,128.619,89,91),(1532,'대구광역시','동구','신암2동',35.8764,128.617,89,91),(1533,'대구광역시','동구','신암3동',35.8766,128.625,89,91),(1534,'대구광역시','동구','신암4동',35.8821,128.632,89,91),(1535,'대구광역시','동구','신암5동',35.8867,128.635,89,91),(1536,'대구광역시','동구','신천1.2동',35.8671,128.617,89,90),(1537,'대구광역시','동구','신천3동',35.8723,128.626,89,91),(1538,'대구광역시','동구','신천4동',35.8688,128.631,89,90),(1539,'대구광역시','동구','안심1동',35.8674,128.704,91,90),(1540,'대구광역시','동구','안심2동',35.8724,128.689,90,91),(1541,'대구광역시','동구','안심3.4동',35.8673,128.713,91,90),(1542,'대구광역시','동구','지저동',35.8907,128.64,90,91),(1543,'대구광역시','동구','해안동',35.8922,128.684,90,91),(1544,'대구광역시','동구','효목1동',35.8782,128.647,90,91),(1545,'대구광역시','동구','효목2동',35.8746,128.64,90,91),(1546,'대구광역시','북구','검단동',35.9105,128.629,89,91),(1547,'대구광역시','북구','고성동',35.8789,128.586,89,91),(1548,'대구광역시','북구','관문동',35.8987,128.544,88,91),(1549,'대구광역시','북구','관음동',35.9414,128.55,88,92),(1550,'대구광역시','북구','구암동',35.9374,128.572,88,92),(1551,'대구광역시','북구','국우동',35.9407,128.553,88,92),(1552,'대구광역시','북구','노원동',35.8948,128.551,88,91),(1553,'대구광역시','북구','대현1동',35.8804,128.611,89,91),(1554,'대구광역시','북구','대현2동',35.8789,128.61,89,91),(1555,'대구광역시','북구','동천동',35.9401,128.558,88,92),(1556,'대구광역시','북구','무태조야동',35.9183,128.599,89,92),(1557,'대구광역시','북구','복현1동',35.8907,128.621,89,91),(1558,'대구광역시','북구','복현2동',35.8924,128.628,89,91),(1559,'대구광역시','북구','산격1동',35.8897,128.597,89,91),(1560,'대구광역시','북구','산격2동',35.8987,128.611,89,91),(1561,'대구광역시','북구','산격3동',35.8905,128.611,89,91),(1562,'대구광역시','북구','산격4동',35.8893,128.606,89,91),(1563,'대구광역시','북구','읍내동',35.9426,128.553,88,92),(1564,'대구광역시','북구','칠성동',35.8762,128.602,89,91),(1565,'대구광역시','북구','침산1동',35.8874,128.583,89,91),(1566,'대구광역시','북구','침산2동',35.8843,128.599,89,91),(1567,'대구광역시','북구','침산3동',35.8891,128.592,89,91),(1568,'대구광역시','북구','태전1동',35.9207,128.546,88,92),(1569,'대구광역시','북구','태전2동',35.9185,128.551,88,92),(1570,'대구광역시','서구','내당1동',35.8577,128.563,88,90),(1571,'대구광역시','서구','내당2.3동',35.8643,128.577,88,90),(1572,'대구광역시','서구','내당4동',35.8578,128.554,88,90),(1573,'대구광역시','서구','비산1동',35.8782,128.571,88,91),(1574,'대구광역시','서구','비산2.3동',35.8727,128.577,88,91),(1575,'대구광역시','서구','비산4동',35.8668,128.576,88,90),(1576,'대구광역시','서구','비산5동',35.8834,128.572,88,91),(1577,'대구광역시','서구','비산6동',35.8733,128.571,88,91),(1578,'대구광역시','서구','비산7동',35.885,128.556,88,91),(1579,'대구광역시','서구','상중이동',35.865,128.546,88,90),(1580,'대구광역시','서구','원대동',35.8838,128.577,88,91),(1581,'대구광역시','서구','평리1동',35.8726,128.565,88,91),(1582,'대구광역시','서구','평리2동',35.8683,128.566,88,90),(1583,'대구광역시','서구','평리3동',35.8729,128.564,88,91),(1584,'대구광역시','서구','평리4동',35.8643,128.559,88,90),(1585,'대구광역시','서구','평리5동',35.8708,128.551,88,90),(1586,'대구광역시','서구','평리6동',35.8722,128.55,88,91),(1587,'대구광역시','수성구','고산1동',35.8341,128.715,91,90),(1588,'대구광역시','수성구','고산2동',35.8403,128.697,91,90),(1589,'대구광역시','수성구','고산3동',35.8413,128.709,91,90),(1590,'대구광역시','수성구','두산동',35.8264,128.623,89,90),(1591,'대구광역시','수성구','만촌1동',35.8699,128.649,90,91),(1592,'대구광역시','수성구','만촌2동',35.8569,128.649,90,90),(1593,'대구광역시','수성구','만촌3동',35.8525,128.653,90,90),(1594,'대구광역시','수성구','범물1동',35.8148,128.648,90,89),(1595,'대구광역시','수성구','범물2동',35.8146,128.646,90,89),(1596,'대구광역시','수성구','범어1동',35.8525,128.624,89,90),(1597,'대구광역시','수성구','범어2동',35.8571,128.634,89,90),(1598,'대구광역시','수성구','범어3동',35.8632,128.62,89,90),(1599,'대구광역시','수성구','범어4동',35.8551,128.643,90,90),(1600,'대구광역시','수성구','상동',35.8292,128.618,89,90),(1601,'대구광역시','수성구','수성1가동',35.8534,128.613,89,90),(1602,'대구광역시','수성구','수성2.3가동',35.8528,128.621,89,90),(1603,'대구광역시','수성구','수성4가동',35.8597,128.619,89,90),(1604,'대구광역시','수성구','중동',35.8444,128.617,89,90),(1605,'대구광역시','수성구','지산1동',35.8219,128.639,90,89),(1606,'대구광역시','수성구','지산2동',35.8201,128.63,89,89),(1607,'대구광역시','수성구','파동',35.8124,128.617,89,89),(1608,'대구광역시','수성구','황금1동',35.841,128.64,90,90),(1609,'대구광역시','수성구','황금2동',35.8386,128.627,89,90),(1610,'대구광역시','중구','남산1동',35.8564,128.593,89,90),(1611,'대구광역시','중구','남산2동',35.8611,128.592,89,90),(1612,'대구광역시','중구','남산3동',35.8565,128.587,89,90),(1613,'대구광역시','중구','남산4동',35.8552,128.583,89,90),(1614,'대구광역시','중구','대봉1동',35.8587,128.607,89,90),(1615,'대구광역시','중구','대봉2동',35.8552,128.602,89,90),(1616,'대구광역시','중구','대신동',35.8632,128.579,89,90),(1617,'대구광역시','중구','동인1.2.4가동',35.865,128.611,89,90),(1618,'대구광역시','중구','동인3가동',35.8683,128.609,89,90),(1619,'대구광역시','중구','삼덕동',35.8626,128.611,89,90),(1620,'대구광역시','중구','성내1동',35.8662,128.6,89,90),(1621,'대구광역시','중구','성내2동',35.8653,128.593,89,90),(1622,'대구광역시','중구','성내3동',35.8696,128.588,89,90),(1623,'대전광역시','대덕구','대화동',36.3634,127.413,68,101),(1624,'대전광역시','대덕구','덕암동',36.4373,127.429,68,102),(1625,'대전광역시','대덕구','목상동',36.4456,127.414,68,102),(1626,'대전광역시','대덕구','법1동',36.3679,127.429,68,101),(1627,'대전광역시','대덕구','법2동',36.3643,127.433,68,101),(1628,'대전광역시','대덕구','비래동',36.352,127.452,68,100),(1629,'대전광역시','대덕구','석봉동',36.4452,127.428,68,102),(1630,'대전광역시','대덕구','송촌동',36.3627,127.442,68,101),(1631,'대전광역시','대덕구','신탄진동',36.4488,127.431,68,103),(1632,'대전광역시','대덕구','오정동',36.3508,127.412,68,100),(1633,'대전광역시','대덕구','중리동',36.3577,127.429,68,101),(1634,'대전광역시','대덕구','회덕동',36.3733,127.424,68,101),(1635,'대전광역시','동구','가양1동',36.3441,127.444,68,100),(1636,'대전광역시','동구','가양2동',36.3461,127.45,68,100),(1637,'대전광역시','동구','대동',36.3254,127.448,68,100),(1638,'대전광역시','동구','대청동',36.3406,127.495,69,100),(1639,'대전광역시','동구','산내동',36.2786,127.47,69,99),(1640,'대전광역시','동구','삼성동',36.3311,127.427,68,100),(1641,'대전광역시','동구','성남동',36.3311,127.427,68,100),(1642,'대전광역시','동구','신인동',36.3311,127.427,68,100),(1643,'대전광역시','동구','용운동',36.3252,127.464,69,100),(1644,'대전광역시','동구','용전동',36.3551,127.434,68,101),(1645,'대전광역시','동구','자양동',36.3325,127.451,68,100),(1646,'대전광역시','동구','중앙동',36.3289,127.431,68,100),(1647,'대전광역시','동구','판암1동',36.3144,127.46,69,100),(1648,'대전광역시','동구','판암2동',36.3175,127.46,69,100),(1649,'대전광역시','동구','홍도동',36.344,127.425,68,100),(1650,'대전광역시','동구','효동',36.3141,127.444,68,100),(1651,'대전광역시','서구','가수원동',36.3006,127.351,67,99),(1652,'대전광역시','서구','가장동',36.3271,127.387,67,100),(1653,'대전광역시','서구','갈마1동',36.3497,127.37,67,100),(1654,'대전광역시','서구','갈마2동',36.3438,127.377,67,100),(1655,'대전광역시','서구','관저1동',36.3009,127.339,66,99),(1656,'대전광역시','서구','관저2동',36.2962,127.337,66,99),(1657,'대전광역시','서구','괴정동',36.3343,127.384,67,100),(1658,'대전광역시','서구','기성동',36.2529,127.344,67,98),(1659,'대전광역시','서구','내동',36.3293,127.38,67,100),(1660,'대전광역시','서구','도마1동',36.3131,127.383,67,100),(1661,'대전광역시','서구','도마2동',36.3098,127.376,67,100),(1662,'대전광역시','서구','둔산1동',36.3495,127.388,67,100),(1663,'대전광역시','서구','둔산2동',36.3508,127.386,67,100),(1664,'대전광역시','서구','둔산3동',36.3311,127.427,68,100),(1665,'대전광역시','서구','만년동',36.3646,127.377,67,101),(1666,'대전광역시','서구','변동',36.3229,127.389,67,100),(1667,'대전광역시','서구','복수동',36.3038,127.376,67,99),(1668,'대전광역시','서구','용문동',36.3337,127.396,67,100),(1669,'대전광역시','서구','월평1동',36.3518,127.36,67,100),(1670,'대전광역시','서구','월평2동',36.3606,127.376,67,101),(1671,'대전광역시','서구','월평3동',36.3574,127.369,67,101),(1672,'대전광역시','서구','정림동',36.3015,127.369,67,99),(1673,'대전광역시','서구','탄방동',36.3437,127.397,67,100),(1674,'대전광역시','유성구','구즉동',36.4375,127.386,67,102),(1675,'대전광역시','유성구','노은1동',36.3653,127.321,66,101),(1676,'대전광역시','유성구','노은2동',36.3886,127.314,66,101),(1677,'대전광역시','유성구','신성동',36.3862,127.35,67,101),(1678,'대전광역시','유성구','온천1동',36.3503,127.341,66,100),(1679,'대전광역시','유성구','온천2동',36.3572,127.339,66,101),(1680,'대전광역시','유성구','전민동',36.397,127.403,68,101),(1681,'대전광역시','유성구','진잠동',36.2968,127.319,66,99),(1682,'대전광역시','중구','대사동',36.3147,127.427,68,100),(1683,'대전광역시','중구','대흥동',36.3174,127.428,68,100),(1684,'대전광역시','중구','목동',36.3315,127.415,68,100),(1685,'대전광역시','중구','문창동',36.3133,127.44,68,100),(1686,'대전광역시','중구','문화1동',36.3124,127.409,68,100),(1687,'대전광역시','중구','문화2동',36.3048,127.401,68,99),(1688,'대전광역시','중구','부사동',36.3113,127.436,68,100),(1689,'대전광역시','중구','산성동',36.3024,127.388,67,99),(1690,'대전광역시','중구','석교동',36.3067,127.445,68,99),(1691,'대전광역시','중구','오류동',36.3226,127.406,68,100),(1692,'대전광역시','중구','용두동',36.3226,127.412,68,100),(1693,'대전광역시','중구','유천1동',36.3121,127.397,67,100),(1694,'대전광역시','중구','유천2동',36.3125,127.401,68,100),(1695,'대전광역시','중구','은행선화동',36.3248,127.42,68,100),(1696,'대전광역시','중구','태평1동',36.3232,127.399,68,100),(1697,'대전광역시','중구','태평2동',36.3183,127.395,67,100),(1698,'부산광역시','강서구','가락동',35.1933,128.904,95,76),(1699,'부산광역시','강서구','강동동',35.2115,128.938,95,76),(1700,'부산광역시','강서구','녹산동',35.1235,128.861,94,74),(1701,'부산광역시','강서구','대저1동',35.2114,128.983,96,76),(1702,'부산광역시','강서구','대저2동',35.1754,128.959,96,76),(1703,'부산광역시','강서구','명지동',35.105,128.929,95,74),(1704,'부산광역시','강서구','천가동',35.0496,128.833,94,73),(1705,'부산광역시','금정구','구서제1동',35.242,129.089,98,77),(1706,'부산광역시','금정구','구서제2동',35.2521,129.093,98,77),(1707,'부산광역시','금정구','금사동',35.2172,129.113,98,77),(1708,'부산광역시','금정구','금성동',35.2473,129.058,97,77),(1709,'부산광역시','금정구','남산동',35.2686,129.095,98,78),(1710,'부산광역시','금정구','부곡제1동',35.2214,129.094,98,77),(1711,'부산광역시','금정구','부곡제2동',35.2267,129.095,98,77),(1712,'부산광역시','금정구','부곡제3동',35.2374,129.096,98,77),(1713,'부산광역시','금정구','부곡제4동',35.2168,129.091,98,77),(1714,'부산광역시','금정구','서제1동',35.2153,129.101,98,77),(1715,'부산광역시','금정구','서제2동',35.2098,129.107,98,76),(1716,'부산광역시','금정구','서제3동',35.2124,129.11,98,76),(1717,'부산광역시','금정구','선두구동',35.2952,129.116,98,78),(1718,'부산광역시','금정구','장전제1동',35.2347,129.087,98,77),(1719,'부산광역시','금정구','장전제2동',35.2225,129.084,98,77),(1720,'부산광역시','금정구','장전제3동',35.2244,129.088,98,77),(1721,'부산광역시','금정구','청룡노포동',35.272,129.092,98,78),(1722,'부산광역시','기장군','기장읍',35.2356,129.218,100,77),(1723,'부산광역시','기장군','일광면',35.2609,129.235,101,78),(1724,'부산광역시','기장군','장안읍',35.3107,129.246,101,79),(1725,'부산광역시','기장군','정관면',35.3224,129.183,100,79),(1726,'부산광역시','기장군','철마면',35.2722,129.152,99,78),(1727,'부산광역시','남구','감만제1동',35.1138,129.083,98,74),(1728,'부산광역시','남구','감만제2동',35.1195,129.087,98,74),(1729,'부산광역시','남구','대연제1동',35.1315,129.096,98,75),(1730,'부산광역시','남구','대연제2동',35.1314,129.086,98,75),(1731,'부산광역시','남구','대연제3동',35.1316,129.103,98,75),(1732,'부산광역시','남구','대연제4동',35.1267,129.094,98,75),(1733,'부산광역시','남구','대연제5동',35.1354,129.092,98,75),(1734,'부산광역시','남구','대연제6동',35.1319,129.086,98,75),(1735,'부산광역시','남구','문현제1동',35.1394,129.074,98,75),(1736,'부산광역시','남구','문현제2동',35.1422,129.071,98,75),(1737,'부산광역시','남구','문현제3동',35.1351,129.074,98,75),(1738,'부산광역시','남구','문현제4동',35.133,129.071,98,75),(1739,'부산광역시','남구','용당동',35.1144,129.097,98,74),(1740,'부산광역시','남구','용호제1동',35.1177,129.111,99,74),(1741,'부산광역시','남구','용호제2동',35.1118,129.116,99,74),(1742,'부산광역시','남구','용호제3동',35.1179,129.115,99,74),(1743,'부산광역시','남구','용호제4동',35.1101,129.113,99,74),(1744,'부산광역시','남구','우암제1동',35.1219,129.078,98,74),(1745,'부산광역시','남구','우암제2동',35.1266,129.073,98,75),(1746,'부산광역시','동구','범일제1동',35.1363,129.058,98,75),(1747,'부산광역시','동구','범일제2동',35.1319,129.062,98,75),(1748,'부산광역시','동구','범일제4동',35.1386,129.056,98,75),(1749,'부산광역시','동구','범일제5동',35.1273,129.056,98,75),(1750,'부산광역시','동구','수정제1동',35.1223,129.045,97,74),(1751,'부산광역시','동구','수정제2동',35.1253,129.047,97,75),(1752,'부산광역시','동구','수정제4동',35.124,129.043,97,75),(1753,'부산광역시','동구','수정제5동',35.1307,129.045,97,75),(1754,'부산광역시','동구','좌천제1동',35.1283,129.051,97,75),(1755,'부산광역시','동구','좌천제4동',35.1336,129.051,97,75),(1756,'부산광역시','동구','초량제1동',35.1109,129.039,97,74),(1757,'부산광역시','동구','초량제2동',35.1134,129.041,97,74),(1758,'부산광역시','동구','초량제3동',35.1182,129.042,97,74),(1759,'부산광역시','동구','초량제6동',35.1229,129.037,97,74),(1760,'부산광역시','동래구','명륜제1동',35.2029,129.083,98,76),(1761,'부산광역시','동래구','명륜제2동',35.2094,129.084,98,76),(1762,'부산광역시','동래구','명장제1동',35.2016,129.107,98,76),(1763,'부산광역시','동래구','명장제2동',35.2049,129.105,98,76),(1764,'부산광역시','동래구','복산동',35.2027,129.088,98,76),(1765,'부산광역시','동래구','사직제1동',35.1959,129.064,98,76),(1766,'부산광역시','동래구','사직제2동',35.1972,129.059,98,76),(1767,'부산광역시','동래구','사직제3동',35.1964,129.072,98,76),(1768,'부산광역시','동래구','수민동',35.193,129.093,98,76),(1769,'부산광역시','동래구','안락제1동',35.194,129.101,98,76),(1770,'부산광역시','동래구','안락제2동',35.1946,129.112,98,76),(1771,'부산광역시','동래구','온천제1동',35.217,129.082,98,77),(1772,'부산광역시','동래구','온천제2동',35.2049,129.075,98,76),(1773,'부산광역시','동래구','온천제3동',35.2019,129.069,98,76),(1774,'부산광역시','부산진구','가야제1동',35.1519,129.044,97,75),(1775,'부산광역시','부산진구','가야제2동',35.1467,129.031,97,75),(1776,'부산광역시','부산진구','개금제1동',35.1496,129.024,97,75),(1777,'부산광역시','부산진구','개금제2동',35.1417,129.022,97,75),(1778,'부산광역시','부산진구','개금제3동',35.1527,129.024,97,75),(1779,'부산광역시','부산진구','당감제1동',35.1597,129.042,97,75),(1780,'부산광역시','부산진구','당감제2동',35.1549,129.05,97,75),(1781,'부산광역시','부산진구','당감제4동',35.1649,129.039,97,75),(1782,'부산광역시','부산진구','범전동',35.1626,129.063,98,75),(1783,'부산광역시','부산진구','범천제1동',35.1438,129.063,98,75),(1784,'부산광역시','부산진구','범천제2동',35.1433,129.058,98,75),(1785,'부산광역시','부산진구','범천제4동',35.1486,129.05,97,75),(1786,'부산광역시','부산진구','부암제1동',35.1605,129.052,97,75),(1787,'부산광역시','부산진구','부암제3동',35.1659,129.042,97,75),(1788,'부산광역시','부산진구','부전제1동',35.1573,129.061,98,75),(1789,'부산광역시','부산진구','부전제2동',35.1495,129.059,98,75),(1790,'부산광역시','부산진구','양정제1동',35.1714,129.067,98,76),(1791,'부산광역시','부산진구','양정제2동',35.1698,129.078,98,76),(1792,'부산광역시','부산진구','연지동',35.1697,129.055,97,76),(1793,'부산광역시','부산진구','전포제1동',35.1513,129.07,98,75),(1794,'부산광역시','부산진구','전포제2동',35.1586,129.068,98,75),(1795,'부산광역시','부산진구','전포제3동',35.1482,129.069,98,75),(1796,'부산광역시','부산진구','초읍동',35.1756,129.05,97,76),(1797,'부산광역시','북구','구포제1동',35.2034,129.003,97,76),(1798,'부산광역시','북구','구포제2동',35.1996,129,96,76),(1799,'부산광역시','북구','구포제3동',35.1918,129.011,97,76),(1800,'부산광역시','북구','금곡동',35.247,129.015,97,77),(1801,'부산광역시','북구','덕천제1동',35.2094,129.019,97,76),(1802,'부산광역시','북구','덕천제2동',35.2093,129.01,97,76),(1803,'부산광역시','북구','덕천제3동',35.2068,129.02,97,76),(1804,'부산광역시','북구','만덕제1동',35.2104,129.039,97,76),(1805,'부산광역시','북구','만덕제2동',35.2071,129.039,97,76),(1806,'부산광역시','북구','만덕제3동',35.2083,129.031,97,76),(1807,'부산광역시','북구','화명제1동',35.2217,129.012,97,77),(1808,'부산광역시','북구','화명제2동',35.2405,129.022,97,77),(1809,'부산광역시','북구','화명제3동',35.2288,129.012,97,77),(1810,'부산광역시','사상구','감전동',35.1512,128.982,96,75),(1811,'부산광역시','사상구','괘법동',35.1607,128.989,96,75),(1812,'부산광역시','사상구','덕포제1동',35.1673,128.986,96,75),(1813,'부산광역시','사상구','덕포제2동',35.1714,128.985,96,76),(1814,'부산광역시','사상구','모라제1동',35.1845,128.99,96,76),(1815,'부산광역시','사상구','모라제3동',35.1816,128.998,96,76),(1816,'부산광역시','사상구','삼락동',35.1739,128.98,96,76),(1817,'부산광역시','사상구','엄궁동',35.1256,128.974,96,74),(1818,'부산광역시','사상구','주례제1동',35.1486,129,97,75),(1819,'부산광역시','사상구','주례제2동',35.147,129.013,97,75),(1820,'부산광역시','사상구','주례제3동',35.1443,129.004,97,75),(1821,'부산광역시','사상구','학장동',35.141,128.99,96,75),(1822,'부산광역시','사하구','감천제1동',35.0849,129.007,97,74),(1823,'부산광역시','사하구','감천제2동',35.0915,129.012,97,74),(1824,'부산광역시','사하구','괴정제1동',35.0965,128.992,96,74),(1825,'부산광역시','사하구','괴정제2동',35.1004,129.006,97,74),(1826,'부산광역시','사하구','괴정제3동',35.0972,129,97,74),(1827,'부산광역시','사하구','괴정제4동',35.096,128.985,96,74),(1828,'부산광역시','사하구','구평동',35.0788,128.99,96,73),(1829,'부산광역시','사하구','다대제1동',35.0561,128.974,96,73),(1830,'부산광역시','사하구','다대제2동',35.0603,128.984,96,73),(1831,'부산광역시','사하구','당리동',35.0998,128.979,96,74),(1832,'부산광역시','사하구','신평제1동',35.0869,128.977,96,74),(1833,'부산광역시','사하구','신평제2동',35.0915,128.962,96,74),(1834,'부산광역시','사하구','장림제1동',35.0798,128.969,96,73),(1835,'부산광역시','사하구','장림제2동',35.0747,128.975,96,73),(1836,'부산광역시','사하구','하단제1동',35.1008,128.967,96,74),(1837,'부산광역시','사하구','하단제2동',35.1114,128.963,96,74),(1838,'부산광역시','서구','남부민제1동',35.0897,129.026,97,74),(1839,'부산광역시','서구','남부민제2동',35.0816,129.022,97,74),(1840,'부산광역시','서구','동대신제1동',35.1065,129.023,97,74),(1841,'부산광역시','서구','동대신제2동',35.1099,129.025,97,74),(1842,'부산광역시','서구','동대신제3동',35.1113,129.02,97,74),(1843,'부산광역시','서구','부민동',35.1007,129.021,97,74),(1844,'부산광역시','서구','서대신제1동',35.108,129.017,97,74),(1845,'부산광역시','서구','서대신제3동',35.1104,129.014,97,74),(1846,'부산광역시','서구','서대신제4동',35.1161,129.015,97,74),(1847,'부산광역시','서구','아미동',35.0971,129.018,97,74),(1848,'부산광역시','서구','암남동',35.0769,129.024,97,73),(1849,'부산광역시','서구','초장동',35.0929,129.023,97,74),(1850,'부산광역시','서구','충무동',35.0949,129.024,97,74),(1851,'부산광역시','수영구','광안제1동',35.1599,129.115,99,75),(1852,'부산광역시','수영구','광안제2동',35.1507,129.115,99,75),(1853,'부산광역시','수영구','광안제3동',35.1648,129.116,99,75),(1854,'부산광역시','수영구','광안제4동',35.152,129.114,99,75),(1855,'부산광역시','수영구','남천제1동',35.1396,129.113,99,75),(1856,'부산광역시','수영구','남천제2동',35.1408,129.117,99,75),(1857,'부산광역시','수영구','망미제1동',35.1714,129.103,98,76),(1858,'부산광역시','수영구','망미제2동',35.1722,129.118,99,76),(1859,'부산광역시','수영구','민락동',35.1542,129.128,99,75),(1860,'부산광역시','수영구','수영동',35.1674,129.118,99,76),(1861,'부산광역시','연제구','거제제1동',35.1917,129.083,98,76),(1862,'부산광역시','연제구','거제제2동',35.1846,129.073,98,76),(1863,'부산광역시','연제구','거제제3동',35.181,129.075,98,76),(1864,'부산광역시','연제구','거제제4동',35.1761,129.07,98,76),(1865,'부산광역시','연제구','연산제1동',35.1859,129.094,98,76),(1866,'부산광역시','연제구','연산제2동',35.1768,129.082,98,76),(1867,'부산광역시','연제구','연산제3동',35.1703,129.097,98,76),(1868,'부산광역시','연제구','연산제4동',35.1832,129.087,98,76),(1869,'부산광역시','연제구','연산제5동',35.1814,129.078,98,76),(1870,'부산광역시','연제구','연산제6동',35.1758,129.088,98,76),(1871,'부산광역시','연제구','연산제8동',35.184,129.103,98,76),(1872,'부산광역시','연제구','연산제9동',35.1855,129.107,98,76),(1873,'부산광역시','영도구','남항동',35.0868,129.04,97,74),(1874,'부산광역시','영도구','동삼제1동',35.0718,129.071,98,73),(1875,'부산광역시','영도구','동삼제2동',35.0647,129.083,98,73),(1876,'부산광역시','영도구','동삼제3동',35.0816,129.071,98,74),(1877,'부산광역시','영도구','봉래제1동',35.0904,129.047,97,74),(1878,'부산광역시','영도구','봉래제2동',35.0911,129.048,97,74),(1879,'부산광역시','영도구','신선동',35.0802,129.047,97,74),(1880,'부산광역시','영도구','영선제1동',35.0872,129.047,97,74),(1881,'부산광역시','영도구','영선제2동',35.0839,129.044,97,74),(1882,'부산광역시','영도구','청학제1동',35.0938,129.061,98,74),(1883,'부산광역시','영도구','청학제2동',35.0888,129.068,98,74),(1884,'부산광역시','중구','광복동',35.0969,129.033,97,74),(1885,'부산광역시','중구','남포동',35.0943,129.034,97,74),(1886,'부산광역시','중구','대청동',35.1011,129.033,97,74),(1887,'부산광역시','중구','동광동',35.1019,129.037,97,74),(1888,'부산광역시','중구','보수동',35.1007,129.028,97,74),(1889,'부산광역시','중구','부평동',35.0973,129.029,97,74),(1890,'부산광역시','중구','영주제1동',35.108,129.037,97,74),(1891,'부산광역시','중구','영주제2동',35.1085,129.034,97,74),(1892,'부산광역시','중구','중앙동',35.0982,129.038,97,74),(1893,'부산광역시','해운대구','반송제1동',35.2221,129.15,99,77),(1894,'부산광역시','해운대구','반송제2동',35.2258,129.163,99,77),(1895,'부산광역시','해운대구','반송제3동',35.2214,129.154,99,77),(1896,'부산광역시','해운대구','반여제1동',35.1981,129.121,99,76),(1897,'부산광역시','해운대구','반여제2동',35.1928,129.132,99,76),(1898,'부산광역시','해운대구','반여제3동',35.198,129.136,99,76),(1899,'부산광역시','해운대구','반여제4동',35.2061,129.119,99,76),(1900,'부산광역시','해운대구','송정동',35.1806,129.206,100,76),(1901,'부산광역시','해운대구','우제1동',35.1598,129.16,99,75),(1902,'부산광역시','해운대구','우제2동',35.1682,129.142,99,76),(1903,'부산광역시','해운대구','재송제1동',35.1809,129.126,99,76),(1904,'부산광역시','해운대구','재송제2동',35.1866,129.128,99,76),(1905,'부산광역시','해운대구','좌제1동',35.1678,129.177,100,76),(1906,'부산광역시','해운대구','좌제2동',35.1661,129.185,100,76),(1907,'부산광역시','해운대구','좌제3동',35.1693,129.169,100,76),(1908,'부산광역시','해운대구','좌제4동',35.1749,129.178,100,76),(1909,'부산광역시','해운대구','중제1동',35.1595,129.166,99,75),(1910,'부산광역시','해운대구','중제2동',35.1588,129.182,100,75),(1911,'서울특별시','강남구','개포1동',37.4791,127.06,61,125),(1912,'서울특별시','강남구','개포2동',37.4852,127.076,62,125),(1913,'서울특별시','강남구','개포4동',37.476,127.054,61,125),(1914,'서울특별시','강남구','논현1동',37.5088,127.031,61,125),(1915,'서울특별시','강남구','논현2동',37.5144,127.039,61,126),(1916,'서울특별시','강남구','대치1동',37.4905,127.064,61,125),(1917,'서울특별시','강남구','대치2동',37.4971,127.069,61,125),(1918,'서울특별시','강남구','대치4동',37.497,127.06,61,125),(1919,'서울특별시','강남구','도곡1동',37.4881,127.04,61,125),(1920,'서울특별시','강남구','도곡2동',37.4799,127.045,61,125),(1921,'서울특별시','강남구','삼성1동',37.509,127.058,61,125),(1922,'서울특별시','강남구','삼성2동',37.5084,127.048,61,125),(1923,'서울특별시','강남구','세곡동',37.4664,127.109,62,125),(1924,'서울특별시','강남구','수서동',37.486,127.107,62,125),(1925,'서울특별시','강남구','신사동',37.5213,127.025,61,126),(1926,'서울특별시','강남구','압구정동',37.5332,127.047,61,126),(1927,'서울특별시','강남구','역삼1동',37.4926,127.035,61,125),(1928,'서울특별시','강남구','역삼2동',37.4932,127.049,61,125),(1929,'서울특별시','강남구','일원1동',37.4891,127.09,62,125),(1930,'서울특별시','강남구','일원2동',37.4893,127.076,62,125),(1931,'서울특별시','강남구','일원본동',37.4805,127.089,62,125),(1932,'서울특별시','강남구','청담동',37.5332,127.047,61,126),(1933,'서울특별시','강동구','강일동',37.5667,127.18,63,127),(1934,'서울특별시','강동구','고덕제1동',37.5562,127.151,63,127),(1935,'서울특별시','강동구','고덕제2동',37.5577,127.166,63,127),(1936,'서울특별시','강동구','길동',37.5319,127.163,63,126),(1937,'서울특별시','강동구','둔촌제1동',37.5207,127.139,63,126),(1938,'서울특별시','강동구','둔촌제2동',37.5305,127.144,63,126),(1939,'서울특별시','강동구','명일제1동',37.547,127.148,63,126),(1940,'서울특별시','강동구','명일제2동',37.5436,127.153,63,126),(1941,'서울특별시','강동구','상일동',37.5488,127.168,63,126),(1942,'서울특별시','강동구','성내제1동',37.5278,127.126,62,126),(1943,'서울특별시','강동구','성내제2동',37.5296,127.132,62,126),(1944,'서울특별시','강동구','성내제3동',37.5234,127.135,63,126),(1945,'서울특별시','강동구','암사제1동',37.5487,127.135,63,126),(1946,'서울특별시','강동구','암사제2동',37.549,127.129,62,126),(1947,'서울특별시','강동구','암사제3동',37.5524,127.14,63,126),(1948,'서울특별시','강동구','천호제1동',37.5423,127.139,63,126),(1949,'서울특별시','강동구','천호제2동',37.5398,127.123,62,126),(1950,'서울특별시','강동구','천호제3동',37.537,127.132,62,126),(1951,'서울특별시','강북구','미아동',37.6241,127.029,61,128),(1952,'서울특별시','강북구','번제1동',37.6352,127.031,61,128),(1953,'서울특별시','강북구','번제2동',37.6294,127.041,61,128),(1954,'서울특별시','강북구','번제3동',37.6231,127.049,61,128),(1955,'서울특별시','강북구','삼각산동',37.6144,127.02,61,128),(1956,'서울특별시','강북구','삼양동',37.6245,127.021,61,128),(1957,'서울특별시','강북구','송중동',37.6134,127.036,61,128),(1958,'서울특별시','강북구','송천동',37.6155,127.026,61,128),(1959,'서울특별시','강북구','수유제1동',37.6307,127.019,61,128),(1960,'서울특별시','강북구','수유제2동',37.6419,127.022,61,128),(1961,'서울특별시','강북구','수유제3동',37.636,127.025,61,128),(1962,'서울특별시','강북구','우이동',37.6452,127.014,60,128),(1963,'서울특별시','강북구','인수동',37.6387,127.013,60,128),(1964,'서울특별시','강서구','가양제1동',37.5665,126.843,57,127),(1965,'서울특별시','강서구','가양제2동',37.5646,126.853,58,127),(1966,'서울특별시','강서구','가양제3동',37.5583,126.863,58,127),(1967,'서울특별시','강서구','공항동',37.5561,126.812,57,126),(1968,'서울특별시','강서구','등촌제1동',37.5531,126.861,58,126),(1969,'서울특별시','강서구','등촌제2동',37.5399,126.865,58,126),(1970,'서울특별시','강서구','등촌제3동',37.5561,126.85,58,126),(1971,'서울특별시','강서구','발산제1동',37.5503,126.835,57,126),(1972,'서울특별시','강서구','방화제1동',37.5688,126.814,57,127),(1973,'서울특별시','강서구','방화제2동',37.5639,126.809,57,127),(1974,'서울특별시','강서구','방화제3동',37.5759,126.816,57,127),(1975,'서울특별시','강서구','염창동',37.551,126.873,58,126),(1976,'서울특별시','강서구','우장산동',37.5353,126.814,57,126),(1977,'서울특별시','강서구','화곡본동',37.5412,126.85,58,126),(1978,'서울특별시','강서구','화곡제1동',37.5277,126.844,58,126),(1979,'서울특별시','강서구','화곡제2동',37.5288,126.857,58,126),(1980,'서울특별시','강서구','화곡제3동',37.5399,126.84,57,126),(1981,'서울특별시','강서구','화곡제4동',37.5301,126.865,58,126),(1982,'서울특별시','강서구','화곡제6동',37.549,126.852,58,126),(1983,'서울특별시','강서구','화곡제8동',37.5299,126.85,58,126),(1984,'서울특별시','관악구','낙성대동',37.4735,126.96,60,125),(1985,'서울특별시','관악구','난곡동',37.4882,126.93,59,125),(1986,'서울특별시','관악구','난향동',37.4882,126.93,59,125),(1987,'서울특별시','관악구','남현동',37.4718,126.98,60,125),(1988,'서울특별시','관악구','대학동',37.4882,126.93,59,125),(1989,'서울특별시','관악구','미성동',37.4882,126.93,59,125),(1990,'서울특별시','관악구','보라매동',37.4853,126.935,59,125),(1991,'서울특별시','관악구','삼성동',37.4882,126.93,59,125),(1992,'서울특별시','관악구','서림동',37.4722,126.937,59,125),(1993,'서울특별시','관악구','서원동',37.4882,126.93,59,125),(1994,'서울특별시','관악구','성현동',37.4882,126.93,59,125),(1995,'서울특별시','관악구','신림동',37.4882,126.93,59,125),(1996,'서울특별시','관악구','신사동',37.4882,126.93,59,125),(1997,'서울특별시','관악구','신원동',37.4788,126.929,59,125),(1998,'서울특별시','관악구','은천동',37.4882,126.93,59,125),(1999,'서울특별시','관악구','인헌동',37.4723,126.967,60,125),(2000,'서울특별시','관악구','조원동',37.4882,126.93,59,125),(2001,'서울특별시','관악구','중앙동',37.4814,126.952,59,125),(2002,'서울특별시','관악구','청룡동',37.4882,126.93,59,125),(2003,'서울특별시','관악구','청림동',37.489,126.961,60,125),(2004,'서울특별시','관악구','행운동',37.4779,126.959,60,125),(2005,'서울특별시','광진구','광장동',37.5442,127.105,62,126),(2006,'서울특별시','광진구','구의제1동',37.5397,127.088,62,126),(2007,'서울특별시','광진구','구의제2동',37.5444,127.092,62,126),(2008,'서울특별시','광진구','구의제3동',37.5361,127.1,62,126),(2009,'서울특별시','광진구','군자동',37.5524,127.078,62,126),(2010,'서울특별시','광진구','능동',37.551,127.083,62,126),(2011,'서울특별시','광진구','자양제1동',37.5317,127.084,62,126),(2012,'서울특별시','광진구','자양제2동',37.526,127.087,62,126),(2013,'서울특별시','광진구','자양제3동',37.531,127.075,61,126),(2014,'서울특별시','광진구','자양제4동',37.5375,127.067,61,126),(2015,'서울특별시','광진구','중곡제1동',37.5578,127.082,62,127),(2016,'서울특별시','광진구','중곡제2동',37.5575,127.084,62,127),(2017,'서울특별시','광진구','중곡제3동',37.5659,127.082,62,127),(2018,'서울특별시','광진구','중곡제4동',37.5625,127.089,62,127),(2019,'서울특별시','광진구','화양동',37.5438,127.073,61,126),(2020,'서울특별시','구로구','가리봉동',37.478,126.892,58,125),(2021,'서울특별시','구로구','개봉제1동',37.4994,126.849,58,125),(2022,'서울특별시','구로구','개봉제2동',37.488,126.859,58,125),(2023,'서울특별시','구로구','개봉제3동',37.4832,126.856,58,125),(2024,'서울특별시','구로구','고척제1동',37.4976,126.865,58,125),(2025,'서울특별시','구로구','고척제2동',37.5038,126.86,58,125),(2026,'서울특별시','구로구','구로제1동',37.4902,126.878,58,125),(2027,'서울특별시','구로구','구로제2동',37.4886,126.886,58,125),(2028,'서울특별시','구로구','구로제3동',37.4831,126.896,58,125),(2029,'서울특별시','구로구','구로제4동',37.4888,126.891,58,125),(2030,'서울특별시','구로구','구로제5동',37.4973,126.891,58,125),(2031,'서울특별시','구로구','수궁동',37.4911,126.834,57,125),(2032,'서울특별시','구로구','신도림동',37.505,126.883,58,125),(2033,'서울특별시','구로구','오류제1동',37.4942,126.847,58,125),(2034,'서울특별시','구로구','오류제2동',37.486,126.842,57,125),(2035,'서울특별시','금천구','가산동',37.4741,126.894,58,125),(2036,'서울특별시','금천구','독산제1동',37.4675,126.899,58,125),(2037,'서울특별시','금천구','독산제2동',37.4633,126.902,59,124),(2038,'서울특별시','금천구','독산제3동',37.4738,126.91,59,125),(2039,'서울특별시','금천구','독산제4동',37.4647,126.904,59,124),(2040,'서울특별시','금천구','시흥제1동',37.4521,126.899,58,124),(2041,'서울특별시','금천구','시흥제2동',37.4473,126.919,59,124),(2042,'서울특별시','금천구','시흥제3동',37.4375,126.908,59,124),(2043,'서울특별시','금천구','시흥제4동',37.4562,126.908,59,124),(2044,'서울특별시','금천구','시흥제5동',37.4496,126.91,59,124),(2045,'서울특별시','노원구','공릉1.3동',37.622,127.076,61,128),(2046,'서울특별시','노원구','공릉2동',37.6186,127.085,62,128),(2047,'서울특별시','노원구','상계10동',37.6584,127.062,61,129),(2048,'서울특별시','노원구','상계1동',37.6771,127.057,61,129),(2049,'서울특별시','노원구','상계2동',37.656,127.071,61,129),(2050,'서울특별시','노원구','상계3.4동',37.661,127.077,61,129),(2051,'서울특별시','노원구','상계5동',37.6602,127.071,61,129),(2052,'서울특별시','노원구','상계6.7동',37.6521,127.069,61,129),(2053,'서울특별시','노원구','상계8동',37.6639,127.054,61,129),(2054,'서울특별시','노원구','상계9동',37.6617,127.066,61,129),(2055,'서울특별시','노원구','월계1동',37.6173,127.065,61,128),(2056,'서울특별시','노원구','월계2동',37.6298,127.053,61,128),(2057,'서울특별시','노원구','월계3동',37.6182,127.071,61,128),(2058,'서울특별시','노원구','중계1동',37.6498,127.08,62,129),(2059,'서울특별시','노원구','중계2.3동',37.6254,127.048,61,128),(2060,'서울특별시','노원구','중계4동',37.656,127.08,62,129),(2061,'서울특별시','노원구','중계본동',37.6451,127.082,62,128),(2062,'서울특별시','노원구','하계1동',37.6378,127.075,61,128),(2063,'서울특별시','노원구','하계2동',37.6292,127.07,61,128),(2064,'서울특별시','도봉구','도봉제1동',37.6758,127.046,61,129),(2065,'서울특별시','도봉구','도봉제2동',37.667,127.049,61,129),(2066,'서울특별시','도봉구','방학제1동',37.6614,127.043,61,129),(2067,'서울특별시','도봉구','방학제2동',37.6654,127.037,61,129),(2068,'서울특별시','도봉구','방학제3동',37.6562,127.03,61,129),(2069,'서울특별시','도봉구','쌍문제1동',37.6452,127.028,61,128),(2070,'서울특별시','도봉구','쌍문제2동',37.6551,127.041,61,129),(2071,'서울특별시','도봉구','쌍문제3동',37.6462,127.03,61,128),(2072,'서울특별시','도봉구','쌍문제4동',37.6536,127.031,61,129),(2073,'서울특별시','도봉구','창제1동',37.6456,127.046,61,128),(2074,'서울특별시','도봉구','창제2동',37.6387,127.038,61,128),(2075,'서울특별시','도봉구','창제3동',37.6353,127.045,61,128),(2076,'서울특별시','도봉구','창제4동',37.6494,127.054,61,129),(2077,'서울특별시','도봉구','창제5동',37.6492,127.041,61,129),(2078,'서울특별시','동대문구','답십리제1동',37.5693,127.054,61,127),(2079,'서울특별시','동대문구','답십리제2동',37.5692,127.062,61,127),(2080,'서울특별시','동대문구','용신동',37.5793,127.048,61,127),(2081,'서울특별시','동대문구','이문제1동',37.595,127.068,61,127),(2082,'서울특별시','동대문구','이문제2동',37.5917,127.059,61,127),(2083,'서울특별시','동대문구','장안제1동',37.565,127.068,61,127),(2084,'서울특별시','동대문구','장안제2동',37.5684,127.075,61,127),(2085,'서울특별시','동대문구','전농제1동',37.5752,127.05,61,127),(2086,'서울특별시','동대문구','전농제2동',37.5817,127.054,61,127),(2087,'서울특별시','동대문구','제기동',37.5793,127.048,61,127),(2088,'서울특별시','동대문구','청량리동',37.5793,127.048,61,127),(2089,'서울특별시','동대문구','회기동',37.588,127.057,61,127),(2090,'서울특별시','동대문구','휘경제1동',37.5902,127.068,61,127),(2091,'서울특별시','동대문구','휘경제2동',37.5885,127.07,61,127),(2092,'서울특별시','동작구','노량진제1동',37.5095,126.944,59,125),(2093,'서울특별시','동작구','노량진제2동',37.5057,126.939,59,125),(2094,'서울특별시','동작구','대방동',37.5053,126.928,59,125),(2095,'서울특별시','동작구','사당제1동',37.4736,126.976,60,125),(2096,'서울특별시','동작구','사당제2동',37.4856,126.98,60,125),(2097,'서울특별시','동작구','사당제3동',37.4838,126.974,60,125),(2098,'서울특별시','동작구','사당제4동',37.4782,126.974,60,125),(2099,'서울특별시','동작구','사당제5동',37.4828,126.969,60,125),(2100,'서울특별시','동작구','상도제1동',37.5041,126.953,59,125),(2101,'서울특별시','동작구','상도제2동',37.5026,126.944,59,125),(2102,'서울특별시','동작구','상도제3동',37.4964,126.933,59,125),(2103,'서울특별시','동작구','상도제4동',37.4978,126.94,59,125),(2104,'서울특별시','동작구','신대방제1동',37.4861,126.912,59,125),(2105,'서울특별시','동작구','신대방제2동',37.4961,126.928,59,125),(2106,'서울특별시','동작구','흑석동',37.5067,126.963,60,125),(2107,'서울특별시','마포구','공덕동',37.5474,126.962,60,126),(2108,'서울특별시','마포구','대흥동',37.5531,126.945,59,126),(2109,'서울특별시','마포구','도화동',37.5349,126.952,59,126),(2110,'서울특별시','마포구','망원제1동',37.5524,126.908,59,126),(2111,'서울특별시','마포구','망원제2동',37.5576,126.904,59,126),(2112,'서울특별시','마포구','상암동',37.5755,126.897,58,127),(2113,'서울특별시','마포구','서강동',37.5444,126.934,59,126),(2114,'서울특별시','마포구','서교동',37.5497,126.923,59,126),(2115,'서울특별시','마포구','성산제1동',37.5606,126.91,59,127),(2116,'서울특별시','마포구','성산제2동',37.5659,126.911,59,127),(2117,'서울특별시','마포구','신수동',37.5441,126.937,59,126),(2118,'서울특별시','마포구','아현동',37.5443,126.954,59,126),(2119,'서울특별시','마포구','연남동',37.5617,126.924,59,127),(2120,'서울특별시','마포구','염리동',37.5444,126.948,59,126),(2121,'서울특별시','마포구','용강동',37.5392,126.944,59,126),(2122,'서울특별시','마포구','합정동',37.5467,126.908,59,126),(2123,'서울특별시','서대문구','남가좌제1동',37.5712,126.916,59,127),(2124,'서울특별시','서대문구','남가좌제2동',37.5756,126.926,59,127),(2125,'서울특별시','서대문구','북가좌제1동',37.5767,126.909,59,127),(2126,'서울특별시','서대문구','북가좌제2동',37.5786,126.913,59,127),(2127,'서울특별시','서대문구','북아현동',37.5569,126.959,59,126),(2128,'서울특별시','서대문구','신촌동',37.5567,126.946,59,126),(2129,'서울특별시','서대문구','연희동',37.5711,126.937,59,127),(2130,'서울특별시','서대문구','천연동',37.5683,126.961,60,127),(2131,'서울특별시','서대문구','충현동',37.5621,126.957,59,127),(2132,'서울특별시','서대문구','홍은제1동',37.5904,126.946,59,127),(2133,'서울특별시','서대문구','홍은제2동',37.5802,126.938,59,127),(2134,'서울특별시','서대문구','홍제제1동',37.5849,126.947,59,127),(2135,'서울특별시','서대문구','홍제제2동',37.5833,126.951,59,127),(2136,'서울특별시','서대문구','홍제제3동',37.5924,126.951,59,127),(2137,'서울특별시','서초구','내곡동',37.4591,127.053,61,124),(2138,'서울특별시','서초구','반포1동',37.5033,127.014,60,125),(2139,'서울특별시','서초구','반포2동',37.5018,126.997,60,125),(2140,'서울특별시','서초구','반포3동',37.5092,127.008,60,125),(2141,'서울특별시','서초구','반포4동',37.4948,127.002,60,125),(2142,'서울특별시','서초구','반포본동',37.4977,126.988,60,125),(2143,'서울특별시','서초구','방배1동',37.4806,126.997,60,125),(2144,'서울특별시','서초구','방배2동',37.477,126.988,60,125),(2145,'서울특별시','서초구','방배3동',37.4775,127.001,60,125),(2146,'서울특별시','서초구','방배4동',37.4868,126.993,60,125),(2147,'서울특별시','서초구','방배본동',37.4914,126.991,60,125),(2148,'서울특별시','서초구','서초1동',37.486,127.021,61,125),(2149,'서울특별시','서초구','서초2동',37.4893,127.027,61,125),(2150,'서울특별시','서초구','서초3동',37.4808,127.015,60,125),(2151,'서울특별시','서초구','서초4동',37.4999,127.024,61,125),(2152,'서울특별시','서초구','양재1동',37.4816,127.038,61,125),(2153,'서울특별시','서초구','양재2동',37.4678,127.043,61,125),(2154,'서울특별시','서초구','잠원동',37.5121,127.016,60,126),(2155,'서울특별시','성동구','금호1가동',37.5521,127.024,61,126),(2156,'서울특별시','성동구','금호2.3가동',37.5332,127.047,61,126),(2157,'서울특별시','성동구','금호4가동',37.5445,127.024,61,126),(2158,'서울특별시','성동구','마장동',37.5634,127.048,61,127),(2159,'서울특별시','성동구','사근동',37.5584,127.048,61,127),(2160,'서울특별시','성동구','성수1가제1동',37.539,127.052,61,126),(2161,'서울특별시','성동구','성수1가제2동',37.5435,127.046,61,126),(2162,'서울특별시','성동구','성수2가제1동',37.5367,127.056,61,126),(2163,'서울특별시','성동구','성수2가제3동',37.5454,127.057,61,126),(2164,'서울특별시','성동구','송정동',37.5517,127.072,61,126),(2165,'서울특별시','성동구','옥수동',37.5338,126.989,60,126),(2166,'서울특별시','성동구','왕십리도선동',37.5793,127.048,61,127),(2167,'서울특별시','성동구','왕십리제2동',37.5583,127.033,61,127),(2168,'서울특별시','성동구','용답동',37.5614,127.057,61,127),(2169,'서울특별시','성동구','응봉동',37.5503,127.035,61,126),(2170,'서울특별시','성동구','행당제1동',37.5554,127.038,61,126),(2171,'서울특별시','성동구','행당제2동',37.5556,127.032,61,126),(2172,'서울특별시','성북구','길음제1동',37.6018,127.024,61,127),(2173,'서울특별시','성북구','길음제2동',37.6039,127.029,61,128),(2174,'서울특별시','성북구','돈암제1동',37.6005,127.028,61,127),(2175,'서울특별시','성북구','돈암제2동',37.5953,127.013,60,127),(2176,'서울특별시','성북구','동선동',37.5913,127.023,61,127),(2177,'서울특별시','성북구','보문동',37.5776,127.025,61,127),(2178,'서울특별시','성북구','삼선동',37.5828,127.01,60,127),(2179,'서울특별시','성북구','석관동',37.6102,127.064,61,128),(2180,'서울특별시','성북구','성북동',37.5874,127.006,60,127),(2181,'서울특별시','성북구','안암동',37.5831,127.023,61,127),(2182,'서울특별시','성북구','월곡제1동',37.6042,127.036,61,128),(2183,'서울특별시','성북구','월곡제2동',37.5999,127.042,61,127),(2184,'서울특별시','성북구','장위제1동',37.6112,127.046,61,128),(2185,'서울특별시','성북구','장위제2동',37.6097,127.057,61,128),(2186,'서울특별시','성북구','장위제3동',37.6138,127.059,61,128),(2187,'서울특별시','성북구','정릉제1동',37.5986,127.019,60,127),(2188,'서울특별시','성북구','정릉제2동',37.6017,127.013,60,127),(2189,'서울특별시','성북구','정릉제3동',37.6062,127.006,60,128),(2190,'서울특별시','성북구','정릉제4동',37.6108,127.008,60,128),(2191,'서울특별시','성북구','종암동',37.5973,127.034,61,127),(2192,'서울특별시','송파구','가락1동',37.4938,127.108,62,125),(2193,'서울특별시','송파구','가락2동',37.4958,127.129,62,125),(2194,'서울특별시','송파구','가락본동',37.4928,127.124,62,125),(2195,'서울특별시','송파구','거여1동',37.4941,127.145,63,125),(2196,'서울특별시','송파구','거여2동',37.4907,127.149,63,125),(2197,'서울특별시','송파구','마천1동',37.4932,127.152,63,125),(2198,'서울특별시','송파구','마천2동',37.4941,127.151,63,125),(2199,'서울특별시','송파구','문정1동',37.4872,127.126,62,125),(2200,'서울특별시','송파구','문정2동',37.4871,127.113,62,125),(2201,'서울특별시','송파구','방이1동',37.5081,127.126,62,125),(2202,'서울특별시','송파구','방이2동',37.5118,127.117,62,126),(2203,'서울특별시','송파구','삼전동',37.5,127.095,62,125),(2204,'서울특별시','송파구','석촌동',37.5008,127.106,62,125),(2205,'서울특별시','송파구','송파1동',37.5031,127.112,62,125),(2206,'서울특별시','송파구','송파2동',37.4994,127.119,62,125),(2207,'서울특별시','송파구','오금동',37.5001,127.13,62,125),(2208,'서울특별시','송파구','오륜동',37.5126,127.136,63,126),(2209,'서울특별시','송파구','잠실2동',37.5119,127.09,62,126),(2210,'서울특별시','송파구','잠실3동',37.5045,127.096,62,125),(2211,'서울특별시','송파구','잠실4동',37.5164,127.11,62,126),(2212,'서울특별시','송파구','잠실6동',37.5154,127.103,62,126),(2213,'서울특별시','송파구','잠실7동',37.5059,127.079,62,125),(2214,'서울특별시','송파구','잠실본동',37.5034,127.086,62,125),(2215,'서울특별시','송파구','장지동',37.4841,127.135,63,125),(2216,'서울특별시','송파구','풍납1동',37.5352,127.124,62,126),(2217,'서울특별시','송파구','풍납2동',37.526,127.119,62,126),(2218,'서울특별시','양천구','목1동',37.5275,126.873,58,126),(2219,'서울특별시','양천구','목2동',37.5434,126.874,58,126),(2220,'서울특별시','양천구','목3동',37.5421,126.867,58,126),(2221,'서울특별시','양천구','목4동',37.5295,126.87,58,126),(2222,'서울특별시','양천구','목5동',37.5324,126.881,58,126),(2223,'서울특별시','양천구','신월1동',37.53,126.834,57,126),(2224,'서울특별시','양천구','신월2동',37.5222,126.847,58,126),(2225,'서울특별시','양천구','신월3동',37.5308,126.831,57,126),(2226,'서울특별시','양천구','신월4동',37.5219,126.842,57,126),(2227,'서울특별시','양천구','신월5동',37.5369,126.829,57,126),(2228,'서울특별시','양천구','신월6동',37.5133,126.846,58,126),(2229,'서울특별시','양천구','신월7동',37.5191,126.837,57,126),(2230,'서울특별시','양천구','신정1동',37.5157,126.856,58,126),(2231,'서울특별시','양천구','신정2동',37.5164,126.873,58,126),(2232,'서울특별시','양천구','신정3동',37.5123,126.857,58,126),(2233,'서울특별시','양천구','신정4동',37.5206,126.861,58,126),(2234,'서울특별시','양천구','신정6동',37.5142,126.866,58,126),(2235,'서울특별시','양천구','신정7동',37.5116,126.862,58,125),(2236,'서울특별시','영등포구','당산제1동',37.5222,126.9,58,126),(2237,'서울특별시','영등포구','당산제2동',37.5319,126.904,59,126),(2238,'서울특별시','영등포구','대림제1동',37.4926,126.908,59,125),(2239,'서울특별시','영등포구','대림제2동',37.4899,126.9,58,125),(2240,'서울특별시','영등포구','대림제3동',37.4955,126.9,58,125),(2241,'서울특별시','영등포구','도림동',37.4882,126.93,59,125),(2242,'서울특별시','영등포구','문래동',37.4882,126.93,59,125),(2243,'서울특별시','영등포구','신길제1동',37.5082,126.923,59,125),(2244,'서울특별시','영등포구','신길제3동',37.5046,126.91,59,125),(2245,'서울특별시','영등포구','신길제4동',37.5057,126.913,59,125),(2246,'서울특별시','영등포구','신길제5동',37.4988,126.907,59,125),(2247,'서울특별시','영등포구','신길제6동',37.4966,126.912,59,125),(2248,'서울특별시','영등포구','신길제7동',37.5037,126.923,59,125),(2249,'서울특별시','영등포구','양평제1동',37.5208,126.89,58,126),(2250,'서울특별시','영등포구','양평제2동',37.535,126.898,58,126),(2251,'서울특별시','영등포구','여의동',37.5149,126.937,59,126),(2252,'서울특별시','영등포구','영등포동',37.5343,126.93,59,126),(2253,'서울특별시','영등포구','영등포본동',37.5343,126.93,59,126),(2254,'서울특별시','용산구','남영동',37.5428,126.977,60,126),(2255,'서울특별시','용산구','보광동',37.5235,127.002,60,126),(2256,'서울특별시','용산구','서빙고동',37.5176,126.997,60,126),(2257,'서울특별시','용산구','용문동',37.5363,126.96,60,126),(2258,'서울특별시','용산구','용산2가동',37.5431,126.988,60,126),(2259,'서울특별시','용산구','원효로제1동',37.5359,126.968,60,126),(2260,'서울특별시','용산구','원효로제2동',37.5316,126.954,59,126),(2261,'서울특별시','용산구','이촌제1동',37.5184,126.975,60,126),(2262,'서울특별시','용산구','이촌제2동',37.524,126.956,59,126),(2263,'서울특별시','용산구','이태원제1동',37.5295,126.997,60,126),(2264,'서울특별시','용산구','이태원제2동',37.538,126.992,60,126),(2265,'서울특별시','용산구','청파동',37.5426,126.972,60,126),(2266,'서울특별시','용산구','한강로동',37.5262,126.972,60,126),(2267,'서울특별시','용산구','한남동',37.5319,127.003,60,126),(2268,'서울특별시','용산구','효창동',37.539,126.963,60,126),(2269,'서울특별시','용산구','후암동',37.5459,126.98,60,126),(2270,'서울특별시','은평구','갈현제1동',37.6209,126.919,59,128),(2271,'서울특별시','은평구','갈현제2동',37.6158,126.918,59,128),(2272,'서울특별시','은평구','구산동',37.609,126.912,59,128),(2273,'서울특별시','은평구','녹번동',37.6,126.937,59,127),(2274,'서울특별시','은평구','대조동',37.6113,126.923,59,128),(2275,'서울특별시','은평구','불광제1동',37.6075,126.934,59,128),(2276,'서울특별시','은평구','불광제2동',37.6188,126.93,59,128),(2277,'서울특별시','은평구','수색동',37.5814,126.9,58,127),(2278,'서울특별시','은평구','신사제1동',37.5952,126.914,59,127),(2279,'서울특별시','은평구','신사제2동',37.5893,126.915,59,127),(2280,'서울특별시','은평구','역촌동',37.6016,126.917,59,127),(2281,'서울특별시','은평구','응암제1동',37.5979,126.929,59,127),(2282,'서울특별시','은평구','응암제2동',37.5918,126.925,59,127),(2283,'서울특별시','은평구','응암제3동',37.5894,126.918,59,127),(2284,'서울특별시','은평구','증산동',37.5815,126.909,59,127),(2285,'서울특별시','은평구','진관동',37.6356,126.921,59,128),(2286,'서울특별시','종로구','가회동',37.5773,126.987,60,127),(2287,'서울특별시','종로구','교남동',37.5691,126.964,60,127),(2288,'서울특별시','종로구','명륜3가동',37.5807,127,60,127),(2289,'서울특별시','종로구','무악동',37.5715,126.961,60,127),(2290,'서울특별시','종로구','부암동',37.5899,126.966,60,127),(2291,'서울특별시','종로구','사직동',37.5733,126.971,60,127),(2292,'서울특별시','종로구','삼청동',37.5824,126.984,60,127),(2293,'서울특별시','종로구','숭인제1동',37.575,127.018,60,127),(2294,'서울특별시','종로구','숭인제2동',37.572,127.022,61,127),(2295,'서울특별시','종로구','이화동',37.5742,127.006,60,127),(2296,'서울특별시','종로구','종로1.2.3.4가동',37.5679,126.991,60,127),(2297,'서울특별시','종로구','종로5.6가동',37.5692,127.007,60,127),(2298,'서울특별시','종로구','창신제1동',37.5679,127.018,61,127),(2299,'서울특별시','종로구','창신제2동',37.5716,127.013,60,127),(2300,'서울특별시','종로구','창신제3동',37.575,127.017,60,127),(2301,'서울특별시','종로구','청운효자동',37.5799,126.989,60,127),(2302,'서울특별시','종로구','평창동',37.6025,126.969,60,127),(2303,'서울특별시','종로구','혜화동',37.584,127.003,60,127),(2304,'서울특별시','중구','광희동',37.5617,127.007,60,127),(2305,'서울특별시','중구','명동',37.5572,126.988,60,127),(2306,'서울특별시','중구','소공동',37.5596,126.979,60,127),(2307,'서울특별시','중구','신당제1동',37.5593,127.017,60,127),(2308,'서울특별시','중구','신당제2동',37.5516,127.01,60,126),(2309,'서울특별시','중구','신당제3동',37.5497,127.011,60,126),(2310,'서울특별시','중구','신당제4동',37.5543,127.017,60,126),(2311,'서울특별시','중구','신당제5동',37.5623,127.024,61,127),(2312,'서울특별시','중구','신당제6동',37.5572,127.022,61,127),(2313,'서울특별시','중구','을지로동',37.5639,126.993,60,127),(2314,'서울특별시','중구','장충동',37.5591,127.01,60,127),(2315,'서울특별시','중구','중림동',37.552,126.967,60,126),(2316,'서울특별시','중구','필동',37.5574,126.998,60,127),(2317,'서울특별시','중구','황학동',37.5647,127.023,61,127),(2318,'서울특별시','중구','회현동',37.5545,126.981,60,126),(2319,'서울특별시','중랑구','망우본동',37.5987,127.108,62,127),(2320,'서울특별시','중랑구','망우제3동',37.5896,127.1,62,127),(2321,'서울특별시','중랑구','면목본동',37.5846,127.09,62,127),(2322,'서울특별시','중랑구','면목제2동',37.587,127.081,62,127),(2323,'서울특별시','중랑구','면목제3.8동',37.5802,127.09,62,127),(2324,'서울특별시','중랑구','면목제4동',37.5718,127.088,62,127),(2325,'서울특별시','중랑구','면목제5동',37.583,127.082,62,127),(2326,'서울특별시','중랑구','면목제7동',37.5762,127.089,62,127),(2327,'서울특별시','중랑구','묵제1동',37.6096,127.081,62,128),(2328,'서울특별시','중랑구','묵제2동',37.6068,127.078,62,128),(2329,'서울특별시','중랑구','상봉제1동',37.597,127.089,62,127),(2330,'서울특별시','중랑구','상봉제2동',37.5896,127.085,62,127),(2331,'서울특별시','중랑구','신내1동',37.6031,127.102,62,128),(2332,'서울특별시','중랑구','신내2동',37.6034,127.096,62,128),(2333,'서울특별시','중랑구','중화제1동',37.5984,127.083,62,127),(2334,'서울특별시','중랑구','중화제2동',37.5922,127.077,62,127),(2335,'세종특별자치시','세종특별자치시','금남면',36.4713,127.258,65,103),(2336,'세종특별자치시','세종특별자치시','부강면',36.5158,127.374,67,104),(2337,'세종특별자치시','세종특별자치시','소정면',36.7027,127.148,63,108),(2338,'세종특별자치시','세종특별자치시','연기면',36.5173,127.259,65,104),(2339,'세종특별자치시','세종특별자치시','연동면',36.5626,127.317,66,105),(2340,'세종특별자치시','세종특별자치시','연서면',36.6093,127.261,65,106),(2341,'세종특별자치시','세종특별자치시','장군면',36.4721,127.201,64,103),(2342,'세종특별자치시','세종특별자치시','전동면',36.6553,127.262,65,107),(2343,'세종특별자치시','세종특별자치시','전의면',36.6561,127.205,64,107),(2344,'세종특별자치시','세종특별자치시','조치원읍',36.6086,127.318,66,106),(2345,'세종특별자치시','세종특별자치시','한솔동',36.4713,127.258,65,103),(2346,'울산광역시','남구','달동',35.5334,129.319,102,84),(2347,'울산광역시','남구','대현동',35.5235,129.329,102,83),(2348,'울산광역시','남구','무거동',35.5479,129.263,101,84),(2349,'울산광역시','남구','삼산동',35.5414,129.334,102,84),(2350,'울산광역시','남구','삼호동',35.5469,129.268,101,84),(2351,'울산광역시','남구','선암동',35.5099,129.337,102,83),(2352,'울산광역시','남구','수암동',35.5214,129.321,102,83),(2353,'울산광역시','남구','신정1동',35.5383,129.309,102,84),(2354,'울산광역시','남구','신정2동',35.5316,129.31,102,84),(2355,'울산광역시','남구','신정3동',35.542,129.319,102,84),(2356,'울산광역시','남구','신정4동',35.5263,129.317,102,83),(2357,'울산광역시','남구','신정5동',35.5419,129.324,102,84),(2358,'울산광역시','남구','야음장생포동',35.5166,129.341,102,83),(2359,'울산광역시','남구','옥동',35.5322,129.296,101,84),(2360,'울산광역시','동구','남목1동',35.5363,129.423,104,84),(2361,'울산광역시','동구','남목2동',35.5216,129.434,104,83),(2362,'울산광역시','동구','남목3동',35.5429,129.434,104,84),(2363,'울산광역시','동구','대송동',35.5001,129.421,104,83),(2364,'울산광역시','동구','방어동',35.483,129.426,104,83),(2365,'울산광역시','동구','일산동',35.495,129.429,104,83),(2366,'울산광역시','동구','전하1동',35.5138,129.431,104,83),(2367,'울산광역시','동구','전하2동',35.5063,129.432,104,83),(2368,'울산광역시','동구','화정동',35.4907,129.427,104,83),(2369,'울산광역시','북구','강동동',35.6124,129.451,104,85),(2370,'울산광역시','북구','농소1동',35.6198,129.358,102,86),(2371,'울산광역시','북구','농소2동',35.6352,129.35,102,86),(2372,'울산광역시','북구','농소3동',35.6256,129.342,102,86),(2373,'울산광역시','북구','송정동',35.5918,129.36,103,85),(2374,'울산광역시','북구','양정동',35.5429,129.388,103,84),(2375,'울산광역시','북구','염포동',35.5238,129.401,103,83),(2376,'울산광역시','북구','효문동',35.5748,129.363,103,85),(2377,'울산광역시','울주군','두동면',35.6512,129.204,100,86),(2378,'울산광역시','울주군','두서면',35.6404,129.161,99,86),(2379,'울산광역시','울주군','범서읍',35.5659,129.232,100,84),(2380,'울산광역시','울주군','삼남면',35.5339,129.111,98,83),(2381,'울산광역시','울주군','삼동면',35.5191,129.159,99,83),(2382,'울산광역시','울주군','상북면',35.5876,129.093,98,85),(2383,'울산광역시','울주군','서생면',35.3462,129.329,102,80),(2384,'울산광역시','울주군','언양읍',35.5664,129.128,98,84),(2385,'울산광역시','울주군','온산읍',35.4316,129.317,102,81),(2386,'울산광역시','울주군','온양읍',35.4159,129.283,101,81),(2387,'울산광역시','울주군','웅촌면',35.4631,129.212,100,82),(2388,'울산광역시','울주군','청량면',35.4902,129.308,102,83),(2389,'울산광역시','중구','다운동',35.5533,129.278,101,84),(2390,'울산광역시','중구','반구1동',35.5534,129.344,102,84),(2391,'울산광역시','중구','반구2동',35.5603,129.343,102,84),(2392,'울산광역시','중구','병영1동',35.567,129.349,102,84),(2393,'울산광역시','중구','병영2동',35.5764,129.348,102,85),(2394,'울산광역시','중구','복산1동',35.56,129.329,102,84),(2395,'울산광역시','중구','복산2동',35.5629,129.336,102,84),(2396,'울산광역시','중구','북정동',35.5576,129.324,102,84),(2397,'울산광역시','중구','약사동',35.5674,129.34,102,84),(2398,'울산광역시','중구','우정동',35.5517,129.315,102,84),(2399,'울산광역시','중구','중앙동',35.5502,129.328,102,84),(2400,'울산광역시','중구','태화동',35.5535,129.307,102,84),(2401,'울산광역시','중구','학성동',35.5523,129.337,102,84),(2402,'인천광역시','강화군','강화읍',37.7455,126.486,51,131),(2403,'인천광역시','강화군','교동면',37.7774,126.283,48,131),(2404,'인천광역시','강화군','길상면',37.6378,126.493,51,128),(2405,'인천광역시','강화군','내가면',37.7166,126.392,50,130),(2406,'인천광역시','강화군','불은면',37.6839,126.482,51,129),(2407,'인천광역시','강화군','삼산면',37.7007,126.323,49,130),(2408,'인천광역시','강화군','서도면',37.6476,126.242,47,128),(2409,'인천광역시','강화군','선원면',37.7105,126.487,51,130),(2410,'인천광역시','강화군','송해면',37.7618,126.465,51,131),(2411,'인천광역시','강화군','양도면',37.66,126.424,50,129),(2412,'인천광역시','강화군','양사면',37.7958,126.41,50,132),(2413,'인천광역시','강화군','하점면',37.7719,126.414,50,131),(2414,'인천광역시','강화군','화도면',37.6289,126.422,50,128),(2415,'인천광역시','계양구','계산1동',37.5401,126.727,55,126),(2416,'인천광역시','계양구','계산2동',37.5446,126.729,56,126),(2417,'인천광역시','계양구','계산3동',37.5339,126.731,56,126),(2418,'인천광역시','계양구','계산4동',37.5318,126.744,56,126),(2419,'인천광역시','계양구','계양1동',37.5741,126.736,56,127),(2420,'인천광역시','계양구','계양2동',37.541,126.739,56,126),(2421,'인천광역시','계양구','작전1동',37.5279,126.732,56,126),(2422,'인천광역시','계양구','작전2동',37.5301,126.726,55,126),(2423,'인천광역시','계양구','작전서운동',37.5252,126.739,56,126),(2424,'인천광역시','계양구','효성1동',37.5296,126.714,55,126),(2425,'인천광역시','계양구','효성2동',37.5222,126.712,55,126),(2426,'인천광역시','남구','관교동',37.4414,126.699,55,124),(2427,'인천광역시','남구','도화1동',37.4581,126.676,55,124),(2428,'인천광역시','남구','문학동',37.4349,126.687,55,124),(2429,'인천광역시','남구','숭의2동',37.4603,126.649,54,124),(2430,'인천광역시','남구','숭의4동',37.462,126.661,54,124),(2431,'인천광역시','남구','용현2동',37.4523,126.648,54,124),(2432,'인천광역시','남구','용현3동',37.4539,126.654,54,124),(2433,'인천광역시','남구','용현5동',37.4497,126.642,54,124),(2434,'인천광역시','남구','주안1동',37.461,126.679,55,124),(2435,'인천광역시','남구','주안2동',37.4519,126.675,55,124),(2436,'인천광역시','남구','주안3동',37.4421,126.676,55,124),(2437,'인천광역시','남구','주안4동',37.4523,126.692,55,124),(2438,'인천광역시','남구','주안5동',37.4631,126.689,55,124),(2439,'인천광역시','남구','주안6동',37.4597,126.691,55,124),(2440,'인천광역시','남구','주안7동',37.4456,126.68,55,124),(2441,'인천광역시','남구','주안8동',37.4468,126.691,55,124),(2442,'인천광역시','남구','학익1동',37.4371,126.666,54,124),(2443,'인천광역시','남구','학익2동',37.4438,126.67,55,124),(2444,'인천광역시','남동구','간석1동',37.4558,126.707,55,124),(2445,'인천광역시','남동구','간석2동',37.4589,126.711,55,124),(2446,'인천광역시','남동구','간석3동',37.4634,126.717,55,124),(2447,'인천광역시','남동구','간석4동',37.4638,126.703,55,124),(2448,'인천광역시','남동구','구월1동',37.4496,126.714,55,124),(2449,'인천광역시','남동구','구월2동',37.4533,126.715,55,124),(2450,'인천광역시','남동구','구월3동',37.4499,126.699,55,124),(2451,'인천광역시','남동구','구월4동',37.4468,126.726,56,124),(2452,'인천광역시','남동구','남촌도림동',37.4294,126.717,55,124),(2453,'인천광역시','남동구','논현고잔동',37.4015,126.718,55,123),(2454,'인천광역시','남동구','논현동',37.3979,126.696,55,123),(2455,'인천광역시','남동구','만수1동',37.446,126.734,56,124),(2456,'인천광역시','남동구','만수2동',37.4564,126.733,56,124),(2457,'인천광역시','남동구','만수3동',37.4592,126.725,55,124),(2458,'인천광역시','남동구','만수4동',37.4567,126.738,56,124),(2459,'인천광역시','남동구','만수5동',37.4552,126.73,56,124),(2460,'인천광역시','남동구','만수6동',37.4409,126.74,56,124),(2461,'인천광역시','남동구','장수서창동',37.4331,126.749,56,124),(2462,'인천광역시','동구','금창동',37.4698,126.642,54,125),(2463,'인천광역시','동구','만석동',37.4804,126.628,54,125),(2464,'인천광역시','동구','송림1동',37.4735,126.642,54,125),(2465,'인천광역시','동구','송림2동',37.473,126.645,54,125),(2466,'인천광역시','동구','송림3.5동',37.4701,126.649,54,125),(2467,'인천광역시','동구','송림4동',37.4755,126.652,54,125),(2468,'인천광역시','동구','송림6동',37.4746,126.65,54,125),(2469,'인천광역시','동구','송현1.2동',37.4734,126.639,54,125),(2470,'인천광역시','동구','송현3동',37.4795,126.645,54,125),(2471,'인천광역시','동구','화수1.화평동',37.4787,126.632,54,125),(2472,'인천광역시','동구','화수2동',37.4816,126.632,54,125),(2473,'인천광역시','부평구','갈산1동',37.5148,126.729,56,126),(2474,'인천광역시','부평구','갈산2동',37.508,126.728,56,125),(2475,'인천광역시','부평구','부개1동',37.4827,126.739,56,125),(2476,'인천광역시','부평구','부개2동',37.492,126.739,56,125),(2477,'인천광역시','부평구','부개3동',37.5016,126.737,56,125),(2478,'인천광역시','부평구','부평1동',37.4914,126.722,55,125),(2479,'인천광역시','부평구','부평2동',37.4841,126.72,55,125),(2480,'인천광역시','부평구','부평3동',37.4832,126.71,55,125),(2481,'인천광역시','부평구','부평4동',37.498,126.727,56,125),(2482,'인천광역시','부평구','부평5동',37.4908,126.73,56,125),(2483,'인천광역시','부평구','부평6동',37.4836,126.727,56,125),(2484,'인천광역시','부평구','산곡1동',37.5041,126.702,55,125),(2485,'인천광역시','부평구','산곡2동',37.5031,126.711,55,125),(2486,'인천광역시','부평구','산곡3동',37.488,126.712,55,125),(2487,'인천광역시','부평구','산곡4동',37.4991,126.714,55,125),(2488,'인천광역시','부평구','삼산1동',37.5156,126.74,56,126),(2489,'인천광역시','부평구','삼산2동',37.509,126.738,56,125),(2490,'인천광역시','부평구','십정1동',37.473,126.698,55,125),(2491,'인천광역시','부평구','십정2동',37.471,126.71,55,125),(2492,'인천광역시','부평구','일신동',37.4816,126.749,56,125),(2493,'인천광역시','부평구','청천1동',37.5139,126.704,55,126),(2494,'인천광역시','부평구','청천2동',37.5121,126.707,55,125),(2495,'인천광역시','서구','가정1동',37.5204,126.677,55,126),(2496,'인천광역시','서구','가정2동',37.5236,126.68,55,126),(2497,'인천광역시','서구','가정3동',37.5127,126.68,55,125),(2498,'인천광역시','서구','가좌1동',37.4911,126.675,55,125),(2499,'인천광역시','서구','가좌2동',37.488,126.687,55,125),(2500,'인천광역시','서구','가좌3동',37.4897,126.682,55,125),(2501,'인천광역시','서구','가좌4동',37.4846,126.686,55,125),(2502,'인천광역시','서구','검단1동',37.5994,126.663,54,127),(2503,'인천광역시','서구','검단2동',37.6144,126.691,55,128),(2504,'인천광역시','서구','검단3동',37.5911,126.7,55,127),(2505,'인천광역시','서구','검단4동',37.5912,126.677,55,127),(2506,'인천광역시','서구','검암경서동',37.5617,126.676,55,127),(2507,'인천광역시','서구','석남1동',37.5084,126.677,55,125),(2508,'인천광역시','서구','석남2동',37.4998,126.677,55,125),(2509,'인천광역시','서구','석남3동',37.5054,126.68,55,125),(2510,'인천광역시','서구','신현원창동',37.5118,126.674,55,125),(2511,'인천광역시','서구','연희동',37.5462,126.68,55,126),(2512,'인천광역시','연수구','동춘1동',37.4068,126.673,55,123),(2513,'인천광역시','연수구','동춘2동',37.3999,126.671,55,123),(2514,'인천광역시','연수구','동춘3동',37.4056,126.68,55,123),(2515,'인천광역시','연수구','선학동',37.4197,126.703,55,123),(2516,'인천광역시','연수구','송도동',37.3885,126.654,54,123),(2517,'인천광역시','연수구','연수1동',37.4194,126.684,55,123),(2518,'인천광역시','연수구','연수2동',37.4089,126.684,55,123),(2519,'인천광역시','연수구','연수3동',37.4166,126.694,55,123),(2520,'인천광역시','연수구','옥련1동',37.4245,126.657,54,124),(2521,'인천광역시','연수구','옥련2동',37.4235,126.65,54,124),(2522,'인천광역시','연수구','청학동',37.4222,126.668,55,124),(2523,'인천광역시','옹진군','대청면',37.4534,126.171,46,124),(2524,'인천광역시','옹진군','덕적면',37.2236,126.149,46,119),(2525,'인천광역시','옹진군','백령면',37.5997,126.166,46,127),(2526,'인천광역시','옹진군','북도면',37.5297,126.429,50,126),(2527,'인천광역시','옹진군','연평면',37.6624,125.704,38,129),(2528,'인천광역시','옹진군','영흥면',37.2529,126.486,51,120),(2529,'인천광역시','옹진군','자월면',37.2482,126.313,48,120),(2530,'인천광역시','중구','도원동',37.4653,126.64,54,124),(2531,'인천광역시','중구','동인천동',37.474,126.631,54,125),(2532,'인천광역시','중구','북성동',37.4726,126.621,54,125),(2533,'인천광역시','중구','송월동',37.4772,126.626,54,125),(2534,'인천광역시','중구','신포동',37.4676,126.627,54,125),(2535,'인천광역시','중구','신흥동',37.4649,126.636,54,124),(2536,'인천광역시','중구','연안동',37.4504,126.607,53,124),(2537,'인천광역시','중구','영종동',37.4907,126.533,52,125),(2538,'인천광역시','중구','용유동',37.4411,126.404,50,124),(2539,'인천광역시','중구','율목동',37.4665,126.638,54,124),(2540,'전라남도','강진군','강진읍',34.6328,126.776,57,63),(2541,'전라남도','강진군','군동면',34.6418,126.817,58,63),(2542,'전라남도','강진군','대구면',34.4923,126.803,57,60),(2543,'전라남도','강진군','도암면',34.5432,126.73,56,61),(2544,'전라남도','강진군','마량면',34.4473,126.821,58,59),(2545,'전라남도','강진군','병영면',34.7138,126.815,58,65),(2546,'전라남도','강진군','성전면',34.6896,126.711,56,64),(2547,'전라남도','강진군','신전면',34.5104,126.722,56,60),(2548,'전라남도','강진군','옴천면',34.7419,126.796,57,65),(2549,'전라남도','강진군','작천면',34.7011,126.773,57,64),(2550,'전라남도','강진군','칠량면',34.5696,126.801,57,61),(2551,'전라남도','고흥군','고흥읍',34.603,127.282,66,62),(2552,'전라남도','고흥군','과역면',34.6781,127.362,67,64),(2553,'전라남도','고흥군','금산면',34.456,127.127,63,59),(2554,'전라남도','고흥군','남양면',34.7258,127.342,67,65),(2555,'전라남도','고흥군','대서면',34.7682,127.286,66,66),(2556,'전라남도','고흥군','도덕면',34.5636,127.18,64,61),(2557,'전라남도','고흥군','도양읍',34.5264,127.141,64,61),(2558,'전라남도','고흥군','도화면',34.507,127.32,67,60),(2559,'전라남도','고흥군','동강면',34.7763,127.336,67,66),(2560,'전라남도','고흥군','동일면',34.4989,127.469,69,60),(2561,'전라남도','고흥군','두원면',34.6435,127.276,66,63),(2562,'전라남도','고흥군','봉래면',34.4606,127.461,69,59),(2563,'전라남도','고흥군','영남면',34.5989,127.458,69,62),(2564,'전라남도','고흥군','점암면',34.6497,127.382,68,63),(2565,'전라남도','고흥군','포두면',34.5684,127.343,67,62),(2566,'전라남도','고흥군','풍양면',34.5724,127.244,65,62),(2567,'전라남도','곡성군','겸면',35.2526,127.175,64,76),(2568,'전라남도','곡성군','고달면',35.2926,127.343,67,77),(2569,'전라남도','곡성군','곡성읍',35.2792,127.298,66,77),(2570,'전라남도','곡성군','목사동면',35.1177,127.302,66,74),(2571,'전라남도','곡성군','삼기면',35.2329,127.214,65,76),(2572,'전라남도','곡성군','석곡면',35.1299,127.256,65,74),(2573,'전라남도','곡성군','오곡면',35.2693,127.316,66,77),(2574,'전라남도','곡성군','오산면',35.2349,127.124,63,76),(2575,'전라남도','곡성군','옥과면',35.2738,127.138,63,77),(2576,'전라남도','곡성군','입면',35.2941,127.206,64,77),(2577,'전라남도','곡성군','죽곡면',35.1481,127.321,67,74),(2578,'전라남도','광양시','골약동',34.9354,127.68,73,70),(2579,'전라남도','광양시','광양읍',34.9702,127.583,71,70),(2580,'전라남도','광양시','광영동',34.9598,127.724,74,70),(2581,'전라남도','광양시','금호동',34.9346,127.725,74,70),(2582,'전라남도','광양시','다압면',35.1202,127.693,73,74),(2583,'전라남도','광양시','봉강면',35.0084,127.583,71,71),(2584,'전라남도','광양시','옥곡면',34.9863,127.701,73,71),(2585,'전라남도','광양시','옥룡면',35.0138,127.621,72,71),(2586,'전라남도','광양시','중마동',34.9379,127.7,73,70),(2587,'전라남도','광양시','진상면',35.0169,127.722,74,71),(2588,'전라남도','광양시','진월면',34.9753,127.76,74,71),(2589,'전라남도','광양시','태인동',34.9394,127.752,74,70),(2590,'전라남도','구례군','간전면',35.1751,127.546,71,75),(2591,'전라남도','구례군','광의면',35.2572,127.442,69,77),(2592,'전라남도','구례군','구례읍',35.2057,127.465,69,76),(2593,'전라남도','구례군','마산면',35.2201,127.49,70,76),(2594,'전라남도','구례군','문척면',35.1887,127.491,70,75),(2595,'전라남도','구례군','산동면',35.3128,127.442,69,78),(2596,'전라남도','구례군','용방면',35.2476,127.432,69,76),(2597,'전라남도','구례군','토지면',35.1948,127.528,70,75),(2598,'전라남도','나주시','공산면',34.9402,126.61,54,70),(2599,'전라남도','나주시','금남동',35.0281,126.718,56,71),(2600,'전라남도','나주시','금천면',35.0278,126.756,57,71),(2601,'전라남도','나주시','남평읍',35.0433,126.845,58,72),(2602,'전라남도','나주시','노안면',35.0729,126.734,56,72),(2603,'전라남도','나주시','다도면',34.9442,126.83,58,70),(2604,'전라남도','나주시','다시면',35.0163,126.639,54,71),(2605,'전라남도','나주시','동강면',34.9364,126.566,53,69),(2606,'전라남도','나주시','문평면',35.0521,126.606,54,72),(2607,'전라남도','나주시','반남면',34.9007,126.654,55,69),(2608,'전라남도','나주시','봉황면',34.9552,126.786,57,70),(2609,'전라남도','나주시','산포면',35.037,126.808,57,72),(2610,'전라남도','나주시','성북동',35.0319,126.721,56,72),(2611,'전라남도','나주시','세지면',34.9166,126.752,56,69),(2612,'전라남도','나주시','송월동',35.0144,126.727,56,71),(2613,'전라남도','나주시','영강동',35.001,126.709,56,71),(2614,'전라남도','나주시','영산동',34.9967,126.716,56,71),(2615,'전라남도','나주시','왕곡면',34.9651,126.672,55,70),(2616,'전라남도','나주시','이창동',34.9945,126.713,56,71),(2617,'전라남도','담양군','고서면',35.2205,126.975,60,76),(2618,'전라남도','담양군','금성면',35.3403,127.028,61,78),(2619,'전라남도','담양군','남면',35.1744,127.03,61,75),(2620,'전라남도','담양군','담양읍',35.3175,126.984,61,78),(2621,'전라남도','담양군','대덕면',35.2464,127.039,62,76),(2622,'전라남도','담양군','대전면',35.2718,126.89,59,77),(2623,'전라남도','담양군','무정면',35.2918,127.032,61,77),(2624,'전라남도','담양군','봉산면',35.2732,126.959,60,77),(2625,'전라남도','담양군','수북면',35.2987,126.931,60,77),(2626,'전라남도','담양군','용면',35.3619,126.99,61,79),(2627,'전라남도','담양군','월산면',35.3372,126.957,60,78),(2628,'전라남도','담양군','창평면',35.2358,127.021,61,76),(2629,'전라남도','목포시','대성동',34.7962,126.386,50,66),(2630,'전라남도','목포시','동명동',34.7878,126.394,50,66),(2631,'전라남도','목포시','만호동',34.7842,126.389,50,66),(2632,'전라남도','목포시','목원동',34.79,126.382,50,66),(2633,'전라남도','목포시','부흥동',34.8011,126.437,51,66),(2634,'전라남도','목포시','북항동',34.804,126.371,50,67),(2635,'전라남도','목포시','산정동',34.806,126.389,50,67),(2636,'전라남도','목포시','삼학동',34.7871,126.404,50,66),(2637,'전라남도','목포시','삼향동',34.8272,126.42,51,67),(2638,'전라남도','목포시','상동',34.8107,126.416,50,67),(2639,'전라남도','목포시','신흥동',34.7957,126.421,51,66),(2640,'전라남도','목포시','연동',34.7916,126.394,50,66),(2641,'전라남도','목포시','연산동',34.8099,126.379,50,67),(2642,'전라남도','목포시','옥암동',34.8071,126.432,51,67),(2643,'전라남도','목포시','용당1동',34.8014,126.395,50,66),(2644,'전라남도','목포시','용당2동',34.8016,126.4,50,66),(2645,'전라남도','목포시','용해동',34.8135,126.401,50,67),(2646,'전라남도','목포시','원산동',34.8088,126.383,50,67),(2647,'전라남도','목포시','유달동',34.7829,126.383,50,66),(2648,'전라남도','목포시','이로동',34.7961,126.412,50,66),(2649,'전라남도','목포시','죽교동',34.7967,126.377,50,66),(2650,'전라남도','목포시','하당동',34.8056,126.422,51,67),(2651,'전라남도','무안군','망운면',35.0098,126.397,50,71),(2652,'전라남도','무안군','몽탄면',34.9277,126.504,52,69),(2653,'전라남도','무안군','무안읍',34.9875,126.478,52,71),(2654,'전라남도','무안군','삼향면',34.82,126.444,51,67),(2655,'전라남도','무안군','운남면',34.9591,126.345,49,70),(2656,'전라남도','무안군','일로읍',34.8483,126.492,52,67),(2657,'전라남도','무안군','청계면',34.9079,126.431,51,69),(2658,'전라남도','무안군','해제면',35.1074,126.297,48,73),(2659,'전라남도','무안군','현경면',35.0183,126.414,50,71),(2660,'전라남도','보성군','겸백면',34.8264,127.154,64,67),(2661,'전라남도','보성군','노동면',34.7942,127.073,62,66),(2662,'전라남도','보성군','득량면',34.759,127.171,64,66),(2663,'전라남도','보성군','문덕면',34.9262,127.175,64,69),(2664,'전라남도','보성군','미력면',34.7978,127.09,63,66),(2665,'전라남도','보성군','벌교읍',34.8442,127.344,67,68),(2666,'전라남도','보성군','보성읍',34.7655,127.082,62,66),(2667,'전라남도','보성군','복내면',34.8899,127.133,63,69),(2668,'전라남도','보성군','웅치면',34.7128,127.022,61,65),(2669,'전라남도','보성군','율어면',34.8675,127.189,64,68),(2670,'전라남도','보성군','조성면',34.8054,127.25,65,67),(2671,'전라남도','보성군','회천면',34.6657,127.087,63,64),(2672,'전라남도','순천시','낙안면',34.905,127.348,67,69),(2673,'전라남도','순천시','남제동',34.9383,127.49,70,70),(2674,'전라남도','순천시','덕연동',34.9462,127.507,70,70),(2675,'전라남도','순천시','도사동',34.9245,127.494,70,69),(2676,'전라남도','순천시','매곡동',34.9608,127.485,70,70),(2677,'전라남도','순천시','별량면',34.8712,127.454,69,68),(2678,'전라남도','순천시','삼산동',34.9678,127.486,70,70),(2679,'전라남도','순천시','상사면',34.936,127.457,69,70),(2680,'전라남도','순천시','서면',34.9917,127.49,70,71),(2681,'전라남도','순천시','송광면',34.971,127.266,66,70),(2682,'전라남도','순천시','승주읍',35.0114,127.392,68,71),(2683,'전라남도','순천시','왕조1동',34.9594,127.523,70,70),(2684,'전라남도','순천시','왕조2동',34.9522,127.535,70,70),(2685,'전라남도','순천시','외서면',34.9107,127.279,66,69),(2686,'전라남도','순천시','월등면',35.0903,127.383,68,73),(2687,'전라남도','순천시','장천동',34.9454,127.489,70,70),(2688,'전라남도','순천시','저전동',34.9449,127.486,70,70),(2689,'전라남도','순천시','조곡동',34.9448,127.499,70,70),(2690,'전라남도','순천시','주암면',35.0738,127.237,65,73),(2691,'전라남도','순천시','중앙동',34.953,127.489,70,70),(2692,'전라남도','순천시','풍덕동',34.9388,127.499,70,70),(2693,'전라남도','순천시','해룡면',34.9107,127.54,71,69),(2694,'전라남도','순천시','향동',34.9496,127.481,70,70),(2695,'전라남도','순천시','황전면',35.0983,127.429,69,73),(2696,'전라남도','신안군','도초면',34.7005,125.955,42,64),(2697,'전라남도','신안군','비금면',34.7522,125.929,42,65),(2698,'전라남도','신안군','신의면',34.582,126.09,45,62),(2699,'전라남도','신안군','안좌면',34.7529,126.127,45,65),(2700,'전라남도','신안군','암태면',34.8241,126.114,45,67),(2701,'전라남도','신안군','압해면',34.8624,126.314,49,68),(2702,'전라남도','신안군','임자면',35.0811,126.113,45,73),(2703,'전라남도','신안군','자은면',34.8814,126.049,44,68),(2704,'전라남도','신안군','장산면',34.6397,126.151,46,63),(2705,'전라남도','신안군','증도면',34.9997,126.142,46,71),(2706,'전라남도','신안군','지도읍',35.0582,126.21,47,72),(2707,'전라남도','신안군','팔금면',34.7819,126.145,46,66),(2708,'전라남도','신안군','하의면',34.6037,126.039,44,62),(2709,'전라남도','신안군','흑산면',34.6798,125.431,33,64),(2710,'전라남도','여수시','광림동',34.7444,127.729,74,66),(2711,'전라남도','여수시','국동',34.7269,127.721,74,65),(2712,'전라남도','여수시','남면',34.5063,127.769,75,60),(2713,'전라남도','여수시','대교동',34.7324,127.723,74,65),(2714,'전라남도','여수시','돌산읍',34.614,127.724,74,63),(2715,'전라남도','여수시','동문동',34.7388,127.745,74,65),(2716,'전라남도','여수시','둔덕동',34.7663,127.697,73,66),(2717,'전라남도','여수시','만덕동',34.7496,127.747,74,66),(2718,'전라남도','여수시','묘도동',34.873,127.712,74,68),(2719,'전라남도','여수시','문수동',34.7515,127.705,74,66),(2720,'전라남도','여수시','미평동',34.7658,127.707,74,66),(2721,'전라남도','여수시','삼산면',34.0225,127.314,67,50),(2722,'전라남도','여수시','삼일동',34.825,127.689,73,67),(2723,'전라남도','여수시','서강동',34.738,127.728,74,65),(2724,'전라남도','여수시','소라면',34.7896,127.635,72,66),(2725,'전라남도','여수시','시전동',34.7574,127.676,73,66),(2726,'전라남도','여수시','쌍봉동',34.7604,127.668,73,66),(2727,'전라남도','여수시','여서동',34.7474,127.711,74,66),(2728,'전라남도','여수시','여천동',34.767,127.664,73,66),(2729,'전라남도','여수시','월호동',34.723,127.714,74,65),(2730,'전라남도','여수시','율촌면',34.8788,127.581,71,68),(2731,'전라남도','여수시','주삼동',34.7845,127.665,73,66),(2732,'전라남도','여수시','중앙동',34.7359,127.738,74,65),(2733,'전라남도','여수시','충무동',34.7457,127.731,74,66),(2734,'전라남도','여수시','한려동',34.7418,127.75,74,65),(2735,'전라남도','여수시','화양면',34.705,127.616,72,65),(2736,'전라남도','여수시','화정면',34.6179,127.642,73,63),(2737,'전라남도','영광군','군남면',35.2367,126.455,51,76),(2738,'전라남도','영광군','군서면',35.2548,126.477,52,76),(2739,'전라남도','영광군','낙월면',35.1991,126.14,45,75),(2740,'전라남도','영광군','대마면',35.2983,126.58,53,77),(2741,'전라남도','영광군','묘량면',35.254,126.545,53,76),(2742,'전라남도','영광군','백수읍',35.2802,126.423,51,77),(2743,'전라남도','영광군','법성면',35.359,126.448,51,79),(2744,'전라남도','영광군','불갑면',35.2059,126.51,52,75),(2745,'전라남도','영광군','염산면',35.2148,126.374,50,75),(2746,'전라남도','영광군','영광읍',35.2749,126.514,52,77),(2747,'전라남도','영광군','홍농읍',35.3926,126.447,51,79),(2748,'전라남도','영암군','군서면',34.7765,126.653,55,66),(2749,'전라남도','영암군','금정면',34.86,126.751,56,68),(2750,'전라남도','영암군','덕진면',34.8158,126.699,56,67),(2751,'전라남도','영암군','도포면',34.8421,126.646,55,67),(2752,'전라남도','영암군','미암면',34.6962,126.574,53,64),(2753,'전라남도','영암군','삼호읍',34.7429,126.471,51,65),(2754,'전라남도','영암군','서호면',34.7519,126.587,54,65),(2755,'전라남도','영암군','시종면',34.8655,126.609,54,68),(2756,'전라남도','영암군','신북면',34.8872,126.695,55,68),(2757,'전라남도','영암군','영암읍',34.7967,126.703,56,66),(2758,'전라남도','영암군','학산면',34.7231,126.572,53,65),(2759,'전라남도','완도군','고금면',34.3918,126.806,58,58),(2760,'전라남도','완도군','군외면',34.3863,126.649,55,57),(2761,'전라남도','완도군','금당면',34.4268,127.073,62,58),(2762,'전라남도','완도군','금일읍',34.3457,127.032,62,57),(2763,'전라남도','완도군','노화읍',34.1747,126.578,53,53),(2764,'전라남도','완도군','보길면',34.1659,126.57,53,53),(2765,'전라남도','완도군','생일면',34.3299,127,61,56),(2766,'전라남도','완도군','소안면',34.1716,126.653,55,53),(2767,'전라남도','완도군','신지면',34.3316,126.829,58,56),(2768,'전라남도','완도군','약산면',34.3905,126.9,59,58),(2769,'전라남도','완도군','완도읍',34.3136,126.748,57,56),(2770,'전라남도','완도군','청산면',34.1767,126.861,59,53),(2771,'전라남도','장성군','남면',35.2413,126.814,58,76),(2772,'전라남도','장성군','동화면',35.2812,126.741,56,77),(2773,'전라남도','장성군','북이면',35.4257,126.811,57,80),(2774,'전라남도','장성군','북일면',35.3717,126.809,57,79),(2775,'전라남도','장성군','북하면',35.4043,126.882,59,80),(2776,'전라남도','장성군','삼계면',35.2565,126.667,55,76),(2777,'전라남도','장성군','삼서면',35.2291,126.648,55,76),(2778,'전라남도','장성군','서삼면',35.331,126.769,57,78),(2779,'전라남도','장성군','장성읍',35.3,126.787,57,77),(2780,'전라남도','장성군','진원면',35.2701,126.835,58,77),(2781,'전라남도','장성군','황룡면',35.2858,126.775,57,77),(2782,'전라남도','장흥군','관산읍',34.5584,126.941,60,61),(2783,'전라남도','장흥군','대덕읍',34.4944,126.889,59,60),(2784,'전라남도','장흥군','부산면',34.7203,126.905,59,65),(2785,'전라남도','장흥군','안양면',34.6469,126.976,61,63),(2786,'전라남도','장흥군','용산면',34.6118,126.916,59,62),(2787,'전라남도','장흥군','유치면',34.7992,126.841,58,66),(2788,'전라남도','장흥군','장동면',34.7468,126.997,61,65),(2789,'전라남도','장흥군','장평면',34.7706,126.977,61,66),(2790,'전라남도','장흥군','장흥읍',34.6767,126.905,59,64),(2791,'전라남도','장흥군','회진면',34.4784,126.942,60,59),(2792,'전라남도','진도군','고군면',34.4873,126.345,49,60),(2793,'전라남도','진도군','군내면',34.5094,126.294,48,60),(2794,'전라남도','진도군','의신면',34.4362,126.285,48,58),(2795,'전라남도','진도군','임회면',34.4029,126.192,46,58),(2796,'전라남도','진도군','조도면',34.2938,126.049,44,55),(2797,'전라남도','진도군','지산면',34.4225,126.169,46,58),(2798,'전라남도','진도군','진도읍',34.4778,126.265,48,59),(2799,'전라남도','함평군','나산면',35.1108,126.611,54,73),(2800,'전라남도','함평군','대동면',35.0657,126.533,53,72),(2801,'전라남도','함평군','손불면',35.1402,126.434,51,74),(2802,'전라남도','함평군','신광면',35.1526,126.5,52,74),(2803,'전라남도','함평군','엄다면',35.0072,126.518,52,71),(2804,'전라남도','함평군','월야면',35.1769,126.634,54,75),(2805,'전라남도','함평군','학교면',35.0138,126.54,53,71),(2806,'전라남도','함평군','함평읍',35.0623,126.522,52,72),(2807,'전라남도','함평군','해보면',35.1774,126.603,54,75),(2808,'전라남도','해남군','계곡면',34.642,126.662,55,63),(2809,'전라남도','해남군','마산면',34.6185,126.57,53,62),(2810,'전라남도','해남군','문내면',34.5888,126.311,49,62),(2811,'전라남도','해남군','북일면',34.461,126.678,55,59),(2812,'전라남도','해남군','북평면',34.405,126.627,54,58),(2813,'전라남도','해남군','산이면',34.6416,126.45,51,63),(2814,'전라남도','해남군','삼산면',34.5177,126.612,54,60),(2815,'전라남도','해남군','송지면',34.3664,126.521,52,57),(2816,'전라남도','해남군','옥천면',34.5644,126.65,55,61),(2817,'전라남도','해남군','해남읍',34.562,126.601,54,61),(2818,'전라남도','해남군','현산면',34.4567,126.556,53,59),(2819,'전라남도','해남군','화산면',34.4882,126.517,52,60),(2820,'전라남도','해남군','화원면',34.6678,126.33,49,64),(2821,'전라남도','해남군','황산면',34.5738,126.438,51,61),(2822,'전라남도','화순군','남면',35.0042,127.098,63,71),(2823,'전라남도','화순군','능주면',34.9868,126.96,60,71),(2824,'전라남도','화순군','도곡면',34.9931,126.92,59,71),(2825,'전라남도','화순군','도암면',34.9347,126.899,59,69),(2826,'전라남도','화순군','동면',35.0269,127.041,62,71),(2827,'전라남도','화순군','동복면',35.0681,127.131,63,72),(2828,'전라남도','화순군','북면',35.1651,127.134,63,75),(2829,'전라남도','화순군','이서면',35.1074,127.073,62,73),(2830,'전라남도','화순군','이양면',34.8848,126.991,61,68),(2831,'전라남도','화순군','청풍면',34.8732,126.972,60,68),(2832,'전라남도','화순군','춘양면',34.9475,126.962,60,70),(2833,'전라남도','화순군','한천면',34.9748,127.001,61,70),(2834,'전라남도','화순군','화순읍',35.0569,126.987,61,72),(2835,'전라북도','고창군','고수면',35.4069,126.681,55,80),(2836,'전라북도','고창군','고창읍',35.4314,126.705,56,80),(2837,'전라북도','고창군','공음면',35.3747,126.514,52,79),(2838,'전라북도','고창군','대산면',35.338,126.605,54,78),(2839,'전라북도','고창군','무장면',35.4162,126.563,53,80),(2840,'전라북도','고창군','부안면',35.5112,126.676,55,82),(2841,'전라북도','고창군','상하면',35.4415,126.497,52,80),(2842,'전라북도','고창군','성내면',35.5349,126.745,56,83),(2843,'전라북도','고창군','성송면',35.3613,126.649,55,79),(2844,'전라북도','고창군','신림면',35.486,126.714,56,81),(2845,'전라북도','고창군','심원면',35.5213,126.553,53,82),(2846,'전라북도','고창군','아산면',35.4368,126.637,54,80),(2847,'전라북도','고창군','해리면',35.4579,126.541,53,81),(2848,'전라북도','고창군','흥덕면',35.5148,126.706,56,82),(2849,'전라북도','군산시','개정동',35.9614,126.757,56,92),(2850,'전라북도','군산시','개정면',35.9554,126.799,57,92),(2851,'전라북도','군산시','경암동',35.9766,126.732,56,92),(2852,'전라북도','군산시','구암동',35.9827,126.746,56,92),(2853,'전라북도','군산시','나운1동',35.9638,126.697,55,92),(2854,'전라북도','군산시','나운2동',35.9619,126.702,55,92),(2855,'전라북도','군산시','나운3동',35.9558,126.691,55,92),(2856,'전라북도','군산시','나포면',36.0246,126.835,58,93),(2857,'전라북도','군산시','대야면',35.9436,126.814,57,91),(2858,'전라북도','군산시','미성동',35.9564,126.659,55,92),(2859,'전라북도','군산시','삼학동',35.9722,126.713,56,92),(2860,'전라북도','군산시','서수면',35.9803,126.878,58,92),(2861,'전라북도','군산시','성산면',35.9867,126.788,57,92),(2862,'전라북도','군산시','소룡동',35.9714,126.681,55,92),(2863,'전라북도','군산시','수송동',35.9625,126.716,56,92),(2864,'전라북도','군산시','신풍동',35.9699,126.703,55,92),(2865,'전라북도','군산시','옥구읍',35.92,126.687,55,91),(2866,'전라북도','군산시','옥도면',36.1166,125.979,43,95),(2867,'전라북도','군산시','옥산면',35.9365,126.75,56,91),(2868,'전라북도','군산시','옥서면',35.9214,126.647,54,91),(2869,'전라북도','군산시','월명동',35.9874,126.712,56,92),(2870,'전라북도','군산시','임피면',35.9795,126.853,58,92),(2871,'전라북도','군산시','조촌동',35.9701,126.74,56,92),(2872,'전라북도','군산시','중앙동',35.9826,126.721,56,92),(2873,'전라북도','군산시','해신동',35.9868,126.709,55,92),(2874,'전라북도','군산시','회현면',35.9101,126.759,56,91),(2875,'전라북도','군산시','흥남동',35.9725,126.719,56,92),(2876,'전라북도','김제시','검산동',35.8045,126.914,59,88),(2877,'전라북도','김제시','공덕면',35.8893,126.915,59,90),(2878,'전라북도','김제시','광활면',35.8308,126.744,56,89),(2879,'전라북도','김제시','교동월촌동',35.7965,126.879,59,88),(2880,'전라북도','김제시','금구면',35.7714,127.013,61,88),(2881,'전라북도','김제시','금산면',35.7136,126.998,61,86),(2882,'전라북도','김제시','만경읍',35.8514,126.822,58,89),(2883,'전라북도','김제시','백구면',35.8877,126.97,60,90),(2884,'전라북도','김제시','백산면',35.825,126.894,59,89),(2885,'전라북도','김제시','봉남면',35.7506,126.964,60,87),(2886,'전라북도','김제시','부량면',35.7309,126.846,58,87),(2887,'전라북도','김제시','성덕면',35.8175,126.808,57,89),(2888,'전라북도','김제시','신풍동',35.793,126.9,59,88),(2889,'전라북도','김제시','요촌동',35.8022,126.894,59,88),(2890,'전라북도','김제시','용지면',35.8507,126.958,60,89),(2891,'전라북도','김제시','죽산면',35.7694,126.816,57,88),(2892,'전라북도','김제시','진봉면',35.856,126.768,57,90),(2893,'전라북도','김제시','청하면',35.9004,126.843,58,90),(2894,'전라북도','김제시','황산면',35.7916,126.944,60,88),(2895,'전라북도','남원시','금동',35.3994,127.377,67,80),(2896,'전라북도','남원시','금지면',35.3545,127.306,66,79),(2897,'전라북도','남원시','노암동',35.3965,127.382,68,80),(2898,'전라북도','남원시','대강면',35.3443,127.23,65,78),(2899,'전라북도','남원시','대산면',35.4291,127.327,67,80),(2900,'전라북도','남원시','덕과면',35.5141,127.354,67,82),(2901,'전라북도','남원시','도통동',35.4168,127.402,68,80),(2902,'전라북도','남원시','동충동',35.408,127.385,68,80),(2903,'전라북도','남원시','보절면',35.5101,127.404,68,82),(2904,'전라북도','남원시','사매면',35.4955,127.363,67,82),(2905,'전라북도','남원시','산내면',35.4161,127.625,72,80),(2906,'전라북도','남원시','산동면',35.4897,127.478,69,82),(2907,'전라북도','남원시','송동면',35.3516,127.339,67,79),(2908,'전라북도','남원시','수지면',35.3362,127.374,67,78),(2909,'전라북도','남원시','아영면',35.5056,127.615,72,82),(2910,'전라북도','남원시','왕정동',35.4052,127.372,67,80),(2911,'전라북도','남원시','운봉읍',35.4367,127.531,70,81),(2912,'전라북도','남원시','이백면',35.4238,127.46,69,80),(2913,'전라북도','남원시','인월면',35.4613,127.602,71,81),(2914,'전라북도','남원시','주생면',35.3758,127.324,67,79),(2915,'전라북도','남원시','주천면',35.3878,127.444,69,79),(2916,'전라북도','남원시','죽항동',35.4045,127.387,68,80),(2917,'전라북도','남원시','향교동',35.414,127.383,68,80),(2918,'전라북도','무주군','무주읍',36.0058,127.664,72,93),(2919,'전라북도','무주군','무풍면',35.9669,127.847,76,92),(2920,'전라북도','무주군','부남면',35.9708,127.561,71,92),(2921,'전라북도','무주군','설천면',36.0052,127.792,75,93),(2922,'전라북도','무주군','안성면',35.8604,127.655,72,90),(2923,'전라북도','무주군','적상면',35.9425,127.662,72,92),(2924,'전라북도','부안군','계화면',35.7587,126.7,55,87),(2925,'전라북도','부안군','동진면',35.7466,126.741,56,87),(2926,'전라북도','부안군','백산면',35.701,126.789,57,86),(2927,'전라북도','부안군','변산면',35.6605,126.53,52,85),(2928,'전라북도','부안군','보안면',35.6091,126.673,55,84),(2929,'전라북도','부안군','부안읍',35.7267,126.739,56,87),(2930,'전라북도','부안군','상서면',35.6834,126.68,55,86),(2931,'전라북도','부안군','위도면',35.5998,126.295,48,84),(2932,'전라북도','부안군','주산면',35.6689,126.713,56,85),(2933,'전라북도','부안군','줄포면',35.5873,126.68,55,84),(2934,'전라북도','부안군','진서면',35.5847,126.607,54,84),(2935,'전라북도','부안군','하서면',35.7125,126.664,55,86),(2936,'전라북도','부안군','행안면',35.7232,126.726,56,87),(2937,'전라북도','순창군','구림면',35.4499,127.104,63,81),(2938,'전라북도','순창군','금과면',35.3366,127.089,62,78),(2939,'전라북도','순창군','동계면',35.4385,127.244,65,81),(2940,'전라북도','순창군','복흥면',35.4291,126.932,60,80),(2941,'전라북도','순창군','순창읍',35.3739,127.149,63,79),(2942,'전라북도','순창군','쌍치면',35.4975,127.003,61,82),(2943,'전라북도','순창군','유등면',35.3583,127.19,64,79),(2944,'전라북도','순창군','인계면',35.4088,127.143,63,80),(2945,'전라북도','순창군','적성면',35.3945,127.211,65,80),(2946,'전라북도','순창군','팔덕면',35.3885,127.099,63,79),(2947,'전라북도','순창군','풍산면',35.3342,127.141,63,78),(2948,'전라북도','완주군','경천면',36.0196,127.255,65,93),(2949,'전라북도','완주군','고산면',35.9735,127.207,64,92),(2950,'전라북도','완주군','구이면',35.7289,127.123,63,87),(2951,'전라북도','완주군','동상면',35.9339,127.299,66,91),(2952,'전라북도','완주군','봉동읍',35.9343,127.164,64,91),(2953,'전라북도','완주군','비봉면',35.9929,127.142,63,93),(2954,'전라북도','완주군','삼례읍',35.9065,127.074,62,91),(2955,'전라북도','완주군','상관면',35.764,127.213,64,88),(2956,'전라북도','완주군','소양면',35.853,127.235,65,90),(2957,'전라북도','완주군','용진면',35.8774,127.158,63,90),(2958,'전라북도','완주군','운주면',36.0895,127.28,66,95),(2959,'전라북도','완주군','이서면',35.8176,127.025,61,89),(2960,'전라북도','완주군','화산면',36.0327,127.206,64,93),(2961,'전라북도','익산시','금마면',35.9901,127.055,62,92),(2962,'전라북도','익산시','남중동',35.9481,126.961,60,92),(2963,'전라북도','익산시','낭산면',36.0751,127.012,61,94),(2964,'전라북도','익산시','동산동',35.9267,126.963,60,91),(2965,'전라북도','익산시','마동',35.9349,126.96,60,91),(2966,'전라북도','익산시','망성면',36.1297,127.023,61,96),(2967,'전라북도','익산시','모현동',35.9452,126.947,60,91),(2968,'전라북도','익산시','삼기면',36.0173,126.986,60,93),(2969,'전라북도','익산시','삼성동',35.9597,126.992,60,92),(2970,'전라북도','익산시','성당면',36.0853,126.937,59,95),(2971,'전라북도','익산시','송학동',35.9353,126.943,60,91),(2972,'전라북도','익산시','신동',35.9568,126.963,60,92),(2973,'전라북도','익산시','어양동',35.9524,126.986,60,92),(2974,'전라북도','익산시','여산면',36.0557,127.088,62,94),(2975,'전라북도','익산시','영등1동',35.9494,126.975,60,92),(2976,'전라북도','익산시','영등2동',35.9572,126.979,60,92),(2977,'전라북도','익산시','오산면',35.9357,126.918,59,91),(2978,'전라북도','익산시','왕궁면',35.9634,127.09,62,92),(2979,'전라북도','익산시','용동면',36.107,126.995,60,95),(2980,'전라북도','익산시','용안면',36.1171,126.954,60,95),(2981,'전라북도','익산시','웅포면',36.0615,126.879,58,94),(2982,'전라북도','익산시','인화동',35.9265,126.956,60,91),(2983,'전라북도','익산시','중앙동',35.9368,126.954,60,91),(2984,'전라북도','익산시','춘포면',35.8977,127.007,61,90),(2985,'전라북도','익산시','팔봉동',35.9634,127.016,61,92),(2986,'전라북도','익산시','평화동',35.9292,126.948,60,91),(2987,'전라북도','익산시','함라면',36.057,126.912,59,94),(2988,'전라북도','익산시','함열읍',36.0717,126.967,60,94),(2989,'전라북도','익산시','황등면',36.0015,126.947,60,93),(2990,'전라북도','임실군','강진면',35.5273,127.166,64,82),(2991,'전라북도','임실군','관촌면',35.6708,127.273,66,86),(2992,'전라북도','임실군','덕치면',35.5071,127.159,64,82),(2993,'전라북도','임실군','삼계면',35.5046,127.277,66,82),(2994,'전라북도','임실군','성수면',35.6269,127.335,67,85),(2995,'전라북도','임실군','신덕면',35.6809,127.18,64,86),(2996,'전라북도','임실군','신평면',35.654,127.226,65,85),(2997,'전라북도','임실군','오수면',35.5383,127.329,67,83),(2998,'전라북도','임실군','운암면',35.6606,127.158,63,85),(2999,'전라북도','임실군','임실읍',35.6104,127.281,66,84),(3000,'전라북도','임실군','지사면',35.5609,127.36,67,83),(3001,'전라북도','임실군','청웅면',35.5668,127.203,64,83),(3002,'전라북도','장수군','계남면',35.6999,127.58,71,86),(3003,'전라북도','장수군','계북면',35.7825,127.615,72,88),(3004,'전라북도','장수군','번암면',35.529,127.546,70,83),(3005,'전라북도','장수군','산서면',35.581,127.398,68,84),(3006,'전라북도','장수군','장계면',35.7289,127.591,71,87),(3007,'전라북도','장수군','장수읍',35.6511,127.522,70,85),(3008,'전라북도','장수군','천천면',35.7305,127.535,70,87),(3009,'전라북도','전주시덕진구','금암1동',35.8344,127.135,63,89),(3010,'전라북도','전주시덕진구','금암2동',35.8356,127.145,63,89),(3011,'전라북도','전주시덕진구','덕진동',35.8424,127.123,63,89),(3012,'전라북도','전주시덕진구','동산동',35.8681,127.077,62,90),(3013,'전라북도','전주시덕진구','송천1동',35.8542,127.123,63,90),(3014,'전라북도','전주시덕진구','송천2동',35.8581,127.122,63,90),(3015,'전라북도','전주시덕진구','우아1동',35.8469,127.162,64,89),(3016,'전라북도','전주시덕진구','우아2동',35.8348,127.169,64,89),(3017,'전라북도','전주시덕진구','인후1동',35.8345,127.159,63,89),(3018,'전라북도','전주시덕진구','인후2동',35.8369,127.148,63,89),(3019,'전라북도','전주시덕진구','인후3동',35.8251,127.163,64,89),(3020,'전라북도','전주시덕진구','조촌동',35.8722,127.078,62,90),(3021,'전라북도','전주시덕진구','진북동',35.825,127.134,63,89),(3022,'전라북도','전주시덕진구','팔복동',35.8506,127.108,63,89),(3023,'전라북도','전주시덕진구','호성동',35.8606,127.152,63,90),(3024,'전라북도','전주시완산구','노송동',35.8214,127.16,63,89),(3025,'전라북도','전주시완산구','동서학동',35.8065,127.154,63,89),(3026,'전라북도','전주시완산구','삼천1동',35.7977,127.124,63,88),(3027,'전라북도','전주시완산구','삼천2동',35.7934,127.124,63,88),(3028,'전라북도','전주시완산구','삼천3동',35.7939,127.116,63,88),(3029,'전라북도','전주시완산구','서서학동',35.8028,127.151,63,88),(3030,'전라북도','전주시완산구','서신동',35.8278,127.118,63,89),(3031,'전라북도','전주시완산구','완산동',35.8062,127.137,63,88),(3032,'전라북도','전주시완산구','중앙동',35.8205,127.143,63,89),(3033,'전라북도','전주시완산구','중화산1동',35.8116,127.127,63,89),(3034,'전라북도','전주시완산구','중화산2동',35.8186,127.118,63,89),(3035,'전라북도','전주시완산구','평화1동',35.7951,127.143,63,88),(3036,'전라북도','전주시완산구','평화2동',35.7839,127.137,63,88),(3037,'전라북도','전주시완산구','풍남동',35.814,127.15,63,89),(3038,'전라북도','전주시완산구','효자1동',35.8029,127.132,63,88),(3039,'전라북도','전주시완산구','효자2동',35.8039,127.122,63,88),(3040,'전라북도','전주시완산구','효자3동',35.8036,127.112,63,88),(3041,'전라북도','전주시완산구','효자4동',35.8097,127.112,63,89),(3042,'전라북도','정읍시','감곡면',35.7119,126.931,59,86),(3043,'전라북도','정읍시','고부면',35.6156,126.774,57,84),(3044,'전라북도','정읍시','내장상동',35.5544,126.871,58,83),(3045,'전라북도','정읍시','농소동',35.5803,126.831,58,84),(3046,'전라북도','정읍시','덕천면',35.6156,126.845,58,84),(3047,'전라북도','정읍시','북면',35.6062,126.894,59,84),(3048,'전라북도','정읍시','산내면',35.5653,127.032,61,83),(3049,'전라북도','정읍시','산외면',35.6184,127.044,61,84),(3050,'전라북도','정읍시','상교동',35.5471,126.84,58,83),(3051,'전라북도','정읍시','소성면',35.5538,126.785,57,83),(3052,'전라북도','정읍시','수성동',35.5662,126.855,58,83),(3053,'전라북도','정읍시','시기3동',35.5589,126.855,58,83),(3054,'전라북도','정읍시','시기동',35.5628,126.851,58,83),(3055,'전라북도','정읍시','신태인읍',35.6851,126.889,59,86),(3056,'전라북도','정읍시','연지동',35.5654,126.847,58,83),(3057,'전라북도','정읍시','영원면',35.6521,126.787,57,85),(3058,'전라북도','정읍시','옹동면',35.6405,126.977,60,85),(3059,'전라북도','정읍시','이평면',35.6619,126.84,58,85),(3060,'전라북도','정읍시','입암면',35.5008,126.795,57,82),(3061,'전라북도','정읍시','장명동',35.5646,126.859,58,83),(3062,'전라북도','정읍시','정우면',35.6419,126.878,59,85),(3063,'전라북도','정읍시','칠보면',35.5996,126.996,61,84),(3064,'전라북도','정읍시','태인면',35.6477,126.935,60,85),(3065,'전라북도','진안군','동향면',35.8352,127.57,71,89),(3066,'전라북도','진안군','마령면',35.7314,127.373,67,87),(3067,'전라북도','진안군','백운면',35.6895,127.4,68,86),(3068,'전라북도','진안군','부귀면',35.834,127.363,67,89),(3069,'전라북도','진안군','상전면',35.8199,127.489,69,89),(3070,'전라북도','진안군','성수면',35.7055,127.326,66,86),(3071,'전라북도','진안군','안천면',35.8942,127.555,70,91),(3072,'전라북도','진안군','용담면',35.9637,127.522,70,92),(3073,'전라북도','진안군','정천면',35.8701,127.431,68,90),(3074,'전라북도','진안군','주천면',35.9722,127.428,68,92),(3075,'전라북도','진안군','진안읍',35.7863,127.425,68,88),(3076,'제주특별자치도','서귀포시','남원읍',33.2764,126.722,56,33),(3077,'제주특별자치도','서귀포시','대륜동',33.2448,126.513,52,32),(3078,'제주특별자치도','서귀포시','대정읍/마라도포함',33.2236,126.254,48,32),(3079,'제주특별자치도','서귀포시','대천동',33.2475,126.48,52,32),(3080,'제주특별자치도','서귀포시','동홍동',33.263,126.569,53,33),(3081,'제주특별자치도','서귀포시','서홍동',33.2606,126.553,53,33),(3082,'제주특별자치도','서귀포시','성산읍',33.4388,126.913,60,37),(3083,'제주특별자치도','서귀포시','송산동',33.2418,126.568,53,32),(3084,'제주특별자치도','서귀포시','안덕면',33.2464,126.339,49,32),(3085,'제주특별자치도','서귀포시','영천동',33.2656,126.589,54,33),(3086,'제주특별자치도','서귀포시','예래동',33.251,126.4,50,32),(3087,'제주특별자치도','서귀포시','정방동',33.2426,126.567,53,32),(3088,'제주특별자치도','서귀포시','중문동',33.2482,126.437,51,32),(3089,'제주특별자치도','서귀포시','중앙동',33.2474,126.567,53,32),(3090,'제주특별자치도','서귀포시','천지동',33.2446,126.563,53,32),(3091,'제주특별자치도','서귀포시','표선면',33.3238,126.834,58,34),(3092,'제주특별자치도','서귀포시','효돈동',33.26,126.618,54,33),(3093,'제주특별자치도','이어도','이어도',32.1349,125.197,28,8),(3094,'제주특별자치도','제주시','건입동',33.5117,126.534,53,38),(3095,'제주특별자치도','제주시','구좌읍',33.5193,126.854,59,38),(3096,'제주특별자치도','제주시','노형동',33.4798,126.479,52,38),(3097,'제주특별자치도','제주시','도두동',33.4999,126.47,52,38),(3098,'제주특별자치도','제주시','봉개동',33.4885,126.597,54,38),(3099,'제주특별자치도','제주시','삼도1동',33.5004,126.52,53,38),(3100,'제주특별자치도','제주시','삼도2동',33.5084,126.524,53,38),(3101,'제주특별자치도','제주시','삼양동',33.5187,126.588,54,38),(3102,'제주특별자치도','제주시','아라동',33.4731,126.547,53,37),(3103,'제주특별자치도','제주시','애월읍',33.4587,126.331,49,37),(3104,'제주특별자치도','제주시','연동',33.4849,126.499,52,38),(3105,'제주특별자치도','제주시','오라동',33.4919,126.514,52,38),(3106,'제주특별자치도','제주시','외도동',33.4896,126.434,51,38),(3107,'제주특별자치도','제주시','용담1동',33.5063,126.516,52,38),(3108,'제주특별자치도','제주시','용담2동',33.5082,126.514,52,38),(3109,'제주특별자치도','제주시','우도면',33.5033,126.955,60,38),(3110,'제주특별자치도','제주시','이도1동',33.5052,126.528,53,38),(3111,'제주특별자치도','제주시','이도2동',33.4939,126.537,53,38),(3112,'제주특별자치도','제주시','이호동',33.4966,126.46,51,38),(3113,'제주특별자치도','제주시','일도1동',33.5117,126.528,53,38),(3114,'제주특별자치도','제주시','일도2동',33.5085,126.54,53,38),(3115,'제주특별자치도','제주시','조천읍',33.5312,126.636,55,39),(3116,'제주특별자치도','제주시','추자면',33.9595,126.296,48,48),(3117,'제주특별자치도','제주시','한경면',33.3474,126.186,46,35),(3118,'제주특별자치도','제주시','한림읍',33.4071,126.269,48,36),(3119,'제주특별자치도','제주시','화북동',33.517,126.567,53,38),(3120,'충청남도','계룡시','금암동',36.2707,127.252,65,99),(3121,'충청남도','계룡시','두마면',36.264,127.275,65,98),(3122,'충청남도','계룡시','신도안면',36.2874,127.255,65,99),(3123,'충청남도','계룡시','엄사면',36.2856,127.242,65,99),(3124,'충청남도','공주시','계룡면',36.3574,127.144,63,100),(3125,'충청남도','공주시','금학동',36.4359,127.121,63,102),(3126,'충청남도','공주시','반포면',36.394,127.252,65,101),(3127,'충청남도','공주시','사곡면',36.4993,127.027,61,104),(3128,'충청남도','공주시','신관동',36.4693,127.135,63,103),(3129,'충청남도','공주시','신풍면',36.5118,126.958,60,104),(3130,'충청남도','공주시','옥룡동',36.4546,127.139,63,103),(3131,'충청남도','공주시','우성면',36.468,127.052,61,103),(3132,'충청남도','공주시','웅진동',36.4557,127.122,63,103),(3133,'충청남도','공주시','유구읍',36.5499,126.953,60,105),(3134,'충청남도','공주시','의당면',36.4966,127.143,63,104),(3135,'충청남도','공주시','이인면',36.359,127.065,62,101),(3136,'충청남도','공주시','장기면',36.4938,127.208,64,103),(3137,'충청남도','공주시','정안면',36.6058,127.122,63,106),(3138,'충청남도','공주시','중학동',36.4496,127.124,63,102),(3139,'충청남도','공주시','탄천면',36.3271,127.032,61,100),(3140,'충청남도','금산군','군북면',36.166,127.53,70,96),(3141,'충청남도','금산군','금산읍',36.1043,127.493,69,95),(3142,'충청남도','금산군','금성면',36.1279,127.456,69,96),(3143,'충청남도','금산군','남이면',36.0424,127.439,68,94),(3144,'충청남도','금산군','남일면',36.0399,127.507,70,94),(3145,'충청남도','금산군','복수면',36.1635,127.4,68,96),(3146,'충청남도','금산군','부리면',36.0578,127.557,70,94),(3147,'충청남도','금산군','제원면',36.1096,127.548,70,95),(3148,'충청남도','금산군','진산면',36.1413,127.372,67,96),(3149,'충청남도','금산군','추부면',36.1919,127.478,69,97),(3150,'충청남도','논산시','가야곡면',36.1339,127.161,63,96),(3151,'충청남도','논산시','강경읍',36.1551,127.02,61,96),(3152,'충청남도','논산시','광석면',36.24,127.082,62,98),(3153,'충청남도','논산시','노성면',36.2752,127.132,63,99),(3154,'충청남도','논산시','벌곡면',36.203,127.267,65,97),(3155,'충청남도','논산시','부적면',36.2131,127.13,63,97),(3156,'충청남도','논산시','부창동',36.1999,127.084,62,97),(3157,'충청남도','논산시','상월면',36.2926,127.143,63,99),(3158,'충청남도','논산시','성동면',36.2006,127.036,61,97),(3159,'충청남도','논산시','양촌면',36.1356,127.235,65,96),(3160,'충청남도','논산시','연무읍',36.1222,127.101,62,95),(3161,'충청남도','논산시','연산면',36.2105,127.203,64,97),(3162,'충청남도','논산시','은진면',36.1645,127.109,62,96),(3163,'충청남도','논산시','채운면',36.1705,127.065,62,96),(3164,'충청남도','논산시','취암동',36.1963,127.089,62,97),(3165,'충청남도','당진시','고대면',36.9231,126.599,53,113),(3166,'충청남도','당진시','당진1동',36.887,126.628,54,112),(3167,'충청남도','당진시','당진2동',36.887,126.628,54,112),(3168,'충청남도','당진시','당진3동',36.887,126.628,54,112),(3169,'충청남도','당진시','대호지면',36.8972,126.506,52,112),(3170,'충청남도','당진시','면천면',36.8146,126.669,55,110),(3171,'충청남도','당진시','석문면',36.9791,126.593,53,114),(3172,'충청남도','당진시','송산면',36.9296,126.681,55,113),(3173,'충청남도','당진시','송악읍',36.8911,126.691,55,112),(3174,'충청남도','당진시','순성면',36.841,126.715,55,111),(3175,'충청남도','당진시','신평면',36.8825,126.776,56,112),(3176,'충청남도','당진시','우강면',36.8106,126.79,57,110),(3177,'충청남도','당진시','정미면',36.8796,126.57,53,112),(3178,'충청남도','당진시','합덕읍',36.8071,126.766,56,110),(3179,'충청남도','보령시','남포면',36.3017,126.607,54,99),(3180,'충청남도','보령시','대천1동',36.349,126.599,53,100),(3181,'충청남도','보령시','대천2동',36.3503,126.592,53,100),(3182,'충청남도','보령시','대천3동',36.3517,126.608,54,100),(3183,'충청남도','보령시','대천4동',36.3375,126.603,54,100),(3184,'충청남도','보령시','대천5동',36.3122,126.514,52,99),(3185,'충청남도','보령시','미산면',36.2076,126.678,55,97),(3186,'충청남도','보령시','성주면',36.3331,126.653,54,100),(3187,'충청남도','보령시','오천면',36.4355,126.525,52,102),(3188,'충청남도','보령시','웅천읍',36.2288,126.603,54,98),(3189,'충청남도','보령시','주교면',36.388,126.571,53,101),(3190,'충청남도','보령시','주산면',36.1954,126.634,54,97),(3191,'충청남도','보령시','주포면',36.4122,126.59,53,102),(3192,'충청남도','보령시','천북면',36.4758,126.529,52,103),(3193,'충청남도','보령시','청라면',36.3875,126.676,55,101),(3194,'충청남도','보령시','청소면',36.4426,126.592,53,102),(3195,'충청남도','부여군','구룡면',36.2497,126.815,57,98),(3196,'충청남도','부여군','규암면',36.2724,126.886,59,99),(3197,'충청남도','부여군','남면',36.2092,126.808,57,97),(3198,'충청남도','부여군','내산면',36.2719,126.783,57,99),(3199,'충청남도','부여군','부여읍',36.2727,126.913,59,99),(3200,'충청남도','부여군','석성면',36.2503,127.004,61,98),(3201,'충청남도','부여군','세도면',36.167,126.951,60,96),(3202,'충청남도','부여군','양화면',36.1324,126.883,59,96),(3203,'충청남도','부여군','옥산면',36.1885,126.736,56,97),(3204,'충청남도','부여군','외산면',36.3014,126.706,55,99),(3205,'충청남도','부여군','은산면',36.3074,126.856,58,99),(3206,'충청남도','부여군','임천면',36.1882,126.897,59,97),(3207,'충청남도','부여군','장암면',36.241,126.889,59,98),(3208,'충청남도','부여군','초촌면',36.2611,127.022,61,98),(3209,'충청남도','부여군','충화면',36.1789,126.824,57,97),(3210,'충청남도','부여군','홍산면',36.2138,126.762,56,97),(3211,'충청남도','서산시','고북면',36.6642,126.536,52,107),(3212,'충청남도','서산시','대산읍',36.9368,126.436,51,113),(3213,'충청남도','서산시','동문1동',36.787,126.461,51,110),(3214,'충청남도','서산시','동문2동',36.7779,126.462,51,110),(3215,'충청남도','서산시','부석면',36.7121,126.396,50,108),(3216,'충청남도','서산시','부춘동',36.7832,126.45,51,110),(3217,'충청남도','서산시','석남동',36.763,126.456,51,109),(3218,'충청남도','서산시','성연면',36.8363,126.463,51,111),(3219,'충청남도','서산시','수석동',36.7684,126.469,51,109),(3220,'충청남도','서산시','운산면',36.8078,126.583,53,110),(3221,'충청남도','서산시','음암면',36.7971,126.52,52,110),(3222,'충청남도','서산시','인지면',36.7501,126.428,50,109),(3223,'충청남도','서산시','지곡면',36.8606,126.439,51,111),(3224,'충청남도','서산시','팔봉면',36.809,126.352,49,110),(3225,'충청남도','서산시','해미면',36.7108,126.547,53,108),(3226,'충청남도','서천군','기산면',36.0717,126.764,56,94),(3227,'충청남도','서천군','마산면',36.1144,126.793,57,95),(3228,'충청남도','서천군','마서면',36.0589,126.709,55,94),(3229,'충청남도','서천군','문산면',36.1394,126.754,56,96),(3230,'충청남도','서천군','비인면',36.1393,126.604,54,96),(3231,'충청남도','서천군','서면',36.15,126.552,53,96),(3232,'충청남도','서천군','서천읍',36.0747,126.692,55,94),(3233,'충청남도','서천군','시초면',36.1189,126.755,56,95),(3234,'충청남도','서천군','장항읍',36.0076,126.702,55,93),(3235,'충청남도','서천군','종천면',36.0946,126.672,55,95),(3236,'충청남도','서천군','판교면',36.1549,126.691,55,96),(3237,'충청남도','서천군','한산면',36.0834,126.804,57,94),(3238,'충청남도','서천군','화양면',36.0348,126.784,57,93),(3239,'충청남도','아산시','도고면',36.7547,126.88,58,109),(3240,'충청남도','아산시','둔포면',36.9269,127.04,61,113),(3241,'충청남도','아산시','배방읍',36.75,127.034,61,109),(3242,'충청남도','아산시','선장면',36.7884,126.863,58,110),(3243,'충청남도','아산시','송악면',36.7288,127.011,61,109),(3244,'충청남도','아산시','신창면',36.8008,126.938,59,110),(3245,'충청남도','아산시','염치읍',36.8139,126.979,60,110),(3246,'충청남도','아산시','영인면',36.8536,126.957,60,111),(3247,'충청남도','아산시','온양1동',36.7842,127.002,60,110),(3248,'충청남도','아산시','온양2동',36.7755,127.005,60,110),(3249,'충청남도','아산시','온양3동',36.7847,127.015,61,110),(3250,'충청남도','아산시','온양4동',36.7857,126.986,60,110),(3251,'충청남도','아산시','온양5동',36.7726,126.998,60,109),(3252,'충청남도','아산시','온양6동',36.7581,127.018,61,109),(3253,'충청남도','아산시','음봉면',36.8469,127.014,61,111),(3254,'충청남도','아산시','인주면',36.8661,126.887,58,111),(3255,'충청남도','아산시','탕정면',36.7976,127.054,61,110),(3256,'충청남도','예산군','고덕면',36.7424,126.704,55,109),(3257,'충청남도','예산군','광시면',36.546,126.775,57,105),(3258,'충청남도','예산군','대술면',36.6547,126.894,59,107),(3259,'충청남도','예산군','대흥면',36.6039,126.79,57,106),(3260,'충청남도','예산군','덕산면',36.6987,126.668,55,108),(3261,'충청남도','예산군','봉산면',36.7458,126.684,55,109),(3262,'충청남도','예산군','삽교읍',36.685,126.741,56,108),(3263,'충청남도','예산군','신암면',36.7317,126.828,57,109),(3264,'충청남도','예산군','신양면',36.5986,126.871,58,106),(3265,'충청남도','예산군','예산읍',36.6758,126.848,58,107),(3266,'충청남도','예산군','오가면',36.6842,126.8,57,108),(3267,'충청남도','예산군','응봉면',36.6558,126.763,56,107),(3268,'충청남도','천안시동남구','광덕면',36.6958,127.113,62,108),(3269,'충청남도','천안시동남구','동면',36.7733,127.346,66,110),(3270,'충청남도','천안시동남구','목천읍',36.7822,127.237,65,110),(3271,'충청남도','천안시동남구','문성동',36.8113,127.154,63,110),(3272,'충청남도','천안시동남구','병천면',36.7636,127.305,66,109),(3273,'충청남도','천안시동남구','봉명동',36.8029,127.142,63,110),(3274,'충청남도','천안시동남구','북면',36.8246,127.275,65,111),(3275,'충청남도','천안시동남구','성남면',36.7396,127.239,65,109),(3276,'충청남도','천안시동남구','수신면',36.7282,127.283,65,109),(3277,'충청남도','천안시동남구','신방동',36.7851,127.122,63,110),(3278,'충청남도','천안시동남구','신안동',36.8156,127.16,63,110),(3279,'충청남도','천안시동남구','원성1동',36.8089,127.165,63,110),(3280,'충청남도','천안시동남구','원성2동',36.7986,127.163,63,110),(3281,'충청남도','천안시동남구','일봉동',36.7981,127.144,63,110),(3282,'충청남도','천안시동남구','중앙동',36.7972,127.155,63,110),(3283,'충청남도','천안시동남구','청룡동',36.7927,127.16,63,110),(3284,'충청남도','천안시동남구','풍세면',36.7193,127.121,63,108),(3285,'충청남도','천안시서북구','백석동',36.8168,127.118,62,110),(3286,'충청남도','천안시서북구','부성동',36.8398,127.154,63,111),(3287,'충청남도','천안시서북구','성거읍',36.8751,127.201,64,112),(3288,'충청남도','천안시서북구','성정1동',36.8122,127.145,63,110),(3289,'충청남도','천안시서북구','성정2동',36.8208,127.139,63,111),(3290,'충청남도','천안시서북구','성환읍',36.9154,127.136,63,113),(3291,'충청남도','천안시서북구','쌍용1동',36.8012,127.133,63,110),(3292,'충청남도','천안시서북구','쌍용2동',36.7934,127.125,63,110),(3293,'충청남도','천안시서북구','쌍용3동',36.8,127.121,63,110),(3294,'충청남도','천안시서북구','입장면',36.91,127.224,64,113),(3295,'충청남도','천안시서북구','직산읍',36.8758,127.153,63,112),(3296,'충청남도','청양군','남양면',36.3983,126.778,57,101),(3297,'충청남도','청양군','대치면',36.4415,126.834,58,102),(3298,'충청남도','청양군','목면',36.4161,127.006,61,102),(3299,'충청남도','청양군','비봉면',36.5165,126.789,57,104),(3300,'충청남도','청양군','운곡면',36.521,126.847,58,104),(3301,'충청남도','청양군','장평면',36.339,126.895,59,100),(3302,'충청남도','청양군','정산면',36.412,126.947,60,102),(3303,'충청남도','청양군','청남면',36.3494,126.954,60,100),(3304,'충청남도','청양군','청양읍',36.4506,126.809,57,102),(3305,'충청남도','청양군','화성면',36.4244,126.719,56,102),(3306,'충청남도','태안군','고남면',36.4175,126.411,50,102),(3307,'충청남도','태안군','근흥면',36.7108,126.23,47,108),(3308,'충청남도','태안군','남면',36.669,126.3,48,107),(3309,'충청남도','태안군','소원면',36.7596,126.199,46,109),(3310,'충청남도','태안군','안면읍',36.5176,126.346,49,104),(3311,'충청남도','태안군','원북면',36.8206,126.259,48,110),(3312,'충청남도','태안군','이원면',36.8669,126.283,48,111),(3313,'충청남도','태안군','태안읍',36.7547,126.298,48,109),(3314,'충청남도','홍성군','갈산면',36.6023,126.552,53,106),(3315,'충청남도','홍성군','결성면',36.5214,126.549,53,104),(3316,'충청남도','홍성군','광천읍',36.5016,126.627,54,104),(3317,'충청남도','홍성군','구항면',36.5848,126.613,54,105),(3318,'충청남도','홍성군','금마면',36.609,126.735,56,106),(3319,'충청남도','홍성군','서부면',36.5774,126.519,52,105),(3320,'충청남도','홍성군','은하면',36.529,126.593,53,104),(3321,'충청남도','홍성군','장곡면',36.5023,126.693,55,104),(3322,'충청남도','홍성군','홍동면',36.5562,126.69,55,105),(3323,'충청남도','홍성군','홍북면',36.6471,126.694,55,107),(3324,'충청남도','홍성군','홍성읍',36.5986,126.664,55,106),(3325,'충청북도','괴산군','감물면',36.8338,127.877,76,111),(3326,'충청북도','괴산군','괴산읍',36.8089,127.793,74,111),(3327,'충청북도','괴산군','문광면',36.787,127.787,74,110),(3328,'충청북도','괴산군','불정면',36.8695,127.856,75,112),(3329,'충청북도','괴산군','사리면',36.8141,127.651,72,111),(3330,'충청북도','괴산군','소수면',36.8529,127.747,73,111),(3331,'충청북도','괴산군','연풍면',36.7636,128.003,78,110),(3332,'충청북도','괴산군','장연면',36.8213,127.957,77,111),(3333,'충청북도','괴산군','청안면',36.7691,127.642,72,110),(3334,'충청북도','괴산군','청천면',36.6575,127.739,73,107),(3335,'충청북도','괴산군','칠성면',36.7851,127.866,75,110),(3336,'충청북도','단양군','가곡면',37.0256,128.388,84,115),(3337,'충청북도','단양군','단성면',36.9343,128.326,83,113),(3338,'충청북도','단양군','단양읍',36.9837,128.37,84,115),(3339,'충청북도','단양군','대강면',36.9194,128.354,84,113),(3340,'충청북도','단양군','매포읍',37.0295,128.306,83,116),(3341,'충청북도','단양군','어상천면',37.0994,128.361,84,117),(3342,'충청북도','단양군','영춘면',37.0758,128.49,86,117),(3343,'충청북도','단양군','적성면',36.9579,128.295,83,114),(3344,'충청북도','보은군','내북면',36.575,127.666,72,105),(3345,'충청북도','보은군','마로면',36.4328,127.823,75,102),(3346,'충청북도','보은군','보은읍',36.4806,127.719,73,103),(3347,'충청북도','보은군','산외면',36.5491,127.735,73,105),(3348,'충청북도','보은군','삼승면',36.3928,127.73,73,101),(3349,'충청북도','보은군','속리산면',36.5092,127.812,75,104),(3350,'충청북도','보은군','수한면',36.4764,127.701,73,103),(3351,'충청북도','보은군','장안면',36.4668,127.791,74,103),(3352,'충청북도','보은군','탄부면',36.4277,127.798,74,102),(3353,'충청북도','보은군','회남면',36.4424,127.581,71,102),(3354,'충청북도','보은군','회인면',36.4919,127.599,71,104),(3355,'충청북도','영동군','매곡면',36.1879,127.934,77,97),(3356,'충청북도','영동군','상촌면',36.1459,127.916,77,96),(3357,'충청북도','영동군','심천면',36.2352,127.723,73,98),(3358,'충청북도','영동군','양강면',36.1495,127.753,74,96),(3359,'충청북도','영동군','양산면',36.1193,127.671,72,95),(3360,'충청북도','영동군','영동읍',36.1683,127.778,74,97),(3361,'충청북도','영동군','용산면',36.2568,127.832,75,99),(3362,'충청북도','영동군','용화면',36.0178,127.769,74,93),(3363,'충청북도','영동군','추풍령면',36.2116,128.001,78,98),(3364,'충청북도','영동군','학산면',36.0964,127.687,73,95),(3365,'충청북도','영동군','황간면',36.2254,127.913,77,98),(3366,'충청북도','옥천군','군북면',36.3272,127.537,70,100),(3367,'충청북도','옥천군','군서면',36.2767,127.53,70,99),(3368,'충청북도','옥천군','동이면',36.2809,127.623,71,99),(3369,'충청북도','옥천군','안남면',36.3533,127.675,72,101),(3370,'충청북도','옥천군','안내면',36.3915,127.664,72,101),(3371,'충청북도','옥천군','옥천읍',36.3044,127.577,71,99),(3372,'충청북도','옥천군','이원면',36.2433,127.622,71,98),(3373,'충청북도','옥천군','청산면',36.3435,127.794,74,100),(3374,'충청북도','옥천군','청성면',36.3247,127.762,74,100),(3375,'충청북도','음성군','감곡면',37.1095,127.646,71,117),(3376,'충청북도','음성군','금왕읍',36.9892,127.6,71,114),(3377,'충청북도','음성군','대소면',36.9691,127.485,69,114),(3378,'충청북도','음성군','맹동면',36.9272,127.565,70,113),(3379,'충청북도','음성군','삼성면',37.0155,127.497,69,115),(3380,'충청북도','음성군','생극면',37.0317,127.609,71,115),(3381,'충청북도','음성군','소이면',36.9207,127.76,74,113),(3382,'충청북도','음성군','원남면',36.8726,127.651,72,112),(3383,'충청북도','음성군','음성읍',36.932,127.693,72,113),(3384,'충청북도','제천시','고암.모산동',37.1593,128.217,81,118),(3385,'충청북도','제천시','교동',37.1391,128.218,81,118),(3386,'충청북도','제천시','금성면',37.0587,128.171,81,116),(3387,'충청북도','제천시','남천.동현동',37.1319,128.219,81,118),(3388,'충청북도','제천시','덕산면',36.9092,128.167,81,113),(3389,'충청북도','제천시','백운면',37.135,128.028,78,118),(3390,'충청북도','제천시','봉양읍',37.1298,128.124,80,118),(3391,'충청북도','제천시','서부.영천동',37.1291,128.204,81,118),(3392,'충청북도','제천시','송학면',37.1821,128.263,82,119),(3393,'충청북도','제천시','수산면',36.9309,128.183,81,113),(3394,'충청북도','제천시','신백.두학동',37.1255,128.225,82,118),(3395,'충청북도','제천시','용두동',37.1391,128.203,81,118),(3396,'충청북도','제천시','중앙.의림.명동',37.1365,128.212,81,118),(3397,'충청북도','제천시','청전동',37.1461,128.217,81,118),(3398,'충청북도','제천시','청풍면',36.9976,128.17,81,115),(3399,'충청북도','제천시','한수면',36.8822,128.084,79,112),(3400,'충청북도','제천시','화산동',37.1279,128.213,81,118),(3401,'충청북도','증평군','도안면',36.8104,127.615,71,110),(3402,'충청북도','증평군','증평읍',36.7826,127.584,71,110),(3403,'충청북도','진천군','광혜원면',36.9905,127.438,68,114),(3404,'충청북도','진천군','덕산면',36.9109,127.511,69,113),(3405,'충청북도','진천군','문백면',36.7814,127.44,68,110),(3406,'충청북도','진천군','백곡면',36.881,127.379,67,112),(3407,'충청북도','진천군','이월면',36.9227,127.431,68,113),(3408,'충청북도','진천군','진천읍',36.852,127.443,68,111),(3409,'충청북도','진천군','초평면',36.843,127.529,70,111),(3410,'충청북도','청원군','가덕면',36.5507,127.551,70,105),(3411,'충청북도','청원군','강내면',36.6182,127.359,67,106),(3412,'충청북도','청원군','남이면',36.5575,127.436,68,105),(3413,'충청북도','청원군','남일면',36.584,127.512,69,106),(3414,'충청북도','청원군','낭성면',36.6197,127.606,71,106),(3415,'충청북도','청원군','내수읍',36.7209,127.538,70,109),(3416,'충청북도','청원군','문의면',36.5148,127.498,69,104),(3417,'충청북도','청원군','미원면',36.6333,127.661,72,107),(3418,'충청북도','청원군','부용면',36.5268,127.373,67,104),(3419,'충청북도','청원군','북이면',36.7366,127.544,70,109),(3420,'충청북도','청원군','오송읍',36.6063,127.327,66,106),(3421,'충청북도','청원군','오창읍',36.7394,127.457,68,109),(3422,'충청북도','청원군','옥산면',36.6617,127.378,67,107),(3423,'충청북도','청원군','현도면',36.4836,127.426,68,103),(3424,'충청북도','청주시상당구','금천동',36.6216,127.501,69,106),(3425,'충청북도','청주시상당구','내덕제1동',36.6554,127.485,69,107),(3426,'충청북도','청주시상당구','내덕제2동',36.6545,127.494,69,107),(3427,'충청북도','청주시상당구','성안동',36.6296,127.494,69,107),(3428,'충청북도','청주시상당구','영운동',36.6151,127.501,69,106),(3429,'충청북도','청주시상당구','오근장동',36.6913,127.483,69,108),(3430,'충청북도','청주시상당구','용담.명암.산성동',36.6322,127.506,69,107),(3431,'충청북도','청주시상당구','용암1동',36.6059,127.503,69,106),(3432,'충청북도','청주시상당구','용암2동',36.6041,127.51,69,106),(3433,'충청북도','청주시상당구','우암동',36.6443,127.488,69,107),(3434,'충청북도','청주시상당구','율량.사천동',36.6637,127.493,69,107),(3435,'충청북도','청주시상당구','중앙동',36.6369,127.49,69,107),(3436,'충청북도','청주시상당구','탑대성동',36.6303,127.499,69,107),(3437,'충청북도','청주시흥덕구','가경동',36.6259,127.435,68,106),(3438,'충청북도','청주시흥덕구','강서제1동',36.6238,127.428,68,106),(3439,'충청북도','청주시흥덕구','강서제2동',36.6585,127.43,68,107),(3440,'충청북도','청주시흥덕구','모충동',36.6248,127.479,69,106),(3441,'충청북도','청주시흥덕구','복대1동',36.6326,127.435,68,107),(3442,'충청북도','청주시흥덕구','복대2동',36.6233,127.446,68,106),(3443,'충청북도','청주시흥덕구','봉명1동',36.6374,127.462,68,107),(3444,'충청북도','청주시흥덕구','봉명2.송정동',36.6418,127.46,68,107),(3445,'충청북도','청주시흥덕구','분평동',36.6058,127.491,69,106),(3446,'충청북도','청주시흥덕구','사직제1동',36.6373,127.483,69,107),(3447,'충청북도','청주시흥덕구','사직제2동',36.6288,127.476,69,106),(3448,'충청북도','청주시흥덕구','사창동',36.6307,127.461,68,107),(3449,'충청북도','청주시흥덕구','산남동',36.6073,127.481,69,106),(3450,'충청북도','청주시흥덕구','성화.개신.죽림동',36.6142,127.45,68,106),(3451,'충청북도','청주시흥덕구','수곡1동',36.6154,127.482,69,106),(3452,'충청북도','청주시흥덕구','수곡2동',36.6144,127.474,69,106),(3453,'충청북도','청주시흥덕구','운천.신봉동',36.645,127.479,69,107),(3454,'충청북도','충주시','가금면',37.0261,127.859,75,115),(3455,'충청북도','충주시','교현.안림동',36.9719,127.937,77,114),(3456,'충청북도','충주시','교현2동',36.9786,127.931,76,114),(3457,'충청북도','충주시','금가면',37.0402,127.927,76,116),(3458,'충청북도','충주시','노은면',37.0453,127.756,73,116),(3459,'충청북도','충주시','달천동',36.9448,127.903,76,114),(3460,'충청북도','충주시','대소원면',36.9749,127.82,75,114),(3461,'충청북도','충주시','동량면',37.0234,127.965,77,115),(3462,'충청북도','충주시','목행.용탄동',37.0087,127.919,76,115),(3463,'충청북도','충주시','문화동',36.9689,127.928,76,114),(3464,'충청북도','충주시','봉방동',36.9715,127.918,76,114),(3465,'충청북도','충주시','산척면',37.0737,127.96,77,116),(3466,'충청북도','충주시','살미면',36.9024,127.967,77,113),(3467,'충청북도','충주시','성내.충인동',36.9705,127.936,77,114),(3468,'충청북도','충주시','소태면',37.1069,127.85,75,117),(3469,'충청북도','충주시','수안보면',36.8444,127.997,78,111),(3470,'충청북도','충주시','신니면',36.9929,127.739,73,114),(3471,'충청북도','충주시','앙성면',37.1048,127.755,73,117),(3472,'충청북도','충주시','엄정면',37.0837,127.917,76,117),(3473,'충청북도','충주시','연수동',36.9834,127.936,77,114),(3474,'충청북도','충주시','용산동',36.9613,127.941,77,114),(3475,'충청북도','충주시','주덕읍',36.9728,127.798,74,114),(3476,'충청북도','충주시','지현동',36.9654,127.935,77,114),(3477,'충청북도','충주시','칠금.금릉동',36.9791,127.921,76,114),(3478,'충청북도','충주시','호암.직동',36.9531,127.941,77,114);
/*!40000 ALTER TABLE `weather_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_data_logger`
--

/*!50001 DROP TABLE IF EXISTS `v_data_logger`*/;
/*!50001 DROP VIEW IF EXISTS `v_data_logger`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`upsas`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_data_logger` AS select concat(`dld`.`target_prefix`,'_',`dl`.`main_seq`,'_',`dl`.`target_code`) AS `dl_real_id`,concat(`dld`.`target_prefix`,'_',`dl`.`target_code`) AS `dl_id`,`dld`.`target_alias` AS `target_alias`,`m`.`name` AS `m_name`,`dl`.`data_logger_seq` AS `data_logger_seq`,`dl`.`main_seq` AS `main_seq`,`dl`.`data_logger_def_seq` AS `data_logger_def_seq`,`dl`.`target_id` AS `target_id`,`dl`.`target_code` AS `target_code`,`dl`.`connect_info` AS `connect_info`,`dl`.`protocol_info` AS `protocol_info` from ((`dv_data_logger` `dl` join `dv_data_logger_def` `dld` on(`dld`.`data_logger_def_seq` = `dl`.`data_logger_def_seq`)) join `main` `m` on(`m`.`main_seq` = `dl`.`main_seq`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_inverter_status`
--

/*!50001 DROP TABLE IF EXISTS `v_inverter_status`*/;
/*!50001 DROP VIEW IF EXISTS `v_inverter_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`upsas`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_inverter_status` AS select `inverter`.`inverter_seq` AS `inverter_seq`,`inverter`.`target_id` AS `target_id`,`inverter`.`target_name` AS `target_name`,`inverter`.`target_type` AS `target_type`,`inverter`.`target_category` AS `target_category`,`inverter`.`connect_type` AS `connect_type`,`inverter`.`dialing` AS `dialing`,`inverter`.`host` AS `host`,`inverter`.`port` AS `port`,`inverter`.`baud_rate` AS `baud_rate`,`inverter`.`code` AS `code`,`inverter`.`amount` AS `amount`,`inverter`.`director_name` AS `director_name`,`inverter`.`director_tel` AS `director_tel`,`inverter`.`chart_color` AS `chart_color`,`inverter`.`chart_sort_rank` AS `chart_sort_rank`,`inverter`.`compare_inverter_seq` AS `compare_inverter_seq`,`id`.`inverter_data_seq` AS `inverter_data_seq`,round(`id`.`in_a` / 10,1) AS `in_a`,round(`id`.`in_v` / 10,1) AS `in_v`,round(`id`.`in_w` / 10,1) AS `in_w`,round(`id`.`out_a` / 10,1) AS `out_a`,round(`id`.`out_v` / 10,1) AS `out_v`,round(`id`.`out_w` / 10,1) AS `out_w`,round(`id`.`p_f` / 10,1) AS `p_f`,round(`id`.`d_wh` / 10,1) AS `d_wh`,round(`id`.`c_wh` / 10,1) AS `c_wh`,round((`id`.`c_wh` - (select max(`inverter_data`.`c_wh`) from `inverter_data` where `inverter_data`.`inverter_seq` = `id`.`inverter_seq` and `inverter_data`.`writedate` >= curdate() - 1 and `inverter_data`.`writedate` < curdate())) / 10,1) AS `daily_power_wh`,`id`.`writedate` AS `writedate`,`pv`.`amount` AS `pv_amount`,`pv`.`install_place` AS `install_place` from (((`inverter_data` `id` left join `inverter` on(`inverter`.`inverter_seq` = `id`.`inverter_seq`)) left join `relation_power` `rp` on(`rp`.`inverter_seq` = `id`.`inverter_seq`)) left join `photovoltaic` `pv` on(`pv`.`photovoltaic_seq` = `rp`.`photovoltaic_seq`)) where `id`.`inverter_data_seq` in (select max(`inverter_data`.`inverter_data_seq`) from `inverter_data` group by `inverter_data`.`inverter_seq`) order by `inverter`.`chart_sort_rank` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_module_status`
--

/*!50001 DROP TABLE IF EXISTS `v_module_status`*/;
/*!50001 DROP VIEW IF EXISTS `v_module_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`upsas`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_module_status` AS select `pv`.`photovoltaic_seq` AS `photovoltaic_seq`,`pv`.`target_id` AS `target_id`,`pv`.`target_name` AS `target_name`,`pv`.`install_place` AS `install_place`,`pv`.`module_type` AS `module_type`,`pv`.`compose_count` AS `compose_count`,`pv`.`amount` AS `amount`,`pv`.`manufacturer` AS `manufacturer`,`pv`.`chart_color` AS `chart_color`,`pv`.`chart_sort_rank` AS `chart_sort_rank`,`rp`.`connector_ch` AS `connector_ch`,`curr_data`.`amp` AS `amp`,`curr_data`.`vol` AS `vol`,`curr_data`.`writedate` AS `writedate` from (((`upsas`.`photovoltaic` `pv` join `upsas`.`relation_power` `rp` on(`rp`.`photovoltaic_seq` = `pv`.`photovoltaic_seq`)) left join `upsas`.`pl_saltern_block` `sb` on(`sb`.`saltern_block_seq` = `rp`.`saltern_block_seq`)) left join (select `md`.`photovoltaic_seq` AS `photovoltaic_seq`,round(`md`.`amp` / 10,1) AS `amp`,round(`md`.`vol` / 10,1) AS `vol`,`md`.`writedate` AS `writedate` from (`upsas`.`module_data` `md` join (select max(`upsas`.`module_data`.`module_data_seq`) AS `module_data_seq` from `upsas`.`module_data` group by `upsas`.`module_data`.`photovoltaic_seq`) `b` on(`md`.`module_data_seq` = `b`.`module_data_seq`))) `curr_data` on(`curr_data`.`photovoltaic_seq` = `pv`.`photovoltaic_seq`)) order by `pv`.`chart_sort_rank` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_node_profile`
--

/*!50001 DROP TABLE IF EXISTS `v_node_profile`*/;
/*!50001 DROP VIEW IF EXISTS `v_node_profile`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`upsas`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_node_profile` AS select `node`.`node_seq` AS `node_seq`,concat(`nd`.`target_prefix`,'_',`vdl`.`main_seq`,'_',`node`.`target_code`) AS `node_real_id`,concat(`nd`.`target_prefix`,'_',`node`.`target_code`) AS `node_id`,concat(`nd`.`target_name`,' ',`node`.`target_code`) AS `node_name`,`node`.`target_code` AS `target_code`,`node`.`data_logger_index` AS `data_logger_index`,`vdl`.`dl_real_id` AS `dl_real_id`,`vdl`.`dl_id` AS `dl_id`,`nd`.`target_prefix` AS `nd_target_prefix`,`nd`.`target_id` AS `nd_target_id`,`nd`.`target_name` AS `nd_target_name`,`nc`.`target_id` AS `nc_target_id`,`nc`.`is_sensor` AS `nc_is_sensor`,`nc`.`target_name` AS `nc_target_name`,`nc`.`data_unit` AS `nc_data_unit`,`nc`.`description` AS `nc_description`,`vdl`.`m_name` AS `m_name`,`nd`.`node_def_seq` AS `node_def_seq`,`nd`.`node_class_seq` AS `node_class_seq`,`vdl`.`main_seq` AS `main_seq`,`vdl`.`data_logger_seq` AS `data_logger_seq`,`vdl`.`data_logger_def_seq` AS `data_logger_def_seq` from (((`dv_node` `node` left join `dv_node_def` `nd` on(`nd`.`node_def_seq` = `node`.`node_def_seq`)) left join `dv_node_class` `nc` on(`nc`.`node_class_seq` = `nd`.`node_class_seq`)) left join `v_data_logger` `vdl` on(`vdl`.`data_logger_seq` = `node`.`data_logger_seq`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_upsas_profile`
--

/*!50001 DROP TABLE IF EXISTS `v_upsas_profile`*/;
/*!50001 DROP VIEW IF EXISTS `v_upsas_profile`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`upsas`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_upsas_profile` AS select `rp`.`connector_ch` AS `connector_ch`,`pv`.`photovoltaic_seq` AS `photovoltaic_seq`,`pv`.`target_id` AS `pv_target_id`,`pv`.`target_name` AS `pv_target_name`,`pv`.`install_place` AS `pv_install_place`,`pv`.`module_type` AS `pv_module_type`,`pv`.`compose_count` AS `pv_compose_count`,`pv`.`amount` AS `pv_amount`,`pv`.`manufacturer` AS `pv_manufacturer`,`pv`.`chart_color` AS `pv_chart_color`,`pv`.`chart_sort_rank` AS `pv_chart_sort_rank`,`cnt`.`connector_seq` AS `connector_seq`,`cnt`.`target_id` AS `cnt_target_id`,`cnt`.`target_category` AS `cnt_target_category`,`cnt`.`target_name` AS `cnt_target_name`,`cnt`.`dialing` AS `cnt_dialing`,`cnt`.`code` AS `cnt_code`,`cnt`.`host` AS `cnt_host`,`cnt`.`port` AS `cnt_port`,`cnt`.`baud_rate` AS `cnt_baud_rate`,`cnt`.`director_name` AS `cnt_director_name`,`cnt`.`director_tel` AS `cnt_director_tel`,`ivt`.`inverter_seq` AS `inverter_seq`,`ivt`.`target_id` AS `ivt_target_id`,`ivt`.`target_name` AS `ivt_target_name`,`ivt`.`target_type` AS `ivt_target_type`,`ivt`.`target_category` AS `ivt_target_category`,`ivt`.`connect_type` AS `ivt_connect_type`,`ivt`.`dialing` AS `ivt_dialing`,`ivt`.`host` AS `ivt_host`,`ivt`.`port` AS `ivt_port`,`ivt`.`baud_rate` AS `ivt_baud_rate`,`ivt`.`code` AS `ivt_code`,`ivt`.`amount` AS `ivt_amount`,`ivt`.`director_name` AS `ivt_director_name`,`ivt`.`director_tel` AS `ivt_director_tel`,`sb`.`saltern_block_seq` AS `saltern_block_seq`,`sb`.`target_id` AS `sb_target_id`,`sb`.`target_type` AS `sb_target_type`,`sb`.`target_name` AS `sb_target_name`,`sb`.`setting_salinity` AS `sb_setting_salinity`,`sb`.`min_water_level` AS `sb_min_water_level`,`sb`.`max_water_level` AS `sb_max_water_level`,`sb`.`depth` AS `sb_depth`,(select count(0) from `relation_power` where `cnt`.`connector_seq` = `relation_power`.`connector_seq`) AS `ch_number` from ((((`relation_power` `rp` left join `photovoltaic` `pv` on(`pv`.`photovoltaic_seq` = `rp`.`photovoltaic_seq`)) left join `inverter` `ivt` on(`ivt`.`inverter_seq` = `rp`.`inverter_seq`)) left join `connector` `cnt` on(`cnt`.`connector_seq` = `rp`.`connector_seq`)) left join `pl_saltern_block` `sb` on(`sb`.`saltern_block_seq` = `rp`.`saltern_block_seq`)) order by `pv`.`chart_sort_rank` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-06 18:10:10
