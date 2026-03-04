-- AlterTable
ALTER TABLE `projects` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL;
