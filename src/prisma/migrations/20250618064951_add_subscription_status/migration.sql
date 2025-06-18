/*
  Warnings:

  - Changed the type of `subscriptionStatus` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAST_DUE', 'TRIALING', 'UNPAID');

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "subscriptionStatus",
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL;
