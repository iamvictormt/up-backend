-- Ramos iniciais de lojistas. Idempotente: rode quantas vezes quiser.
-- Ajuste/adicione nomes conforme a necessidade real.
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- garante gen_random_uuid() em qualquer versão

INSERT INTO "StoreCategory" ("id", "name", "updatedAt") VALUES
  (gen_random_uuid(), 'Móveis',            now()),
  (gen_random_uuid(), 'Tapetes',           now()),
  (gen_random_uuid(), 'Iluminação',        now()),
  (gen_random_uuid(), 'Decoração',         now()),
  (gen_random_uuid(), 'Cortinas e Persianas', now()),
  (gen_random_uuid(), 'Papel de Parede',   now()),
  (gen_random_uuid(), 'Estofados',         now()),
  (gen_random_uuid(), 'Cama, Mesa e Banho', now()),
  (gen_random_uuid(), 'Eletro e Utilidades', now()),
  (gen_random_uuid(), 'Paisagismo e Jardim', now())
ON CONFLICT ("name") DO NOTHING;
