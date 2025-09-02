-- DropForeignKey
ALTER TABLE `contato` DROP FOREIGN KEY `contato_fkUnidadeId_fkey`;

-- DropForeignKey
ALTER TABLE `contrato` DROP FOREIGN KEY `contrato_fkUnidadeId_fkey`;

-- DropForeignKey
ALTER TABLE `faturamento` DROP FOREIGN KEY `faturamento_fkContratoId_fkey`;

-- DropForeignKey
ALTER TABLE `faturamento` DROP FOREIGN KEY `faturamento_fkProjecaoId_fkey`;

-- DropForeignKey
ALTER TABLE `projecao` DROP FOREIGN KEY `projecao_fkContratoId_fkey`;

-- DropForeignKey
ALTER TABLE `unidade` DROP FOREIGN KEY `unidade_fkEmpresaId_fkey`;

-- DropIndex
DROP INDEX `contrato_fkUnidadeId_fkey` ON `contrato`;

-- DropIndex
DROP INDEX `faturamento_fkContratoId_fkey` ON `faturamento`;

-- DropIndex
DROP INDEX `faturamento_fkProjecaoId_fkey` ON `faturamento`;

-- DropIndex
DROP INDEX `projecao_fkContratoId_fkey` ON `projecao`;

-- DropIndex
DROP INDEX `unidade_fkEmpresaId_fkey` ON `unidade`;

-- AlterTable
ALTER TABLE `contato` MODIFY `email` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `unidade` ADD CONSTRAINT `unidade_fkEmpresaId_fkey` FOREIGN KEY (`fkEmpresaId`) REFERENCES `empresa`(`idEmpresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contato` ADD CONSTRAINT `contato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato` ADD CONSTRAINT `contrato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projecao` ADD CONSTRAINT `projecao_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkProjecaoId_fkey` FOREIGN KEY (`fkProjecaoId`) REFERENCES `projecao`(`idProjecao`) ON DELETE CASCADE ON UPDATE CASCADE;
