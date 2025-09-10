-- CreateTable
CREATE TABLE `fornecedor` (
    `idFornecedor` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoPessoa` ENUM('CLIENTE', 'FORNECEDOR', 'CLIENTE_FORNECEDOR') NOT NULL,
    `cnpjCpf` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `fornecedor_cnpjCpf_key`(`cnpjCpf`),
    PRIMARY KEY (`idFornecedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planoContaCategoria` (
    `idPlanoContaCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idPlanoContaCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planoContaSubcategoria` (
    `idPlanoContaSubCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `fkPlanoContaCategoria` INTEGER NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idPlanoContaSubCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banco` (
    `idBanco` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idBanco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contaPagar` (
    `idContaPagar` INTEGER NOT NULL AUTO_INCREMENT,
    `dataEmissao` DATETIME(3) NOT NULL,
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `fkFornecedorId` INTEGER NOT NULL,
    `tipoDocumentoConta` ENUM('BOLETO', 'DEBITO_AUTOMATICO', 'FATURA', 'NF', 'PIX') NOT NULL,
    `fkPlanoContaSubCategoriaId` INTEGER NOT NULL,
    `fkBancoId` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `parcelas` INTEGER NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `intervalo` INTEGER NOT NULL,
    `recorrente` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA') NOT NULL DEFAULT 'ABERTA',

    PRIMARY KEY (`idContaPagar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parcelaContaPagar` (
    `idParcela` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContaPagarId` INTEGER NOT NULL,
    `numero` INTEGER NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA') NOT NULL DEFAULT 'ABERTA',
    `pagoEm` DATETIME(3) NULL,

    PRIMARY KEY (`idParcela`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `planoContaSubcategoria` ADD CONSTRAINT `planoContaSubcategoria_fkPlanoContaCategoria_fkey` FOREIGN KEY (`fkPlanoContaCategoria`) REFERENCES `planoContaCategoria`(`idPlanoContaCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contaPagar` ADD CONSTRAINT `contaPagar_fkFornecedorId_fkey` FOREIGN KEY (`fkFornecedorId`) REFERENCES `fornecedor`(`idFornecedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contaPagar` ADD CONSTRAINT `contaPagar_fkPlanoContaSubCategoriaId_fkey` FOREIGN KEY (`fkPlanoContaSubCategoriaId`) REFERENCES `planoContaSubcategoria`(`idPlanoContaSubCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contaPagar` ADD CONSTRAINT `contaPagar_fkBancoId_fkey` FOREIGN KEY (`fkBancoId`) REFERENCES `banco`(`idBanco`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parcelaContaPagar` ADD CONSTRAINT `parcelaContaPagar_fkContaPagarId_fkey` FOREIGN KEY (`fkContaPagarId`) REFERENCES `contaPagar`(`idContaPagar`) ON DELETE RESTRICT ON UPDATE CASCADE;
