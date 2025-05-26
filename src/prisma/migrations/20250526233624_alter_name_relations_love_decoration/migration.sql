/*
  Warnings:

  - You are about to drop the column `LoveDecorationId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[loveDecorationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_LoveDecorationId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "LoveDecorationId",
ADD COLUMN     "loveDecorationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_loveDecorationId_key" ON "User"("loveDecorationId");
