-- DropIndex
DROP INDEX "PartnerSupplier_storeId_key";

-- DropIndex
DROP INDEX "Store_partnerId_key";

-- AlterTable
ALTER TABLE "PartnerSupplier" DROP COLUMN "storeId";
