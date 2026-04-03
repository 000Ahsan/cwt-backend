-- AlterTable
ALTER TABLE `work_sessions` ADD COLUMN `hourlyRateAtTime` DOUBLE NULL,
    ADD COLUMN `workCategoryId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `work_categories` (
    `id` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hourlyRate` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `work_categories_contractorId_name_key`(`contractorId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_work_categories` (
    `userId` VARCHAR(191) NOT NULL,
    `workCategoryId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `workCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_work_categories` (
    `projectId` VARCHAR(191) NOT NULL,
    `workCategoryId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`projectId`, `workCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `work_sessions` ADD CONSTRAINT `work_sessions_workCategoryId_fkey` FOREIGN KEY (`workCategoryId`) REFERENCES `work_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_categories` ADD CONSTRAINT `work_categories_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_work_categories` ADD CONSTRAINT `user_work_categories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_work_categories` ADD CONSTRAINT `user_work_categories_workCategoryId_fkey` FOREIGN KEY (`workCategoryId`) REFERENCES `work_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_work_categories` ADD CONSTRAINT `project_work_categories_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_work_categories` ADD CONSTRAINT `project_work_categories_workCategoryId_fkey` FOREIGN KEY (`workCategoryId`) REFERENCES `work_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
