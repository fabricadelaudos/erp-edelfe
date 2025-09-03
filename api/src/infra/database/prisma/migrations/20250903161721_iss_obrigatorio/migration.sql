/*
  Warnings:

  - Made the column `iss` on table `competenciafinanceira` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `competenciafinanceira` MODIFY `iss` DECIMAL(10, 2) NOT NULL;
