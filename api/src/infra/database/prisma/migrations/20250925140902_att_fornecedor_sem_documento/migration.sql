-- AlterTable
ALTER TABLE `fornecedor` MODIFY `tipoDocumento` ENUM('CNPJ', 'CAEPF', 'CPF') NULL,
    MODIFY `documento` VARCHAR(191) NULL;
