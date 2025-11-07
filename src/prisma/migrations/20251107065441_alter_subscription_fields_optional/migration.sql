-- DropIndex
DROP INDEX "Subscription_subscriptionId_key";

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL,
ALTER COLUMN "subscriptionId" DROP NOT NULL;
