-- LIMPEZA das linhas WELLNESS legadas em PartnerSupplier.
-- Rodar MANUALMENTE, só depois de validar que a migração 20260703000000_wellness_entity
-- copiou tudo (conferir contagens abaixo antes de executar os DELETEs).

-- Conferência (deve retornar 0 linhas):
--   SELECT ps.id, ps."tradeName" FROM "PartnerSupplier" ps
--   WHERE ps.type = 'WELLNESS' AND ps.id NOT IN (SELECT id FROM "Wellness");

BEGIN;

-- produtos e eventos das lojas de wellness
DELETE FROM "Product" WHERE "storeId" IN (
  SELECT s.id FROM "Store" s JOIN "PartnerSupplier" ps ON s."partnerId" = ps.id WHERE ps.type = 'WELLNESS');
DELETE FROM "EventRegistration" WHERE "eventId" IN (
  SELECT e.id FROM "Event" e JOIN "Store" s ON e."storeId" = s.id JOIN "PartnerSupplier" ps ON s."partnerId" = ps.id WHERE ps.type = 'WELLNESS');
DELETE FROM "Event" WHERE "storeId" IN (
  SELECT s.id FROM "Store" s JOIN "PartnerSupplier" ps ON s."partnerId" = ps.id WHERE ps.type = 'WELLNESS');

-- lojas de wellness
DELETE FROM "Store" WHERE "partnerId" IN (SELECT id FROM "PartnerSupplier" WHERE type = 'WELLNESS');

-- assinaturas de wellness (não deveriam existir mais; wellness não tem plano)
DELETE FROM "Subscription" WHERE "partnerSupplierId" IN (SELECT id FROM "PartnerSupplier" WHERE type = 'WELLNESS');

-- por fim, as linhas WELLNESS
DELETE FROM "PartnerSupplier" WHERE type = 'WELLNESS';

COMMIT;
