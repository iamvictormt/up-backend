-- Log imutável de eventos de assinatura
CREATE TABLE "SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "partnerSupplierId" TEXT,
    "wellnessId" TEXT,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'admin',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SubscriptionEvent_partnerSupplierId_idx" ON "SubscriptionEvent"("partnerSupplierId");
CREATE INDEX "SubscriptionEvent_wellnessId_idx" ON "SubscriptionEvent"("wellnessId");
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_partnerSupplierId_fkey" FOREIGN KEY ("partnerSupplierId") REFERENCES "PartnerSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_wellnessId_fkey" FOREIGN KEY ("wellnessId") REFERENCES "Wellness"("id") ON DELETE SET NULL ON UPDATE CASCADE;
