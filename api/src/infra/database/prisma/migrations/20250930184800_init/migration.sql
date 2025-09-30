-- CreateTable
CREATE TABLE `usuario` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `firebaseId` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `editado_em` DATETIME(0) NOT NULL,

    UNIQUE INDEX `email_UNIQUE`(`email`),
    UNIQUE INDEX `usuario_firebaseId_key`(`firebaseId`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `tipoDocumento` ENUM('CNPJ', 'CAEPF', 'CPF') NOT NULL,
    `inscricaoEstadual` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `observacao` VARCHAR(191) NULL,
    `uf` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `retemIss` BOOLEAN NOT NULL DEFAULT false,

    INDEX `unidade_fkEmpresaId_fkey`(`fkEmpresaId`),
    PRIMARY KEY (`idUnidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contato` (
    `idContato` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailSecundario` VARCHAR(191) NULL,
    `telefoneFixo` VARCHAR(191) NULL,
    `telefoneWpp` VARCHAR(191) NULL,

    PRIMARY KEY (`idContato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contrato` (
    `idContrato` INTEGER NOT NULL AUTO_INCREMENT,
    `fkUnidadeId` INTEGER NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `parcelas` INTEGER NOT NULL,
    `valorBase` DECIMAL(10, 2) NOT NULL,
    `porVida` BOOLEAN NOT NULL,
    `recorrente` BOOLEAN NOT NULL,
    `status` ENUM('ATIVO', 'ENCERRADO', 'CANCELADO') NOT NULL,
    `faturadoPor` ENUM('MEDWORK', 'EDELFE') NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `esocial` BOOLEAN NULL,
    `laudos` BOOLEAN NULL,
    `diaVencimento` VARCHAR(191) NULL,
    `vidas` INTEGER NULL,

    INDEX `contrato_fkUnidadeId_fkey`(`fkUnidadeId`),
    PRIMARY KEY (`idContrato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projecao` (
    `idProjecao` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContratoId` INTEGER NOT NULL,
    `competencia` VARCHAR(191) NOT NULL,
    `valorPrevisto` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDENTE', 'FATURADO') NOT NULL,
    `vidas` INTEGER NULL,

    INDEX `projecao_fkContratoId_fkey`(`fkContratoId`),
    PRIMARY KEY (`idProjecao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faturamento` (
    `idFaturamento` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContratoId` INTEGER NOT NULL,
    `fkProjecaoId` INTEGER NULL,
    `fkCompetenciaFinanceiraId` INTEGER NULL,
    `competencia` VARCHAR(191) NOT NULL,
    `valorBase` DECIMAL(10, 2) NOT NULL,
    `impostoPorcentagem` DECIMAL(10, 2) NOT NULL,
    `impostoValor` DECIMAL(10, 2) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA') NOT NULL,
    `vidas` INTEGER NULL,
    `pagoEm` DATETIME(3) NULL,
    `competenciaPagamento` VARCHAR(191) NULL,
    `numeroNota` VARCHAR(191) NULL,

    INDEX `faturamento_fkCompetenciaFinanceiraId_fkey`(`fkCompetenciaFinanceiraId`),
    INDEX `faturamento_fkContratoId_fkey`(`fkContratoId`),
    INDEX `faturamento_fkProjecaoId_fkey`(`fkProjecaoId`),
    PRIMARY KEY (`idFaturamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedor` (
    `idFornecedor` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoPessoa` ENUM('CLIENTE', 'FORNECEDOR', 'CLIENTE_FORNECEDOR') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `documento` VARCHAR(191) NULL,
    `tipoDocumento` ENUM('CNPJ', 'CAEPF', 'CPF') NULL,

    UNIQUE INDEX `fornecedor_documento_key`(`documento`),
    PRIMARY KEY (`idFornecedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banco` (
    `idBanco` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idBanco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competenciafinanceira` (
    `idCompetenciaFinanceira` INTEGER NOT NULL AUTO_INCREMENT,
    `competencia` VARCHAR(191) NOT NULL,
    `imposto` DECIMAL(10, 2) NOT NULL,
    `ipca` DECIMAL(10, 2) NOT NULL,
    `iss` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `competenciaFinanceira_competencia_key`(`competencia`),
    PRIMARY KEY (`idCompetenciaFinanceira`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contapagar` (
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

-- CreateTable
CREATE TABLE `logevento` (
    `idLogEvento` INTEGER NOT NULL AUTO_INCREMENT,
    `fkUsuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `entidade` VARCHAR(191) NULL,
    `entidade_id` INTEGER NULL,
    `dados_antes` JSON NULL,
    `dados_depois` JSON NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_logEvento_fkUsuarioId`(`fkUsuarioId`),
    PRIMARY KEY (`idLogEvento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parcelacontapagar` (
    `idParcela` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContaPagarId` INTEGER NOT NULL,
    `numero` INTEGER NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA') NOT NULL DEFAULT 'ABERTA',
    `pagoEm` DATETIME(3) NULL,

    INDEX `parcelaContaPagar_fkContaPagarId_fkey`(`fkContaPagarId`),
    PRIMARY KEY (`idParcela`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planocontacategoria` (
    `idPlanoContaCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`idPlanoContaCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planocontasubcategoria` (
    `idPlanoContaSubCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `fkPlanoContaCategoria` INTEGER NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `planoContaSubcategoria_fkPlanoContaCategoria_fkey`(`fkPlanoContaCategoria`),
    PRIMARY KEY (`idPlanoContaSubCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unidadecontato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fkContatoId` INTEGER NOT NULL,
    `fkUnidadeId` INTEGER NOT NULL,

    INDEX `unidadeContato_fkContatoId_fkey`(`fkContatoId`),
    UNIQUE INDEX `unidadeContato_fkUnidadeId_fkContatoId_key`(`fkUnidadeId`, `fkContatoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `unidade` ADD CONSTRAINT `unidade_fkEmpresaId_fkey` FOREIGN KEY (`fkEmpresaId`) REFERENCES `empresa`(`idEmpresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato` ADD CONSTRAINT `contrato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projecao` ADD CONSTRAINT `projecao_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkCompetenciaFinanceiraId_fkey` FOREIGN KEY (`fkCompetenciaFinanceiraId`) REFERENCES `competenciafinanceira`(`idCompetenciaFinanceira`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkProjecaoId_fkey` FOREIGN KEY (`fkProjecaoId`) REFERENCES `projecao`(`idProjecao`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contapagar` ADD CONSTRAINT `contaPagar_fkBancoId_fkey` FOREIGN KEY (`fkBancoId`) REFERENCES `banco`(`idBanco`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contapagar` ADD CONSTRAINT `contaPagar_fkFornecedorId_fkey` FOREIGN KEY (`fkFornecedorId`) REFERENCES `fornecedor`(`idFornecedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contapagar` ADD CONSTRAINT `contaPagar_fkPlanoContaSubCategoriaId_fkey` FOREIGN KEY (`fkPlanoContaSubCategoriaId`) REFERENCES `planocontasubcategoria`(`idPlanoContaSubCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logevento` ADD CONSTRAINT `fk_logEvento_fkUsuarioId` FOREIGN KEY (`fkUsuarioId`) REFERENCES `usuario`(`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parcelacontapagar` ADD CONSTRAINT `parcelaContaPagar_fkContaPagarId_fkey` FOREIGN KEY (`fkContaPagarId`) REFERENCES `contapagar`(`idContaPagar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planocontasubcategoria` ADD CONSTRAINT `planoContaSubcategoria_fkPlanoContaCategoria_fkey` FOREIGN KEY (`fkPlanoContaCategoria`) REFERENCES `planocontacategoria`(`idPlanoContaCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unidadecontato` ADD CONSTRAINT `unidadeContato_fkContatoId_fkey` FOREIGN KEY (`fkContatoId`) REFERENCES `contato`(`idContato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unidadecontato` ADD CONSTRAINT `unidadeContato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;
