-- DropForeignKey
ALTER TABLE `faturamento` DROP FOREIGN KEY `faturamento_fkCompetenciaFinanceiraId_fkey`;

-- DropIndex
DROP INDEX `faturamento_fkCompetenciaFinanceiraId_fkey` ON `faturamento`;

-- AlterTable
ALTER TABLE `faturamento` MODIFY `fkCompetenciaFinanceiraId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkCompetenciaFinanceiraId_fkey` FOREIGN KEY (`fkCompetenciaFinanceiraId`) REFERENCES `competenciaFinanceira`(`idCompetenciaFinanceira`) ON DELETE SET NULL ON UPDATE CASCADE;
