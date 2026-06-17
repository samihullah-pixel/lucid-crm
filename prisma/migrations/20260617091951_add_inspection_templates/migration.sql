-- CreateTable
CREATE TABLE "InspectionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionArea" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InspectionArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "interval" TEXT NOT NULL DEFAULT 'TAEGLICH',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InspectionTemplate_propertyId_idx" ON "InspectionTemplate"("propertyId");

-- CreateIndex
CREATE INDEX "InspectionArea_templateId_idx" ON "InspectionArea"("templateId");

-- CreateIndex
CREATE INDEX "InspectionItem_areaId_idx" ON "InspectionItem"("areaId");

-- AddForeignKey
ALTER TABLE "InspectionTemplate" ADD CONSTRAINT "InspectionTemplate_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionArea" ADD CONSTRAINT "InspectionArea_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItem" ADD CONSTRAINT "InspectionItem_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "InspectionArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
