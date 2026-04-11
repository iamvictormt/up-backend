-- AlterTable
ALTER TABLE "PartnerSupplier" ADD COLUMN     "currentPointsAwarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsLimit" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PhysicalSale" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sellerName" TEXT,
    "invoice" TEXT,
    "points" INTEGER NOT NULL,
    "partnerId" TEXT NOT NULL,
    "professionalId" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhysicalSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalSale_code_key" ON "PhysicalSale"("code");

-- AddForeignKey
ALTER TABLE "PhysicalSale" ADD CONSTRAINT "PhysicalSale_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalSale" ADD CONSTRAINT "PhysicalSale_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
