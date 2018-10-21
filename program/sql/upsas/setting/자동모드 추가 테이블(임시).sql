-- UPSAS 설정 장소
CREATE TABLE `UPSAS_SET_PLACE` (
	`place_seq`       MEDIUMINT NOT NULL COMMENT '장소 정보 시퀀스', -- 장소 정보 시퀀스
	`set_water_level` FLOAT     NULL     COMMENT '설정 수위', -- 설정 수위
	`min_water_level` FLOAT     NULL     COMMENT '최저 수위' -- 최저 수위
)
COMMENT 'UPSAS 설정 장소';

-- UPSAS 설정 장소
ALTER TABLE `UPSAS_SET_PLACE`
	ADD CONSTRAINT `PK_UPSAS_SET_PLACE` -- UPSAS 설정 장소 기본키
		PRIMARY KEY (
			`place_seq` -- 장소 정보 시퀀스
		);


-- UPSAS 설정 장소
ALTER TABLE `UPSAS_SET_PLACE`
	ADD CONSTRAINT `FK_DV_PLACE_TO_UPSAS_SET_PLACE` -- 장소 정보 -> UPSAS 설정 장소
		FOREIGN KEY (
			`place_seq` -- 장소 정보 시퀀스
		)
		REFERENCES `DV_PLACE` ( -- 장소 정보
			`place_seq` -- 장소 정보 시퀀스
		);
		
		

-- UPSAS 장소 데이터
CREATE TABLE `UPSAS_PLACE_DATA` (
	`upsas_place_data_seq` MEDIUMINT NOT NULL COMMENT '장소 데이터 시퀀스', -- 장소 데이터 시퀀스
	`place_seq`            MEDIUMINT NULL     COMMENT '장소 정보 시퀀스', -- 장소 정보 시퀀스
	`water_level`          FLOAT     NULL     COMMENT '수위', -- 수위
	`salinity`             FLOAT     NULL     COMMENT '염도', -- 염도
	`writedate`            DATETIME  NULL     COMMENT '작성일' -- 작성일
)
COMMENT 'UPSAS 장소 데이터';

-- UPSAS 장소 데이터
ALTER TABLE `UPSAS_PLACE_DATA`
	ADD CONSTRAINT `PK_UPSAS_PLACE_DATA` -- UPSAS 장소 데이터 기본키
		PRIMARY KEY (
			`upsas_place_data_seq` -- 장소 데이터 시퀀스
		);

ALTER TABLE `UPSAS_PLACE_DATA`
	MODIFY COLUMN `upsas_place_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '장소 데이터 시퀀스';

-- UPSAS 장소 데이터
ALTER TABLE `UPSAS_PLACE_DATA`
	ADD CONSTRAINT `FK_DV_PLACE_TO_UPSAS_PLACE_DATA` -- 장소 정보 -> UPSAS 장소 데이터
		FOREIGN KEY (
			`place_seq` -- 장소 정보 시퀀스
		)
		REFERENCES `DV_PLACE` ( -- 장소 정보
			`place_seq` -- 장소 정보 시퀀스
		);		
