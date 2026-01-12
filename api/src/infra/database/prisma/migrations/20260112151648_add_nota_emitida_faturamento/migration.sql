/*
  Warnings:

  - You are about to drop the column `NotaEmitida` on the `faturamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `faturamento` DROP COLUMN `NotaEmitida`,
    ADD COLUMN `notaEmitida` BOOLEAN NULL DEFAULT false;
