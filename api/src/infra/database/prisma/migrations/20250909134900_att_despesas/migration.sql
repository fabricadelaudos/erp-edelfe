/*
  Warnings:

  - You are about to drop the `despesa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `despesacategoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `despesarecorrente` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `despesa` DROP FOREIGN KEY `despesa_fkDespesaCategoriaId_fkey`;

-- DropForeignKey
ALTER TABLE `despesa` DROP FOREIGN KEY `despesa_fkDespesaRecorrenteId_fkey`;

-- DropTable
DROP TABLE `despesa`;

-- DropTable
DROP TABLE `despesacategoria`;

-- DropTable
DROP TABLE `despesarecorrente`;
