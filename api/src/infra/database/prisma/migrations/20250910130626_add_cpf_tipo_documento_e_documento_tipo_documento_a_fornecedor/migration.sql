/*
  Warnings:

  - You are about to drop the column `cnpjCpf` on the `fornecedor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documento]` on the table `fornecedor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documento` to the `fornecedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `fornecedor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `fornecedor_cnpjCpf_key` ON `fornecedor`;

-- AlterTable
ALTER TABLE `fornecedor` DROP COLUMN `cnpjCpf`,
    ADD COLUMN `documento` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipoDocumento` ENUM('CNPJ', 'CAEPF', 'CPF') NOT NULL;

-- AlterTable
ALTER TABLE `unidade` MODIFY `tipoDocumento` ENUM('CNPJ', 'CAEPF', 'CPF') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `fornecedor_documento_key` ON `fornecedor`(`documento`);
