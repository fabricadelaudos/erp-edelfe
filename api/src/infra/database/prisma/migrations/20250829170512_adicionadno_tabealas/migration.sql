-- CreateTable
CREATE TABLE `empresa` (
    `idEmpresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idEmpresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unidade` (
    `idUnidade` INTEGER NOT NULL AUTO_INCREMENT,
    `fkEmpresaId` INTEGER NOT NULL,
    `nomeFantasia` VARCHAR(191) NOT NULL,
    `razaoSocial` VARCHAR(191) NOT NULL,
    `tipoDocumento` ENUM('CNPJ', 'CAEPF') NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `inscricaoEstadual` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `observacao` VARCHAR(191) NULL,

    PRIMARY KEY (`idUnidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contato` (
    `idContato` INTEGER NOT NULL AUTO_INCREMENT,
    `fkUnidadeId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailSecundario` VARCHAR(191) NULL,
    `telefoneFixo` VARCHAR(191) NULL,
    `telefoneWpp` VARCHAR(191) NULL,

    UNIQUE INDEX `contato_fkUnidadeId_key`(`fkUnidadeId`),
    PRIMARY KEY (`idContato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contrato` (
    `idContrato` INTEGER NOT NULL AUTO_INCREMENT,
    `fkUnidadeId` INTEGER NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `parcelas` INTEGER NOT NULL,
    `valorBase` DECIMAL(65, 30) NOT NULL,
    `porVida` BOOLEAN NOT NULL,
    `recorrente` BOOLEAN NOT NULL,
    `status` ENUM('ATIVO', 'ENCERRADO', 'CANCELADO') NOT NULL,
    `faturadoPor` ENUM('MEDWORK', 'EDELFE') NOT NULL,
    `observacao` VARCHAR(191) NULL,

    PRIMARY KEY (`idContrato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projecao` (
    `idProjecao` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContratoId` INTEGER NOT NULL,
    `competencia` VARCHAR(191) NOT NULL,
    `valorPrevisto` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('PENDENTE', 'FATURADO') NOT NULL,
    `vidas` INTEGER NULL,

    PRIMARY KEY (`idProjecao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faturamento` (
    `idFaturamento` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContratoId` INTEGER NOT NULL,
    `fkProjecaoId` INTEGER NULL,
    `fkCompetenciaFinanceiraId` INTEGER NOT NULL,
    `competencia` VARCHAR(191) NOT NULL,
    `valorBase` DECIMAL(65, 30) NOT NULL,
    `impostoPorcentagem` DECIMAL(65, 30) NOT NULL,
    `impostoValor` DECIMAL(65, 30) NOT NULL,
    `valorTotal` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA') NOT NULL,
    `vidas` INTEGER NULL,
    `pagoEm` DATETIME(3) NULL,
    `competenciaPagamento` VARCHAR(191) NULL,

    PRIMARY KEY (`idFaturamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competenciaFinanceira` (
    `idCompetenciaFinanceira` INTEGER NOT NULL AUTO_INCREMENT,
    `competencia` VARCHAR(191) NOT NULL,
    `imposto` DECIMAL(65, 30) NOT NULL,
    `ipca` DECIMAL(65, 30) NOT NULL,

    UNIQUE INDEX `competenciaFinanceira_competencia_key`(`competencia`),
    PRIMARY KEY (`idCompetenciaFinanceira`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despesa` (
    `idDespesa` INTEGER NOT NULL AUTO_INCREMENT,
    `fkDespesaRecorrenteId` INTEGER NULL,
    `fkDespesaCategoriaId` INTEGER NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `competencia` VARCHAR(191) NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('ABERTA', 'PAGA') NOT NULL,
    `tipoPagamento` ENUM('AVISTA', 'APRAZO', 'RECORRENTE') NOT NULL,
    `parcelaAtual` INTEGER NULL,
    `parcelaTotal` INTEGER NULL,
    `pagoEm` DATETIME(3) NULL,

    PRIMARY KEY (`idDespesa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despesaRecorrente` (
    `idDespesaRecorrente` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `vencimento` INTEGER NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idDespesaRecorrente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despesaCategoria` (
    `idDespesaCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` INTEGER NOT NULL,

    PRIMARY KEY (`idDespesaCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `unidade` ADD CONSTRAINT `unidade_fkEmpresaId_fkey` FOREIGN KEY (`fkEmpresaId`) REFERENCES `empresa`(`idEmpresa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contato` ADD CONSTRAINT `contato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato` ADD CONSTRAINT `contrato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projecao` ADD CONSTRAINT `projecao_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkProjecaoId_fkey` FOREIGN KEY (`fkProjecaoId`) REFERENCES `projecao`(`idProjecao`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkCompetenciaFinanceiraId_fkey` FOREIGN KEY (`fkCompetenciaFinanceiraId`) REFERENCES `competenciaFinanceira`(`idCompetenciaFinanceira`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `despesa` ADD CONSTRAINT `despesa_fkDespesaRecorrenteId_fkey` FOREIGN KEY (`fkDespesaRecorrenteId`) REFERENCES `despesaRecorrente`(`idDespesaRecorrente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `despesa` ADD CONSTRAINT `despesa_fkDespesaCategoriaId_fkey` FOREIGN KEY (`fkDespesaCategoriaId`) REFERENCES `despesaCategoria`(`idDespesaCategoria`) ON DELETE SET NULL ON UPDATE CASCADE;
