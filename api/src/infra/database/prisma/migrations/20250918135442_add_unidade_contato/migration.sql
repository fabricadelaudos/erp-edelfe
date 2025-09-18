/*
  Warnings:

  - You are about to drop the column `fkUnidadeId` on the `contato` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `contato` DROP FOREIGN KEY `contato_fkUnidadeId_fkey`;

-- DropIndex
DROP INDEX `contato_fkUnidadeId_key` ON `contato`;

-- AlterTable
ALTER TABLE `contato` DROP COLUMN `fkUnidadeId`;

-- CreateTable
CREATE TABLE `unidadeContato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unidadeId` INTEGER NOT NULL,
    `contatoId` INTEGER NOT NULL,

    UNIQUE INDEX `unidadeContato_unidadeId_contatoId_key`(`unidadeId`, `contatoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `unidadeContato` ADD CONSTRAINT `unidadeContato_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade`(`idUnidade`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unidadeContato` ADD CONSTRAINT `unidadeContato_contatoId_fkey` FOREIGN KEY (`contatoId`) REFERENCES `contato`(`idContato`) ON DELETE CASCADE ON UPDATE CASCADE;
