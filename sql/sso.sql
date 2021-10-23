-- 删除用户
use mysql;
select User,Host from user WHERE User='sso' and Host='%';
drop user sso@'%';
flush privileges;
-- 删除数据库
DROP DATABASE sso_server;

-- 创建用户
use mysql;
create user 'sso'@'%' IDENTIFIED by '12345678';
-- 授权用户
grant SELECT,
	INSERT,
	UPDATE,
	DELETE,
  CREATE,
	CREATE VIEW,
	EXECUTE,
	DROP,
	INDEX,
	ALTER on sso_server.* to 'sso'@'%';
FLUSH PRIVILEGES;
SHOW GRANTS for sso;

-- 创建数据库
create DATABASE sso_server;
-- 创建表
use sso_server;
-- 
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '邮箱(不可以为空, 由用户自己添加邮箱并激活, 未激活邮箱不能使用邮箱登录)',
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '密码',
  `male` enum('0','1','2') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '2' COMMENT '性别[0:女,1:男,2:保密]',
  `status` enum('0','1') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '1' COMMENT '状态[0:冻结,1:正常,2:注销,3:管理员操作冻结,4:管理员操作注销,5:账户异常时系统判断冻结]',
  `role` enum('0','1','2') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '0' COMMENT '角色[0:普通用户,1:系统管理员,2:二级管理员,3:...]',
  `createTime` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`, `username`, `email`) USING BTREE,
  UNIQUE INDEX `id`(`id`) USING BTREE COMMENT 'id',
  UNIQUE INDEX `username`(`username`) USING BTREE COMMENT '用户名唯一',
  UNIQUE INDEX `email`(`email`) USING BTREE COMMENT '邮箱唯一'
) ENGINE = InnoDB AUTO_INCREMENT = 98 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `user` VALUES (1, '1064926209@qq.com', 'admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '1', '2021-02-03 15:59:59', '2021-05-24 16:06:24');
INSERT INTO `user` VALUES (2, '1064926204@qq.com', 'test4', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '0', '2021-02-04 16:09:14', '2021-05-24 16:06:24');
INSERT INTO `user` VALUES (3, '1064926202@qq.com', 'test2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '0', '2021-02-05 11:46:53', '2021-05-24 16:06:25');
INSERT INTO `user` VALUES (4, '1064926203@qq.com', 'test3', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '0', '2021-02-05 15:01:21', '2021-05-24 16:06:26');
INSERT INTO `user` VALUES (5, '1064926205@qq.com', 'test5', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '0', '2021-02-05 15:26:27', '2021-05-24 16:06:27');
INSERT INTO `user` VALUES (6, '1064926206@qq.com', 'test6', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '1', '2021-02-05 15:43:52', '2021-05-26 22:53:52');
INSERT INTO `user` VALUES (7, 'uyao1@qq.com', 'uyao1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2', '1', '0', '2021-03-16 17:24:47', '2021-05-20 13:39:52');

CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(256) NOT NULL,
  `male` enum('0','1','2') NOT NULL DEFAULT '2',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  `role` enum('0','1','2') NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;