-- Subscription passa a atender lojista OU wellness
ALTER TABLE "Subscription" ALTER COLUMN "partnerSupplierId" DROP NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN "wellnessId" TEXT;
CREATE UNIQUE INDEX "Subscription_wellnessId_key" ON "Subscription"("wellnessId");
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_wellnessId_fkey" FOREIGN KEY ("wellnessId") REFERENCES "Wellness"("id") ON DELETE SET NULL ON UPDATE CASCADE;
