-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: host.docker.internal    Database: jsh_erp
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `jsh_account`
--

DROP TABLE IF EXISTS `jsh_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_account` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `serial_no` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '编号',
  `initial_amount` decimal(24,6) DEFAULT NULL COMMENT '期初金额',
  `current_amount` decimal(24,6) DEFAULT NULL COMMENT '当前余额',
  `remark` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `is_default` bit(1) DEFAULT NULL COMMENT '是否默认',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='账户信息';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_account`
--

LOCK TABLES `jsh_account` WRITE;
/*!40000 ALTER TABLE `jsh_account` DISABLE KEYS */;
INSERT INTO `jsh_account` VALUES (17,'账户1','zzz111',100.000000,829.000000,'aabb',_binary '',NULL,_binary '',63,'0'),(18,'账户2','1234131324',200.000000,-1681.000000,'bbbb',_binary '',NULL,_binary '\0',63,'0'),(24,'测试账户',NULL,180.000000,NULL,NULL,_binary '',NULL,_binary '',146,'0');
/*!40000 ALTER TABLE `jsh_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_account_head`
--

DROP TABLE IF EXISTS `jsh_account_head`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_account_head` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型(支出/收入/收款/付款/转账)',
  `organ_id` bigint DEFAULT NULL COMMENT '单位Id(收款/付款单位)',
  `hands_person_id` bigint DEFAULT NULL COMMENT '经手人id',
  `creator` bigint DEFAULT NULL COMMENT '操作员',
  `change_amount` decimal(24,6) DEFAULT NULL COMMENT '变动金额(优惠/收款/付款/实付)',
  `discount_money` decimal(24,6) DEFAULT NULL COMMENT '优惠金额',
  `total_price` decimal(24,6) DEFAULT NULL COMMENT '合计金额',
  `account_id` bigint DEFAULT NULL COMMENT '账户(收款/付款)',
  `bill_no` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '单据编号',
  `bill_time` datetime DEFAULT NULL COMMENT '单据日期',
  `remark` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `file_name` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '附件名称',
  `status` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '状态，0未审核、1已审核、9审核中',
  `source` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '单据来源，0-pc，1-手机',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  `work_order_id` bigint DEFAULT NULL COMMENT '关联工单ID',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK9F4C0D8DB610FC06` (`organ_id`) USING BTREE,
  KEY `FK9F4C0D8DAAE50527` (`account_id`) USING BTREE,
  KEY `FK9F4C0D8DC4170B37` (`hands_person_id`) USING BTREE,
  KEY `bill_no` (`bill_no`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='财务主表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_account_head`
--

LOCK TABLES `jsh_account_head` WRITE;
/*!40000 ALTER TABLE `jsh_account_head` DISABLE KEYS */;
INSERT INTO `jsh_account_head` VALUES (128,'收款',NULL,NULL,146,271.000000,0.000000,271.000000,24,'WO20260323141312505','2026-03-23 14:26:45','工单结算：WO20260323141312505',NULL,'1','0',146,'0',4);
/*!40000 ALTER TABLE `jsh_account_head` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_account_item`
--

DROP TABLE IF EXISTS `jsh_account_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_account_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `header_id` bigint NOT NULL COMMENT '表头Id',
  `account_id` bigint DEFAULT NULL COMMENT '账户Id',
  `in_out_item_id` bigint DEFAULT NULL COMMENT '收支项目Id',
  `bill_id` bigint DEFAULT NULL COMMENT '单据id',
  `need_debt` decimal(24,6) DEFAULT NULL COMMENT '应收欠款',
  `finish_debt` decimal(24,6) DEFAULT NULL COMMENT '已收欠款',
  `each_amount` decimal(24,6) DEFAULT NULL COMMENT '单项金额',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '单据备注',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK9F4CBAC0AAE50527` (`account_id`) USING BTREE,
  KEY `FK9F4CBAC0C5FE6007` (`header_id`) USING BTREE,
  KEY `FK9F4CBAC0D203EDC5` (`in_out_item_id`) USING BTREE,
  KEY `bill_id` (`bill_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='财务子表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_account_item`
--

LOCK TABLES `jsh_account_item` WRITE;
/*!40000 ALTER TABLE `jsh_account_item` DISABLE KEYS */;
INSERT INTO `jsh_account_item` VALUES (152,128,NULL,NULL,NULL,NULL,NULL,271.000000,'工单结算：WO20260323141312505',146,'0');
/*!40000 ALTER TABLE `jsh_account_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_depot`
--

DROP TABLE IF EXISTS `jsh_depot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_depot` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '仓库名称',
  `address` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '仓库地址',
  `warehousing` decimal(24,6) DEFAULT NULL COMMENT '仓储费',
  `truckage` decimal(24,6) DEFAULT NULL COMMENT '搬运费',
  `type` int DEFAULT NULL COMMENT '类型',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `remark` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '描述',
  `principal` bigint DEFAULT NULL COMMENT '负责人',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_Flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  `is_default` bit(1) DEFAULT NULL COMMENT '是否默认',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='仓库表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_depot`
--

LOCK TABLES `jsh_depot` WRITE;
/*!40000 ALTER TABLE `jsh_depot` DISABLE KEYS */;
INSERT INTO `jsh_depot` VALUES (14,'仓库1','dizhi',12.000000,12.000000,0,'1','描述',131,_binary '',63,'0',_binary ''),(15,'仓库2','地址100',555.000000,666.000000,0,'2','dfdf',131,_binary '',63,'0',_binary '\0'),(17,'仓库3','123123',123.000000,123.000000,0,'3','123',131,_binary '',63,'0',_binary '\0'),(19,'默认仓库01',NULL,NULL,NULL,0,NULL,NULL,NULL,_binary '',146,'0',_binary '');
/*!40000 ALTER TABLE `jsh_depot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_depot_head`
--

DROP TABLE IF EXISTS `jsh_depot_head`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_depot_head` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型(出库/入库)',
  `sub_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '出入库分类',
  `default_number` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '初始票据号',
  `number` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '票据号',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `oper_time` datetime DEFAULT NULL COMMENT '出入库时间',
  `organ_id` bigint DEFAULT NULL COMMENT '供应商id',
  `creator` bigint DEFAULT NULL COMMENT '操作员',
  `account_id` bigint DEFAULT NULL COMMENT '账户id',
  `change_amount` decimal(24,6) DEFAULT NULL COMMENT '变动金额(收款/付款)',
  `back_amount` decimal(24,6) DEFAULT NULL COMMENT '找零金额',
  `total_price` decimal(24,6) DEFAULT NULL COMMENT '合计金额',
  `pay_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '付款类型(现金、记账等)',
  `bill_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '单据类型',
  `remark` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `file_name` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '附件名称',
  `sales_man` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '销售员（可以多个）',
  `account_id_list` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '多账户ID列表',
  `account_money_list` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '多账户金额列表',
  `discount` decimal(24,6) DEFAULT NULL COMMENT '优惠率',
  `discount_money` decimal(24,6) DEFAULT NULL COMMENT '优惠金额',
  `discount_last_money` decimal(24,6) DEFAULT NULL COMMENT '优惠后金额',
  `other_money` decimal(24,6) DEFAULT NULL COMMENT '销售或采购费用合计',
  `deposit` decimal(24,6) DEFAULT NULL COMMENT '订金',
  `status` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '状态，0未审核、1已审核、2完成采购|销售、3部分采购|销售、9审核中',
  `purchase_status` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '采购状态，0未采购、2完成采购、3部分采购',
  `source` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '单据来源，0-pc，1-手机',
  `link_number` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '关联订单号',
  `link_apply` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '关联请购单',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK2A80F214B610FC06` (`organ_id`) USING BTREE,
  KEY `FK2A80F214AAE50527` (`account_id`) USING BTREE,
  KEY `number` (`number`) USING BTREE,
  KEY `link_number` (`link_number`) USING BTREE,
  KEY `creator` (`creator`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=287 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='单据主表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_depot_head`
--

LOCK TABLES `jsh_depot_head` WRITE;
/*!40000 ALTER TABLE `jsh_depot_head` DISABLE KEYS */;
INSERT INTO `jsh_depot_head` VALUES (277,'出库','零售','LSCK00000000673','LSCK00000000673','2026-03-08 15:50:57','2026-03-08 15:41:01',60,63,18,56.000000,0.000000,56.000000,'预付款',NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','0','0',NULL,NULL,63,'0'),(278,'其它','采购订单','CGDD00000000675','CGDD00000000675','2026-03-08 15:52:15','2026-03-08 15:45:37',74,63,17,0.000000,NULL,-23.000000,'现付',NULL,NULL,'',NULL,'','',0.000000,0.000000,23.000000,NULL,NULL,'2','0','0',NULL,NULL,63,'0'),(279,'入库','采购','CGRK00000000676','CGRK00000000676','2026-03-08 15:54:18','2026-03-08 15:52:22',68,63,18,-1311.000000,NULL,-1311.000000,'现付',NULL,NULL,'',NULL,'','',0.000000,0.000000,1311.000000,0.000000,NULL,'0','0','0',NULL,NULL,63,'0'),(281,'入库','采购','CGRK00000000677','CGRK00000000677','2026-03-08 15:55:23','2026-03-08 15:54:34',74,63,17,-23.000000,NULL,-23.000000,'现付',NULL,NULL,'',NULL,'','',0.000000,0.000000,23.000000,0.000000,NULL,'0','0','0','CGDD00000000675',NULL,63,'0'),(282,'出库','采购退货','CGTH00000000678','CGTH00000000678','2026-03-08 15:56:31','2026-03-08 15:55:59',74,63,17,69.000000,NULL,69.000000,'现付',NULL,NULL,'',NULL,'','',0.000000,0.000000,69.000000,0.000000,NULL,'0','0','0',NULL,NULL,63,'0'),(283,'其它','销售订单','XSDD00000000679','XSDD00000000679','2026-03-11 16:47:43','2026-03-11 16:46:22',90,146,NULL,0.000000,NULL,189.000000,'现付',NULL,NULL,'','','','',15.870000,30.000000,159.000000,NULL,NULL,'2','0','0',NULL,NULL,146,'0'),(284,'出库','销售','XSCK00000000680','XSCK00000000680','2026-03-11 16:50:42','2026-03-11 16:49:36',90,146,24,159.000000,NULL,189.000000,'现付',NULL,NULL,'','','','',15.870000,30.000000,159.000000,0.000000,NULL,'1','0','0','XSDD00000000679',NULL,146,'0'),(285,'出库','零售','LSCK00000000682','LSCK00000000682','2026-03-11 16:55:22','2026-03-11 16:54:32',NULL,146,24,120.000000,0.000000,120.000000,'现付',NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1','0','0',NULL,NULL,146,'0'),(286,'出库','零售','LSCK00000000682','LSCK00000000683','2026-03-11 16:55:34','2026-03-11 16:55:24',NULL,146,24,120.000000,0.000000,120.000000,'现付','',NULL,'',NULL,NULL,NULL,NULL,NULL,0.000000,NULL,NULL,'0','0','0','',NULL,146,'1');
/*!40000 ALTER TABLE `jsh_depot_head` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_depot_item`
--

DROP TABLE IF EXISTS `jsh_depot_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_depot_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `header_id` bigint NOT NULL COMMENT '表头Id',
  `material_id` bigint NOT NULL COMMENT '商品Id',
  `material_extend_id` bigint DEFAULT NULL COMMENT '商品扩展id',
  `material_unit` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '商品单位',
  `sku` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '多属性',
  `oper_number` decimal(24,6) DEFAULT NULL COMMENT '数量',
  `basic_number` decimal(24,6) DEFAULT NULL COMMENT '基础数量，如kg、瓶',
  `unit_price` decimal(24,6) DEFAULT NULL COMMENT '单价',
  `purchase_unit_price` decimal(24,6) DEFAULT NULL COMMENT '采购单价',
  `tax_unit_price` decimal(24,6) DEFAULT NULL COMMENT '含税单价',
  `all_price` decimal(24,6) DEFAULT NULL COMMENT '金额',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `depot_id` bigint DEFAULT NULL COMMENT '仓库ID',
  `another_depot_id` bigint DEFAULT NULL COMMENT '调拨时，对方仓库Id',
  `tax_rate` decimal(24,6) DEFAULT NULL COMMENT '税率',
  `tax_money` decimal(24,6) DEFAULT NULL COMMENT '税额',
  `tax_last_money` decimal(24,6) DEFAULT NULL COMMENT '价税合计',
  `material_type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '商品类型',
  `sn_list` varchar(2000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '序列号列表',
  `batch_number` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '批号',
  `expiration_date` datetime DEFAULT NULL COMMENT '有效日期',
  `link_id` bigint DEFAULT NULL COMMENT '关联明细id',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK2A819F475D61CCF7` (`material_id`) USING BTREE,
  KEY `FK2A819F474BB6190E` (`header_id`) USING BTREE,
  KEY `FK2A819F479485B3F5` (`depot_id`) USING BTREE,
  KEY `FK2A819F47729F5392` (`another_depot_id`) USING BTREE,
  KEY `material_extend_id` (`material_extend_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=346 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='单据子表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_depot_item`
--

LOCK TABLES `jsh_depot_item` WRITE;
/*!40000 ALTER TABLE `jsh_depot_item` DISABLE KEYS */;
INSERT INTO `jsh_depot_item` VALUES (334,277,620,40,'件',NULL,1.000000,1.000000,56.000000,23.000000,NULL,56.000000,NULL,14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,63,'0'),(335,278,620,40,'件',NULL,1.000000,1.000000,23.000000,NULL,NULL,23.000000,NULL,NULL,NULL,0.000000,0.000000,23.000000,NULL,NULL,NULL,NULL,NULL,63,'0'),(336,279,620,40,'件',NULL,1.000000,1.000000,23.000000,NULL,NULL,23.000000,NULL,15,NULL,0.000000,0.000000,23.000000,NULL,NULL,NULL,NULL,NULL,63,'0'),(337,279,620,40,'件',NULL,56.000000,56.000000,23.000000,NULL,NULL,1288.000000,NULL,14,NULL,0.000000,0.000000,1288.000000,NULL,NULL,NULL,NULL,NULL,63,'0'),(338,281,620,40,'件',NULL,1.000000,1.000000,23.000000,NULL,NULL,23.000000,NULL,17,NULL,0.000000,0.000000,23.000000,NULL,NULL,NULL,NULL,335,63,'0'),(339,282,620,40,'件',NULL,3.000000,3.000000,23.000000,NULL,NULL,69.000000,NULL,14,NULL,0.000000,0.000000,69.000000,NULL,NULL,NULL,NULL,NULL,63,'0'),(340,283,622,45,'块',NULL,1.000000,1.000000,80.000000,NULL,NULL,80.000000,NULL,NULL,NULL,0.000000,0.000000,80.000000,NULL,NULL,NULL,NULL,NULL,146,'0'),(341,283,621,42,'条',NULL,1.000000,1.000000,109.000000,NULL,NULL,109.000000,NULL,NULL,NULL,0.000000,0.000000,109.000000,NULL,NULL,NULL,NULL,NULL,146,'0'),(342,284,622,45,'块',NULL,1.000000,1.000000,80.000000,56.000000,NULL,80.000000,NULL,19,NULL,0.000000,0.000000,80.000000,NULL,NULL,NULL,NULL,340,146,'0'),(343,284,621,42,'条',NULL,1.000000,1.000000,109.000000,99.000000,NULL,109.000000,NULL,19,NULL,0.000000,0.000000,109.000000,NULL,NULL,NULL,NULL,341,146,'0'),(344,285,621,41,'条',NULL,1.000000,1.000000,120.000000,100.000000,NULL,120.000000,NULL,19,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,146,'0'),(345,286,621,41,'条',NULL,1.000000,1.000000,120.000000,100.000000,NULL,120.000000,NULL,19,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,146,'1');
/*!40000 ALTER TABLE `jsh_depot_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_function`
--

DROP TABLE IF EXISTS `jsh_function`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_function` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `number` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '编号',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `parent_number` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '上级编号',
  `url` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '链接',
  `component` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '组件',
  `state` bit(1) DEFAULT NULL COMMENT '收缩',
  `sort` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型',
  `push_btn` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '功能按钮',
  `icon` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '图标',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `url` (`url`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=269 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='功能模块表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_function`
--

LOCK TABLES `jsh_function` WRITE;
/*!40000 ALTER TABLE `jsh_function` DISABLE KEYS */;
INSERT INTO `jsh_function` VALUES (1,'0001','系统管理','0','/system','/layouts/TabLayout',_binary '','0910',_binary '','电脑版','','setting','0'),(13,'000102','角色管理','0001','/system/role','/system/RoleList',_binary '\0','0130',_binary '','电脑版','1','profile','0'),(14,'000103','用户管理','0001','/system/user','/system/UserList',_binary '\0','0140',_binary '','电脑版','1','profile','0'),(15,'000104','日志管理','0001','/system/log','/system/LogList',_binary '\0','0160',_binary '','电脑版','','profile','0'),(16,'000105','功能管理','0001','/system/function','/system/FunctionList',_binary '\0','0166',_binary '','电脑版','1','profile','0'),(18,'000109','租户管理','0001','/system/tenant','/system/TenantList',_binary '\0','0167',_binary '','电脑版','1','profile','0'),(21,'0101','商品管理','0','/material','/layouts/TabLayout',_binary '\0','0620',_binary '','电脑版',NULL,'shopping','0'),(22,'010101','商品类别','0101','/material/material_category','/material/MaterialCategoryList',_binary '\0','0230',_binary '','电脑版','1','profile','0'),(23,'010102','商品信息','0101','/material/material','/material/MaterialList',_binary '\0','0240',_binary '','电脑版','1,3','profile','0'),(24,'0102','基础资料','0','/systemA','/layouts/TabLayout',_binary '\0','0750',_binary '','电脑版',NULL,'appstore','0'),(25,'01020101','供应商信息','0102','/system/vendor','/system/VendorList',_binary '\0','0260',_binary '','电脑版','1,3','profile','0'),(26,'010202','仓库信息','0102','/system/depot','/system/DepotList',_binary '\0','0270',_binary '','电脑版','1','profile','0'),(31,'010206','经手人管理','0102','/system/person','/system/PersonList',_binary '\0','0284',_binary '','电脑版','1','profile','0'),(32,'0502','采购管理','0','/bill','/layouts/TabLayout',_binary '\0','0330',_binary '','电脑版','','retweet','0'),(33,'050201','采购入库','0502','/bill/purchase_in','/bill/PurchaseInList',_binary '\0','0340',_binary '','电脑版','1,2,3,7','profile','0'),(38,'0603','销售管理','0','/billB','/layouts/TabLayout',_binary '\0','0390',_binary '','电脑版','','shopping-cart','0'),(40,'080107','调拨出库','0801','/bill/allocation_out','/bill/AllocationOutList',_binary '\0','0807',_binary '','电脑版','1,2,3,7','profile','0'),(41,'060303','销售出库','0603','/bill/sale_out','/bill/SaleOutList',_binary '\0','0394',_binary '','电脑版','1,2,3,7','profile','0'),(44,'0704','财务管理','0','/financial','/layouts/TabLayout',_binary '\0','0450',_binary '','电脑版','','money-collect','0'),(59,'030101','进销存统计','0301','/report/in_out_stock_report','/report/InOutStockReport',_binary '\0','0658',_binary '','电脑版','','profile','0'),(194,'010204','收支项目','0102','/system/in_out_item','/system/InOutItemList',_binary '\0','0282',_binary '','电脑版','1','profile','0'),(195,'010205','结算账户','0102','/system/account','/system/AccountList',_binary '\0','0283',_binary '','电脑版','1','profile','0'),(197,'070402','收入单','0704','/financial/item_in','/financial/ItemInList',_binary '\0','0465',_binary '','电脑版','1,2,3,7','profile','0'),(198,'0301','报表查询','0','/report','/layouts/TabLayout',_binary '\0','0570',_binary '','电脑版',NULL,'pie-chart','0'),(199,'050204','采购退货','0502','/bill/purchase_back','/bill/PurchaseBackList',_binary '\0','0345',_binary '','电脑版','1,2,3,7','profile','0'),(200,'060305','销售退货','0603','/bill/sale_back','/bill/SaleBackList',_binary '\0','0396',_binary '','电脑版','1,2,3,7','profile','0'),(201,'080103','其它入库','0801','/bill/other_in','/bill/OtherInList',_binary '\0','0803',_binary '','电脑版','1,2,3,7','profile','0'),(202,'080105','其它出库','0801','/bill/other_out','/bill/OtherOutList',_binary '\0','0805',_binary '','电脑版','1,2,3,7','profile','0'),(203,'070403','支出单','0704','/financial/item_out','/financial/ItemOutList',_binary '\0','0470',_binary '','电脑版','1,2,3,7','profile','0'),(204,'070404','收款单','0704','/financial/money_in','/financial/MoneyInList',_binary '\0','0475',_binary '','电脑版','1,2,3,7','profile','0'),(205,'070405','付款单','0704','/financial/money_out','/financial/MoneyOutList',_binary '\0','0480',_binary '','电脑版','1,2,3,7','profile','0'),(206,'070406','转账单','0704','/financial/giro','/financial/GiroList',_binary '\0','0490',_binary '','电脑版','1,2,3,7','profile','0'),(207,'030102','账户统计','0301','/report/account_report','/report/AccountReport',_binary '\0','0610',_binary '','电脑版','','profile','0'),(208,'030103','采购统计','0301','/report/buy_in_report','/report/BuyInReport',_binary '\0','0620',_binary '','电脑版','','profile','0'),(209,'030104','销售统计','0301','/report/sale_out_report','/report/SaleOutReport',_binary '\0','0630',_binary '','电脑版','','profile','0'),(210,'040102','零售出库','0401','/bill/retail_out','/bill/RetailOutList',_binary '\0','0405',_binary '','电脑版','1,2,3,7','profile','0'),(211,'040104','零售退货','0401','/bill/retail_back','/bill/RetailBackList',_binary '\0','0407',_binary '','电脑版','1,2,3,7','profile','0'),(212,'070407','收预付款','0704','/financial/advance_in','/financial/AdvanceInList',_binary '\0','0495',_binary '','电脑版','1,2,3,7','profile','0'),(217,'01020102','客户信息','0102','/system/customer','/system/CustomerList',_binary '\0','0262',_binary '','电脑版','1,3','profile','0'),(218,'01020103','会员信息','0102','/system/member','/system/MemberList',_binary '\0','0263',_binary '','电脑版','1,3','profile','0'),(220,'010103','多单位','0101','/system/unit','/system/UnitList',_binary '\0','0245',_binary '','电脑版','1','profile','0'),(225,'0401','零售管理','0','/billC','/layouts/TabLayout',_binary '\0','0101',_binary '','电脑版','','gift','0'),(226,'030106','入库明细','0301','/report/in_detail','/report/InDetail',_binary '\0','0640',_binary '','电脑版','','profile','0'),(227,'030107','出库明细','0301','/report/out_detail','/report/OutDetail',_binary '\0','0645',_binary '','电脑版','','profile','0'),(228,'030108','入库汇总','0301','/report/in_material_count','/report/InMaterialCount',_binary '\0','0650',_binary '','电脑版','','profile','0'),(229,'030109','出库汇总','0301','/report/out_material_count','/report/OutMaterialCount',_binary '\0','0655',_binary '','电脑版','','profile','0'),(232,'080109','组装单','0801','/bill/assemble','/bill/AssembleList',_binary '\0','0809',_binary '','电脑版','1,2,3,7','profile','0'),(233,'080111','拆卸单','0801','/bill/disassemble','/bill/DisassembleList',_binary '\0','0811',_binary '','电脑版','1,2,3,7','profile','0'),(234,'000105','系统配置','0001','/system/system_config','/system/SystemConfigList',_binary '\0','0164',_binary '','电脑版','1','profile','0'),(235,'030110','客户对账','0301','/report/customer_account','/report/CustomerAccount',_binary '\0','0660',_binary '','电脑版','','profile','0'),(236,'000106','商品属性','0001','/material/material_property','/material/MaterialPropertyList',_binary '\0','0163',_binary '','电脑版','1','profile','0'),(237,'030111','供应商对账','0301','/report/vendor_account','/report/VendorAccount',_binary '\0','0665',_binary '','电脑版','','profile','0'),(239,'0801','仓库管理','0','/billD','/layouts/TabLayout',_binary '\0','0420',_binary '','电脑版','','hdd','0'),(241,'050202','采购订单','0502','/bill/purchase_order','/bill/PurchaseOrderList',_binary '\0','0335',_binary '','电脑版','1,2,3,7','profile','0'),(242,'060301','销售订单','0603','/bill/sale_order','/bill/SaleOrderList',_binary '\0','0392',_binary '','电脑版','1,2,3,7','profile','0'),(243,'000108','机构管理','0001','/system/organization','/system/OrganizationList',_binary '','0150',_binary '','电脑版','1','profile','0'),(244,'030112','库存预警','0301','/report/stock_warning_report','/report/StockWarningReport',_binary '\0','0670',_binary '','电脑版','','profile','0'),(245,'000107','插件管理','0001','/system/plugin','/system/PluginList',_binary '\0','0170',_binary '','电脑版','1','profile','0'),(246,'030113','商品库存','0301','/report/material_stock','/report/MaterialStock',_binary '\0','0605',_binary '','电脑版','','profile','0'),(247,'010105','多属性','0101','/material/material_attribute','/material/MaterialAttributeList',_binary '\0','0250',_binary '','电脑版','1','profile','0'),(248,'030150','调拨明细','0301','/report/allocation_detail','/report/AllocationDetail',_binary '\0','0646',_binary '','电脑版','','profile','0'),(258,'000112','平台配置','0001','/system/platform_config','/system/PlatformConfigList',_binary '\0','0175',_binary '','电脑版','','profile','0'),(259,'030105','零售统计','0301','/report/retail_out_report','/report/RetailOutReport',_binary '\0','0615',_binary '','电脑版','','profile','0'),(261,'050203','请购单','0502','/bill/purchase_apply','/bill/PurchaseApplyList',_binary '\0','0330',_binary '','电脑版','1,2,3,7','profile','0'),(262,'project','项目管理','0','/project','/layouts/TabLayout',NULL,'150',_binary '','0',NULL,'project','0'),(263,'project_category','项目类别','project','/project/category','/project/ProjectCategoryList',NULL,'151',_binary '','0','1,3','folder','0'),(264,'project_info','项目信息','project','/project/info','/project/ProjectList',NULL,'152',_binary '','0','1,3','file-text','0'),(265,'01020104','客户车辆','0102','/vehicle/vehicleList','/vehicle/VehicleList',_binary '\0','0264',_binary '','电脑端','1,3','profile','0'),(266,'workorder','工单管理','0','/workorder','/layouts/TabLayout',_binary '\0','0900',_binary '','电脑端',NULL,'scan','0'),(267,'workorder_info','工单信息','workorder','/workorder/workOrderList','/workorder/WorkOrderList',_binary '\0','0901',_binary '','电脑端','1,3','profile','0'),(268,'0910','选项管理','0001','/system/optionList','/system/OptionList',_binary '\0','0910',_binary '','电脑端','1','profile','0');
/*!40000 ALTER TABLE `jsh_function` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_in_out_item`
--

DROP TABLE IF EXISTS `jsh_in_out_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_in_out_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型',
  `remark` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='收支项目';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_in_out_item`
--

LOCK TABLES `jsh_in_out_item` WRITE;
/*!40000 ALTER TABLE `jsh_in_out_item` DISABLE KEYS */;
INSERT INTO `jsh_in_out_item` VALUES (21,'快递费','支出','',_binary '',NULL,63,'0'),(22,'房租收入','收入','',_binary '',NULL,63,'0'),(23,'利息收入','收入','收入',_binary '',NULL,63,'0'),(28,'moonshot','收入',NULL,_binary '',NULL,146,'0');
/*!40000 ALTER TABLE `jsh_in_out_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_log`
--

DROP TABLE IF EXISTS `jsh_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL COMMENT '用户id',
  `operation` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '操作模块名称',
  `client_ip` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '客户端IP',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `status` tinyint DEFAULT NULL COMMENT '操作状态 0==成功，1==失败',
  `content` varchar(5000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '详情',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FKF2696AA13E226853` (`user_id`) USING BTREE,
  KEY `create_time` (`create_time`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7739 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='操作日志';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_log`
--

LOCK TABLES `jsh_log` WRITE;
/*!40000 ALTER TABLE `jsh_log` DISABLE KEYS */;
INSERT INTO `jsh_log` VALUES (7608,63,'用户','127.0.0.1/127.0.0.1','2026-03-08 15:39:04',0,'登录jsh',63),(7609,63,'系统配置','127.0.0.1/127.0.0.1','2026-03-08 15:44:13',0,'修改公司test',63),(7610,63,'系统配置','127.0.0.1/127.0.0.1','2026-03-08 15:44:13',0,'修改公司test',63),(7611,63,'商品','127.0.0.1/127.0.0.1','2026-03-08 15:49:59',0,'新增轮胎001',63),(7612,63,'单据','127.0.0.1/127.0.0.1','2026-03-08 15:50:57',0,'新增LSCK00000000673',63),(7613,63,'单据','127.0.0.1/127.0.0.1','2026-03-08 15:51:04',0,'[审核]LSCK00000000673',63),(7614,63,'单据','127.0.0.1/127.0.0.1','2026-03-08 15:52:15',0,'新增CGDD00000000675[审核]',63),(7615,63,'单据','127.0.0.1/127.0.0.1','2026-03-08 15:54:18',0,'新增CGRK00000000676',63),(7616,63,'单据','127.0.0.1/127.0.0.1','2026-03-08 15:55:23',0,'新增CGRK00000000677',63),(7617,63,'单据','127.0.0.1/127.0.0.1','2026-03-08 15:56:31',0,'新增CGTH00000000678',63),(7618,120,'用户','127.0.0.1/127.0.0.1','2026-03-08 16:04:06',0,'登录admin',0),(7619,63,'用户','127.0.0.1/127.0.0.1','2026-03-08 17:00:10',0,'登录jsh',63),(7620,63,'用户','127.0.0.1/127.0.0.1','2026-03-09 08:43:34',0,'登录jsh',63),(7621,63,'用户','0:0:0:0:0:0:0:1','2026-03-09 08:46:54',0,'登录jsh',63),(7622,63,'用户','127.0.0.1/127.0.0.1','2026-03-09 08:52:10',0,'登录jsh',63),(7623,63,'用户','127.0.0.1','2026-03-09 09:22:47',0,'登录jsh',63),(7624,63,'用户','127.0.0.1','2026-03-09 10:47:59',0,'登录jsh',63),(7625,63,'用户','127.0.0.1','2026-03-09 10:48:40',0,'登录jsh',63),(7626,63,'用户','127.0.0.1','2026-03-09 10:49:11',0,'登录jsh',63),(7627,63,'用户','127.0.0.1','2026-03-09 10:50:49',0,'登录jsh',63),(7628,63,'用户','127.0.0.1','2026-03-09 10:52:20',0,'登录jsh',63),(7629,63,'用户','127.0.0.1','2026-03-09 13:18:12',0,'登录jsh',63),(7630,63,'用户','127.0.0.1','2026-03-09 13:18:59',0,'登录jsh',63),(7631,63,'用户','127.0.0.1','2026-03-09 13:27:22',0,'登录jsh',63),(7632,63,'用户','127.0.0.1','2026-03-09 13:28:30',0,'登录jsh',63),(7633,63,'用户','127.0.0.1','2026-03-09 14:59:16',0,'登录jsh',63),(7634,63,'用户','127.0.0.1/127.0.0.1','2026-03-09 16:18:08',0,'登录jsh',63),(7635,63,'商品类型','127.0.0.1/127.0.0.1','2026-03-09 17:27:17',0,'新增测试类',63),(7636,120,'用户','127.0.0.1/127.0.0.1','2026-03-09 17:34:17',0,'登录admin',0),(7637,146,'用户','127.0.0.1/127.0.0.1','2026-03-09 18:57:32',0,'登录wangxin',146),(7638,146,'商品属性','127.0.0.1/127.0.0.1','2026-03-09 18:59:04',0,'新增扩展1',146),(7639,146,'商品属性','127.0.0.1/127.0.0.1','2026-03-09 18:59:27',0,'新增扩展2',146),(7640,146,'商品属性','127.0.0.1/127.0.0.1','2026-03-09 18:59:46',0,'新增扩展3',146),(7641,146,'商品类型','127.0.0.1/127.0.0.1','2026-03-09 19:01:01',0,'新增轮胎',146),(7642,146,'用户','127.0.0.1/127.0.0.1','2026-03-09 21:30:46',0,'登录wangxin',146),(7643,120,'用户','127.0.0.1/127.0.0.1','2026-03-09 21:31:25',0,'登录admin',0),(7644,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-10 10:06:15',0,'修改',NULL),(7645,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-10 10:06:27',0,'修改角色的按钮权限',NULL),(7646,120,'用户','127.0.0.1/127.0.0.1','2026-03-10 10:06:44',0,'登录admin',0),(7647,146,'用户','127.0.0.1/127.0.0.1','2026-03-10 10:07:04',0,'登录wangxin',146),(7648,146,'用户','127.0.0.1/127.0.0.1','2026-03-10 10:16:00',0,'登录wangxin',146),(7649,146,'用户','127.0.0.1/127.0.0.1','2026-03-10 10:21:13',0,'登录wangxin',146),(7650,146,'项目类别','127.0.0.1/127.0.0.1','2026-03-10 10:40:42',0,'新增moonshot',146),(7651,146,'机构','127.0.0.1/127.0.0.1','2026-03-10 15:18:18',0,'新增测试机构',146),(7652,146,'用户','127.0.0.1/127.0.0.1','2026-03-10 15:18:38',0,'登录wangxin',146),(7653,120,'用户','127.0.0.1/127.0.0.1','2026-03-10 15:19:02',0,'登录admin',0),(7654,146,'用户','127.0.0.1/127.0.0.1','2026-03-11 13:59:19',0,'登录wangxin',146),(7655,146,'项目类别','127.0.0.1/127.0.0.1','2026-03-11 14:08:06',0,'新增保养',146),(7656,146,'商品类型','127.0.0.1/127.0.0.1','2026-03-11 14:10:01',0,'新增米其林',146),(7657,146,'项目类别','127.0.0.1/127.0.0.1','2026-03-11 14:15:17',0,'新增大保养',146),(7658,146,'项目类别','127.0.0.1/127.0.0.1','2026-03-11 14:25:19',0,'批量删除,id集:7,',146),(7659,146,'项目类别','127.0.0.1/127.0.0.1','2026-03-11 14:25:29',0,'批量删除,id集:5,',146),(7660,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 14:55:24',0,'新增112',146),(7661,146,'关联关系','127.0.0.1/127.0.0.1','2026-03-11 15:03:34',0,'新增',146),(7662,146,'仓库','127.0.0.1/127.0.0.1','2026-03-11 15:03:34',0,'新增默认仓库01',146),(7663,146,'商品类型','127.0.0.1/127.0.0.1','2026-03-11 15:06:09',0,'新增玻璃',146),(7664,146,'商品类型','127.0.0.1/127.0.0.1','2026-03-11 15:06:26',0,'新增刹车片',146),(7665,146,'商品','127.0.0.1/127.0.0.1','2026-03-11 15:08:57',0,'新增轮胎1',146),(7666,146,'商品','127.0.0.1/127.0.0.1','2026-03-11 15:09:10',0,'修改轮胎1',146),(7667,146,'商品','127.0.0.1/127.0.0.1','2026-03-11 15:09:29',0,'修改轮胎1',146),(7668,146,'商品','127.0.0.1/127.0.0.1','2026-03-11 15:11:34',0,'新增玻璃1',146),(7669,146,'商家','127.0.0.1/127.0.0.1','2026-03-11 16:46:37',0,'新增张三',146),(7670,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:47:43',0,'新增XSDD00000000679',146),(7671,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:50:04',0,'[审核]XSDD00000000679',146),(7672,146,'账户','127.0.0.1/127.0.0.1','2026-03-11 16:50:38',0,'新增测试账户',146),(7673,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:50:42',0,'新增XSCK00000000680',146),(7674,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:51:38',0,'[审核]XSCK00000000680',146),(7675,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:55:22',0,'新增LSCK00000000682[审核]',146),(7676,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:55:34',0,'新增LSCK00000000683',146),(7677,146,'单据','127.0.0.1/127.0.0.1','2026-03-11 16:55:45',0,'删除[LSCK00000000683]',146),(7678,146,'商品','127.0.0.1/127.0.0.1','2026-03-11 16:57:10',0,'新增轮胎2',146),(7679,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 18:58:07',0,'修改112',146),(7680,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 18:58:25',0,'修改112',146),(7681,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 19:03:01',0,'修改112',146),(7682,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 19:03:50',0,'修改112',146),(7683,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 19:03:56',0,'修改112',146),(7684,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:21:33',0,'修改112',146),(7685,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:21:44',0,'修改112',146),(7686,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:22:13',0,'修改112',146),(7687,146,'用户','127.0.0.1/127.0.0.1','2026-03-11 20:25:01',0,'登录wangxin',146),(7688,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:25:14',0,'修改112',146),(7689,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:41:34',0,'修改112',146),(7690,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:42:12',0,'修改112',146),(7691,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 20:42:29',0,'修改112',146),(7692,146,'用户','127.0.0.1/127.0.0.1','2026-03-11 20:45:39',0,'登录wangxin',146),(7693,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 21:08:07',0,'修改112',146),(7694,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 21:10:45',0,'修改112',146),(7695,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 21:14:27',0,'新增345',146),(7696,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 21:14:39',0,'批量删除,id集:5,4,',146),(7697,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-11 21:17:39',0,'新增666',146),(7698,146,'项目类别','127.0.0.1/127.0.0.1','2026-03-12 10:32:28',0,'新增洗车',146),(7699,146,'项目信息','127.0.0.1/127.0.0.1','2026-03-12 10:38:49',0,'新增洗车',146),(7700,120,'用户','127.0.0.1/127.0.0.1','2026-03-12 11:25:35',0,'登录admin',0),(7701,120,'用户','127.0.0.1/127.0.0.1','2026-03-12 11:40:29',0,'登录admin',0),(7702,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 11:43:45',0,'修改客户车辆',NULL),(7703,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-12 11:44:40',0,'修改',NULL),(7704,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-12 11:44:53',0,'修改角色的按钮权限',NULL),(7705,146,'用户','127.0.0.1/127.0.0.1','2026-03-12 11:45:09',0,'登录wangxin',146),(7706,120,'用户','127.0.0.1/127.0.0.1','2026-03-12 11:45:54',0,'登录admin',0),(7707,146,'用户','127.0.0.1/127.0.0.1','2026-03-12 11:46:30',0,'登录wangxin',146),(7708,146,'客户车辆','127.0.0.1/127.0.0.1','2026-03-12 11:57:47',0,'新增鲁B02k1A',146),(7709,146,'收支项目','127.0.0.1/127.0.0.1','2026-03-12 12:00:10',0,'新增moonshot',146),(7710,120,'用户','127.0.0.1/127.0.0.1','2026-03-12 14:00:52',0,'登录admin',0),(7711,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 14:16:28',0,'修改工单信息',NULL),(7712,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 14:20:39',0,'修改工单管理',NULL),(7713,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 14:24:06',0,'修改工单管理',NULL),(7714,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 14:24:40',0,'修改租户管理',NULL),(7715,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 14:24:44',0,'修改租户管理',NULL),(7716,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 14:26:18',0,'修改项目管理',NULL),(7717,120,'功能','127.0.0.1/127.0.0.1','2026-03-12 15:57:15',0,'修改项目管理',NULL),(7718,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-12 15:57:50',0,'修改',NULL),(7719,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-12 15:58:18',0,'修改角色的按钮权限',NULL),(7720,146,'用户','127.0.0.1/127.0.0.1','2026-03-12 15:58:38',0,'登录wangxin',146),(7721,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-14 20:19:58',0,'新增WO20260314201957932',146),(7722,146,'用户','127.0.0.1/127.0.0.1','2026-03-15 19:40:02',0,'登录wangxin',146),(7723,120,'用户','127.0.0.1/127.0.0.1','2026-03-15 19:40:21',0,'登录admin',0),(7724,120,'功能','127.0.0.1/127.0.0.1','2026-03-15 19:42:53',0,'修改选项管理',NULL),(7725,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-15 19:43:21',0,'修改角色的按钮权限',NULL),(7726,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-15 19:43:31',0,'修改',NULL),(7727,120,'关联关系','127.0.0.1/127.0.0.1','2026-03-15 19:43:39',0,'修改角色的按钮权限',NULL),(7728,146,'用户','127.0.0.1/127.0.0.1','2026-03-15 19:44:46',0,'登录wangxin',146),(7729,146,'用户','127.0.0.1/127.0.0.1','2026-03-23 11:19:25',0,'登录wangxin',146),(7730,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 13:15:49',0,'修改null',146),(7731,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 13:16:00',0,'更新状态，id:3 status:1',146),(7732,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 13:16:12',0,'更新状态，id:3 status:2',146),(7733,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 13:16:21',0,'更新状态，id:3 status:3',146),(7734,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 13:20:58',0,'更新状态，id:3 status:4',146),(7735,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 14:13:13',0,'新增WO20260323141312505',146),(7736,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 14:21:34',0,'更新状态，id:4 status:2',146),(7737,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 14:21:47',0,'更新状态，id:4 status:3',146),(7738,146,'工单管理','127.0.0.1/127.0.0.1','2026-03-23 14:26:45',0,'工单结算，编号:WO20260323141312505 金额:271',146);
/*!40000 ALTER TABLE `jsh_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material`
--

DROP TABLE IF EXISTS `jsh_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `category_id` bigint DEFAULT NULL COMMENT '产品类型id',
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `mfrs` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '制造商',
  `model` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '型号',
  `standard` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '规格',
  `brand` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '品牌',
  `mnemonic` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '助记码',
  `color` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '颜色',
  `unit` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '单位-单个',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `img_name` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '图片名称',
  `unit_id` bigint DEFAULT NULL COMMENT '单位Id',
  `expiry_num` int DEFAULT NULL COMMENT '保质期天数',
  `weight` decimal(24,6) DEFAULT NULL COMMENT '基础重量(kg)',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用 0-禁用  1-启用',
  `other_field1` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '自定义1',
  `other_field2` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '自定义2',
  `other_field3` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '自定义3',
  `enable_serial_number` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '是否开启序列号，0否，1是',
  `enable_batch_number` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '是否开启批号，0否，1是',
  `position` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '仓位货架',
  `attribute` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '多属性信息',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK675951272AB6672C` (`category_id`) USING BTREE,
  KEY `UnitId` (`unit_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=624 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='产品表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material`
--

LOCK TABLES `jsh_material` WRITE;
/*!40000 ALTER TABLE `jsh_material` DISABLE KEYS */;
INSERT INTO `jsh_material` VALUES (568,17,'商品1','制1','sp1','',NULL,NULL,'','个','',NULL,NULL,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(569,17,'商品2','','sp2','',NULL,NULL,'','只','',NULL,NULL,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(570,17,'商品3','','sp3','',NULL,NULL,'','个','',NULL,NULL,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(577,NULL,'商品8','','sp8','',NULL,NULL,'','','',NULL,15,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(579,21,'商品17','','sp17','',NULL,NULL,'','','',NULL,15,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(586,17,'序列号商品测试','','xlh123','',NULL,NULL,'','个','',NULL,NULL,NULL,NULL,_binary '','','','','1','0',NULL,NULL,63,'0'),(587,17,'商品test1','南通中远','','test1',NULL,NULL,'','个','',NULL,NULL,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(588,21,'商品200','fafda','weqwe','300ml',NULL,NULL,'红色','个','aaaabbbbb',NULL,NULL,NULL,NULL,_binary '','','','','0','0',NULL,NULL,63,'0'),(619,NULL,'衣服',NULL,NULL,NULL,NULL,NULL,NULL,'件',NULL,'',NULL,NULL,NULL,_binary '',NULL,NULL,NULL,'0','0',NULL,NULL,63,'0'),(620,NULL,'轮胎001',NULL,NULL,NULL,NULL,'lt001',NULL,'件',NULL,'',NULL,NULL,NULL,_binary '',NULL,NULL,NULL,'0','0',NULL,'{}',63,'0'),(621,31,'轮胎1',NULL,NULL,'225/45R18',NULL,'lt1',NULL,'条',NULL,'',NULL,NULL,NULL,_binary '',NULL,NULL,NULL,'0','0',NULL,'{}',146,'0'),(622,32,'玻璃1',NULL,NULL,NULL,NULL,'bl1',NULL,'块',NULL,'',NULL,NULL,NULL,_binary '',NULL,NULL,NULL,'0','0',NULL,'{}',146,'0'),(623,31,'轮胎2',NULL,NULL,NULL,NULL,'lt2',NULL,'条',NULL,'',NULL,NULL,NULL,_binary '',NULL,NULL,NULL,'0','0',NULL,'{}',146,'0');
/*!40000 ALTER TABLE `jsh_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material_attribute`
--

DROP TABLE IF EXISTS `jsh_material_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material_attribute` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attribute_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '属性名',
  `attribute_value` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '属性值',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='产品属性表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material_attribute`
--

LOCK TABLES `jsh_material_attribute` WRITE;
/*!40000 ALTER TABLE `jsh_material_attribute` DISABLE KEYS */;
INSERT INTO `jsh_material_attribute` VALUES (1,'多颜色','红色|橙色|黄色|绿色|蓝色|紫色',63,'0'),(2,'多尺寸','S|M|L|XL|XXL|XXXL',63,'0'),(3,'自定义1','小米|华为',63,'0'),(4,'自定义2',NULL,63,'0'),(5,'自定义3',NULL,63,'0');
/*!40000 ALTER TABLE `jsh_material_attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material_category`
--

DROP TABLE IF EXISTS `jsh_material_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `category_level` smallint DEFAULT NULL COMMENT '等级',
  `parent_id` bigint DEFAULT NULL COMMENT '上级id',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '显示顺序',
  `serial_no` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '编号',
  `remark` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK3EE7F725237A77D8` (`parent_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='产品类型表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material_category`
--

LOCK TABLES `jsh_material_category` WRITE;
/*!40000 ALTER TABLE `jsh_material_category` DISABLE KEYS */;
INSERT INTO `jsh_material_category` VALUES (17,'目录1',NULL,NULL,'11','wae12','eee','2019-04-10 22:18:12','2021-02-17 15:11:35',63,'0'),(21,'目录2',NULL,17,'22','ada112','ddd','2020-07-20 23:08:44','2020-07-20 23:08:44',63,'0'),(29,'测试类',NULL,NULL,'2','001',NULL,'2026-03-09 17:27:17','2026-03-09 17:27:17',63,'0'),(30,'轮胎',NULL,NULL,NULL,'qsd0021',NULL,'2026-03-09 19:01:01','2026-03-09 19:01:01',146,'0'),(31,'米其林',NULL,30,NULL,'0035',NULL,'2026-03-11 14:10:01','2026-03-11 14:10:01',146,'0'),(32,'玻璃',NULL,NULL,NULL,'002',NULL,'2026-03-11 15:06:09','2026-03-11 15:06:09',146,'0'),(33,'刹车片',NULL,NULL,NULL,'003',NULL,'2026-03-11 15:06:26','2026-03-11 15:06:26',146,'0');
/*!40000 ALTER TABLE `jsh_material_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material_current_stock`
--

DROP TABLE IF EXISTS `jsh_material_current_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material_current_stock` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `material_id` bigint DEFAULT NULL COMMENT '产品id',
  `depot_id` bigint DEFAULT NULL COMMENT '仓库id',
  `current_number` decimal(24,6) DEFAULT NULL COMMENT '当前库存数量',
  `current_unit_price` decimal(24,6) DEFAULT NULL COMMENT '当前单价',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `material_id` (`material_id`) USING BTREE,
  KEY `depot_id` (`depot_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT COMMENT='产品当前库存';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material_current_stock`
--

LOCK TABLES `jsh_material_current_stock` WRITE;
/*!40000 ALTER TABLE `jsh_material_current_stock` DISABLE KEYS */;
INSERT INTO `jsh_material_current_stock` VALUES (19,588,14,7.000000,NULL,63,'0'),(20,568,14,2.000000,NULL,63,'0'),(21,568,15,1.000000,NULL,63,'0'),(22,570,14,8.000000,NULL,63,'0'),(23,619,14,5.000000,NULL,63,'0'),(24,619,15,0.000000,NULL,63,'0'),(25,619,17,0.000000,NULL,63,'0'),(26,620,14,52.000000,23.425900,63,'0'),(27,620,15,1.000000,23.425900,63,'0'),(28,620,17,1.000000,23.425900,63,'0'),(29,621,19,28.000000,0.000000,146,'0'),(30,622,19,65.000000,0.000000,146,'0');
/*!40000 ALTER TABLE `jsh_material_current_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material_extend`
--

DROP TABLE IF EXISTS `jsh_material_extend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material_extend` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `material_id` bigint DEFAULT NULL COMMENT '商品id',
  `bar_code` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '商品条码',
  `commodity_unit` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '商品单位',
  `sku` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '多属性',
  `purchase_decimal` decimal(24,6) DEFAULT NULL COMMENT '采购价格',
  `commodity_decimal` decimal(24,6) DEFAULT NULL COMMENT '零售价格',
  `wholesale_decimal` decimal(24,6) DEFAULT NULL COMMENT '销售价格',
  `low_decimal` decimal(24,6) DEFAULT NULL COMMENT '最低售价',
  `default_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '1' COMMENT '是否为默认单位，1是，0否',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `create_serial` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '创建人编码',
  `update_serial` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '更新人编码',
  `update_time` bigint DEFAULT NULL COMMENT '更新时间戳',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_Flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `material_id` (`material_id`) USING BTREE,
  KEY `bar_code` (`bar_code`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT COMMENT='产品价格扩展';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material_extend`
--

LOCK TABLES `jsh_material_extend` WRITE;
/*!40000 ALTER TABLE `jsh_material_extend` DISABLE KEYS */;
INSERT INTO `jsh_material_extend` VALUES (1,587,'1000','个',NULL,11.000000,22.000000,22.000000,22.000000,'1','2020-02-20 23:22:03','jsh','jsh',1595263657135,63,'0'),(2,568,'1001','个',NULL,11.000000,15.000000,15.000000,15.000000,'1','2020-02-20 23:44:57','jsh','jsh',1595265439418,63,'0'),(3,569,'1002','只',NULL,10.000000,15.000000,15.000000,13.000000,'1','2020-02-20 23:45:15','jsh','jsh',1582213514731,63,'0'),(4,570,'1003','个',NULL,8.000000,15.000000,14.000000,13.000000,'1','2020-02-20 23:45:37','jsh','jsh',1587657604430,63,'0'),(5,577,'1004','个',NULL,10.000000,20.000000,20.000000,20.000000,'1','2020-02-20 23:46:36','jsh','jsh',1582213596494,63,'0'),(6,577,'1005','箱',NULL,120.000000,240.000000,240.000000,240.000000,'0','2020-02-20 23:46:36','jsh','jsh',1582213596497,63,'0'),(7,579,'1006','个',NULL,20.000000,30.000000,30.000000,30.000000,'1','2020-02-20 23:47:04','jsh','jsh',1595264270458,63,'0'),(8,579,'1007','箱',NULL,240.000000,360.000000,360.000000,360.000000,'0','2020-02-20 23:47:04','jsh','jsh',1595264270466,63,'0'),(9,586,'1008','个',NULL,12.000000,15.000000,15.000000,15.000000,'1','2020-02-20 23:47:23','jsh','jsh',1595254981896,63,'0'),(10,588,'1009','个',NULL,11.000000,22.000000,22.000000,22.000000,'1','2020-07-21 00:58:15','jsh','jsh',1614699799073,63,'0'),(36,619,'1014','件','橙色,M',12.000000,15.000000,14.000000,NULL,'1','2021-07-28 01:00:20','jsh','jsh',1627405220316,63,'0'),(37,619,'1015','件','橙色,L',12.000000,15.000000,14.000000,NULL,'0','2021-07-28 01:00:20','jsh','jsh',1627405220327,63,'0'),(38,619,'1016','件','绿色,M',12.000000,15.000000,14.000000,NULL,'0','2021-07-28 01:00:20','jsh','jsh',1627405220336,63,'0'),(39,619,'1017','件','绿色,L',12.000000,15.000000,14.000000,NULL,'0','2021-07-28 01:00:20','jsh','jsh',1627405220346,63,'0'),(40,620,'1018','件','',23.000000,56.000000,50.000000,45.000000,'1','2026-03-08 15:49:59','jsh','jsh',1772956591217,63,'0'),(41,621,'1001','条','',100.000000,120.000000,110.000000,105.000000,'1','2026-03-11 15:08:57','wangxin','wangxin',1773219334235,146,'0'),(42,621,'1002','条','',99.000000,119.000000,109.000000,104.000000,'0','2026-03-11 15:08:57','wangxin','wangxin',1773219042438,146,'0'),(43,621,'1003','条','',NULL,NULL,NULL,NULL,'0','2026-03-11 15:08:57','wangxin','wangxin',1773212968892,146,'0'),(44,621,'1004','条','',NULL,NULL,NULL,NULL,'0','2026-03-11 15:08:57','wangxin','wangxin',1773212968907,146,'0'),(45,622,'1005','块','',56.000000,90.000000,80.000000,77.000000,'1','2026-03-11 15:11:34','wangxin','wangxin',1773219042379,146,'0'),(46,623,'1006','条','',98.000000,106.000000,100.000000,100.000000,'1','2026-03-11 16:57:10','wangxin','wangxin',1773219430253,146,'0');
/*!40000 ALTER TABLE `jsh_material_extend` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material_initial_stock`
--

DROP TABLE IF EXISTS `jsh_material_initial_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material_initial_stock` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `material_id` bigint DEFAULT NULL COMMENT '产品id',
  `depot_id` bigint DEFAULT NULL COMMENT '仓库id',
  `number` decimal(24,6) DEFAULT NULL COMMENT '初始库存数量',
  `low_safe_stock` decimal(24,6) DEFAULT NULL COMMENT '最低库存数量',
  `high_safe_stock` decimal(24,6) DEFAULT NULL COMMENT '最高库存数量',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `material_id` (`material_id`) USING BTREE,
  KEY `depot_id` (`depot_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT COMMENT='产品初始库存';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material_initial_stock`
--

LOCK TABLES `jsh_material_initial_stock` WRITE;
/*!40000 ALTER TABLE `jsh_material_initial_stock` DISABLE KEYS */;
INSERT INTO `jsh_material_initial_stock` VALUES (206,621,19,30.000000,NULL,NULL,146,'0'),(207,622,19,66.000000,NULL,NULL,146,'0');
/*!40000 ALTER TABLE `jsh_material_initial_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_material_property`
--

DROP TABLE IF EXISTS `jsh_material_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_material_property` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `native_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '原始名称',
  `enabled` bit(1) DEFAULT NULL COMMENT '是否启用',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `another_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '别名',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='产品扩展字段表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_material_property`
--

LOCK TABLES `jsh_material_property` WRITE;
/*!40000 ALTER TABLE `jsh_material_property` DISABLE KEYS */;
INSERT INTO `jsh_material_property` VALUES (6,'扩展1',NULL,NULL,'颜色',146,'0'),(7,'扩展2',NULL,NULL,'重量',146,'0'),(8,'扩展3',NULL,NULL,'光泽',146,'0');
/*!40000 ALTER TABLE `jsh_material_property` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_msg`
--

DROP TABLE IF EXISTS `jsh_msg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_msg` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `msg_title` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '消息标题',
  `msg_content` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '消息内容',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '消息类型',
  `user_id` bigint DEFAULT NULL COMMENT '接收人id',
  `status` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '状态，1未读 2已读',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_Flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT COMMENT='消息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_msg`
--

LOCK TABLES `jsh_msg` WRITE;
/*!40000 ALTER TABLE `jsh_msg` DISABLE KEYS */;
INSERT INTO `jsh_msg` VALUES (2,'标题1','内容1','2019-09-10 00:11:39','类型1',63,'2',63,'0');
/*!40000 ALTER TABLE `jsh_msg` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_option_group`
--

DROP TABLE IF EXISTS `jsh_option_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_option_group` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(64) NOT NULL COMMENT '选项组编码（如 customer_source）',
  `name` varchar(100) NOT NULL COMMENT '选项组名称（如 客户来源）',
  `scope` varchar(20) NOT NULL DEFAULT 'system' COMMENT '作用域：system-系统级, tenant-租户级',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID，系统级为空',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标记 0=正常 1=删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code_tenant` (`code`,`tenant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='通用下拉选项-选项组';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_option_group`
--

LOCK TABLES `jsh_option_group` WRITE;
/*!40000 ALTER TABLE `jsh_option_group` DISABLE KEYS */;
INSERT INTO `jsh_option_group` VALUES (1,'workorder_status','工单状态','system',NULL,NULL,1,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(2,'vehicle_purpose','车辆用途','system',NULL,NULL,1,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(3,'customer_source','客户来源','system',NULL,NULL,1,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(4,'dispatch_staff','派工人员','system',NULL,'工单派工时可选择的人员',1,'2026-03-23 11:33:58','2026-03-23 11:33:58','0');
/*!40000 ALTER TABLE `jsh_option_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_option_item`
--

DROP TABLE IF EXISTS `jsh_option_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_option_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `group_code` varchar(64) NOT NULL COMMENT '所属选项组编码',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID，系统级为空',
  `value` varchar(64) NOT NULL COMMENT '选项值（存入业务表的代码）',
  `label` varchar(100) NOT NULL COMMENT '选项名称（展示用）',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序号',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认选中',
  `hidden` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否隐藏系统默认项',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标记 0=正常 1=删除',
  PRIMARY KEY (`id`),
  KEY `idx_group_tenant` (`group_code`,`tenant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='通用下拉选项-选项项';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_option_item`
--

LOCK TABLES `jsh_option_item` WRITE;
/*!40000 ALTER TABLE `jsh_option_item` DISABLE KEYS */;
INSERT INTO `jsh_option_item` VALUES (1,'workorder_status',NULL,'0','草稿',0,1,1,0,'2026-03-15 10:33:24','2026-03-23 14:17:35','1'),(2,'workorder_status',NULL,'1','待派工',1,1,1,0,'2026-03-15 10:33:24','2026-03-23 14:17:35','0'),(3,'workorder_status',NULL,'2','维修中',2,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(4,'workorder_status',NULL,'3','已完工',3,1,0,0,'2026-03-15 10:33:24','2026-03-23 13:29:41','0'),(5,'workorder_status',NULL,'4','待收款',4,1,0,0,'2026-03-15 10:33:24','2026-03-23 13:29:41','0'),(6,'workorder_status',NULL,'5','已收款',5,1,0,0,'2026-03-15 10:33:24','2026-03-23 13:29:41','0'),(7,'vehicle_purpose',NULL,'乘用车','乘用车',0,1,1,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(8,'vehicle_purpose',NULL,'商用车','商用车',1,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(9,'vehicle_purpose',NULL,'专用车','专用车',2,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(10,'customer_source',NULL,'ZRLF','自然来访',0,1,1,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(11,'customer_source',NULL,'FRJJ','朋友介绍',1,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(12,'customer_source',NULL,'WLZH','网络渠道',2,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(13,'customer_source',NULL,'DHYY','电话预约',3,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(14,'customer_source',NULL,'BXLD','保险理赔',4,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(15,'customer_source',NULL,'QTLY','其他',5,1,0,0,'2026-03-15 10:33:24','2026-03-15 10:33:24','0'),(16,'workorder_status',146,'0','草稿',0,1,1,0,'2026-03-15 20:16:37','2026-03-23 14:17:35','1'),(17,'workorder_status',146,'1','待派工',1,1,1,0,'2026-03-15 20:16:37','2026-03-23 14:17:35','0'),(18,'workorder_status',146,'2','维修中',2,1,0,0,'2026-03-15 20:16:37','2026-03-15 20:16:37','0'),(19,'workorder_status',146,'3','已完工',3,1,0,0,'2026-03-15 20:16:37','2026-03-23 13:29:41','0'),(20,'workorder_status',146,'4','待收款',4,1,0,0,'2026-03-15 20:16:37','2026-03-23 13:29:41','0'),(21,'workorder_status',146,'5','已收款',5,1,0,0,'2026-03-15 20:16:37','2026-03-23 13:29:41','0'),(22,'workorder_status',146,'测试','测试',6,1,0,0,'2026-03-15 20:21:23','2026-03-15 20:21:23','0'),(23,'dispatch_staff',146,'张三','张三',0,1,0,0,'2026-03-23 13:15:42','2026-03-23 13:15:42','0'),(26,'workorder_status',NULL,'6','已取消',6,1,0,0,'2026-03-23 13:30:37','2026-03-23 13:30:37','0'),(27,'workorder_status',146,'6','已取消',6,1,0,0,'2026-03-23 13:30:37','2026-03-23 13:30:37','0'),(28,'dispatch_staff',146,'李四','李四',1,1,0,0,'2026-03-23 14:12:11','2026-03-23 14:12:11','0');
/*!40000 ALTER TABLE `jsh_option_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_orga_user_rel`
--

DROP TABLE IF EXISTS `jsh_orga_user_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_orga_user_rel` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `orga_id` bigint DEFAULT NULL COMMENT '机构id',
  `user_id` bigint NOT NULL COMMENT '用户id',
  `user_blng_orga_dspl_seq` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '用户在所属机构中显示顺序',
  `delete_flag` char(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `creator` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `updater` bigint DEFAULT NULL COMMENT '更新人',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `orga_id` (`orga_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `creator` (`creator`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='机构用户关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_orga_user_rel`
--

LOCK TABLES `jsh_orga_user_rel` WRITE;
/*!40000 ALTER TABLE `jsh_orga_user_rel` DISABLE KEYS */;
INSERT INTO `jsh_orga_user_rel` VALUES (10,13,131,'2','0','2019-12-28 12:13:15',63,'2021-03-18 22:33:19',63,63),(11,12,63,'15','0','2020-09-13 18:42:45',63,'2021-03-19 00:11:40',63,63),(12,13,135,'9','0','2021-03-18 22:24:25',63,'2021-03-19 00:09:23',63,63),(13,13,134,'1','0','2021-03-18 22:31:39',63,'2021-03-18 23:59:55',63,63),(14,22,133,'22','0','2021-03-18 22:31:44',63,'2021-03-18 22:32:04',63,63),(15,12,144,NULL,'0','2021-03-19 00:00:40',63,'2021-03-19 00:08:07',63,63),(16,12,145,NULL,'0','2021-03-19 00:03:44',63,'2021-03-19 00:03:44',63,63);
/*!40000 ALTER TABLE `jsh_orga_user_rel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_organization`
--

DROP TABLE IF EXISTS `jsh_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_organization` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `org_no` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '机构编号',
  `org_abr` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '机构简称',
  `parent_id` bigint DEFAULT NULL COMMENT '父机构id',
  `sort` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '机构显示顺序',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='机构表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_organization`
--

LOCK TABLES `jsh_organization` WRITE;
/*!40000 ALTER TABLE `jsh_organization` DISABLE KEYS */;
INSERT INTO `jsh_organization` VALUES (12,'001','测试机构',NULL,'2','aaaa2','2019-12-28 12:13:01','2019-12-28 12:13:01',63,'0'),(13,'jg1','机构1',12,'3','','2020-07-21 00:09:57','2020-07-21 00:10:22',63,'0'),(14,'12','机构2',13,'4','','2020-07-21 22:45:42','2021-02-15 22:18:30',63,'0'),(24,'0012','测试机构',NULL,NULL,NULL,'2026-03-10 15:18:18','2026-03-10 15:18:18',146,'0');
/*!40000 ALTER TABLE `jsh_organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_person`
--

DROP TABLE IF EXISTS `jsh_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_person` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '姓名',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='经手人表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_person`
--

LOCK TABLES `jsh_person` WRITE;
/*!40000 ALTER TABLE `jsh_person` DISABLE KEYS */;
INSERT INTO `jsh_person` VALUES (14,'销售员','小李',_binary '',NULL,63,'0'),(15,'仓管员','小军',_binary '',NULL,63,'0'),(16,'财务员','小夏',_binary '',NULL,63,'0'),(17,'财务员','小曹',_binary '',NULL,63,'0');
/*!40000 ALTER TABLE `jsh_person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_platform_config`
--

DROP TABLE IF EXISTS `jsh_platform_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_platform_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `platform_key` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '关键词',
  `platform_key_info` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '关键词名称',
  `platform_value` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '值',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='平台参数';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_platform_config`
--

LOCK TABLES `jsh_platform_config` WRITE;
/*!40000 ALTER TABLE `jsh_platform_config` DISABLE KEYS */;
INSERT INTO `jsh_platform_config` VALUES (1,'platform_name','平台名称','哇哇ERP'),(2,'activation_code','激活码',''),(3,'platform_url','官方网站','http://www.baidu.com/'),(4,'bill_print_flag','三联打印启用标记','1'),(5,'bill_print_url','三联打印地址',''),(6,'pay_fee_url','租户续费地址',''),(7,'register_flag','注册启用标记','1'),(8,'app_activation_code','手机端激活码',''),(9,'send_workflow_url','发起流程地址',''),(10,'weixinUrl','微信url',''),(11,'weixinAppid','微信appid',''),(12,'weixinSecret','微信secret',''),(13,'aliOss_endpoint','阿里OSS-endpoint',''),(14,'aliOss_accessKeyId','阿里OSS-accessKeyId',''),(15,'aliOss_accessKeySecret','阿里OSS-accessKeySecret',''),(16,'aliOss_bucketName','阿里OSS-bucketName',''),(17,'aliOss_linkUrl','阿里OSS-linkUrl',''),(18,'bill_excel_url','单据Excel地址',''),(19,'email_from','邮件发送端-发件人',''),(20,'email_auth_code','邮件发送端-授权码',''),(21,'email_smtp_host','邮件发送端-SMTP服务器',''),(22,'checkcode_flag','验证码启用标记','1');
/*!40000 ALTER TABLE `jsh_platform_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_project`
--

DROP TABLE IF EXISTS `jsh_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_project` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '项目名称',
  `category_id` bigint DEFAULT NULL COMMENT '项目类别id',
  `hourly_rate` decimal(24,2) DEFAULT NULL COMMENT '工时单价（元/小时）',
  `default_hours` decimal(24,2) DEFAULT NULL COMMENT '默认工时（小时）',
  `total_price` decimal(24,2) DEFAULT '0.00' COMMENT '项目总价',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `enabled` bit(1) DEFAULT b'1' COMMENT '启用 0-禁用  1-启用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `category_id` (`category_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='项目信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_project`
--

LOCK TABLES `jsh_project` WRITE;
/*!40000 ALTER TABLE `jsh_project` DISABLE KEYS */;
INSERT INTO `jsh_project` VALUES (1,'ERP系统开发',2,500.00,160.00,0.00,'企业资源规划系统开发项目',_binary '','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(2,'移动商城APP',3,600.00,200.00,0.00,'电商移动应用开发',_binary '','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(3,'企业管理咨询',4,800.00,80.00,0.00,'企业管理流程优化咨询',_binary '','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(4,'112',6,12.00,23.00,786.00,'123123',_binary '','2026-03-11 14:55:24','2026-03-11 21:14:39',146,'1'),(5,'345',6,11.00,1.00,11.00,NULL,_binary '','2026-03-11 21:14:27','2026-03-11 21:14:39',146,'1'),(6,'666',6,45.00,1.00,45.00,NULL,_binary '','2026-03-11 21:17:39','2026-03-11 21:17:39',146,'0'),(7,'洗车',8,30.00,1.00,210.00,NULL,_binary '','2026-03-12 10:38:49','2026-03-12 10:38:49',146,'0');
/*!40000 ALTER TABLE `jsh_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_project_category`
--

DROP TABLE IF EXISTS `jsh_project_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_project_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类别名称',
  `category_level` smallint DEFAULT NULL COMMENT '等级',
  `parent_id` bigint DEFAULT NULL COMMENT '上级id',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '显示顺序',
  `serial_no` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '编号',
  `remark` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `parent_id` (`parent_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='项目类别表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_project_category`
--

LOCK TABLES `jsh_project_category` WRITE;
/*!40000 ALTER TABLE `jsh_project_category` DISABLE KEYS */;
INSERT INTO `jsh_project_category` VALUES (1,'软件开发',NULL,NULL,'10','PRJ_CAT_001','软件开发类项目','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(2,'Web开发',NULL,1,'11','PRJ_CAT_002','Web应用开发','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(3,'移动开发',NULL,1,'12','PRJ_CAT_003','移动应用开发','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(4,'咨询服务',NULL,NULL,'20','PRJ_CAT_004','咨询服务类项目','2026-03-09 20:43:31','2026-03-09 20:43:31',63,'0'),(5,'moonshot',NULL,NULL,'123','01',NULL,'2026-03-10 10:40:42','2026-03-11 14:25:29',146,'1'),(6,'保养',NULL,NULL,'2','0101',NULL,'2026-03-11 14:08:06','2026-03-11 14:08:06',146,'0'),(7,'大保养',NULL,6,NULL,'小保养',NULL,'2026-03-11 14:15:17','2026-03-11 14:25:19',146,'1'),(8,'洗车',NULL,NULL,NULL,'002',NULL,'2026-03-12 10:32:28','2026-03-12 10:32:28',146,'0');
/*!40000 ALTER TABLE `jsh_project_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_project_material`
--

DROP TABLE IF EXISTS `jsh_project_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_project_material` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `material_id` bigint NOT NULL COMMENT '商品ID',
  `quantity` int DEFAULT '1' COMMENT '数量',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `delete_flag` varchar(1) DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3 COMMENT='项目商品关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_project_material`
--

LOCK TABLES `jsh_project_material` WRITE;
/*!40000 ALTER TABLE `jsh_project_material` DISABLE KEYS */;
INSERT INTO `jsh_project_material` VALUES (1,4,623,1,'2026-03-11 18:58:07',146,'1'),(2,4,622,1,'2026-03-11 18:58:07',146,'1'),(3,4,623,1,'2026-03-11 18:58:25',146,'1'),(4,4,622,1,'2026-03-11 18:58:25',146,'1'),(5,4,622,3,'2026-03-11 19:03:50',146,'1'),(6,4,621,2,'2026-03-11 19:03:50',146,'1'),(7,4,622,3,'2026-03-11 19:03:56',146,'1'),(8,4,621,2,'2026-03-11 19:03:56',146,'1'),(9,4,622,3,'2026-03-11 20:21:33',146,'1'),(10,4,621,2,'2026-03-11 20:21:33',146,'1'),(11,4,622,3,'2026-03-11 20:21:44',146,'1'),(12,4,621,2,'2026-03-11 20:21:44',146,'1'),(13,4,622,3,'2026-03-11 20:22:12',146,'1'),(14,4,621,2,'2026-03-11 20:22:12',146,'1'),(15,4,622,3,'2026-03-11 20:25:14',146,'1'),(16,4,621,2,'2026-03-11 20:25:14',146,'1'),(17,4,622,3,'2026-03-11 20:41:34',146,'1'),(18,4,621,2,'2026-03-11 20:41:34',146,'1'),(19,4,622,3,'2026-03-11 20:42:12',146,'1'),(20,4,621,2,'2026-03-11 20:42:12',146,'1'),(21,4,622,3,'2026-03-11 20:42:29',146,'1'),(22,4,621,2,'2026-03-11 20:42:29',146,'1'),(23,4,622,3,'2026-03-11 21:08:07',146,'1'),(24,4,621,2,'2026-03-11 21:08:07',146,'1'),(25,4,622,3,'2026-03-11 21:10:45',146,'0'),(26,4,621,2,'2026-03-11 21:10:45',146,'0'),(27,7,622,2,'2026-03-12 10:38:49',146,'0');
/*!40000 ALTER TABLE `jsh_project_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_role`
--

DROP TABLE IF EXISTS `jsh_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型',
  `price_limit` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '价格屏蔽 1-屏蔽采购价 2-屏蔽零售价 3-屏蔽销售价',
  `value` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '值',
  `description` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '描述',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_role`
--

LOCK TABLES `jsh_role` WRITE;
/*!40000 ALTER TABLE `jsh_role` DISABLE KEYS */;
INSERT INTO `jsh_role` VALUES (4,'管理员','全部数据',NULL,NULL,NULL,_binary '',NULL,NULL,'0'),(10,'租户','全部数据',NULL,NULL,'',_binary '',NULL,NULL,'0'),(16,'销售经理','全部数据',NULL,NULL,'ddd',_binary '',NULL,63,'0'),(17,'销售代表','个人数据',NULL,NULL,'rrr',_binary '',NULL,63,'0');
/*!40000 ALTER TABLE `jsh_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_sequence`
--

DROP TABLE IF EXISTS `jsh_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_sequence` (
  `seq_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '序列名称',
  `min_value` bigint NOT NULL COMMENT '最小值',
  `max_value` bigint NOT NULL COMMENT '最大值',
  `current_val` bigint NOT NULL COMMENT '当前值',
  `increment_val` int NOT NULL DEFAULT '1' COMMENT '增长步数',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`seq_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='单据编号表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_sequence`
--

LOCK TABLES `jsh_sequence` WRITE;
/*!40000 ALTER TABLE `jsh_sequence` DISABLE KEYS */;
INSERT INTO `jsh_sequence` VALUES ('depot_number_seq',1,999999999999999999,685,1,'单据编号sequence');
/*!40000 ALTER TABLE `jsh_sequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_serial_number`
--

DROP TABLE IF EXISTS `jsh_serial_number`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_serial_number` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `material_id` bigint DEFAULT NULL COMMENT '产品表id',
  `depot_id` bigint DEFAULT NULL COMMENT '仓库id',
  `serial_number` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '序列号',
  `is_sell` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '是否卖出，0未卖出，1卖出',
  `in_price` decimal(24,6) DEFAULT NULL COMMENT '入库单价',
  `remark` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `creator` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `updater` bigint DEFAULT NULL COMMENT '更新人',
  `in_bill_no` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '入库单号',
  `out_bill_no` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '出库单号',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `material_id` (`material_id`) USING BTREE,
  KEY `depot_id` (`depot_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='序列号表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_serial_number`
--

LOCK TABLES `jsh_serial_number` WRITE;
/*!40000 ALTER TABLE `jsh_serial_number` DISABLE KEYS */;
/*!40000 ALTER TABLE `jsh_serial_number` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_supplier`
--

DROP TABLE IF EXISTS `jsh_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_supplier` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `supplier` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '供应商名称',
  `contacts` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '联系人',
  `phone_num` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '电子邮箱',
  `description` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `isystem` tinyint DEFAULT NULL COMMENT '是否系统自带 0==系统 1==非系统',
  `type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类型',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `advance_in` decimal(24,6) DEFAULT '0.000000' COMMENT '预收款',
  `begin_need_get` decimal(24,6) DEFAULT NULL COMMENT '期初应收',
  `begin_need_pay` decimal(24,6) DEFAULT NULL COMMENT '期初应付',
  `all_need_get` decimal(24,6) DEFAULT NULL COMMENT '累计应收',
  `all_need_pay` decimal(24,6) DEFAULT NULL COMMENT '累计应付',
  `fax` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '传真',
  `telephone` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '手机',
  `address` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '地址',
  `tax_num` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '纳税人识别号',
  `bank_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '开户行',
  `account_number` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '账号',
  `tax_rate` decimal(24,6) DEFAULT NULL COMMENT '税率',
  `sort` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '排序',
  `creator` bigint DEFAULT NULL COMMENT '操作员',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `type` (`type`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='供应商/客户信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_supplier`
--

LOCK TABLES `jsh_supplier` WRITE;
/*!40000 ALTER TABLE `jsh_supplier` DISABLE KEYS */;
INSERT INTO `jsh_supplier` VALUES (57,'供应商1','小军','12345678','','',NULL,'供应商',_binary '',0.000000,0.000000,0.000000,0.000000,4.000000,'','15000000000','地址1','','','',12.000000,NULL,63,63,'0'),(58,'客户1','小李','12345678','','',NULL,'客户',_binary '',0.000000,0.000000,0.000000,-100.000000,NULL,'','','','','','',12.000000,NULL,63,63,'0'),(59,'客户2','小陈','','','',NULL,'客户',_binary '',0.000000,0.000000,0.000000,0.000000,NULL,'','','','','','',NULL,NULL,63,63,'0'),(60,'12312666','小曹','','','',NULL,'会员',_binary '',-56.000000,0.000000,0.000000,NULL,NULL,'','13000000000','','','','',NULL,NULL,63,63,'0'),(68,'供应商3','晓丽','12345678','','fasdfadf',NULL,'供应商',_binary '',0.000000,0.000000,0.000000,0.000000,-35.000000,'','13000000000','aaaa','1341324','','',13.000000,NULL,63,63,'0'),(71,'客户3','小周','','','',NULL,'客户',_binary '',0.000000,0.000000,0.000000,0.000000,NULL,'','','','','','',NULL,NULL,63,63,'0'),(74,'供应商5','小季','77779999','','',NULL,'供应商',_binary '',0.000000,0.000000,5.000000,0.000000,5.000000,'','15806283912','','','','',3.000000,NULL,63,63,'0'),(90,'张三',NULL,NULL,NULL,NULL,NULL,'客户',_binary '',0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,146,146,'0');
/*!40000 ALTER TABLE `jsh_supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_system_config`
--

DROP TABLE IF EXISTS `jsh_system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '公司名称',
  `company_contacts` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '公司联系人',
  `company_address` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '公司地址',
  `company_tel` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '公司电话',
  `company_fax` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '公司传真',
  `company_post_code` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '公司邮编',
  `sale_agreement` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '销售协议',
  `depot_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '仓库启用标记，0未启用，1启用',
  `customer_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '客户启用标记，0未启用，1启用',
  `minus_stock_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '负库存启用标记，0未启用，1启用',
  `purchase_by_sale_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '以销定购启用标记，0未启用，1启用',
  `multi_level_approval_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '多级审核启用标记，0未启用，1启用',
  `multi_bill_type` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '流程类型，可多选',
  `force_approval_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '强审核启用标记，0未启用，1启用',
  `update_unit_price_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '1' COMMENT '更新单价启用标记，0未启用，1启用',
  `over_link_bill_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '超出关联单据启用标记，0未启用，1启用',
  `in_out_manage_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '出入库管理启用标记，0未启用，1启用',
  `multi_account_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '多账户启用标记，0未启用，1启用',
  `move_avg_price_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '移动平均价启用标记，0未启用，1启用',
  `audit_print_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '先审核后打印启用标记，0未启用，1启用',
  `zero_change_amount_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '零收付款启用标记，0未启用，1启用',
  `customer_static_price_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '客户静态单价启用标记，0未启用，1启用',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=COMPACT COMMENT='系统参数';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_system_config`
--

LOCK TABLES `jsh_system_config` WRITE;
/*!40000 ALTER TABLE `jsh_system_config` DISABLE KEYS */;
INSERT INTO `jsh_system_config` VALUES (11,'公司test','小李','地址1','12345678',NULL,NULL,'注：本单为我公司与客户约定账期内结款的依据，由客户或其单位员工签字生效，并承担法律责任。','0','0','1','0','0','','0','1','0','0','0','0','0','0','0',63,'0');
/*!40000 ALTER TABLE `jsh_system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_tenant`
--

DROP TABLE IF EXISTS `jsh_tenant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_tenant` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `tenant_id` bigint DEFAULT NULL COMMENT '用户id',
  `login_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '登录名',
  `user_num_limit` int DEFAULT NULL COMMENT '用户数量限制',
  `type` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '租户类型，0免费租户，1付费租户',
  `enabled` bit(1) DEFAULT b'1' COMMENT '启用 0-禁用  1-启用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `expire_time` datetime DEFAULT NULL COMMENT '到期时间',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `create_time` (`create_time`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='租户';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_tenant`
--

LOCK TABLES `jsh_tenant` WRITE;
/*!40000 ALTER TABLE `jsh_tenant` DISABLE KEYS */;
INSERT INTO `jsh_tenant` VALUES (13,63,'jsh',2000,'1',_binary '','2021-02-17 23:19:17','2099-02-17 23:19:17',NULL,'0'),(14,146,'wangxin',10,'1',_binary '','2026-03-09 18:55:51','2027-03-09 18:59:27',NULL,'0');
/*!40000 ALTER TABLE `jsh_tenant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_unit`
--

DROP TABLE IF EXISTS `jsh_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_unit` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称，支持多单位',
  `basic_unit` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '基础单位',
  `other_unit` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '副单位',
  `other_unit_two` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '副单位2',
  `other_unit_three` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '副单位3',
  `ratio` decimal(24,3) DEFAULT NULL COMMENT '比例',
  `ratio_two` decimal(24,3) DEFAULT NULL COMMENT '比例2',
  `ratio_three` decimal(24,3) DEFAULT NULL COMMENT '比例3',
  `enabled` bit(1) DEFAULT NULL COMMENT '启用',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='多单位表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_unit`
--

LOCK TABLES `jsh_unit` WRITE;
/*!40000 ALTER TABLE `jsh_unit` DISABLE KEYS */;
INSERT INTO `jsh_unit` VALUES (15,'个/(箱=12个)','个','箱',NULL,NULL,12.000,NULL,NULL,_binary '',63,'0'),(19,'个/(盒=15个)','个','盒',NULL,NULL,15.000,NULL,NULL,_binary '',63,'0'),(20,'盒/(箱=8盒)','盒','箱',NULL,NULL,8.000,NULL,NULL,_binary '',63,'0'),(21,'瓶/(箱=12瓶)','瓶','箱',NULL,NULL,12.000,NULL,NULL,_binary '',63,'0');
/*!40000 ALTER TABLE `jsh_unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_user`
--

DROP TABLE IF EXISTS `jsh_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '用户姓名--例如张三',
  `login_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '登录用户名',
  `password` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '登陆密码',
  `leader_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '是否经理，0否，1是',
  `position` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '职位',
  `department` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '所属部门',
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '电子邮箱',
  `phonenum` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '手机号码',
  `ismanager` tinyint NOT NULL DEFAULT '1' COMMENT '是否为管理者 0==管理者 1==员工',
  `isystem` tinyint NOT NULL DEFAULT '0' COMMENT '是否系统自带数据 ',
  `status` tinyint DEFAULT '0' COMMENT '状态，0正常，2封禁',
  `description` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '用户描述信息',
  `remark` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '备注',
  `weixin_open_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '微信绑定',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_user`
--

LOCK TABLES `jsh_user` WRITE;
/*!40000 ALTER TABLE `jsh_user` DISABLE KEYS */;
INSERT INTO `jsh_user` VALUES (63,'测试用户','jsh','e10adc3949ba59abbe56e057f20f883e','0','主管',NULL,'666666@qq.com','1123123123132',1,1,0,'',NULL,NULL,63,'0'),(120,'管理员','admin','e10adc3949ba59abbe56e057f20f883e','0',NULL,NULL,NULL,NULL,1,0,0,NULL,NULL,NULL,0,'0'),(131,'test123','test123','e10adc3949ba59abbe56e057f20f883e','0','总监',NULL,'7777777@qq.com','',1,0,0,'',NULL,NULL,63,'0'),(146,'wangxin','wangxin','e10adc3949ba59abbe56e057f20f883e','0',NULL,NULL,NULL,NULL,1,0,0,NULL,NULL,NULL,146,'0');
/*!40000 ALTER TABLE `jsh_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_user_business`
--

DROP TABLE IF EXISTS `jsh_user_business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_user_business` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '类别',
  `key_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '主id',
  `value` varchar(10000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '值',
  `btn_str` varchar(2000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '按钮权限',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `type` (`type`) USING BTREE,
  KEY `key_id` (`key_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC COMMENT='用户/角色/模块关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_user_business`
--

LOCK TABLES `jsh_user_business` WRITE;
/*!40000 ALTER TABLE `jsh_user_business` DISABLE KEYS */;
INSERT INTO `jsh_user_business` VALUES (5,'RoleFunctions','4','[210][225][211][241][33][199][242][38][41][200][201][239][202][40][232][233][197][44][203][204][205][206][212][246][198][207][259][208][209][226][227][248][228][229][59][235][237][244][22][21][23][220][247][25][24][217][218][26][194][195][31][13][1][14][243][15][234][16][18][236][245][258][261][32][262][263][264][265][266][267][268]','[{\"funId\":13,\"btnStr\":\"1\"},{\"funId\":14,\"btnStr\":\"1\"},{\"funId\":243,\"btnStr\":\"1\"},{\"funId\":236,\"btnStr\":\"1\"},{\"funId\":234,\"btnStr\":\"1\"},{\"funId\":16,\"btnStr\":\"1\"},{\"funId\":18,\"btnStr\":\"1\"},{\"funId\":245,\"btnStr\":\"1\"},{\"funId\":22,\"btnStr\":\"1\"},{\"funId\":23,\"btnStr\":\"1,3\"},{\"funId\":220,\"btnStr\":\"1\"},{\"funId\":247,\"btnStr\":\"1\"},{\"funId\":25,\"btnStr\":\"1,3\"},{\"funId\":217,\"btnStr\":\"1,3\"},{\"funId\":218,\"btnStr\":\"1,3\"},{\"funId\":26,\"btnStr\":\"1\"},{\"funId\":194,\"btnStr\":\"1\"},{\"funId\":195,\"btnStr\":\"1\"},{\"funId\":31,\"btnStr\":\"1\"},{\"funId\":261,\"btnStr\":\"1,2,7,3\"},{\"funId\":241,\"btnStr\":\"1,2,7,3\"},{\"funId\":33,\"btnStr\":\"1,2,7,3\"},{\"funId\":199,\"btnStr\":\"1,2,7,3\"},{\"funId\":242,\"btnStr\":\"1,2,7,3\"},{\"funId\":41,\"btnStr\":\"1,2,7,3\"},{\"funId\":200,\"btnStr\":\"1,2,7,3\"},{\"funId\":210,\"btnStr\":\"1,2,7,3\"},{\"funId\":211,\"btnStr\":\"1,2,7,3\"},{\"funId\":197,\"btnStr\":\"1,7,2,3\"},{\"funId\":203,\"btnStr\":\"1,7,2,3\"},{\"funId\":204,\"btnStr\":\"1,7,2,3\"},{\"funId\":205,\"btnStr\":\"1,7,2,3\"},{\"funId\":206,\"btnStr\":\"1,2,7,3\"},{\"funId\":212,\"btnStr\":\"1,7,2,3\"},{\"funId\":201,\"btnStr\":\"1,2,7,3\"},{\"funId\":202,\"btnStr\":\"1,2,7,3\"},{\"funId\":40,\"btnStr\":\"1,2,7,3\"},{\"funId\":232,\"btnStr\":\"1,2,7,3\"},{\"funId\":233,\"btnStr\":\"1,2,7,3\"},{\"funId\":267,\"btnStr\":\"1,3\"},{\"funId\":268,\"btnStr\":\"1\"},{\"funId\":263,\"btnStr\":\"1,3\"},{\"funId\":264,\"btnStr\":\"1,3\"}]',NULL,'0'),(6,'RoleFunctions','5','[22][23][25][26][194][195][31][33][200][201][41][199][202]',NULL,NULL,'0'),(7,'RoleFunctions','6','[22][23][220][240][25][217][218][26][194][195][31][59][207][208][209][226][227][228][229][235][237][210][211][241][33][199][242][41][200][201][202][40][232][233][197][203][204][205][206][212]','[{\"funId\":\"33\",\"btnStr\":\"4\"}]',NULL,'0'),(9,'RoleFunctions','7','[168][13][12][16][14][15][189][18][19][132]',NULL,NULL,'0'),(10,'RoleFunctions','8','[168][13][12][16][14][15][189][18][19][132][22][23][25][26][27][157][158][155][156][125][31][127][126][128][33][34][35][36][37][39][40][41][42][43][46][47][48][49][50][51][52][53][54][55][56][57][192][59][60][61][62][63][65][66][68][69][70][71][73][74][76][77][79][191][81][82][83][85][89][161][86][176][165][160][28][134][91][92][29][94][95][97][104][99][100][101][102][105][107][108][110][111][113][114][116][117][118][120][121][131][135][123][122][20][130][146][147][138][148][149][153][140][145][184][152][143][170][171][169][166][167][163][164][172][173][179][178][181][182][183][186][187][247]',NULL,NULL,'0'),(11,'RoleFunctions','9','[168][13][12][16][14][15][189][18][19][132][22][23][25][26][27][157][158][155][156][125][31][127][126][128][33][34][35][36][37][39][40][41][42][43][46][47][48][49][50][51][52][53][54][55][56][57][192][59][60][61][62][63][65][66][68][69][70][71][73][74][76][77][79][191][81][82][83][85][89][161][86][176][165][160][28][134][91][92][29][94][95][97][104][99][100][101][102][105][107][108][110][111][113][114][116][117][118][120][121][131][135][123][122][20][130][146][147][138][148][149][153][140][145][184][152][143][170][171][169][166][167][163][164][172][173][179][178][181][182][183][186][187][188]',NULL,NULL,'0'),(12,'UserRole','1','[5]',NULL,NULL,'0'),(13,'UserRole','2','[6][7]',NULL,NULL,'0'),(14,'UserDepot','2','[1][2][6][7]',NULL,NULL,'0'),(15,'UserDepot','1','[1][2][5][6][7][10][12][14][15][17]',NULL,NULL,'0'),(16,'UserRole','63','[10]',NULL,63,'0'),(18,'UserDepot','63','[14][15]',NULL,63,'0'),(19,'UserDepot','5','[6][45][46][50]',NULL,NULL,'0'),(20,'UserRole','5','[5]',NULL,NULL,'0'),(21,'UserRole','64','[13]',NULL,NULL,'0'),(22,'UserDepot','64','[1]',NULL,NULL,'0'),(23,'UserRole','65','[5]',NULL,NULL,'0'),(24,'UserDepot','65','[1]',NULL,NULL,'0'),(25,'UserCustomer','64','[5][2]',NULL,NULL,'0'),(26,'UserCustomer','65','[6]',NULL,NULL,'0'),(27,'UserCustomer','63','[58]',NULL,63,'0'),(28,'UserDepot','96','[7]',NULL,NULL,'0'),(29,'UserRole','96','[6]',NULL,NULL,'0'),(30,'UserRole','113','[10]',NULL,NULL,'0'),(32,'RoleFunctions','10','[210][225][211][261][32][241][33][199][242][38][41][200][201][239][202][40][232][233][197][44][203][204][205][206][212][246][198][207][259][208][209][226][227][248][228][229][59][235][237][244][22][21][23][220][247][25][24][217][218][265][26][194][195][31][267][266][13][14][243][15][236][234][263][262][264][268]','[{\"funId\":13,\"btnStr\":\"1\"},{\"funId\":14,\"btnStr\":\"1\"},{\"funId\":243,\"btnStr\":\"1\"},{\"funId\":236,\"btnStr\":\"1\"},{\"funId\":234,\"btnStr\":\"1\"},{\"funId\":22,\"btnStr\":\"1\"},{\"funId\":23,\"btnStr\":\"1,3\"},{\"funId\":220,\"btnStr\":\"1\"},{\"funId\":247,\"btnStr\":\"1\"},{\"funId\":25,\"btnStr\":\"1,3\"},{\"funId\":217,\"btnStr\":\"1,3\"},{\"funId\":218,\"btnStr\":\"1,3\"},{\"funId\":265,\"btnStr\":\"1,3\"},{\"funId\":26,\"btnStr\":\"1\"},{\"funId\":194,\"btnStr\":\"1\"},{\"funId\":195,\"btnStr\":\"1\"},{\"funId\":31,\"btnStr\":\"1\"},{\"funId\":261,\"btnStr\":\"1,2,7,3\"},{\"funId\":241,\"btnStr\":\"1,2,7,3\"},{\"funId\":33,\"btnStr\":\"1,2,7,3\"},{\"funId\":199,\"btnStr\":\"1,7,2,3\"},{\"funId\":242,\"btnStr\":\"1,2,7,3\"},{\"funId\":41,\"btnStr\":\"1,2,7,3\"},{\"funId\":200,\"btnStr\":\"1,2,7,3\"},{\"funId\":210,\"btnStr\":\"1,2,7,3\"},{\"funId\":211,\"btnStr\":\"1,2,7,3\"},{\"funId\":197,\"btnStr\":\"1,2,7,3\"},{\"funId\":203,\"btnStr\":\"1,7,2,3\"},{\"funId\":204,\"btnStr\":\"1,7,2,3\"},{\"funId\":205,\"btnStr\":\"1,2,7,3\"},{\"funId\":206,\"btnStr\":\"1,7,2,3\"},{\"funId\":212,\"btnStr\":\"1,2,7,3\"},{\"funId\":201,\"btnStr\":\"1,2,7,3\"},{\"funId\":202,\"btnStr\":\"1,2,7,3\"},{\"funId\":40,\"btnStr\":\"1,2,7,3\"},{\"funId\":232,\"btnStr\":\"1,2,7,3\"},{\"funId\":233,\"btnStr\":\"1,2,7,3\"},{\"funId\":267,\"btnStr\":\"1,3\"},{\"funId\":268,\"btnStr\":\"1\"},{\"funId\":263,\"btnStr\":\"1,3\"},{\"funId\":264,\"btnStr\":\"1,3\"}]',NULL,'0'),(34,'UserRole','115','[10]',NULL,NULL,'0'),(35,'UserRole','117','[10]',NULL,NULL,'0'),(36,'UserDepot','117','[8][9]',NULL,NULL,'0'),(37,'UserCustomer','117','[52]',NULL,NULL,'0'),(38,'UserRole','120','[4]',NULL,NULL,'0'),(41,'RoleFunctions','12','',NULL,NULL,'0'),(48,'RoleFunctions','13','[59][207][208][209][226][227][228][229][235][237][210][211][241][33][199][242][41][200]',NULL,NULL,'0'),(51,'UserRole','74','[10]',NULL,NULL,'0'),(52,'UserDepot','121','[13]',NULL,NULL,'0'),(54,'UserDepot','115','[13]',NULL,NULL,'0'),(56,'UserCustomer','115','[56]',NULL,NULL,'0'),(57,'UserCustomer','121','[56]',NULL,NULL,'0'),(67,'UserRole','131','[17]',NULL,63,'0'),(68,'RoleFunctions','16','[210]',NULL,63,'0'),(69,'RoleFunctions','17','[210][225][211][241][32][33][199][242][38][41][200][201][239][202][40][232][233][197][44][203][204][205][206][212]','[{\"funId\":\"241\",\"btnStr\":\"1,2\"},{\"funId\":\"33\",\"btnStr\":\"1,2\"},{\"funId\":\"199\",\"btnStr\":\"1,2\"},{\"funId\":\"242\",\"btnStr\":\"1,2\"},{\"funId\":\"41\",\"btnStr\":\"1,2\"},{\"funId\":\"200\",\"btnStr\":\"1,2\"},{\"funId\":\"210\",\"btnStr\":\"1,2\"},{\"funId\":\"211\",\"btnStr\":\"1,2\"},{\"funId\":\"197\",\"btnStr\":\"1\"},{\"funId\":\"203\",\"btnStr\":\"1\"},{\"funId\":\"204\",\"btnStr\":\"1\"},{\"funId\":\"205\",\"btnStr\":\"1\"},{\"funId\":\"206\",\"btnStr\":\"1\"},{\"funId\":\"212\",\"btnStr\":\"1\"},{\"funId\":\"201\",\"btnStr\":\"1,2\"},{\"funId\":\"202\",\"btnStr\":\"1,2\"},{\"funId\":\"40\",\"btnStr\":\"1,2\"},{\"funId\":\"232\",\"btnStr\":\"1,2\"},{\"funId\":\"233\",\"btnStr\":\"1,2\"}]',63,'0'),(83,'UserRole','146','[10]',NULL,146,'0'),(84,'UserDepot','146','[19]',NULL,146,'0'),(85,'UserCustomer','146','[90]',NULL,146,'0');
/*!40000 ALTER TABLE `jsh_user_business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_vehicle`
--

DROP TABLE IF EXISTS `jsh_vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_vehicle` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `vehicle_purpose` varchar(20) DEFAULT '乘用车' COMMENT '车辆用途：乘用车/商用车',
  `license_plate_province` varchar(10) DEFAULT NULL COMMENT '车牌省份',
  `license_plate_no` varchar(20) DEFAULT NULL COMMENT '车牌号',
  `no_plate` tinyint(1) DEFAULT '0' COMMENT '无牌：0否 1是',
  `vin` varchar(20) DEFAULT NULL COMMENT 'VIN码',
  `no_vin` tinyint(1) DEFAULT '0' COMMENT '暂无VIN：0否 1是',
  `vehicle_type` varchar(100) DEFAULT NULL COMMENT '车型',
  `production_year` varchar(10) DEFAULT NULL COMMENT '生产年份',
  `fuel_type` varchar(30) DEFAULT NULL COMMENT '燃料类型',
  `vehicle_category` varchar(50) DEFAULT NULL COMMENT '车辆一级类型',
  `body_color` varchar(30) DEFAULT NULL COMMENT '车身颜色',
  `images` text COMMENT '车辆图片（JSON数组，最多15张）',
  `vehicle_source` varchar(30) DEFAULT '主动获取' COMMENT '车辆来源',
  `customer_name` varchar(60) DEFAULT NULL COMMENT '客户姓名',
  `customer_phone` varchar(20) DEFAULT NULL COMMENT '手机号码',
  `customer_level` varchar(30) DEFAULT '默认客户' COMMENT '客户等级',
  `customer_gender` varchar(10) DEFAULT '先生' COMMENT '性别',
  `customer_address` varchar(100) DEFAULT NULL COMMENT '地址信息（省/市/区）',
  `customer_detail_address` varchar(255) DEFAULT NULL COMMENT '详细地址',
  `vehicle_owner` varchar(60) DEFAULT NULL COMMENT '车辆所有人',
  `brand_model` varchar(100) DEFAULT NULL COMMENT '品牌型号',
  `engine_no` varchar(50) DEFAULT NULL COMMENT '发动机号',
  `register_date` date DEFAULT NULL COMMENT '注册日期',
  `issue_date` date DEFAULT NULL COMMENT '发证日期',
  `usage_nature` varchar(30) DEFAULT NULL COMMENT '使用性质',
  `registration_images` text COMMENT '行驶证图片（JSON数组，最多2张）',
  `annual_check_date` date DEFAULT NULL COMMENT '年检日期',
  `traffic_insurance_expire` date DEFAULT NULL COMMENT '交强险到期',
  `commercial_insurance_expire` date DEFAULT NULL COMMENT '商业险到期',
  `no_insurance` tinyint(1) DEFAULT '0' COMMENT '未投保：0否 1是',
  `insurance_company` varchar(60) DEFAULT NULL COMMENT '保险公司',
  `insurance_contact` varchar(60) DEFAULT NULL COMMENT '保险联系人',
  `insurance_phone` varchar(20) DEFAULT NULL COMMENT '保险联系电话',
  `repairer_name` varchar(60) DEFAULT NULL COMMENT '送修人姓名',
  `repairer_contact` varchar(20) DEFAULT NULL COMMENT '送修人联系方式',
  `repairer_gender` varchar(10) DEFAULT '先生' COMMENT '送修人性别',
  `repairer_id_no` varchar(30) DEFAULT NULL COMMENT '证件号码',
  `repairer_region` varchar(100) DEFAULT NULL COMMENT '所在地区',
  `repairer_address` varchar(255) DEFAULT NULL COMMENT '详细地址',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用：0否 1是',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `delete_flag` varchar(1) DEFAULT '0' COMMENT '删除标志：0未删除 1已删除',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_license_plate` (`license_plate_province`,`license_plate_no`),
  KEY `idx_customer_phone` (`customer_phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='客户车辆信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_vehicle`
--

LOCK TABLES `jsh_vehicle` WRITE;
/*!40000 ALTER TABLE `jsh_vehicle` DISABLE KEYS */;
INSERT INTO `jsh_vehicle` VALUES (1,'乘用车','鲁','B02k1A',0,'',1,NULL,NULL,NULL,NULL,NULL,NULL,'主动获取','王新','18712345678','普通客户','先生',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'先生',NULL,NULL,NULL,NULL,1,'2026-03-12 11:57:47','2026-03-12 11:57:47',146,'0'),(2,'乘用车','京','C00256',0,'',0,'测试',NULL,NULL,NULL,NULL,NULL,'主动获取','张','18712345678','默认客户','先生','','',NULL,'大众速腾',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'先生',NULL,NULL,NULL,NULL,1,'2026-03-23 14:13:12','2026-03-23 14:13:12',146,'0');
/*!40000 ALTER TABLE `jsh_vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_vehicle_contact`
--

DROP TABLE IF EXISTS `jsh_vehicle_contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_vehicle_contact` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `vehicle_id` bigint NOT NULL COMMENT '关联车辆ID',
  `contact_name` varchar(60) DEFAULT NULL COMMENT '联系人姓名',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系人手机号',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `delete_flag` varchar(1) DEFAULT '0' COMMENT '删除标志：0未删除 1已删除',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='车辆联系人表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_vehicle_contact`
--

LOCK TABLES `jsh_vehicle_contact` WRITE;
/*!40000 ALTER TABLE `jsh_vehicle_contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `jsh_vehicle_contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_work_order`
--

DROP TABLE IF EXISTS `jsh_work_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_work_order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_no` varchar(30) DEFAULT NULL COMMENT '工单编号（WO+日期+序号）',
  `vehicle_id` bigint DEFAULT NULL COMMENT '客户车辆ID',
  `license_plate` varchar(30) DEFAULT NULL COMMENT '车牌号（冗余，省份+号码）',
  `customer_name` varchar(60) DEFAULT NULL COMMENT '客户姓名',
  `customer_phone` varchar(20) DEFAULT NULL COMMENT '客户手机号',
  `vehicle_info` varchar(100) DEFAULT NULL COMMENT '车辆信息（品牌车型）',
  `vin` varchar(20) DEFAULT NULL COMMENT 'VIN码',
  `mileage` int DEFAULT NULL COMMENT '进厂里程(km)',
  `fault_desc` text COMMENT '故障描述/客户主诉',
  `handler_name` varchar(60) DEFAULT NULL COMMENT '经手人',
  `intake_time` datetime DEFAULT NULL COMMENT '接车时间',
  `estimated_finish_time` datetime DEFAULT NULL COMMENT '预计完工时间',
  `actual_finish_time` datetime DEFAULT NULL COMMENT '实际完工时间',
  `status` tinyint DEFAULT '0' COMMENT '状态:0草稿,1待派工,2维修中,3待结算,4已结算,5已取消',
  `labor_amount` decimal(12,2) DEFAULT '0.00' COMMENT '工时费合计',
  `material_amount` decimal(12,2) DEFAULT '0.00' COMMENT '材料费合计',
  `other_amount` decimal(12,2) DEFAULT '0.00' COMMENT '其他费用',
  `total_amount` decimal(12,2) DEFAULT '0.00' COMMENT '合计金额（工时+材料+其他）',
  `discount_amount` decimal(12,2) DEFAULT '0.00' COMMENT '优惠金额',
  `payable_amount` decimal(12,2) DEFAULT '0.00' COMMENT '应收金额（合计-优惠）',
  `payment_status` tinyint DEFAULT '0' COMMENT '付款状态:0未付,1部分付款,2已付清',
  `received_amount` decimal(24,6) DEFAULT NULL COMMENT '已收金额',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `delete_flag` varchar(1) DEFAULT '0' COMMENT '删除标记:0正常,1删除',
  PRIMARY KEY (`id`),
  KEY `idx_wo_vehicle_id` (`vehicle_id`),
  KEY `idx_wo_tenant_id` (`tenant_id`),
  KEY `idx_wo_order_no` (`order_no`),
  KEY `idx_wo_status` (`status`),
  KEY `idx_wo_intake_time` (`intake_time`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='工单主表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_work_order`
--

LOCK TABLES `jsh_work_order` WRITE;
/*!40000 ALTER TABLE `jsh_work_order` DISABLE KEYS */;
INSERT INTO `jsh_work_order` VALUES (3,'WO20260314201957932',1,'鲁B02k1A','王新','18712345678',NULL,'',NULL,'123123','张三',NULL,NULL,'2026-03-23 13:20:58',4,210.00,196.00,0.00,406.00,0.00,406.00,0,NULL,'123123','2026-03-14 20:19:58','2026-03-23 13:20:58',146,'0'),(4,'WO20260323141312505',2,'京C00256','张','18712345678','大众速腾','',13556,'测试这是故障','李四','2026-03-23 14:11:36','2026-03-23 14:11:42','2026-03-23 14:21:47',5,45.00,226.00,0.00,271.00,0.00,271.00,2,271.000000,'这是备注','2026-03-23 14:13:13','2026-03-23 14:26:45',146,'0');
/*!40000 ALTER TABLE `jsh_work_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_work_order_material`
--

DROP TABLE IF EXISTS `jsh_work_order_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_work_order_material` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id` bigint NOT NULL COMMENT '工单ID',
  `material_id` bigint DEFAULT NULL COMMENT '商品ID（jsh_material，允许为空手动录入）',
  `material_name` varchar(100) DEFAULT NULL COMMENT '商品名称',
  `standard` varchar(60) DEFAULT NULL COMMENT '规格',
  `model` varchar(60) DEFAULT NULL COMMENT '型号',
  `unit` varchar(20) DEFAULT NULL COMMENT '单位',
  `unit_price` decimal(12,2) DEFAULT '0.00' COMMENT '单价（元）',
  `quantity` decimal(10,2) DEFAULT '1.00' COMMENT '数量',
  `discount_rate` decimal(5,2) DEFAULT '100.00' COMMENT '折扣率(0~100)',
  `amount` decimal(12,2) DEFAULT '0.00' COMMENT '金额=单价×数量×折扣率/100',
  `remark` varchar(200) DEFAULT NULL COMMENT '备注',
  `sort` int DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_wom_order_id` (`order_id`),
  KEY `idx_wom_material_id` (`material_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='工单材料明细';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_work_order_material`
--

LOCK TABLES `jsh_work_order_material` WRITE;
/*!40000 ALTER TABLE `jsh_work_order_material` DISABLE KEYS */;
INSERT INTO `jsh_work_order_material` VALUES (3,3,623,'轮胎2','','','',106.00,1.00,100.00,106.00,'',0),(4,3,622,'玻璃1','','','',90.00,1.00,100.00,90.00,'',1),(5,4,623,'轮胎2','','','',106.00,1.00,100.00,106.00,'',0),(6,4,621,'轮胎1','225/45R18','','',120.00,1.00,100.00,120.00,'',1);
/*!40000 ALTER TABLE `jsh_work_order_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jsh_work_order_project`
--

DROP TABLE IF EXISTS `jsh_work_order_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jsh_work_order_project` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id` bigint NOT NULL COMMENT '工单ID',
  `project_id` bigint DEFAULT NULL COMMENT '关联项目ID（jsh_project，允许为空）',
  `project_name` varchar(100) DEFAULT NULL COMMENT '服务项目名称',
  `unit_price` decimal(12,2) DEFAULT '0.00' COMMENT '单价（元）',
  `quantity` decimal(10,2) DEFAULT '1.00' COMMENT '数量/工时',
  `discount_rate` decimal(5,2) DEFAULT '100.00' COMMENT '折扣率(0~100)',
  `amount` decimal(12,2) DEFAULT '0.00' COMMENT '金额=单价×数量×折扣率/100',
  `worker_name` varchar(60) DEFAULT NULL COMMENT '施工人员',
  `remark` varchar(200) DEFAULT NULL COMMENT '备注',
  `sort` int DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_wop_order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='工单服务项目明细';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jsh_work_order_project`
--

LOCK TABLES `jsh_work_order_project` WRITE;
/*!40000 ALTER TABLE `jsh_work_order_project` DISABLE KEYS */;
INSERT INTO `jsh_work_order_project` VALUES (2,3,7,'洗车',210.00,1.00,100.00,210.00,'','',0),(3,4,6,'666',45.00,1.00,100.00,45.00,'','',0);
/*!40000 ALTER TABLE `jsh_work_order_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'jsh_erp'
--

--
-- Dumping routines for database 'jsh_erp'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 10:40:11
