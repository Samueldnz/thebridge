/*
  Warnings:

  - A unique constraint covering the columns `[researcherId,organizationId]` on the table `ResearcherAffiliation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ResearcherAffiliation_researcherId_organizationId_key` ON `ResearcherAffiliation`(`researcherId`, `organizationId`);
