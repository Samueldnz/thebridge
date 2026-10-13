-- CreateTable AuditLog (Trilha de Auditoria Imutável - LGPD / Marco Civil)
CREATE TABLE `AuditLog` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `userEmail` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(150) NOT NULL,
    `userRole` VARCHAR(50) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `resourceType` VARCHAR(50) NOT NULL,
    `resourceId` VARCHAR(100) NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(500) NULL,
    `severity` VARCHAR(20) NOT NULL DEFAULT 'INFO',
    `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Regra de Segurança e Blindagem WORM (Append-Only):
-- Impede que registros de log já gravados sejam alterados (UPDATE)
DELIMITER $$
CREATE TRIGGER `prevent_audit_log_update`
BEFORE UPDATE ON `AuditLog`
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Operação Proibida: Registros de auditoria são imutáveis (WORM) e não podem ser alterados.';
END$$
DELIMITER ;
