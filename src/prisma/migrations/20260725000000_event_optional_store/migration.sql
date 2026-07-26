-- Evento pode existir sem loja associada (eventos configurados pelo admin)
ALTER TABLE "Event" ALTER COLUMN "storeId" DROP NOT NULL;
