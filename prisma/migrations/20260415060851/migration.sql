-- AlterTable
ALTER TABLE `users` MODIFY `currency` ENUM('USD', 'EUR', 'GBP', 'PKR', 'CAD') NOT NULL DEFAULT 'USD';
