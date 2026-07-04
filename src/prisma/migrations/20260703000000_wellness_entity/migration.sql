-- CreateEnum (se já existir de outra migração, ignore o erro / ajuste)
DO $$ BEGIN
  CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE "Wellness" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'CPF',
    "contact" TEXT,
    "description" TEXT,
    "whatsappMessage" TEXT,
    "logoUrl" TEXT,
    "openingHours" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wellness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessOffering" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "duration" TEXT,
    "photoUrl" TEXT,
    "wellnessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessOffering_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WellnessOffering" ADD CONSTRAINT "WellnessOffering_wellnessId_fkey" FOREIGN KEY ("wellnessId") REFERENCES "Wellness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- User <-> Wellness
ALTER TABLE "User" ADD COLUMN "wellnessId" TEXT;
CREATE UNIQUE INDEX "User_wellnessId_key" ON "User"("wellnessId");
ALTER TABLE "User" ADD CONSTRAINT "User_wellnessId_fkey" FOREIGN KEY ("wellnessId") REFERENCES "Wellness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===== Data migration: copiar parceiros WELLNESS preservando IDs =====
-- documentType é derivado do documento legado: 14 dígitos = CNPJ, senão CPF.
INSERT INTO "Wellness" ("id", "name", "document", "documentType", "contact", "status", "isDeleted", "deletedAt", "createdAt", "updatedAt")
SELECT
  "id",
  COALESCE(NULLIF("companyName", ''), "tradeName"),
  "document",
  CASE WHEN length(regexp_replace("document", '\D', '', 'g')) = 14 THEN 'CNPJ'::"DocumentType" ELSE 'CPF'::"DocumentType" END,
  "contact", "status", "isDeleted", "deletedAt", "createdAt", "updatedAt"
FROM "PartnerSupplier"
WHERE "type" = 'WELLNESS';

-- Vincular users dos wellness à nova entidade
UPDATE "User" u
SET "wellnessId" = u."partnerSupplierId", "partnerSupplierId" = NULL
WHERE u."partnerSupplierId" IN (SELECT "id" FROM "Wellness");

-- Produtos de lojas de wellness viram serviços (IDs preservados)
INSERT INTO "WellnessOffering" ("id", "name", "description", "price", "duration", "photoUrl", "wellnessId", "createdAt", "updatedAt")
SELECT p."id", p."name", p."description", p."price", p."duration", p."photoUrl", s."partnerId", p."createdAt", p."updatedAt"
FROM "Product" p
JOIN "Store" s ON p."storeId" = s."id"
WHERE s."partnerId" IN (SELECT "id" FROM "Wellness");

-- Vitrine: aproveitar logo/horário/descrição da antiga loja de wellness
UPDATE "Wellness" w
SET "logoUrl" = s."logoUrl",
    "openingHours" = s."openingHours",
    "description" = COALESCE(w."description", s."description")
FROM "Store" s
WHERE s."partnerId" = w."id";

-- Favoritos: reconstruir _FavoriteWellness apontando pra Wellness
-- (convenção Prisma: A = Professional, B = Wellness em ordem alfabética)
ALTER TABLE "_FavoriteWellness" RENAME TO "_FavoriteWellness_old";
-- rename de tabela não renomeia constraints/índices; renomear pra não colidir com a nova
ALTER TABLE "_FavoriteWellness_old" RENAME CONSTRAINT "_FavoriteWellness_AB_pkey" TO "_FavoriteWellness_old_AB_pkey";
ALTER INDEX "_FavoriteWellness_B_index" RENAME TO "_FavoriteWellness_old_B_index";
CREATE TABLE "_FavoriteWellness" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FavoriteWellness_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_FavoriteWellness_B_index" ON "_FavoriteWellness"("B");
ALTER TABLE "_FavoriteWellness" ADD CONSTRAINT "_FavoriteWellness_A_fkey" FOREIGN KEY ("A") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_FavoriteWellness" ADD CONSTRAINT "_FavoriteWellness_B_fkey" FOREIGN KEY ("B") REFERENCES "Wellness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- tabela antiga tinha A = PartnerSupplier, B = Professional; só migram favoritos de wellness
INSERT INTO "_FavoriteWellness" ("A", "B")
SELECT o."B", o."A"
FROM "_FavoriteWellness_old" o
WHERE o."A" IN (SELECT "id" FROM "Wellness");
DROP TABLE "_FavoriteWellness_old";

-- ===== Preço opcional + mensagem de WhatsApp =====
ALTER TABLE "Product" ALTER COLUMN "price" DROP NOT NULL;
ALTER TABLE "Store" ADD COLUMN "whatsappMessage" TEXT;
