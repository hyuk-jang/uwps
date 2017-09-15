-- ���ӹ� ����
CREATE TABLE `connector` (
	`connector_seq` MEDIUMINT    NOT NULL COMMENT '���ӹ� ���� ������', -- ���ӹ� ���� ������
	`target_id`     VARCHAR(6)   NOT NULL COMMENT '���ӹ� id', -- ���ӹ� id
	`target_name`   VARCHAR(20)  NOT NULL COMMENT '�ι��� ��', -- �ι��� ��
	`code`          VARCHAR(100) NULL     COMMENT '���� �ڵ�', -- ���� �ڵ�
	`ch_number`     TINYINT      NOT NULL COMMENT 'CH ��', -- CH ��
	`director_name` VARCHAR(20)  NOT NULL COMMENT '�����', -- �����
	`director_tel`  VARCHAR(13)  NOT NULL COMMENT '����ó' -- ����ó
)
COMMENT '���ӹ� �� ����';

-- ���ӹ� ����
ALTER TABLE `connector`
	ADD CONSTRAINT `PK_connector` -- ���ӹ� ���� �⺻Ű
		PRIMARY KEY (
			`connector_seq` -- ���ӹ� ���� ������
		);

ALTER TABLE `connector`
	MODIFY COLUMN `connector_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���ӹ� ���� ������';

-- ��� ����
CREATE TABLE `photovoltaic` (
	`photovoltaic_seq`  MEDIUMINT   NOT NULL COMMENT '��� ���� ���� ������', -- ��� ���� ���� ������
	`saltern_block_seq` MEDIUMINT   NULL     COMMENT '���� ������', -- ���� ������
	`target_id`         VARCHAR(6)  NOT NULL COMMENT '��� id', -- ��� id
	`target_name`       VARCHAR(20) NOT NULL COMMENT '��� ��', -- ��� ��
	`install_place`     VARCHAR(50) NOT NULL COMMENT '��ġ���', -- ��ġ���
	`module_type`       TINYINT     NOT NULL COMMENT '��� Ÿ��', -- ��� Ÿ��
	`compose_count`     TINYINT     NOT NULL COMMENT '���ı��� ����', -- ���ı��� ����
	`amount`            FLOAT       NOT NULL COMMENT '�뷮', -- �뷮
	`manufacturer`      VARCHAR(20) NOT NULL COMMENT '������' -- ������
)
COMMENT '���� �¾籤 ��� �� ����';

-- ��� ����
ALTER TABLE `photovoltaic`
	ADD CONSTRAINT `PK_photovoltaic` -- ��� ���� �⺻Ű
		PRIMARY KEY (
			`photovoltaic_seq` -- ��� ���� ���� ������
		);

ALTER TABLE `photovoltaic`
	MODIFY COLUMN `photovoltaic_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '��� ���� ���� ������';

-- rtu_����
CREATE TABLE `rtu` (
	`rtu_seq` MEDIUMINT  NOT NULL COMMENT 'rtu_���� ������', -- rtu_���� ������
	`mac`     VARCHAR(6) NULL     COMMENT 'mac', -- mac
	`ip`      VARCHAR(6) NULL     COMMENT 'ip', -- ip
	`port`    VARCHAR(6) NULL     COMMENT 'port' -- port
)
COMMENT '�� ��ġ�� Remote Control Unit�� ��ġ�� ��� �ش� ��ġ���� ���� ����';

-- rtu_����
ALTER TABLE `rtu`
	ADD CONSTRAINT `PK_rtu` -- rtu_���� �⺻Ű
		PRIMARY KEY (
			`rtu_seq` -- rtu_���� ������
		);

ALTER TABLE `rtu`
	MODIFY COLUMN `rtu_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT 'rtu_���� ������';

-- �ι��� ����
CREATE TABLE `inverter` (
	`inverter_seq`  MEDIUMINT    NOT NULL COMMENT '�ι��� ���� ������', -- �ι��� ���� ������
	`connector_seq` MEDIUMINT    NULL     COMMENT '���ӹ� ���� ������', -- ���ӹ� ���� ������
	`target_id`     VARCHAR(6)   NOT NULL COMMENT '�ι��� id', -- �ι��� id
	`target_name`   VARCHAR(20)  NOT NULL COMMENT '�ι��� ��', -- �ι��� ��
	`code`          VARCHAR(100) NULL     COMMENT '���� �ڵ�', -- ���� �ڵ�
	`amount`        FLOAT        NOT NULL COMMENT '�뷮', -- �뷮
	`director_name` VARCHAR(20)  NOT NULL COMMENT '�����', -- �����
	`director_tel`  VARCHAR(13)  NOT NULL COMMENT '����ó' -- ����ó
)
COMMENT '�ι��� ��ġ �� ����';

-- �ι��� ����
ALTER TABLE `inverter`
	ADD CONSTRAINT `PK_inverter` -- �ι��� ���� �⺻Ű
		PRIMARY KEY (
			`inverter_seq` -- �ι��� ���� ������
		);

ALTER TABLE `inverter`
	MODIFY COLUMN `inverter_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '�ι��� ���� ������';

-- ���ӹ� ������
CREATE TABLE `connector_data` (
	`connector_data_seq` MEDIUMINT NOT NULL COMMENT '���ӹ� ������ ������', -- ���ӹ� ������ ������
	`connector_seq`      MEDIUMINT NOT NULL COMMENT '���ӹ� ���� ������', -- ���ӹ� ���� ������
	`data_type`          FLOAT     NOT NULL COMMENT '0: ����, 1: ����', -- ����
	`data_value`         FLOAT     NOT NULL COMMENT '1CH ����', -- 1CH ����
	`1_ch`               FLOAT     NOT NULL COMMENT '2CH ����', -- 2CH ����
	`2_ch`               FLOAT     NOT NULL COMMENT '3CH ����', -- 3CH ����
	`3_ch`               FLOAT     NOT NULL COMMENT '4CH ����', -- 4CH ����
	`4_ch`               DATETIME  NOT NULL COMMENT '�����' -- �����
)
COMMENT '���ӹݿ��� ������ ������';

-- ���ӹ� ������
ALTER TABLE `connector_data`
	ADD CONSTRAINT `PK_connector_data` -- ���ӹ� ������ �⺻Ű
		PRIMARY KEY (
			`connector_data_seq`, -- ���ӹ� ������ ������
			`connector_seq`       -- ���ӹ� ���� ������
		);

ALTER TABLE `connector_data`
	MODIFY COLUMN `connector_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���ӹ� ������ ������';

-- �ι��� ������
CREATE TABLE `inverter_data` (
	`inverter_data_seq`     MEDIUMINT NOT NULL COMMENT '�ι��� ������ ������', -- �ι��� ������ ������
	`inverter_seq`          MEDIUMINT NOT NULL COMMENT '�ι��� ���� ������', -- �ι��� ���� ������
	`in_a`                  FLOAT     NOT NULL COMMENT '�Է� ����', -- �Է� ����
	`in_v`                  FLOAT     NOT NULL COMMENT '�Է� ����', -- �Է� ����
	`out_a`                 FLOAT     NOT NULL COMMENT '��� ����', -- ��� ����
	`out_v`                 FLOAT     NOT NULL COMMENT '��� ����', -- ��� ����
	`conversion_efficiency` FLOAT     NOT NULL COMMENT '��ȯ ȿ��', -- ��ȯ ȿ��
	`writedate`             DATETIME  NOT NULL COMMENT '�����' -- �����
)
COMMENT '�ι��Ϳ��� ������ ������';

-- �ι��� ������
ALTER TABLE `inverter_data`
	ADD CONSTRAINT `PK_inverter_data` -- �ι��� ������ �⺻Ű
		PRIMARY KEY (
			`inverter_data_seq`, -- �ι��� ������ ������
			`inverter_seq`       -- �ι��� ���� ������
		);

ALTER TABLE `inverter_data`
	MODIFY COLUMN `inverter_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '�ι��� ������ ������';

-- ��������� ���� ����
CREATE TABLE `weather_device_data` (
	`weather_device_data_seq` MEDIUMINT NOT NULL COMMENT '��������� ���� ���� ������', -- ��������� ���� ���� ������
	`rain_status`             FLOAT     NULL     COMMENT '0: ����, 1: �̽���, 2: ���Ѻ�, 3: �����, 4: ����', -- ��������(���� ������ �ִ� ��)
	`rain_amount`             FLOAT     NULL     COMMENT '���췮', -- ���췮
	`temperature`             FLOAT     NULL     COMMENT '����', -- ���
	`solar`                   FLOAT     NULL     COMMENT '�ϻ緮', -- �ϻ緮
	`humidity`                TINYINT   NULL     COMMENT '%', -- ����
	`wind_direction`          TINYINT   NULL     COMMENT '0~7 (��, �ϵ�, ��, ����, ��, ����, ��, �ϼ�)', -- ǳ��
	`wind_speed`              FLOAT     NULL     COMMENT 'm/s', -- ǳ��
	`writedate`               DATETIME  NULL     COMMENT '�����' -- �����
)
COMMENT '���������κ��� ������ �����͸� ����';

-- ��������� ���� ����
ALTER TABLE `weather_device_data`
	ADD CONSTRAINT `PK_weather_device_data` -- ��������� ���� ���� �⺻Ű
		PRIMARY KEY (
			`weather_device_data_seq` -- ��������� ���� ���� ������
		);

ALTER TABLE `weather_device_data`
	MODIFY COLUMN `weather_device_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '��������� ���� ���� ������';

-- ���û �ϱ� ����
CREATE TABLE `kma_data` (
	`kma_data_seq` MEDIUMINT NOT NULL COMMENT '���û �ϱ� ���� ������', -- ���û �ϱ� ���� ������
	`temp`         FLOAT     NULL     COMMENT '����µ�', -- ����µ�
	`pty`          TINYINT   NULL     COMMENT '(0 : ����, 1:��, 2:��/��, 3:��/��, 4:��)', -- ���������ڵ�
	`pop`          TINYINT   NULL     COMMENT '����Ȯ��(%)', -- ����Ȯ��(%)
	`r12`          FLOAT     NULL     COMMENT '(�� 0 <= x < 0.1, �� 0.1 <= x < 1, �� 1 <= x < 5, �� 5 <= x < 10, �� 10 <= x < 25, �� 25 <= x < 50, �� 50 <= x)', -- 12�ð� ���󰭼��� mm
	`ws`           FLOAT     NULL     COMMENT 'ǳ��(m/s)', -- ǳ��(m/s)
	`wd`           TINYINT   NULL     COMMENT 'ǳ�� 0~7 (��, �ϵ�, ��, ����, ��, ����, ��, �ϼ�)', -- ǳ��
	`reh`          TINYINT   NULL     COMMENT '����(%)', -- ����(%)
	`applydate`    DATETIME  NULL     COMMENT '����ð�', -- ����ð�
	`writedate`    DATETIME  NULL     COMMENT '�ۼ���', -- �ۼ���
	`updatedate`   DATETIME  NULL     COMMENT '������' -- ������
)
COMMENT '���û���� ��ǥ�� �ϱ⿹���� ����';

-- ���û �ϱ� ����
ALTER TABLE `kma_data`
	ADD CONSTRAINT `PK_kma_data` -- ���û �ϱ� ���� �⺻Ű
		PRIMARY KEY (
			`kma_data_seq` -- ���û �ϱ� ���� ������
		);

ALTER TABLE `kma_data`
	MODIFY COLUMN `kma_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���û �ϱ� ���� ������';

-- ���� ���� �̷�
CREATE TABLE `saltern_trouble_data` (
	`saltern_trouble_data_seq` MEDIUMINT    NOT NULL COMMENT '���� �̷� ������', -- ���� �̷� ������
	`saltern_device_info_seq`  MEDIUMINT    NOT NULL COMMENT '���� ���� ��� ������', -- ���� ���� ��� ������
	`device_structure_seq`     MEDIUMINT    NOT NULL COMMENT '��ġ ���� ���� ������', -- ��ġ ���� ���� ������
	`trouble_msg`              VARCHAR(100) NULL     COMMENT '���� ����', -- ���� ����
	`fix_msg`                  VARCHAR(100) NULL     COMMENT '�ذ� ����', -- �ذ� ����
	`occur_date`               DATETIME     NULL     COMMENT '�߻� ����', -- �߻� ����
	`fix_date`                 DATETIME     NULL     COMMENT '�ذ� ����' -- �ذ� ����
)
COMMENT '��ġ���� ������ ����� ��� �߻� �� �ذ� ���� ����';

-- ���� ���� �̷�
ALTER TABLE `saltern_trouble_data`
	ADD CONSTRAINT `PK_saltern_trouble_data` -- ���� ���� �̷� �⺻Ű
		PRIMARY KEY (
			`saltern_trouble_data_seq`, -- ���� �̷� ������
			`saltern_device_info_seq`,  -- ���� ���� ��� ������
			`device_structure_seq`      -- ��ġ ���� ���� ������
		);

ALTER TABLE `saltern_trouble_data`
	MODIFY COLUMN `saltern_trouble_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� �̷� ������';

-- GCM ��ġ
CREATE TABLE `gcm_device` (
	`gcm_device_seq`  MEDIUMINT    NOT NULL COMMENT 'GCM ��ġ ������', -- GCM ��ġ ������
	`member_id`       VARCHAR(16)  NULL     COMMENT 'app ����� id (���ռ������� ����)', -- ȸ�� ���̵�
	`device_key`      VARCHAR(255) NULL     COMMENT '���� ��ġ ID', -- ��ġŰ��
	`registration_id` VARCHAR(255) NULL     COMMENT 'GCM�� ������ ���� ���ۿ��� ���� ����� Session ID', -- ������Ʈ���̼� ���̵�
	`writedate`       DATETIME     NULL     COMMENT '�ۼ���', -- �ۼ���
	`updatedate`      DATETIME     NULL     COMMENT '������' -- ������
)
COMMENT '���� �����ڿ��� ���� �߿��� �޽����� ������ ���� App �ĺ� ���� ����';

-- GCM ��ġ
ALTER TABLE `gcm_device`
	ADD CONSTRAINT `PK_gcm_device` -- GCM ��ġ �⺻Ű
		PRIMARY KEY (
			`gcm_device_seq` -- GCM ��ġ ������
		);

ALTER TABLE `gcm_device`
	MODIFY COLUMN `gcm_device_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT 'GCM ��ġ ������';

-- ����
CREATE TABLE `saltern_block` (
	`saltern_block_seq` MEDIUMINT   NOT NULL COMMENT '���� ������', -- ���� ������
	`target_id`         VARCHAR(6)  NOT NULL COMMENT '���� id', -- ���� id
	`target_type`       TINYINT     NOT NULL COMMENT '0: ������, 1: ������', -- ���� Ÿ��
	`setting_salinity`  FLOAT       NULL     COMMENT '���� ����', -- ���� ����
	`water_level_count` TINYINT     NULL     COMMENT '���� ���� �� ����', -- ���� ���� �� ����
	`min_water_level`   TINYINT     NOT NULL COMMENT '���� ���� ��', -- ���� ���� ����
	`max_water_level`   TINYINT     NOT NULL COMMENT '�ִ� ���� ����', -- �ִ� ���� ����
	`water_cm`          VARCHAR(10) NULL     COMMENT '���� ���� �� ������ŭ '','' �������� �Ľ� -> �迭 ��(�� �ڷ����� float)', -- �ܰ躰 ���� ����
	`depth`             TINYINT     NOT NULL COMMENT '����� ��' -- ����� ��
)
COMMENT '����';

-- ����
ALTER TABLE `saltern_block`
	ADD CONSTRAINT `PK_saltern_block` -- ���� �⺻Ű
		PRIMARY KEY (
			`saltern_block_seq` -- ���� ������
		);

ALTER TABLE `saltern_block`
	MODIFY COLUMN `saltern_block_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� ������';

-- ����
CREATE TABLE `water_tank` (
	`water_tank_seq`   MEDIUMINT   NOT NULL COMMENT '���� ������', -- ���� ������
	`target_id`        VARCHAR(6)  NOT NULL COMMENT '���� id', -- ���� id
	`target_type`      TINYINT     NOT NULL COMMENT '0: ��������, 1: ��������', -- ���� Ÿ��
	`setting_salinity` FLOAT       NOT NULL COMMENT '���� ����', -- ���� ����
	`min_water_level`  TINYINT     NOT NULL COMMENT '���� ���� ����', -- ���� ���� ����
	`max_water_level`  TINYINT     NOT NULL COMMENT '�ִ� ���� ����', -- �ִ� ���� ����
	`water_cm`         VARCHAR(10) NOT NULL COMMENT '�ܰ躰 ���� ����', -- �ܰ躰 ���� ����
	`depth`            TINYINT     NOT NULL COMMENT '����� ��' -- ����� ��
)
COMMENT '����';

-- ����
ALTER TABLE `water_tank`
	ADD CONSTRAINT `PK_water_tank` -- ���� �⺻Ű
		PRIMARY KEY (
			`water_tank_seq` -- ���� ������
		);

ALTER TABLE `water_tank`
	MODIFY COLUMN `water_tank_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� ������';

-- �ٴ�
CREATE TABLE `sea` (
	`sea_seq`   MEDIUMINT  NOT NULL COMMENT '�ٴ� ������', -- �ٴ� ������
	`target_id` VARCHAR(6) NOT NULL COMMENT '�ٴ� id', -- �ٴ� id
	`depth`     TINYINT    NOT NULL COMMENT '����� ��' -- ����� ��
)
COMMENT '�ٴ�';

-- �ٴ�
ALTER TABLE `sea`
	ADD CONSTRAINT `PK_sea` -- �ٴ� �⺻Ű
		PRIMARY KEY (
			`sea_seq` -- �ٴ� ������
		);

ALTER TABLE `sea`
	MODIFY COLUMN `sea_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '�ٴ� ������';

-- ������
CREATE TABLE `reservoir` (
	`reservoir_seq` MEDIUMINT  NOT NULL COMMENT '������ ������', -- ������ ������
	`target_id`     VARCHAR(6) NOT NULL COMMENT '������ id', -- ������ id
	`depth`         TINYINT    NOT NULL COMMENT '����� ��' -- ����� ��
)
COMMENT '������';

-- ������
ALTER TABLE `reservoir`
	ADD CONSTRAINT `PK_reservoir` -- ������ �⺻Ű
		PRIMARY KEY (
			`reservoir_seq` -- ������ ������
		);

ALTER TABLE `reservoir`
	MODIFY COLUMN `reservoir_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '������ ������';

-- ���ӹ� ��ġ ���� ����
CREATE TABLE `connector_structure` (
	`connector_structure_seq` MEDIUMINT NOT NULL COMMENT '���ӹ� ��ġ ���� ���� ������', -- ���ӹ� ��ġ ���� ���� ������
	`connector_seq`           MEDIUMINT NOT NULL COMMENT '���ӹ� ���� ������', -- ���ӹ� ���� ������
	`photovoltaic_seq`        MEDIUMINT NOT NULL COMMENT '��� ���� ���� ������', -- ��� ���� ���� ������
	`channel`                 TINYINT   NOT NULL COMMENT 'CH' -- CH
)
COMMENT '���ӹ� ��ġ ���� ����';

-- ���ӹ� ��ġ ���� ����
ALTER TABLE `connector_structure`
	ADD CONSTRAINT `PK_connector_structure` -- ���ӹ� ��ġ ���� ���� �⺻Ű
		PRIMARY KEY (
			`connector_structure_seq`, -- ���ӹ� ��ġ ���� ���� ������
			`connector_seq`,           -- ���ӹ� ���� ������
			`photovoltaic_seq`         -- ��� ���� ���� ������
		);

ALTER TABLE `connector_structure`
	MODIFY COLUMN `connector_structure_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���ӹ� ��ġ ���� ���� ������';

-- ����
CREATE TABLE `water_way` (
	`water_way_seq` MEDIUMINT  NOT NULL COMMENT '���� ������', -- ���� ������
	`target_id`     VARCHAR(6) NOT NULL COMMENT '���� id', -- ���� id
	`depth`         TINYINT    NOT NULL COMMENT '����� ��' -- ����� ��
)
COMMENT '����';

-- ����
ALTER TABLE `water_way`
	ADD CONSTRAINT `PK_water_way` -- ���� �⺻Ű
		PRIMARY KEY (
			`water_way_seq` -- ���� ������
		);

ALTER TABLE `water_way`
	MODIFY COLUMN `water_way_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� ������';

-- ���� ���� ���
CREATE TABLE `saltern_device_info` (
	`saltern_device_info_seq` MEDIUMINT   NOT NULL COMMENT '���� ���� ��� ������', -- ���� ���� ��� ������
	`device_structure_seq`    MEDIUMINT   NOT NULL COMMENT '��ġ ���� ���� ������', -- ��ġ ���� ���� ������
	`target_id`               VARCHAR(6)  NOT NULL COMMENT '��ġ id', -- ��ġ id
	`target_name`             VARCHAR(20) NOT NULL COMMENT '��ġ �̸�', -- ��ġ �̸�
	`device_type`             TINYINT(1)  NOT NULL COMMENT '(0: Socket, 1: Serial)', -- ���� Ÿ��
	`board_id`                VARCHAR(10) NOT NULL COMMENT '���� id', -- ���� id
	`port`                    INTEGER(5)  NOT NULL COMMENT 'Port' -- Port
)
COMMENT '���� ���� ���';

-- ���� ���� ���
ALTER TABLE `saltern_device_info`
	ADD CONSTRAINT `PK_saltern_device_info` -- ���� ���� ��� �⺻Ű
		PRIMARY KEY (
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		);

ALTER TABLE `saltern_device_info`
	MODIFY COLUMN `saltern_device_info_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� ���� ��� ������';

-- ��ġ ���� ����
CREATE TABLE `device_structure` (
	`device_structure_seq` MEDIUMINT   NOT NULL COMMENT '��ġ ���� ���� ������', -- ��ġ ���� ���� ������
	`structure_type`       VARCHAR(10) NOT NULL COMMENT '�׷� ��', -- �׷� ��
	`structure_header`     VARCHAR(3)  NOT NULL COMMENT '��ġ ���ξ�' -- ��ġ ���ξ�
)
COMMENT '��ġ ���� ����';

-- ��ġ ���� ����
ALTER TABLE `device_structure`
	ADD CONSTRAINT `PK_device_structure` -- ��ġ ���� ���� �⺻Ű
		PRIMARY KEY (
			`device_structure_seq` -- ��ġ ���� ���� ������
		);

ALTER TABLE `device_structure`
	MODIFY COLUMN `device_structure_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '��ġ ���� ���� ������';

-- ���� ��ġ ����
CREATE TABLE `relation_saltern_block` (
	`relation_saltern_block`  MEDIUMINT NOT NULL COMMENT '���� ��ġ ���� ������', -- ���� ��ġ ���� ������
	`saltern_device_info_seq` MEDIUMINT NOT NULL COMMENT '���� ���� ��� ������', -- ���� ���� ��� ������
	`device_structure_seq`    MEDIUMINT NOT NULL COMMENT '��ġ ���� ���� ������', -- ��ġ ���� ���� ������
	`saltern_block_seq`       MEDIUMINT NULL     COMMENT '���� ������', -- ���� ������
	`sea_seq`                 MEDIUMINT NULL     COMMENT '�ٴ� ������', -- �ٴ� ������
	`reservoir_seq`           MEDIUMINT NULL     COMMENT '������ ������', -- ������ ������
	`water_tank_seq`          MEDIUMINT NULL     COMMENT '���� ������', -- ���� ������
	`water_way_seq`           MEDIUMINT NULL     COMMENT '���� ������' -- ���� ������
)
COMMENT '���� ��ġ ����';

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `PK_relation_saltern_block` -- ���� ��ġ ���� �⺻Ű
		PRIMARY KEY (
			`relation_saltern_block`,  -- ���� ��ġ ���� ������
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		);

ALTER TABLE `relation_saltern_block`
	MODIFY COLUMN `relation_saltern_block` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� ��ġ ���� ������';

-- ��ġ ������
CREATE TABLE `saltern_data` (
	`saltern_data_seq`        MEDIUMINT NOT NULL COMMENT '��ġ ������ ������', -- ��ġ ������ ������
	`saltern_device_info_seq` MEDIUMINT NOT NULL COMMENT '���� ���� ��� ������', -- ���� ���� ��� ������
	`device_structure_seq`    MEDIUMINT NOT NULL COMMENT '��ġ ���� ���� ������', -- ��ġ ���� ���� ������
	`data`                    FLOAT     NOT NULL COMMENT '��ġ ������', -- ��ġ ������
	`writedate`               DATETIME  NOT NULL COMMENT '�Է���' -- �Է���
)
COMMENT '��ġ ������';

-- ��ġ ������
ALTER TABLE `saltern_data`
	ADD CONSTRAINT `PK_saltern_data` -- ��ġ ������ �⺻Ű
		PRIMARY KEY (
			`saltern_data_seq`,        -- ��ġ ������ ������
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		);

ALTER TABLE `saltern_data`
	MODIFY COLUMN `saltern_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '��ġ ������ ������';

-- ���� �ý��� ���� �̷�
CREATE TABLE `photovoltaic_trouble_data` (
	`photovoltaic_trouble_data_seq` MEDIUMINT    NOT NULL COMMENT '���� �̷� ������', -- ���� �̷� ������
	`photovoltaic_seq`              MEDIUMINT    NULL     COMMENT '��� ���� ���� ������', -- ��� ���� ���� ������
	`connector_seq`                 MEDIUMINT    NULL     COMMENT '���ӹ� ���� ������', -- ���ӹ� ���� ������
	`inverter_seq`                  MEDIUMINT    NULL     COMMENT '�ι��� ���� ������', -- �ι��� ���� ������
	`trouble_msg`                   VARCHAR(100) NULL     COMMENT '���� ����', -- ���� ����
	`fix_msg`                       VARCHAR(100) NULL     COMMENT '�ذ� ����', -- �ذ� ����
	`occur_date`                    DATETIME     NULL     COMMENT '�߻� ����', -- �߻� ����
	`fix_date`                      DATETIME     NULL     COMMENT '�ذ� ����' -- �ذ� ����
)
COMMENT '��ġ���� ������ ����� ��� �߻� �� �ذ� ���� ����';

-- ���� �ý��� ���� �̷�
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `PK_photovoltaic_trouble_data` -- ���� �ý��� ���� �̷� �⺻Ű
		PRIMARY KEY (
			`photovoltaic_trouble_data_seq` -- ���� �̷� ������
		);

ALTER TABLE `photovoltaic_trouble_data`
	MODIFY COLUMN `photovoltaic_trouble_data_seq` MEDIUMINT NOT NULL AUTO_INCREMENT COMMENT '���� �̷� ������';

-- ��� ����
ALTER TABLE `photovoltaic`
	ADD CONSTRAINT `FK_saltern_block_TO_photovoltaic` -- ���� -> ��� ����
		FOREIGN KEY (
			`saltern_block_seq` -- ���� ������
		)
		REFERENCES `saltern_block` ( -- ����
			`saltern_block_seq` -- ���� ������
		);

-- �ι��� ����
ALTER TABLE `inverter`
	ADD CONSTRAINT `FK_connector_TO_inverter` -- ���ӹ� ���� -> �ι��� ����
		FOREIGN KEY (
			`connector_seq` -- ���ӹ� ���� ������
		)
		REFERENCES `connector` ( -- ���ӹ� ����
			`connector_seq` -- ���ӹ� ���� ������
		);

-- ���ӹ� ������
ALTER TABLE `connector_data`
	ADD CONSTRAINT `FK_connector_TO_connector_data` -- ���ӹ� ���� -> ���ӹ� ������
		FOREIGN KEY (
			`connector_seq` -- ���ӹ� ���� ������
		)
		REFERENCES `connector` ( -- ���ӹ� ����
			`connector_seq` -- ���ӹ� ���� ������
		);

-- �ι��� ������
ALTER TABLE `inverter_data`
	ADD CONSTRAINT `FK_inverter_TO_inverter_data` -- �ι��� ���� -> �ι��� ������
		FOREIGN KEY (
			`inverter_seq` -- �ι��� ���� ������
		)
		REFERENCES `inverter` ( -- �ι��� ����
			`inverter_seq` -- �ι��� ���� ������
		);

-- ���� ���� �̷�
ALTER TABLE `saltern_trouble_data`
	ADD CONSTRAINT `FK_saltern_device_info_TO_saltern_trouble_data` -- ���� ���� ��� -> ���� ���� �̷�
		FOREIGN KEY (
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		)
		REFERENCES `saltern_device_info` ( -- ���� ���� ���
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		);

-- ���ӹ� ��ġ ���� ����
ALTER TABLE `connector_structure`
	ADD CONSTRAINT `FK_connector_TO_connector_structure` -- ���ӹ� ���� -> ���ӹ� ��ġ ���� ����
		FOREIGN KEY (
			`connector_seq` -- ���ӹ� ���� ������
		)
		REFERENCES `connector` ( -- ���ӹ� ����
			`connector_seq` -- ���ӹ� ���� ������
		);

-- ���ӹ� ��ġ ���� ����
ALTER TABLE `connector_structure`
	ADD CONSTRAINT `FK_photovoltaic_TO_connector_structure` -- ��� ���� -> ���ӹ� ��ġ ���� ����
		FOREIGN KEY (
			`photovoltaic_seq` -- ��� ���� ���� ������
		)
		REFERENCES `photovoltaic` ( -- ��� ����
			`photovoltaic_seq` -- ��� ���� ���� ������
		);

-- ���� ���� ���
ALTER TABLE `saltern_device_info`
	ADD CONSTRAINT `FK_device_structure_TO_saltern_device_info` -- ��ġ ���� ���� -> ���� ���� ���
		FOREIGN KEY (
			`device_structure_seq` -- ��ġ ���� ���� ������
		)
		REFERENCES `device_structure` ( -- ��ġ ���� ����
			`device_structure_seq` -- ��ġ ���� ���� ������
		);

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_saltern_device_info_TO_relation_saltern_block` -- ���� ���� ��� -> ���� ��ġ ����
		FOREIGN KEY (
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		)
		REFERENCES `saltern_device_info` ( -- ���� ���� ���
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		);

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_saltern_block_TO_relation_saltern_block` -- ���� -> ���� ��ġ ����
		FOREIGN KEY (
			`saltern_block_seq` -- ���� ������
		)
		REFERENCES `saltern_block` ( -- ����
			`saltern_block_seq` -- ���� ������
		);

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_sea_TO_relation_saltern_block` -- �ٴ� -> ���� ��ġ ����
		FOREIGN KEY (
			`sea_seq` -- �ٴ� ������
		)
		REFERENCES `sea` ( -- �ٴ�
			`sea_seq` -- �ٴ� ������
		);

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_reservoir_TO_relation_saltern_block` -- ������ -> ���� ��ġ ����
		FOREIGN KEY (
			`reservoir_seq` -- ������ ������
		)
		REFERENCES `reservoir` ( -- ������
			`reservoir_seq` -- ������ ������
		);

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_water_tank_TO_relation_saltern_block` -- ���� -> ���� ��ġ ����
		FOREIGN KEY (
			`water_tank_seq` -- ���� ������
		)
		REFERENCES `water_tank` ( -- ����
			`water_tank_seq` -- ���� ������
		);

-- ���� ��ġ ����
ALTER TABLE `relation_saltern_block`
	ADD CONSTRAINT `FK_water_way_TO_relation_saltern_block` -- ���� -> ���� ��ġ ����
		FOREIGN KEY (
			`water_way_seq` -- ���� ������
		)
		REFERENCES `water_way` ( -- ����
			`water_way_seq` -- ���� ������
		);

-- ��ġ ������
ALTER TABLE `saltern_data`
	ADD CONSTRAINT `FK_saltern_device_info_TO_saltern_data` -- ���� ���� ��� -> ��ġ ������
		FOREIGN KEY (
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		)
		REFERENCES `saltern_device_info` ( -- ���� ���� ���
			`saltern_device_info_seq`, -- ���� ���� ��� ������
			`device_structure_seq`     -- ��ġ ���� ���� ������
		);

-- ���� �ý��� ���� �̷�
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `FK_inverter_TO_photovoltaic_trouble_data` -- �ι��� ���� -> ���� �ý��� ���� �̷�
		FOREIGN KEY (
			`inverter_seq` -- �ι��� ���� ������
		)
		REFERENCES `inverter` ( -- �ι��� ����
			`inverter_seq` -- �ι��� ���� ������
		);

-- ���� �ý��� ���� �̷�
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `FK_photovoltaic_TO_photovoltaic_trouble_data` -- ��� ���� -> ���� �ý��� ���� �̷�
		FOREIGN KEY (
			`photovoltaic_seq` -- ��� ���� ���� ������
		)
		REFERENCES `photovoltaic` ( -- ��� ����
			`photovoltaic_seq` -- ��� ���� ���� ������
		);

-- ���� �ý��� ���� �̷�
ALTER TABLE `photovoltaic_trouble_data`
	ADD CONSTRAINT `FK_connector_TO_photovoltaic_trouble_data` -- ���ӹ� ���� -> ���� �ý��� ���� �̷�
		FOREIGN KEY (
			`connector_seq` -- ���ӹ� ���� ������
		)
		REFERENCES `connector` ( -- ���ӹ� ����
			`connector_seq` -- ���ӹ� ���� ������
		);