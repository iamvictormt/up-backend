-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('SUPPLIER', 'WELLNESS');

-- AlterTable
ALTER TABLE "PartnerSupplier" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "PartnerType" NOT NULL DEFAULT 'SUPPLIER';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "duration" TEXT;

-- CreateTable
CREATE TABLE "_FavoriteWellness" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FavoriteWellness_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FavoriteWellness_B_index" ON "_FavoriteWellness"("B");

-- AddForeignKey
ALTER TABLE "_FavoriteWellness" ADD CONSTRAINT "_FavoriteWellness_A_fkey" FOREIGN KEY ("A") REFERENCES "PartnerSupplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteWellness" ADD CONSTRAINT "_FavoriteWellness_B_fkey" FOREIGN KEY ("B") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
