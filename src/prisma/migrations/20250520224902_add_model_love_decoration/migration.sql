/*
  Warnings:

  - A unique constraint covering the columns `[LoveDecorationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "LoveDecorationId" TEXT;

-- CreateTable
CREATE TABLE "LoveDecoration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "tiktok" TEXT NOT NULL,
    "addressId" TEXT,
    "userId" TEXT,

    CONSTRAINT "LoveDecoration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_LoveDecorationId_key" ON "User"("LoveDecorationId");

-- AddForeignKey
ALTER TABLE "LoveDecoration" ADD CONSTRAINT "LoveDecoration_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoveDecoration" ADD CONSTRAINT "LoveDecoration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
