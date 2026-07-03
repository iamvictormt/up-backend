-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- AlterTable
ALTER TABLE "PartnerSupplier"
  ADD COLUMN "documentType" "DocumentType" NOT NULL DEFAULT 'CNPJ',
  ALTER COLUMN "companyName" DROP NOT NULL;
