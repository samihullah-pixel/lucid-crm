-- CreateEnum
CREATE TYPE "StepMediaType" AS ENUM ('NONE', 'PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" "ServiceType",
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureStep" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "section" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "mediaUrl" TEXT,
    "mediaType" "StepMediaType" NOT NULL DEFAULT 'NONE',
    "tip" TEXT,
    "warning" TEXT,
    "requiresCheck" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProcedureStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconKey" TEXT,
    "imageUrl" TEXT,
    "defaultLocation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureEquipment" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "locationNote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProcedureEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteProcedure" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "welcomeText" TEXT,
    "waterLocation" TEXT,
    "accessNote" TEXT,
    "emergencyNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureStep_procedureId_idx" ON "ProcedureStep"("procedureId");

-- CreateIndex
CREATE INDEX "ProcedureEquipment_procedureId_idx" ON "ProcedureEquipment"("procedureId");

-- CreateIndex
CREATE INDEX "ProcedureEquipment_equipmentId_idx" ON "ProcedureEquipment"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureEquipment_procedureId_equipmentId_key" ON "ProcedureEquipment"("procedureId", "equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteProcedure_qrToken_key" ON "SiteProcedure"("qrToken");

-- CreateIndex
CREATE INDEX "SiteProcedure_siteId_idx" ON "SiteProcedure"("siteId");

-- CreateIndex
CREATE INDEX "SiteProcedure_procedureId_idx" ON "SiteProcedure"("procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteProcedure_siteId_procedureId_key" ON "SiteProcedure"("siteId", "procedureId");

-- AddForeignKey
ALTER TABLE "ProcedureStep" ADD CONSTRAINT "ProcedureStep_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureEquipment" ADD CONSTRAINT "ProcedureEquipment_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureEquipment" ADD CONSTRAINT "ProcedureEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteProcedure" ADD CONSTRAINT "SiteProcedure_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteProcedure" ADD CONSTRAINT "SiteProcedure_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
