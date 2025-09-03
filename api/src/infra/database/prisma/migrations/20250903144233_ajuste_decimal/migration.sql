/*
  Warnings:

  - You are about to alter the column `imposto` on the `competenciafinanceira` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `ipca` on the `competenciafinanceira` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `valorBase` on the `contrato` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `valor` on the `despesa` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `valor` on the `despesarecorrente` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `valorBase` on the `faturamento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `impostoPorcentagem` on the `faturamento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `impostoValor` on the `faturamento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `valorTotal` on the `faturamento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `valorPrevisto` on the `projecao` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `competenciafinanceira` MODIFY `imposto` DECIMAL(10, 2) NOT NULL,
    MODIFY `ipca` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `contrato` MODIFY `valorBase` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `despesa` MODIFY `valor` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `despesarecorrente` MODIFY `valor` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `faturamento` MODIFY `valorBase` DECIMAL(10, 2) NOT NULL,
    MODIFY `impostoPorcentagem` DECIMAL(10, 2) NOT NULL,
    MODIFY `impostoValor` DECIMAL(10, 2) NOT NULL,
    MODIFY `valorTotal` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `projecao` MODIFY `valorPrevisto` DECIMAL(10, 2) NOT NULL;
