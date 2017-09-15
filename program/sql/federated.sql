CREATE TABLE `admin` (
	`id` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '관리자아이디',
	`name` VARCHAR(255) NULL DEFAULT NULL COMMENT '이름',
	`password` VARCHAR(255) NULL DEFAULT NULL COMMENT '비밀번호',
	`createdate` DATETIME NULL DEFAULT NULL,
	`updatedate` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`id`)
)
COLLATE='utf8_general_ci'
DEFAULT CHARSET=utf8
CONNECTION='mysql://readonlyuser:smqwe123@121.178.26.59:3306/salt_pond/admin'
ENGINE=federated
;
