-- DropForeignKey
ALTER TABLE `faturamento` DROP FOREIGN KEY `faturamento_fkProjecaoId_fkey`;

-- DropIndex
DROP INDEX `faturamento_fkProjecaoId_fkey` ON `faturamento`;

-- AlterTable
ALTER TABLE `contrato` ADD COLUMN `esocial` BOOLEAN NULL,
    ADD COLUMN `laudos` BOOLEAN NULL;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkProjecaoId_fkey` FOREIGN KEY (`fkProjecaoId`) REFERENCES `projecao`(`idProjecao`) ON DELETE SET NULL ON UPDATE CASCADE;
