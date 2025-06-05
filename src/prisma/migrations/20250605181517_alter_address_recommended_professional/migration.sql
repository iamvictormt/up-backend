/*
  Warnings:

  - You are about to drop the column `city` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - You are about to drop the column `complement` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `RecommendedProfessional` table. All the data in the column will be lost.
  - Added the required column `addressId` to the `RecommendedProfessional` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecommendedProfessional" DROP COLUMN "city",
DROP COLUMN "complement",
DROP COLUMN "district",
DROP COLUMN "number",
DROP COLUMN "state",
DROP COLUMN "street",
DROP COLUMN "zipCode",
ADD COLUMN     "addressId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RecommendedProfessional" ADD CONSTRAINT "RecommendedProfessional_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
