/*
  Warnings:

  - You are about to drop the column `accessPending` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PartnerSupplier" ADD COLUMN     "accessPending" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessPending";
