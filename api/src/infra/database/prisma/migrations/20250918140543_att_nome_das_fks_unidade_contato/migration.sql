/*
  Warnings:

  - You are about to drop the column `contatoId` on the `unidadecontato` table. All the data in the column will be lost.
  - You are about to drop the column `unidadeId` on the `unidadecontato` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fkUnidadeId,fkContatoId]` on the table `unidadeContato` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fkContatoId` to the `unidadeContato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fkUnidadeId` to the `unidadeContato` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `unidadecontato` DROP FOREIGN KEY `unidadeContato_contatoId_fkey`;

-- DropForeignKey
ALTER TABLE `unidadecontato` DROP FOREIGN KEY `unidadeContato_unidadeId_fkey`;

-- DropIndex
DROP INDEX `unidadeContato_contatoId_fkey` ON `unidadecontato`;

-- DropIndex
DROP INDEX `unidadeContato_unidadeId_contatoId_key` ON `unidadecontato`;

-- AlterTable
ALTER TABLE `unidadecontato` DROP COLUMN `contatoId`,
    DROP COLUMN `unidadeId`,
    ADD COLUMN `fkContatoId` INTEGER NOT NULL,
    ADD COLUMN `fkUnidadeId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `unidadeContato_fkUnidadeId_fkContatoId_key` ON `unidadeContato`(`fkUnidadeId`, `fkContatoId`);

-- AddForeignKey
ALTER TABLE `unidadeContato` ADD CONSTRAINT `unidadeContato_fkUnidadeId_fkey` FOREIGN KEY (`fkUnidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unidadeContato` ADD CONSTRAINT `unidadeContato_fkContatoId_fkey` FOREIGN KEY (`fkContatoId`) REFERENCES `contato`(`idContato`) ON DELETE CASCADE ON UPDATE CASCADE;
