-- DropIndex
DROP INDEX IF EXISTS "User_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_active_key" ON "User"("email") WHERE "isDeleted" = false;
