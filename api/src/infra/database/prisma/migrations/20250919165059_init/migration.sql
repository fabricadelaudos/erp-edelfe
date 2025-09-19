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
    `documento` VARCHAR(191) NOT NULL,
    `inscricaoEstadual` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `uf` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `observacao` VARCHAR(191) NULL,
    `retemIss` BOOLEAN NOT NULL DEFAULT false,

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
CREATE TABLE `unidadeContato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fkUnidadeId` INTEGER NOT NULL,
    `fkContatoId` INTEGER NOT NULL,

    UNIQUE INDEX `unidadeContato_fkUnidadeId_fkContatoId_key`(`fkUnidadeId`, `fkContatoId`),
    PRIMARY KEY (`id`)
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
    `vidas` INTEGER NULL,
    `recorrente` BOOLEAN NOT NULL,
    `status` ENUM('ATIVO', 'ENCERRADO', 'CANCELADO') NOT NULL,
    `faturadoPor` ENUM('MEDWORK', 'EDELFE') NOT NULL,
    `esocial` BOOLEAN NULL,
    `laudos` BOOLEAN NULL,
    `observacao` VARCHAR(191) NULL,
    `diaVencimento` VARCHAR(191) NULL,

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

    PRIMARY KEY (`idFaturamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competenciaFinanceira` (
    `idCompetenciaFinanceira` INTEGER NOT NULL AUTO_INCREMENT,
    `competencia` VARCHAR(191) NOT NULL,
    `imposto` DECIMAL(10, 2) NOT NULL,
    `ipca` DECIMAL(10, 2) NOT NULL,
    `iss` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `competenciaFinanceira_competencia_key`(`competencia`),
    PRIMARY KEY (`idCompetenciaFinanceira`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedor` (
    `idFornecedor` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoPessoa` ENUM('CLIENTE', 'FORNECEDOR', 'CLIENTE_FORNECEDOR') NOT NULL,
    `tipoDocumento` ENUM('CNPJ', 'CAEPF', 'CPF') NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `fornecedor_documento_key`(`documento`),
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
    `descricao` VARCHAR(191) NULL,
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

-- CreateTable
CREATE TABLE `logEvento` (
    `idLogEvento` INTEGER NOT NULL AUTO_INCREMENT,
    `fkUsuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `entidade` VARCHAR(191) NULL,
    `entidade_id` INTEGER NULL,
    `dados_antes` JSON NULL,
    `dados_depois` JSON NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`idLogEvento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `unidade` ADD CONSTRAINT `unidade_fkEmpresaId_fkey` FOREIGN KEY (`fkEmpresaId`) REFERENCES `empresa`(`idEmpresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unidadeContato` ADD CONSTRAINT `unidadeContato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unidadeContato` ADD CONSTRAINT `unidadeContato_fkContatoId_fkey` FOREIGN KEY (`fkContatoId`) REFERENCES `contato`(`idContato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contrato` ADD CONSTRAINT `contrato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projecao` ADD CONSTRAINT `projecao_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkContratoId_fkey` FOREIGN KEY (`fkContratoId`) REFERENCES `contrato`(`idContrato`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkProjecaoId_fkey` FOREIGN KEY (`fkProjecaoId`) REFERENCES `projecao`(`idProjecao`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_fkCompetenciaFinanceiraId_fkey` FOREIGN KEY (`fkCompetenciaFinanceiraId`) REFERENCES `competenciaFinanceira`(`idCompetenciaFinanceira`) ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `logEvento` ADD CONSTRAINT `fk_logEvento_fkUsuarioId` FOREIGN KEY (`fkUsuarioId`) REFERENCES `usuario`(`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
