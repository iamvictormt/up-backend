-- Categorias iniciais de wellness. Idempotente: rode quantas vezes quiser.
-- Ajuste/adicione nomes conforme a necessidade real.
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- garante gen_random_uuid() em qualquer versão

INSERT INTO "WellnessCategory" ("id", "name", "updatedAt") VALUES
  (gen_random_uuid(), 'Massagem',          now()),
  (gen_random_uuid(), 'Yoga',              now()),
  (gen_random_uuid(), 'Estética',          now()),
  (gen_random_uuid(), 'Terapias Holísticas', now()),
  (gen_random_uuid(), 'Nutrição',          now()),
  (gen_random_uuid(), 'Fisioterapia',      now()),
  (gen_random_uuid(), 'Pilates',           now()),
  (gen_random_uuid(), 'Acupuntura',        now()),
  (gen_random_uuid(), 'Meditação',         now()),
  (gen_random_uuid(), 'Personal Trainer',  now())
ON CONFLICT ("name") DO NOTHING;
