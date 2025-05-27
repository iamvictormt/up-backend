-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "ListedProfessional" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "zipCode" TEXT,
    "socialMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListedProfessional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableDay" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "WeekDay" NOT NULL,
    "listedProfessionalId" TEXT NOT NULL,

    CONSTRAINT "AvailableDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListedProfessional_socialMediaId_key" ON "ListedProfessional"("socialMediaId");

-- AddForeignKey
ALTER TABLE "ListedProfessional" ADD CONSTRAINT "ListedProfessional_socialMediaId_fkey" FOREIGN KEY ("socialMediaId") REFERENCES "SocialMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableDay" ADD CONSTRAINT "AvailableDay_listedProfessionalId_fkey" FOREIGN KEY ("listedProfessionalId") REFERENCES "ListedProfessional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
