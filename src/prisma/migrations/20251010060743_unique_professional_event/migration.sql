/*
  Warnings:

  - A unique constraint covering the columns `[professionalId,eventId]` on the table `EventRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_professionalId_eventId_key" ON "EventRegistration"("professionalId", "eventId");
