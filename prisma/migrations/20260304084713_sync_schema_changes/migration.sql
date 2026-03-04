-- DropForeignKey
ALTER TABLE `project_assignments` DROP FOREIGN KEY `project_assignments_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `work_logs` DROP FOREIGN KEY `work_logs_workSessionId_fkey`;

-- DropForeignKey
ALTER TABLE `work_photos` DROP FOREIGN KEY `work_photos_workLogId_fkey`;

-- DropForeignKey
ALTER TABLE `work_sessions` DROP FOREIGN KEY `work_sessions_projectId_fkey`;

-- DropIndex
DROP INDEX `work_logs_workSessionId_fkey` ON `work_logs`;

-- DropIndex
DROP INDEX `work_photos_workLogId_fkey` ON `work_photos`;

-- DropIndex
DROP INDEX `work_sessions_projectId_fkey` ON `work_sessions`;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `categories` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `categories` VARCHAR(191) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `project_assignments` ADD CONSTRAINT `project_assignments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_sessions` ADD CONSTRAINT `work_sessions_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_logs` ADD CONSTRAINT `work_logs_workSessionId_fkey` FOREIGN KEY (`workSessionId`) REFERENCES `work_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_photos` ADD CONSTRAINT `work_photos_workLogId_fkey` FOREIGN KEY (`workLogId`) REFERENCES `work_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
