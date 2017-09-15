CREATE TABLE `weathercast_data` (
	`weathercast_data_seq` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '기상청 일기 예보 시퀀스',
	`x` INT(10) NULL DEFAULT NULL COMMENT 'x',
	`y` INT(10) NULL DEFAULT NULL COMMENT 'y',
	`temp` FLOAT NULL DEFAULT NULL COMMENT '현재온도',
	`pty` TINYINT(2) NULL DEFAULT NULL COMMENT '강수상태코드(0 : 없음, 1:비, 2:비/눈, 3:눈/비, 4:눈)',
	`pop` INT(5) NULL DEFAULT NULL COMMENT '강수확율(%)',
	`r12` TINYINT(2) NULL DEFAULT NULL COMMENT '12시간 예상강수량 mm(① 0 <= x < 0.1, ② 0.1 <= x < 1, ③ 1 <= x < 5, ④ 5 <= x < 10, ⑤ 10 <= x < 25, ⑥ 25 <= x < 50, ⑦ 50 <= x)',
	`ws` FLOAT NULL DEFAULT NULL COMMENT '풍속(m/s)',
	`wd` TINYINT(2) NULL DEFAULT NULL COMMENT '풍향 0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)',
	`reh` INT(5) NULL DEFAULT NULL COMMENT '습도(%)',
	`applydate` DATETIME NULL DEFAULT NULL COMMENT '적용시간',
	`writedate` DATETIME NULL DEFAULT NULL COMMENT '작성일',
	`updatedate` DATETIME NULL DEFAULT NULL COMMENT '수정일',
	PRIMARY KEY (`weathercast_data_seq`)
)
COMMENT='기상청에서 발표한 일기예보를 저장'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;
