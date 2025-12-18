/*
  Warnings:

  - You are about to alter the column `tipoDocumento` on the `fornecedor` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `faturamento` ADD COLUMN `boletoEmitido` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `emailEnviado` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `fornecedor` MODIFY `tipoDocumento` VARCHAR(191) NULL;
