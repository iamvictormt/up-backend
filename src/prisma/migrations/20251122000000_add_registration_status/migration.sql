-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "PartnerSupplier" ADD COLUMN "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING';

-- UpdateStatus
UPDATE "PartnerSupplier" SET "status" = 'APPROVED' WHERE "accessPending" = false;

-- AlterTable
ALTER TABLE "PartnerSupplier" DROP COLUMN "accessPending";
