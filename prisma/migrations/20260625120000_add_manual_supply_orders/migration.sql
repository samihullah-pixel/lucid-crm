-- CreateEnum
CREATE TYPE "SupplyOrderSource" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable: Lieferant – eigene Kundennummer + Standard-CC
ALTER TABLE "Supplier" ADD COLUMN     "customerNumber" TEXT,
ADD COLUMN     "defaultCc" TEXT;

-- AlterTable: Bestellung – Quelle, Lieferobjekt, Mitarbeiter, CC, Notiz
ALTER TABLE "SupplyOrder" ADD COLUMN     "source" "SupplyOrderSource" NOT NULL DEFAULT 'AUTO',
ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "ccEmail" TEXT,
ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE INDEX "SupplyOrder_propertyId_idx" ON "SupplyOrder"("propertyId");

-- CreateIndex
CREATE INDEX "SupplyOrder_employeeId_idx" ON "SupplyOrder"("employeeId");

-- AddForeignKey
ALTER TABLE "SupplyOrder" ADD CONSTRAINT "SupplyOrder_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyOrder" ADD CONSTRAINT "SupplyOrder_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
