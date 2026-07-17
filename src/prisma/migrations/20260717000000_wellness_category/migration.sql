-- CreateTable
CREATE TABLE "WellnessCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WellnessCategory_name_key" ON "WellnessCategory"("name");

-- AlterTable
ALTER TABLE "Wellness" ADD COLUMN "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Wellness" ADD CONSTRAINT "Wellness_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WellnessCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
