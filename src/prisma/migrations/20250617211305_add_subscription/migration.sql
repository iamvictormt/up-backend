-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "partnerSupplierId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_partnerSupplierId_key" ON "Subscription"("partnerSupplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_partnerSupplierId_fkey" FOREIGN KEY ("partnerSupplierId") REFERENCES "PartnerSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
