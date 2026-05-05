-- SharePlate Platform Schema
-- Clean schema for container deployment

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `Batch_Tags`;
DROP TABLE IF EXISTS `Feedback_Reviews`;
DROP TABLE IF EXISTS `Delivery_Assignments`;
DROP TABLE IF EXISTS `Claims`;
DROP TABLE IF EXISTS `Food_Batches`;
DROP TABLE IF EXISTS `Dietary_Tags`;
DROP TABLE IF EXISTS `Drivers`;
DROP TABLE IF EXISTS `Notifications`;
DROP TABLE IF EXISTS `Reviews`;
DROP TABLE IF EXISTS `Users`;

SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role` enum('Restaurant','Charity') NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(200) NOT NULL DEFAULT 'Unknown',
  `base_city` varchar(100) NOT NULL DEFAULT 'Unknown',
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Dietary_Tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Drivers` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `truck_type` enum('Refrigerated','Dry_Goods') NOT NULL,
  PRIMARY KEY (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Delivery_Assignments` (
  `claim_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`claim_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `delivery_assignments_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `Claims` (`claim_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_assignments_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `Drivers` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Feedback_Reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `claim_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `rating` int NOT NULL,
  `comments` text,
  `reviewer_name` varchar(100) DEFAULT 'Anonymous',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `claim_id` (`claim_id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `feedback_reviews_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `Claims` (`claim_id`),
  CONSTRAINT `feedback_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `feedback_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Batch_Tags` (
  `batch_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`batch_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `batch_tags_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `Food_Batches` (`batch_id`) ON DELETE CASCADE,
  CONSTRAINT `batch_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `Dietary_Tags` (`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
