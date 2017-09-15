-- 접속반 정보
CREATE TABLE `connector` (
	`connector_seq` MEDIUMINT    NOT NULL COMMENT '접속반 정보 시퀀스', -- 접속반 정보 시퀀스
	`target_id`     VARCHAR(6)   NOT NULL COMMENT '접속반 id', -- 접속반 id
	`target_name`   VARCHAR(20)  NOT NULL COMMENT '인버터 명', -- 인버터 명
	`code`          VARCHAR(100) NULL     COMMENT '고유 코드', -- 고유 코드
	`ch_number`     TINYINT      NOT NULL COMMENT 'CH 수', -- CH 수
	`director_name` VARCHAR(20)  NOT NULL COMMENT '담당자', -- 담당자
	`director_tel`  VARCHAR(13)  NOT NULL COMMENT '연락처' -- 연락처
)
COMMENT '접속반 상세 정보';

-- 접속반 정보
ALTER TABLE `connector`
	ADD CONSTRAINT `PK_connector` -- 접속반 정보 기본키
		PRIMARY KEY (
			`connector_seq` -- 접속반 정보 시퀀스
		);

ALTER TABLE `connector`
	MODIFY COLUMN `connector_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '접속반 정보 시퀀스';

-- 모듈 정보
CREATE TABLE `photovoltaic` (
	`photovoltaic_seq`  MEDIUMINT   NOT NULL COMMENT '모듈 세부 정보 시퀀스', -- 모듈 세부 정보 시퀀스
	`saltern_block_seq` MEDIUMINT   NULL     COMMENT '염판 시퀀스', -- 염판 시퀀스
	`target_id`         VARCHAR(6)  NOT NULL COMMENT '모듈 id', -- 모듈 id
	`target_name`       VARCHAR(20) NOT NULL COMMENT '모듈 명', -- 모듈 명
	`install_place`     VARCHAR(50) NOT NULL COMMENT '설치장소', -- 설치장소
	`module_type`       TINYINT     NOT NULL COMMENT '모듈 타입', -- 모듈 타입
	`compose_count`     TINYINT     NOT NULL COMMENT '직렬구성 개수', -- 직렬구성 개수
	`amount`            FLOAT       NOT NULL COMMENT '용량', -- 용량
	`manufacturer`      VARCHAR(20) NOT NULL COMMENT '제조사' -- 제조사
)
COMMENT '수중 태양광 모듈 상세 정보';

-- 모듈 정보
ALTER TABLE `photovoltaic`
	ADD CONSTRAINT `PK_photovoltaic` -- 모듈 정보 기본키
		PRIMARY KEY (
			`photovoltaic_seq` -- 모듈 세부 정보 시퀀스
		);

ALTER TABLE `photovoltaic`
	MODIFY COLUMN `photovoltaic_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '모듈 세부 정보 시퀀스';

-- rtu_정보
CREATE TABLE `rtu` (
	`rtu_seq` MEDIUMINT  NOT NULL COMMENT 'rtu_정보 시퀀스', -- rtu_정보 시퀀스
	`mac`     VARCHAR(6) NULL     COMMENT 'mac', -- mac
	`ip`      VARCHAR(6) NULL     COMMENT 'ip', -- ip
	`port`    VARCHAR(6) NULL     COMMENT 'port' -- port
)
COMMENT '각 장치에 Remote Control Unit이 설치될 경우 해당 장치와의 접속 정보';

-- rtu_정보
ALTER TABLE `rtu`
	ADD CONSTRAINT `PK_rtu` -- rtu_정보 기본키
		PRIMARY KEY (
			`rtu_seq` -- rtu_정보 시퀀스
		);

ALTER TABLE `rtu`
	MODIFY COLUMN `rtu_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT 'rtu_정보 시퀀스';

-- 인버터 정보
CREATE TABLE `inverter` (
	`inverter_seq`  MEDIUMINT    NOT NULL COMMENT '인버터 정보 시퀀스', -- 인버터 정보 시퀀스
	`connector_seq` MEDIUMINT    NULL     COMMENT '접속반 정보 시퀀스', -- 접속반 정보 시퀀스
	`target_id`     VARCHAR(6)   NOT NULL COMMENT '인버터 id', -- 인버터 id
	`target_name`   VARCHAR(20)  NOT NULL COMMENT '인버터 명', -- 인버터 명
	`code`          VARCHAR(100) NULL     COMMENT '고유 코드', -- 고유 코드
	`amount`        FLOAT        NOT NULL COMMENT '용량', -- 용량
	`director_name` VARCHAR(20)  NOT NULL COMMENT '담당자', -- 담당자
	`director_tel`  VARCHAR(13)  NOT NULL COMMENT '연락처' -- 연락처
)
COMMENT '인버터 장치 상세 정보';

-- 인버터 정보
ALTER TABLE `inverter`
	ADD CONSTRAINT `PK_inverter` -- 인버터 정보 기본키
		PRIMARY KEY (
			`inverter_seq` -- 인버터 정보 시퀀스
		);

ALTER TABLE `inverter`
	MODIFY COLUMN `inverter_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '인버터 정보 시퀀스';

-- 접속반 데이터
CREATE TABLE `connector_data` (
	`connector_data_seq` MEDIUMINT NOT NULL COMMENT '접속반 데이터 시퀀스', -- 접속반 데이터 시퀀스
	`connector_seq`      MEDIUMINT NOT NULL COMMENT '접속반 정보 시퀀스', -- 접속반 정보 시퀀스
	`data_type`          FLOAT     NOT NULL COMMENT '0: 전류, 1: 전압', -- 전압
	`data_value`         FLOAT     NOT NULL COMMENT '1CH 전류', -- 1CH 전류
	`1_ch`               FLOAT     NOT NULL COMMENT '2CH 전류', -- 2CH 전류
	`2_ch`               FLOAT     NOT NULL COMMENT '3CH 전류', -- 3CH 전류
	`3_ch`               FLOAT     NOT NULL COMMENT '4CH 전류', -- 4CH 전류
	`4_ch`               DATETIME  NOT NULL COMMENT '등록일' -- 등록일
)
COMMENT '접속반에서 측정된 데이터';

-- 접속반 데이터
ALTER TABLE `connector_data`
	ADD CONSTRAINT `PK_connector_data` -- 접속반 데이터 기본키
		PRIMARY KEY (
			`connector_data_seq`, -- 접속반 데이터 시퀀스
			`connector_seq`       -- 접속반 정보 시퀀스
		);

ALTER TABLE `connector_data`
	MODIFY COLUMN `connector_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '접속반 데이터 시퀀스';

-- 인버터 데이터
CREATE TABLE `inverter_data` (
	`inverter_data_seq`     MEDIUMINT NOT NULL COMMENT '인버터 데이터 시퀀스', -- 인버터 데이터 시퀀스
	`inverter_seq`          MEDIUMINT NOT NULL COMMENT '인버터 정보 시퀀스', -- 인버터 정보 시퀀스
	`in_a`                  FLOAT     NOT NULL COMMENT '입력 전류', -- 입력 전류
	`in_v`                  FLOAT     NOT NULL COMMENT '입력 전압', -- 입력 전압
	`out_a`                 FLOAT     NOT NULL COMMENT '출력 전류', -- 출력 전류
	`out_v`                 FLOAT     NOT NULL COMMENT '출력 전압', -- 출력 전압
	`conversion_efficiency` FLOAT     NOT NULL COMMENT '변환 효율', -- 변환 효율
	`writedate`             DATETIME  NOT NULL COMMENT '등록일' -- 등록일
)
COMMENT '인버터에서 측정된 데이터';

-- 인버터 데이터
ALTER TABLE `inverter_data`
	ADD CONSTRAINT `PK_inverter_data` -- 인버터 데이터 기본키
		PRIMARY KEY (
			`inverter_data_seq`, -- 인버터 데이터 시퀀스
			`inverter_seq`       -- 인버터 정보 시퀀스
		);

ALTER TABLE `inverter_data`
	MODIFY COLUMN `inverter_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '인버터 데이터 시퀀스';

-- 기상관측장비 측정 정보
CREATE TABLE `weather_device_data` (
	`weather_device_data_seq` MEDIUMINT NOT NULL COMMENT '기상관측장비 측정 정보 시퀀스', -- 기상관측장비 측정 정보 시퀀스
	`rain_status`             FLOAT     NULL     COMMENT '0: 맑음, 1: 이슬비, 2: 약한비, 3: 보통비, 4: 폭우', -- 강수상태(현재 내리고 있는 비)
	`rain_amount`             FLOAT     NULL     COMMENT '강우량', -- 강우량
	`temperature`             FLOAT     NULL     COMMENT '섭씨', -- 기온
	`solar`                   FLOAT     NULL     COMMENT '일사량', -- 일사량
	`humidity`                TINYINT   NULL     COMMENT '%', -- 습도
	`wind_direction`          TINYINT   NULL     COMMENT '0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)', -- 풍향
	`wind_speed`              FLOAT     NULL     COMMENT 'm/s', -- 풍속
	`writedate`               DATETIME  NULL     COMMENT '등록일' -- 등록일
)
COMMENT '기상관측장비로부터 수집한 데이터를 저장';

-- 기상관측장비 측정 정보
ALTER TABLE `weather_device_data`
	ADD CONSTRAINT `PK_weather_device_data` -- 기상관측장비 측정 정보 기본키
		PRIMARY KEY (
			`weather_device_data_seq` -- 기상관측장비 측정 정보 시퀀스
		);

ALTER TABLE `weather_device_data`
	MODIFY COLUMN `weather_device_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '기상관측장비 측정 정보 시퀀스';

-- 기상청 일기 예보
CREATE TABLE `kma_data` (
	`kma_data_seq` MEDIUMINT NOT NULL COMMENT '기상청 일기 예보 시퀀스', -- 기상청 일기 예보 시퀀스
	`temp`         FLOAT     NULL     COMMENT '현재온도', -- 현재온도
	`pty`          TINYINT   NULL     COMMENT '(0 : 없음, 1:비, 2:비/눈, 3:눈/비, 4:눈)', -- 강수상태코드
	`pop`          TINYINT   NULL     COMMENT '강수확율(%)', -- 강수확율(%)
	`r12`          FLOAT     NULL     COMMENT '(① 0 <= x < 0.1, ② 0.1 <= x < 1, ③ 1 <= x < 5, ④ 5 <= x < 10, ⑤ 10 <= x < 25, ⑥ 25 <= x < 50, ⑦ 50 <= x)', -- 12시간 예상강수량 mm
	`ws`           FLOAT     NULL     COMMENT '풍속(m/s)', -- 풍속(m/s)
	`wd`           TINYINT   NULL     COMMENT '풍향 0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)', -- 풍향
	`reh`          TINYINT   NULL     COMMENT '습도(%)', -- 습도(%)
	`applydate`    DATETIME  NULL     COMMENT '적용시간', -- 적용시간
	`writedate`    DATETIME  NULL     COMMENT '작성일', -- 작성일
	`updatedate`   DATETIME  NULL     COMMENT '수정일' -- 수정일
)
COMMENT '기상청에서 발표한 일기예보를 저장';

-- 기상청 일기 예보
ALTER TABLE `kma_data`
	ADD CONSTRAINT `PK_kma_data` -- 기상청 일기 예보 기본키
		PRIMARY KEY (
			`kma_data_seq` -- 기상청 일기 예보 시퀀스
		);

ALTER TABLE `kma_data`
	MODIFY COLUMN `kma_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '기상청 일기 예보 시퀀스';

-- 염전 고장 이력
CREATE TABLE `saltern_trouble_data` (
	`saltern_trouble_data_seq` MEDIUMINT    NOT NULL COMMENT '고장 이력 시퀀스', -- 고장 이력 시퀀스
	`saltern_device_info_seq`  MEDIUMINT    NOT NULL COMMENT '염전 설정 장비 시퀀스', -- 염전 설정 장비 시퀀스
	`device_structure_seq`     MEDIUMINT    NOT NULL COMMENT '장치 구성 정보 시퀀스', -- 장치 구성 정보 시퀀스
	`trouble_msg`              VARCHAR(100) NULL     COMMENT '고장 내용', -- 고장 내용
	`fix_msg`                  VARCHAR(100) NULL     COMMENT '해결 내용', -- 해결 내용
	`occur_date`               DATETIME     NULL     COMMENT '발생 일자', -- 발생 일자
	`fix_date`                 DATETIME     NULL     COMMENT '해결 일자' -- 해결 일자
)
COMMENT '장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 염전 고장 이력
ALTER TABLE `saltern_trouble_data`
	ADD CONSTRAINT `PK_saltern_trouble_data` -- 염전 고장 이력 기본키
		PRIMARY KEY (
			`saltern_trouble_data_seq`, -- 고장 이력 시퀀스
			`saltern_device_info_seq`,  -- 염전 설정 장비 시퀀스
			`device_structure_seq`      -- 장치 구성 정보 시퀀스
		);

ALTER TABLE `saltern_trouble_data`
	MODIFY COLUMN `saltern_trouble_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '고장 이력 시퀀스';

-- GCM 장치
CREATE TABLE `gcm_device` (
	`gcm_device_seq`  MEDIUMINT    NOT NULL COMMENT 'GCM 장치 시퀀스', -- GCM 장치 시퀀스
	`member_id`       VARCHAR(16)  NULL     COMMENT 'app 사용자 id (통합서버에서 받음)', -- 회원 아이디
	`device_key`      VARCHAR(255) NULL     COMMENT '고유 장치 ID', -- 장치키값
	`registration_id` VARCHAR(255) NULL     COMMENT 'GCM을 보내기 위해 구글에서 받은 모바일 Session ID', -- 레지스트레이션 아이디
	`writedate`       DATETIME     NULL     COMMENT '작성일', -- 작성일
	`updatedate`      DATETIME     NULL     COMMENT '수정일' -- 수정일
)
COMMENT '염전 관리자에게 보낼 중요한 메시지를 보내기 위한 App 식별 정보 저장';

-- GCM 장치
ALTER TABLE `gcm_device`
	ADD CONSTRAINT `PK_gcm_device` -- GCM 장치 기본키
		PRIMARY KEY (
			`gcm_device_seq` -- GCM 장치 시퀀스
		);

ALTER TABLE `gcm_device`
	MODIFY COLUMN `gcm_device_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT 'GCM 장치 시퀀스';

-- 염판
CREATE TABLE `saltern_block` (
	`saltern_block_seq` MEDIUMINT   NOT NULL COMMENT '염판 시퀀스', -- 염판 시퀀스
	`target_id`         VARCHAR(6)  NOT NULL COMMENT '염판 id', -- 염판 id
	`target_type`       TINYINT     NOT NULL COMMENT '0: 증발지, 1: 결정지', -- 염판 타입
	`setting_salinity`  FLOAT       NULL     COMMENT '설정 염도', -- 설정 염도
	`water_level_count` TINYINT     NULL     COMMENT '수위 측정 봉 개수', -- 수위 측정 봉 개수
	`min_water_level`   TINYINT     NOT NULL COMMENT '수위 측정 봉', -- 최저 수위 레벨
	`max_water_level`   TINYINT     NOT NULL COMMENT '최대 수위 레벨', -- 최대 수위 레벨
	`water_cm`          VARCHAR(10) NULL     COMMENT '수위 측정 봉 개수만큼 '','' 구분으로 파싱 -> 배열 형(각 자료형은 float)', -- 단계별 실제 수위
	`depth`             TINYINT     NOT NULL COMMENT '상대적 고도' -- 상대적 고도
)
COMMENT '염판';

-- 염판
ALTER TABLE `saltern_block`
	ADD CONSTRAINT `PK_saltern_block` -- 염판 기본키
		PRIMARY KEY (
			`saltern_block_seq` -- 염판 시퀀스
		);

ALTER TABLE `saltern_block`
	MODIFY COLUMN `saltern_block_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '염판 시퀀스';

-- 해주
CREATE TABLE `water_tank` (
	`water_tank_seq`   MEDIUMINT   NOT NULL COMMENT '해주 시퀀스', -- 해주 시퀀스
	`target_id`        VARCHAR(6)  NOT NULL COMMENT '해주 id', -- 해주 id
	`target_type`      TINYINT     NOT NULL COMMENT '0: 증발지용, 1: 결정지용', -- 해주 타입
	`setting_salinity` FLOAT       NOT NULL COMMENT '설정 염도', -- 설정 염도
	`min_water_level`  TINYINT     NOT NULL COMMENT '최저 수위 레벨', -- 최저 수위 레벨
	`max_water_level`  TINYINT     NOT NULL COMMENT '최대 수위 레벨', -- 최대 수위 레벨
	`water_cm`         VARCHAR(10) NOT NULL COMMENT '단계별 실제 수위', -- 단계별 실제 수위
	`depth`            TINYINT     NOT NULL COMMENT '상대적 고도' -- 상대적 고도
)
COMMENT '해주';

-- 해주
ALTER TABLE `water_tank`
	ADD CONSTRAINT `PK_water_tank` -- 해주 기본키
		PRIMARY KEY (
			`water_tank_seq` -- 해주 시퀀스
		);

ALTER TABLE `water_tank`
	MODIFY COLUMN `water_tank_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '해주 시퀀스';

-- 바다
CREATE TABLE `sea` (
	`sea_seq`   MEDIUMINT  NOT NULL COMMENT '바다 시퀀스', -- 바다 시퀀스
	`target_id` VARCHAR(6) NOT NULL COMMENT '바다 id', -- 바다 id
	`depth`     TINYINT    NOT NULL COMMENT '상대적 고도' -- 상대적 고도
)
COMMENT '바다';

-- 바다
ALTER TABLE `sea`
	ADD CONSTRAINT `PK_sea` -- 바다 기본키
		PRIMARY KEY (
			`sea_seq` -- 바다 시퀀스
		);

ALTER TABLE `sea`
	MODIFY COLUMN `sea_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '바다 시퀀스';

-- 저수지
CREATE TABLE `reservoir` (
	`reservoir_seq` MEDIUMINT  NOT NULL COMMENT '저수지 시퀀스', -- 저수지 시퀀스
	`target_id`     VARCHAR(6) NOT NULL COMMENT '저수지 id', -- 저수지 id
	`depth`         TINYINT    NOT NULL COMMENT '상대적 고도' -- 상대적 고도
)
COMMENT '저수지';

-- 저수지
ALTER TABLE `reservoir`
	ADD CONSTRAINT `PK_reservoir` -- 저수지 기본키
		PRIMARY KEY (
			`reservoir_seq` -- 저수지 시퀀스
		);

ALTER TABLE `reservoir`
	MODIFY COLUMN `reservoir_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '저수지 시퀀스';

-- 접속반 장치 설정 정보
CREATE TABLE `connector_structure` (
	`connector_structure_seq` MEDIUMINT NOT NULL COMMENT '접속반 장치 설정 정보 시퀀스', -- 접속반 장치 설정 정보 시퀀스
	`connector_seq`           MEDIUMINT NOT NULL COMMENT '접속반 정보 시퀀스', -- 접속반 정보 시퀀스
	`photovoltaic_seq`        MEDIUMINT NOT NULL COMMENT '모듈 세부 정보 시퀀스', -- 모듈 세부 정보 시퀀스
	`channel`                 TINYINT   NOT NULL COMMENT 'CH' -- CH
)
COMMENT '접속반 장치 설정 정보';

-- 접속반 장치 설정 정보
ALTER TABLE `connector_structure`
	ADD CONSTRAINT `PK_connector_structure` -- 접속반 장치 설정 정보 기본키
		PRIMARY KEY (
			`connector_structure_seq`, -- 접속반 장치 설정 정보 시퀀스
			`connector_seq`,           -- 접속반 정보 시퀀스
			`photovoltaic_seq`         -- 모듈 세부 정보 시퀀스
		);

ALTER TABLE `connector_structure`
	MODIFY COLUMN `connector_structure_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '접속반 장치 설정 정보 시퀀스';

-- 수로
CREATE TABLE `water_way` (
	`water_way_seq` MEDIUMINT  NOT NULL COMMENT '수로 시퀀스', -- 수로 시퀀스
	`target_id`     VARCHAR(6) NOT NULL COMMENT '수로 id', -- 수로 id
	`depth`         TINYINT    NOT NULL COMMENT '상대적 고도' -- 상대적 고도
)
COMMENT '수로';

-- 수로
ALTER TABLE `water_way`
	ADD CONSTRAINT `PK_water_way` -- 수로 기본키
		PRIMARY KEY (
			`water_way_seq` -- 수로 시퀀스
		);

ALTER TABLE `water_way`
	MODIFY COLUMN `water_way_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '수로 시퀀스';

-- 염전 설정 장비
CREATE TABLE `saltern_device_info` (
	`saltern_device_info_seq` MEDIUMINT   NOT NULL COMMENT '염전 설정 장비 시퀀스', -- 염전 설정 장비 시퀀스
	`device_structure_seq`    MEDIUMINT   NOT NULL COMMENT '장치 구성 정보 시퀀스', -- 장치 구성 정보 시퀀스
	`target_id`               VARCHAR(6)  NOT NULL COMMENT '장치 id', -- 장치 id
	`target_name`             VARCHAR(20) NOT NULL COMMENT '장치 이름', -- 장치 이름
	`device_type`             TINYINT(1)  NOT NULL COMMENT '(0: Socket, 1: Serial)', -- 연결 타입
	`board_id`                VARCHAR(10) NOT NULL COMMENT '보드 id', -- 보드 id
	`port`                    INTEGER(5)  NOT NULL COMMENT 'Port' -- Port
)
COMMENT '염전 설정 장비';

-- 염전 설정 장비
ALTER TABLE `saltern_device_info`
	ADD CONSTRAINT `PK_saltern_device_info` -- 염전 설정 장비 기본키
		PRIMARY KEY (
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		);

ALTER TABLE `saltern_device_info`
	MODIFY COLUMN `saltern_device_info_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '염전 설정 장비 시퀀스';

-- 장치 구성 정보
CREATE TABLE `device_structure` (
	`device_structure_seq` MEDIUMINT   NOT NULL COMMENT '장치 구성 정보 시퀀스', -- 장치 구성 정보 시퀀스
	`structure_type`       VARCHAR(10) NOT NULL COMMENT '그룹 명', -- 그룹 명
	`structure_header`     VARCHAR(3)  NOT NULL COMMENT '장치 접두어' -- 장치 접두어
)
COMMENT '장치 구성 정보';

-- 장치 구성 정보
ALTER TABLE `device_structure`
	ADD CONSTRAINT `PK_device_structure` -- 장치 구성 정보 기본키
		PRIMARY KEY (
			`device_structure_seq` -- 장치 구성 정보 시퀀스
		);

ALTER TABLE `device_structure`
	MODIFY COLUMN `device_structure_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '장치 구성 정보 시퀀스';

-- 염판 장치 관계
CREATE TABLE `relation_saltern_block` (
	`relation_saltern_block`  MEDIUMINT NOT NULL COMMENT '염판 장치 관계 시퀀스', -- 염판 장치 관계 시퀀스
	`saltern_device_info_seq` MEDIUMINT NOT NULL COMMENT '염전 설정 장비 시퀀스', -- 염전 설정 장비 시퀀스
	`device_structure_seq`    MEDIUMINT NOT NULL COMMENT '장치 구성 정보 시퀀스', -- 장치 구성 정보 시퀀스
	`saltern_block_seq`       MEDIUMINT NULL     COMMENT '염판 시퀀스', -- 염판 시퀀스
	`sea_seq`                 MEDIUMINT NULL     COMMENT '바다 시퀀스', -- 바다 시퀀스
	`reservoir_seq`           MEDIUMINT NULL     COMMENT '저수지 시퀀스', -- 저수지 시퀀스
	`water_tank_seq`          MEDIUMINT NULL     COMMENT '해주 시퀀스', -- 해주 시퀀스
	`water_way_seq`           MEDIUMINT NULL     COMMENT '수로 시퀀스' -- 수로 시퀀스
)
COMMENT '염판 장치 관계';

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `PK_relation_saltern_block` -- 염판 장치 관계 기본키
		PRIMARY KEY (
			`relation_saltern_block`,  -- 염판 장치 관계 시퀀스
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		);

ALTER TABLE `relation_saltern_block`
	MODIFY COLUMN `relation_saltern_block` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '염판 장치 관계 시퀀스';

-- 장치 데이터
CREATE TABLE `saltern_data` (
	`saltern_data_seq`        MEDIUMINT NOT NULL COMMENT '장치 데이터 시퀀스', -- 장치 데이터 시퀀스
	`saltern_device_info_seq` MEDIUMINT NOT NULL COMMENT '염전 설정 장비 시퀀스', -- 염전 설정 장비 시퀀스
	`device_structure_seq`    MEDIUMINT NOT NULL COMMENT '장치 구성 정보 시퀀스', -- 장치 구성 정보 시퀀스
	`data`                    FLOAT     NOT NULL COMMENT '장치 데이터', -- 장치 데이터
	`writedate`               DATETIME  NOT NULL COMMENT '입력일' -- 입력일
)
COMMENT '장치 데이터';

-- 장치 데이터
ALTER TABLE `saltern_data`
	ADD CONSTRAINT `PK_saltern_data` -- 장치 데이터 기본키
		PRIMARY KEY (
			`saltern_data_seq`,        -- 장치 데이터 시퀀스
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		);

ALTER TABLE `saltern_data`
	MODIFY COLUMN `saltern_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '장치 데이터 시퀀스';

-- 발전 시스템 고장 이력
CREATE TABLE `photovoltaic_trouble_data` (
	`photovoltaic_trouble_data_seq` MEDIUMINT    NOT NULL COMMENT '고장 이력 시퀀스', -- 고장 이력 시퀀스
	`photovoltaic_seq`              MEDIUMINT    NULL     COMMENT '모듈 세부 정보 시퀀스', -- 모듈 세부 정보 시퀀스
	`connector_seq`                 MEDIUMINT    NULL     COMMENT '접속반 정보 시퀀스', -- 접속반 정보 시퀀스
	`inverter_seq`                  MEDIUMINT    NULL     COMMENT '인버터 정보 시퀀스', -- 인버터 정보 시퀀스
	`trouble_msg`                   VARCHAR(100) NULL     COMMENT '고장 내용', -- 고장 내용
	`fix_msg`                       VARCHAR(100) NULL     COMMENT '해결 내용', -- 해결 내용
	`occur_date`                    DATETIME     NULL     COMMENT '발생 일자', -- 발생 일자
	`fix_date`                      DATETIME     NULL     COMMENT '해결 일자' -- 해결 일자
)
COMMENT '장치에서 에러가 검출될 경우 발생 및 해결 정보 저장';

-- 발전 시스템 고장 이력
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `PK_photovoltaic_trouble_data` -- 발전 시스템 고장 이력 기본키
		PRIMARY KEY (
			`photovoltaic_trouble_data_seq` -- 고장 이력 시퀀스
		);

ALTER TABLE `photovoltaic_trouble_data`
	MODIFY COLUMN `photovoltaic_trouble_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '고장 이력 시퀀스';

-- 모듈 정보
ALTER TABLE `photovoltaic`
	ADD CONSTRAINT `FK_saltern_block_TO_photovoltaic` -- 염판 -> 모듈 정보
		FOREIGN KEY (
			`saltern_block_seq` -- 염판 시퀀스
		)
		REFERENCES `saltern_block` ( -- 염판
			`saltern_block_seq` -- 염판 시퀀스
		);

-- 인버터 정보
ALTER TABLE `inverter`
	ADD CONSTRAINT `FK_connector_TO_inverter` -- 접속반 정보 -> 인버터 정보
		FOREIGN KEY (
			`connector_seq` -- 접속반 정보 시퀀스
		)
		REFERENCES `connector` ( -- 접속반 정보
			`connector_seq` -- 접속반 정보 시퀀스
		);

-- 접속반 데이터
ALTER TABLE `connector_data`
	ADD CONSTRAINT `FK_connector_TO_connector_data` -- 접속반 정보 -> 접속반 데이터
		FOREIGN KEY (
			`connector_seq` -- 접속반 정보 시퀀스
		)
		REFERENCES `connector` ( -- 접속반 정보
			`connector_seq` -- 접속반 정보 시퀀스
		);

-- 인버터 데이터
ALTER TABLE `inverter_data`
	ADD CONSTRAINT `FK_inverter_TO_inverter_data` -- 인버터 정보 -> 인버터 데이터
		FOREIGN KEY (
			`inverter_seq` -- 인버터 정보 시퀀스
		)
		REFERENCES `inverter` ( -- 인버터 정보
			`inverter_seq` -- 인버터 정보 시퀀스
		);

-- 염전 고장 이력
ALTER TABLE `saltern_trouble_data`
	ADD CONSTRAINT `FK_saltern_device_info_TO_saltern_trouble_data` -- 염전 설정 장비 -> 염전 고장 이력
		FOREIGN KEY (
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		)
		REFERENCES `saltern_device_info` ( -- 염전 설정 장비
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		);

-- 접속반 장치 설정 정보
ALTER TABLE `connector_structure`
	ADD CONSTRAINT `FK_connector_TO_connector_structure` -- 접속반 정보 -> 접속반 장치 설정 정보
		FOREIGN KEY (
			`connector_seq` -- 접속반 정보 시퀀스
		)
		REFERENCES `connector` ( -- 접속반 정보
			`connector_seq` -- 접속반 정보 시퀀스
		);

-- 접속반 장치 설정 정보
ALTER TABLE `connector_structure`
	ADD CONSTRAINT `FK_photovoltaic_TO_connector_structure` -- 모듈 정보 -> 접속반 장치 설정 정보
		FOREIGN KEY (
			`photovoltaic_seq` -- 모듈 세부 정보 시퀀스
		)
		REFERENCES `photovoltaic` ( -- 모듈 정보
			`photovoltaic_seq` -- 모듈 세부 정보 시퀀스
		);

-- 염전 설정 장비
ALTER TABLE `saltern_device_info`
	ADD CONSTRAINT `FK_device_structure_TO_saltern_device_info` -- 장치 구성 정보 -> 염전 설정 장비
		FOREIGN KEY (
			`device_structure_seq` -- 장치 구성 정보 시퀀스
		)
		REFERENCES `device_structure` ( -- 장치 구성 정보
			`device_structure_seq` -- 장치 구성 정보 시퀀스
		);

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_saltern_device_info_TO_relation_saltern_block` -- 염전 설정 장비 -> 염판 장치 관계
		FOREIGN KEY (
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		)
		REFERENCES `saltern_device_info` ( -- 염전 설정 장비
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		);

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_saltern_block_TO_relation_saltern_block` -- 염판 -> 염판 장치 관계
		FOREIGN KEY (
			`saltern_block_seq` -- 염판 시퀀스
		)
		REFERENCES `saltern_block` ( -- 염판
			`saltern_block_seq` -- 염판 시퀀스
		);

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_sea_TO_relation_saltern_block` -- 바다 -> 염판 장치 관계
		FOREIGN KEY (
			`sea_seq` -- 바다 시퀀스
		)
		REFERENCES `sea` ( -- 바다
			`sea_seq` -- 바다 시퀀스
		);

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_reservoir_TO_relation_saltern_block` -- 저수지 -> 염판 장치 관계
		FOREIGN KEY (
			`reservoir_seq` -- 저수지 시퀀스
		)
		REFERENCES `reservoir` ( -- 저수지
			`reservoir_seq` -- 저수지 시퀀스
		);

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_water_tank_TO_relation_saltern_block` -- 해주 -> 염판 장치 관계
		FOREIGN KEY (
			`water_tank_seq` -- 해주 시퀀스
		)
		REFERENCES `water_tank` ( -- 해주
			`water_tank_seq` -- 해주 시퀀스
		);

-- 염판 장치 관계
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_water_way_TO_relation_saltern_block` -- 수로 -> 염판 장치 관계
		FOREIGN KEY (
			`water_way_seq` -- 수로 시퀀스
		)
		REFERENCES `water_way` ( -- 수로
			`water_way_seq` -- 수로 시퀀스
		);

-- 장치 데이터
ALTER TABLE `saltern_data`
	ADD CONSTRAINT `FK_saltern_device_info_TO_saltern_data` -- 염전 설정 장비 -> 장치 데이터
		FOREIGN KEY (
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		)
		REFERENCES `saltern_device_info` ( -- 염전 설정 장비
			`saltern_device_info_seq`, -- 염전 설정 장비 시퀀스
			`device_structure_seq`     -- 장치 구성 정보 시퀀스
		);

-- 발전 시스템 고장 이력
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `FK_inverter_TO_photovoltaic_trouble_data` -- 인버터 정보 -> 발전 시스템 고장 이력
		FOREIGN KEY (
			`inverter_seq` -- 인버터 정보 시퀀스
		)
		REFERENCES `inverter` ( -- 인버터 정보
			`inverter_seq` -- 인버터 정보 시퀀스
		);

-- 발전 시스템 고장 이력
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `FK_photovoltaic_TO_photovoltaic_trouble_data` -- 모듈 정보 -> 발전 시스템 고장 이력
		FOREIGN KEY (
			`photovoltaic_seq` -- 모듈 세부 정보 시퀀스
		)
		REFERENCES `photovoltaic` ( -- 모듈 정보
			`photovoltaic_seq` -- 모듈 세부 정보 시퀀스
		);

-- 발전 시스템 고장 이력
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `FK_connector_TO_photovoltaic_trouble_data` -- 접속반 정보 -> 발전 시스템 고장 이력
		FOREIGN KEY (
			`connector_seq` -- 접속반 정보 시퀀스
		)
		REFERENCES `connector` ( -- 접속반 정보
			`connector_seq` -- 접속반 정보 시퀀스
		);