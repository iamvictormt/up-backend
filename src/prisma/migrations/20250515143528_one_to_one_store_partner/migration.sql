/*
  Warnings:

  - You are about to drop the column `cnpj` on the `Store` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId]` on the table `PartnerSupplier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[partnerId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PartnerSupplier" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "cnpj";

-- CreateIndex
CREATE UNIQUE INDEX "PartnerSupplier_storeId_key" ON "PartnerSupplier"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_partnerId_key" ON "Store"("partnerId");
