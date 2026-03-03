-- DropIndex
DROP INDEX "Subscription_partnerSupplierId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId");
