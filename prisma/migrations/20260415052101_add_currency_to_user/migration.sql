-- AlterTable
ALTER TABLE `users` ADD COLUMN `currency` ENUM('USD', 'EUR', 'GBP', 'PKR', 'CAD') NOT NULL DEFAULT 'CAD';
