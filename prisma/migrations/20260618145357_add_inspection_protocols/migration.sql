-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('OFFEN', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN');

-- AlterTable
ALTER TABLE "InspectionTemplate" ADD COLUMN     "siteId" TEXT;

-- CreateTable
CREATE TABLE "InspectionProtocol" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "siteId" TEXT,
    "employeeId" TEXT,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'OFFEN',
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionCheck" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "itemLabel" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "note" TEXT,
    "checkedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InspectionCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InspectionProtocol_templateId_idx" ON "InspectionProtocol"("templateId");

-- CreateIndex
CREATE INDEX "InspectionProtocol_siteId_idx" ON "InspectionProtocol"("siteId");

-- CreateIndex
CREATE INDEX "InspectionProtocol_employeeId_idx" ON "InspectionProtocol"("employeeId");

-- CreateIndex
CREATE INDEX "InspectionProtocol_weekStart_idx" ON "InspectionProtocol"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionProtocol_templateId_weekStart_key" ON "InspectionProtocol"("templateId", "weekStart");

-- CreateIndex
CREATE INDEX "InspectionCheck_protocolId_idx" ON "InspectionCheck"("protocolId");

-- CreateIndex
CREATE INDEX "InspectionTemplate_siteId_idx" ON "InspectionTemplate"("siteId");

-- AddForeignKey
ALTER TABLE "InspectionTemplate" ADD CONSTRAINT "InspectionTemplate_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionProtocol" ADD CONSTRAINT "InspectionProtocol_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionProtocol" ADD CONSTRAINT "InspectionProtocol_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionProtocol" ADD CONSTRAINT "InspectionProtocol_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionCheck" ADD CONSTRAINT "InspectionCheck_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "InspectionProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
