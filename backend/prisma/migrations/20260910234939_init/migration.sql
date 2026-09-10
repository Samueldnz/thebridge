-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `profileType` ENUM('COMPANY', 'RESEARCHER') NOT NULL,
    `systemRole` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `profileCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_profileType_idx`(`profileType`),
    INDEX `User_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` CHAR(36) NOT NULL,
    `type` ENUM('COMPANY', 'UNIVERSITY', 'RESEARCH_INSTITUTE', 'LABORATORY', 'RESEARCH_CENTER', 'OTHER') NOT NULL,
    `legalName` VARCHAR(255) NULL,
    `tradeName` VARCHAR(255) NULL,
    `cnpj` VARCHAR(18) NULL,
    `description` TEXT NULL,
    `website` VARCHAR(500) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(30) NULL,
    `logoUrl` VARCHAR(500) NULL,
    `addressLine` VARCHAR(255) NULL,
    `addressNumber` VARCHAR(30) NULL,
    `addressComplement` VARCHAR(150) NULL,
    `neighborhood` VARCHAR(150) NULL,
    `city` VARCHAR(150) NULL,
    `state` VARCHAR(100) NULL,
    `postalCode` VARCHAR(20) NULL,
    `country` VARCHAR(100) NULL,
    `source` ENUM('PLATFORM', 'BVFAPESP', 'IMPORT', 'OTHER') NOT NULL DEFAULT 'PLATFORM',
    `sourceExternalId` VARCHAR(191) NULL,
    `sourceUrl` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_cnpj_key`(`cnpj`),
    INDEX `Organization_type_idx`(`type`),
    INDEX `Organization_city_idx`(`city`),
    INDEX `Organization_state_idx`(`state`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizationMember` (
    `id` CHAR(36) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrganizationMember_organizationId_idx`(`organizationId`),
    INDEX `OrganizationMember_userId_idx`(`userId`),
    UNIQUE INDEX `OrganizationMember_userId_organizationId_key`(`userId`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResearcherProfile` (
    `id` CHAR(36) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(14) NULL,
    `bio` TEXT NULL,
    `academicTitle` VARCHAR(150) NULL,
    `researchField` VARCHAR(255) NULL,
    `lattesUrl` VARCHAR(500) NULL,
    `orcidUrl` VARCHAR(500) NULL,
    `linkedinUrl` VARCHAR(500) NULL,
    `trustBadge` ENUM('NONE', 'BRONZE', 'SILVER', 'GOLD') NOT NULL DEFAULT 'NONE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ResearcherProfile_userId_key`(`userId`),
    UNIQUE INDEX `ResearcherProfile_cpf_key`(`cpf`),
    INDEX `ResearcherProfile_researchField_idx`(`researchField`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResearcherAffiliation` (
    `id` CHAR(36) NOT NULL,
    `researcherId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `role` ENUM('PROFESSOR', 'RESEARCHER', 'STUDENT', 'TECHNICIAN', 'COORDINATOR', 'OTHER') NOT NULL,
    `title` VARCHAR(150) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ResearcherAffiliation_researcherId_idx`(`researcherId`),
    INDEX `ResearcherAffiliation_organizationId_idx`(`organizationId`),
    INDEX `ResearcherAffiliation_isPrimary_idx`(`isPrimary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResearcherLink` (
    `id` CHAR(36) NOT NULL,
    `researcherId` VARCHAR(191) NOT NULL,
    `type` ENUM('ARTICLE', 'PATENT', 'OTHER') NOT NULL,
    `label` VARCHAR(255) NULL,
    `url` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ResearcherLink_researcherId_idx`(`researcherId`),
    INDEX `ResearcherLink_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Competence` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `parentId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Competence_slug_key`(`slug`),
    INDEX `Competence_parentId_idx`(`parentId`),
    INDEX `Competence_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResearcherCompetence` (
    `id` CHAR(36) NOT NULL,
    `researcherId` VARCHAR(191) NOT NULL,
    `competenceId` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ResearcherCompetence_competenceId_idx`(`competenceId`),
    UNIQUE INDEX `ResearcherCompetence_researcherId_competenceId_key`(`researcherId`, `competenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` CHAR(36) NOT NULL,
    `ownerId` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `keywords` TEXT NULL,
    `researchField` VARCHAR(255) NULL,
    `trl` INTEGER NULL,
    `crl` INTEGER NULL,
    `patentStatus` ENUM('NONE', 'PENDING', 'GRANTED') NOT NULL DEFAULT 'NONE',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `source` ENUM('PLATFORM', 'BVFAPESP', 'IMPORT', 'OTHER') NOT NULL DEFAULT 'PLATFORM',
    `sourceExternalId` VARCHAR(191) NULL,
    `sourceUrl` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Project_ownerId_idx`(`ownerId`),
    INDEX `Project_organizationId_idx`(`organizationId`),
    INDEX `Project_status_idx`(`status`),
    INDEX `Project_researchField_idx`(`researchField`),
    INDEX `Project_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectCompetence` (
    `id` CHAR(36) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `competenceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProjectCompetence_competenceId_idx`(`competenceId`),
    UNIQUE INDEX `ProjectCompetence_projectId_competenceId_key`(`projectId`, `competenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Opportunity` (
    `id` CHAR(36) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `keywords` TEXT NULL,
    `industrySector` VARCHAR(255) NULL,
    `desiredTechnology` VARCHAR(255) NULL,
    `minTrl` INTEGER NULL,
    `desiredCrl` INTEGER NULL,
    `patentRequirement` ENUM('NOT_REQUIRED', 'REQUIRED', 'PENDING_ACCEPTED') NOT NULL DEFAULT 'NOT_REQUIRED',
    `budgetMin` DECIMAL(15, 2) NULL,
    `budgetMax` DECIMAL(15, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'BRL',
    `timeline` VARCHAR(255) NULL,
    `status` ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Opportunity_ownerId_idx`(`ownerId`),
    INDEX `Opportunity_organizationId_idx`(`organizationId`),
    INDEX `Opportunity_status_idx`(`status`),
    INDEX `Opportunity_industrySector_idx`(`industrySector`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpportunityCompetence` (
    `id` CHAR(36) NOT NULL,
    `opportunityId` VARCHAR(191) NOT NULL,
    `competenceId` VARCHAR(191) NOT NULL,
    `weight` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OpportunityCompetence_competenceId_idx`(`competenceId`),
    UNIQUE INDEX `OpportunityCompetence_opportunityId_competenceId_key`(`opportunityId`, `competenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` CHAR(36) NOT NULL,
    `opportunityId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `score` DECIMAL(8, 6) NOT NULL,
    `modelName` VARCHAR(100) NULL,
    `modelVersion` VARCHAR(50) NOT NULL DEFAULT 'v1',
    `status` ENUM('GENERATED', 'VIEWED', 'CONTACTED', 'DISMISSED') NOT NULL DEFAULT 'GENERATED',
    `explanation` JSON NULL,
    `viewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Match_opportunityId_score_idx`(`opportunityId`, `score`),
    INDEX `Match_projectId_score_idx`(`projectId`, `score`),
    INDEX `Match_status_idx`(`status`),
    UNIQUE INDEX `Match_opportunityId_projectId_modelVersion_key`(`opportunityId`, `projectId`, `modelVersion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResearcherProfile` ADD CONSTRAINT `ResearcherProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResearcherAffiliation` ADD CONSTRAINT `ResearcherAffiliation_researcherId_fkey` FOREIGN KEY (`researcherId`) REFERENCES `ResearcherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResearcherAffiliation` ADD CONSTRAINT `ResearcherAffiliation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResearcherLink` ADD CONSTRAINT `ResearcherLink_researcherId_fkey` FOREIGN KEY (`researcherId`) REFERENCES `ResearcherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Competence` ADD CONSTRAINT `Competence_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Competence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResearcherCompetence` ADD CONSTRAINT `ResearcherCompetence_researcherId_fkey` FOREIGN KEY (`researcherId`) REFERENCES `ResearcherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResearcherCompetence` ADD CONSTRAINT `ResearcherCompetence_competenceId_fkey` FOREIGN KEY (`competenceId`) REFERENCES `Competence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectCompetence` ADD CONSTRAINT `ProjectCompetence_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectCompetence` ADD CONSTRAINT `ProjectCompetence_competenceId_fkey` FOREIGN KEY (`competenceId`) REFERENCES `Competence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpportunityCompetence` ADD CONSTRAINT `OpportunityCompetence_opportunityId_fkey` FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpportunityCompetence` ADD CONSTRAINT `OpportunityCompetence_competenceId_fkey` FOREIGN KEY (`competenceId`) REFERENCES `Competence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_opportunityId_fkey` FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
