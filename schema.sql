-- MySQL dump 10.13  Distrib 9.6.0, for macos15 (arm64)
--
-- Host: localhost    Database: food_waste_redistribution_platform
-- ------------------------------------------------------
-- Server version	9.6.0

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
-- Table structure for table `Batch_Tags`
--

DROP TABLE IF EXISTS `Batch_Tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Batch_Tags` (
  `batch_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`batch_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `batch_tags_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `Food_Batches` (`batch_id`) ON DELETE CASCADE,
  CONSTRAINT `batch_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `Dietary_Tags` (`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Claims`
--

DROP TABLE IF EXISTS `Claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Claims` (
  `claim_id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `charity_id` int NOT NULL,
  `claimed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `pickup_status` enum('pending','en_route','completed','failed') DEFAULT 'pending',
  `charity_name` varchar(100) DEFAULT 'Unknown',
  `charity_address` varchar(255) DEFAULT 'Unknown',
  PRIMARY KEY (`claim_id`),
  KEY `batch_id` (`batch_id`),
  KEY `charity_id` (`charity_id`),
  CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `Food_Batches` (`batch_id`),
  CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`charity_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Delivery_Assignments`
--

DROP TABLE IF EXISTS `Delivery_Assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Delivery_Assignments` (
  `claim_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`claim_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `delivery_assignments_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `Claims` (`claim_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_assignments_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `Drivers` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Dietary_Tags`
--

DROP TABLE IF EXISTS `Dietary_Tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dietary_Tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Drivers`
--

DROP TABLE IF EXISTS `Drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Drivers` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `truck_type` enum('Refrigerated','Dry_Goods') NOT NULL,
  PRIMARY KEY (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Feedback_Reviews`
--

DROP TABLE IF EXISTS `Feedback_Reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Feedback_Reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `claim_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `rating` int NOT NULL,
  `comments` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `claim_id` (`claim_id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `feedback_reviews_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `Claims` (`claim_id`),
  CONSTRAINT `feedback_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `feedback_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Food_Batches`
--

DROP TABLE IF EXISTS `Food_Batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Food_Batches` (
  `batch_id` int NOT NULL AUTO_INCREMENT,
  `donor_id` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `batch_type` enum('Refrigerated','Dry_Goods','Produce','Prepared_Meals','Baked_Goods','Beverages','Other') NOT NULL,
  `weight_kg` decimal(5,2) NOT NULL,
  `expiry_timestamp` datetime NOT NULL,
  `status` enum('available','locked','claimed','expired') DEFAULT 'available',
  `delivery_city` varchar(100) NOT NULL DEFAULT 'Unknown',
  `donor_name` varchar(100) DEFAULT 'Unknown',
  `pickup_address` varchar(255) DEFAULT 'Unknown',
  PRIMARY KEY (`batch_id`),
  KEY `donor_id` (`donor_id`),
  CONSTRAINT `food_batches_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('new_batch','claim_approved','pickup_reminder','batch_expired') NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role` enum('Restaurant','Charity') NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(200) NOT NULL,
  `base_city` varchar(100) NOT NULL DEFAULT 'Unknown',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06  0:20:14
