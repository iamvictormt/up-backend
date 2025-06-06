/*
  Warnings:

  - You are about to drop the column `profession` on the `Professional` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "profession",
ADD COLUMN     "professionId" TEXT;

-- CreateTable
CREATE TABLE "Profession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Profession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profession_name_key" ON "Profession"("name");

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "Profession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
