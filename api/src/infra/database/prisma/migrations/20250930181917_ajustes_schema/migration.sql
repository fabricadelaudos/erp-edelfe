/*
  Warnings:

  - You are about to drop the `contapagar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `contapagar` DROP FOREIGN KEY `contaPagar_fkBancoId_fkey`;

-- DropForeignKey
ALTER TABLE `contapagar` DROP FOREIGN KEY `contaPagar_fkFornecedorId_fkey`;

-- DropForeignKey
ALTER TABLE `contapagar` DROP FOREIGN KEY `contaPagar_fkPlanoContaSubCategoriaId_fkey`;

-- DropForeignKey
ALTER TABLE `parcelacontapagar` DROP FOREIGN KEY `parcelaContaPagar_fkContaPagarId_fkey`;

-- DropTable
DROP TABLE `contapagar`;

-- CreateTable
CREATE TABLE `contaspagar` (
    `idContaPagar` INTEGER NOT NULL AUTO_INCREMENT,
    `dataEmissao` DATETIME(3) NOT NULL,
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `fkFornecedorId` INTEGER NOT NULL,
    `tipoDocumentoConta` ENUM('BOLETO', 'DEBITO_AUTOMATICO', 'FATURA', 'NF', 'PIX') NOT NULL,
    `fkPlanoContaSubCategoriaId` INTEGER NOT NULL,
    `fkBancoId` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `parcelas` INTEGER NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `intervalo` INTEGER NOT NULL,
    `recorrente` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA') NOT NULL DEFAULT 'ABERTA',

    INDEX `contaPagar_fkBancoId_fkey`(`fkBancoId`),
    INDEX `contaPagar_fkFornecedorId_fkey`(`fkFornecedorId`),
    INDEX `contaPagar_fkPlanoContaSubCategoriaId_fkey`(`fkPlanoContaSubCategoriaId`),
    PRIMARY KEY (`idContaPagar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contaspagar` ADD CONSTRAINT `contaPagar_fkBancoId_fkey` FOREIGN KEY (`fkBancoId`) REFERENCES `banco`(`idBanco`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contaspagar` ADD CONSTRAINT `contaPagar_fkFornecedorId_fkey` FOREIGN KEY (`fkFornecedorId`) REFERENCES `fornecedor`(`idFornecedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contaspagar` ADD CONSTRAINT `contaPagar_fkPlanoContaSubCategoriaId_fkey` FOREIGN KEY (`fkPlanoContaSubCategoriaId`) REFERENCES `planocontasubcategoria`(`idPlanoContaSubCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parcelacontapagar` ADD CONSTRAINT `parcelaContaPagar_fkContaPagarId_fkey` FOREIGN KEY (`fkContaPagarId`) REFERENCES `contaspagar`(`idContaPagar`) ON DELETE RESTRICT ON UPDATE CASCADE;
