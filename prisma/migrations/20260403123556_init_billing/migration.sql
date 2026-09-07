-- AlterTable
ALTER TABLE `users` ADD COLUMN `defaultHourlyRate` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `billings` (
    `id` VARCHAR(191) NOT NULL,
    `workerId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `workLogId` VARCHAR(191) NULL,
    `workCategoryId` VARCHAR(191) NULL,
    `billingType` ENUM('PROJECT', 'CONTRACTOR') NOT NULL,
    `hours` DOUBLE NOT NULL,
    `hourlyRate` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('DUE', 'PAID') NOT NULL DEFAULT 'DUE',
    `paidAt` DATETIME(3) NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `billings_workLogId_key`(`workLogId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `billings` ADD CONSTRAINT `billings_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billings` ADD CONSTRAINT `billings_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billings` ADD CONSTRAINT `billings_workLogId_fkey` FOREIGN KEY (`workLogId`) REFERENCES `work_logs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billings` ADD CONSTRAINT `billings_workCategoryId_fkey` FOREIGN KEY (`workCategoryId`) REFERENCES `work_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
