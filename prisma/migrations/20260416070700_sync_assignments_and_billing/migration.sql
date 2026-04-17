-- DropForeignKey
ALTER TABLE `project_assignments` DROP FOREIGN KEY `project_assignments_projectId_fkey`;
ALTER TABLE `project_assignments` DROP FOREIGN KEY `project_assignments_workerId_fkey`;
ALTER TABLE `billings` DROP FOREIGN KEY `billings_projectId_fkey`;
ALTER TABLE `billings` DROP FOREIGN KEY `billings_workCategoryId_fkey`;
ALTER TABLE `billings` DROP FOREIGN KEY `billings_workLogId_fkey`;

-- DropIndex
DROP INDEX `project_assignments_projectId_workerId_key` ON `project_assignments`;
DROP INDEX `billings_workLogId_key` ON `billings`;

-- AlterTable
ALTER TABLE `project_assignments` ADD COLUMN `hourlyRate` DOUBLE NOT NULL,
    ADD COLUMN `workCategoryId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `work_categories` DROP COLUMN `hourlyRate`;

-- AlterTable
ALTER TABLE `billings` DROP COLUMN `amount`,
    DROP COLUMN `billingType`,
    DROP COLUMN `hourlyRate`,
    DROP COLUMN `hours`,
    DROP COLUMN `projectId`,
    DROP COLUMN `workCategoryId`,
    DROP COLUMN `workLogId`,
    ADD COLUMN `contractorHours` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `contractorTotal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `projectHours` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `projectTotal` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `work_logs` ADD COLUMN `billingId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `project_assignments_projectId_workerId_workCategoryId_key` ON `project_assignments`(`projectId`, `workerId`, `workCategoryId`);

-- AddForeignKey
ALTER TABLE `project_assignments` ADD CONSTRAINT `project_assignments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `project_assignments` ADD CONSTRAINT `project_assignments_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `project_assignments` ADD CONSTRAINT `project_assignments_workCategoryId_fkey` FOREIGN KEY (`workCategoryId`) REFERENCES `work_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `work_logs` ADD CONSTRAINT `work_logs_billingId_fkey` FOREIGN KEY (`billingId`) REFERENCES `billings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
