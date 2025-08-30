/*
  Warnings:

  - You are about to drop the column `cnpj` on the `unidade` table. All the data in the column will be lost.
  - Added the required column `documento` to the `unidade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `unidade` DROP COLUMN `cnpj`,
    ADD COLUMN `documento` VARCHAR(191) NOT NULL;
