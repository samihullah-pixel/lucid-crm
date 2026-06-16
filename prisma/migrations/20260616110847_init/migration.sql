-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('PAUSCHAL', 'STUNDENSATZ');

-- CreateEnum
CREATE TYPE "IntervalType" AS ENUM ('EINMALIG', 'TAEGLICH', 'WOECHENTLICH', 'ZWEIWOECHENTLICH', 'MONATLICH', 'NACH_BEDARF');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('AKTIV', 'PAUSIERT');

-- CreateEnum
CREATE TYPE "CleaningJobStatus" AS ENUM ('GEPLANT', 'ERLEDIGT', 'VERSCHOBEN', 'STORNIERT');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('UNTERHALTSREINIGUNG', 'FENSTERREINIGUNG', 'TREPPENHAUSREINIGUNG', 'GRUNDREINIGUNG', 'SONDERREINIGUNG', 'BAUENDREINIGUNG', 'DESINFEKTION', 'SONSTIGES');

-- CreateEnum
CREATE TYPE "ExtraBillingType" AS ENUM ('STUNDENSATZ', 'PAUSCHAL');

-- CreateEnum
CREATE TYPE "MaterialProvider" AS ENUM ('DU', 'KUNDE', 'GEMISCHT', 'EXTERN');

-- CreateEnum
CREATE TYPE "MaterialBillingType" AS ENUM ('INKLUSIVE', 'PAUSCHALE', 'NACH_VERBRAUCH', 'SEPARAT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ENTWURF', 'ERSTELLT', 'VERSENDET', 'BEZAHLT', 'STORNIERT');

-- CreateEnum
CREATE TYPE "InvoiceItemType" AS ENUM ('REGELLEISTUNG', 'ZUSATZARBEIT', 'MATERIALPAUSCHALE', 'VERBRAUCHSMATERIAL', 'SERVICEPAUSCHALE', 'SONSTIGES');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "billingAddress" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "paymentTermsDays" INTEGER DEFAULT 14,
    "vatId" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT,
    "city" TEXT,
    "contactOnSite" TEXT,
    "phoneOnSite" TEXT,
    "accessType" TEXT,
    "accessDetails" TEXT,
    "keyNumber" TEXT,
    "hasAlarmSystem" BOOLEAN NOT NULL DEFAULT false,
    "alarmNote" TEXT,
    "accessTimes" TEXT,
    "parkingInfo" TEXT,
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "floor" TEXT,
    "specialAreas" TEXT,
    "safetyInstructions" TEXT,
    "roomList" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceContract" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "billingType" "BillingType" NOT NULL,
    "flatRatePrice" DECIMAL(10,2),
    "hourlyRate" DECIMAL(10,2),
    "serviceDescription" TEXT,
    "intervalType" "IntervalType" NOT NULL,
    "weekdays" TEXT,
    "standardHours" DECIMAL(5,2),
    "contractStart" TIMESTAMP(3) NOT NULL,
    "contractEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "serviceContractId" TEXT,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "intervalType" "IntervalType" NOT NULL,
    "weekday" INTEGER,
    "startTime" TEXT,
    "endTime" TEXT,
    "standardHours" DECIMAL(5,2),
    "status" "AppointmentStatus" NOT NULL DEFAULT 'AKTIV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningJob" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "workedHours" DECIMAL(5,2),
    "serviceType" "ServiceType" NOT NULL,
    "note" TEXT,
    "status" "CleaningJobStatus" NOT NULL DEFAULT 'GEPLANT',
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "alreadyInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleaningJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraWork" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "cleaningJobId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "billingType" "ExtraBillingType" NOT NULL,
    "hours" DECIMAL(5,2),
    "hourlyRate" DECIMAL(10,2),
    "flatRatePrice" DECIMAL(10,2),
    "customerApproved" BOOLEAN NOT NULL DEFAULT false,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "alreadyInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialAgreement" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "materialProvider" "MaterialProvider" NOT NULL,
    "cleaningSuppliesProvider" "MaterialProvider" NOT NULL,
    "consumablesProvider" "MaterialProvider" NOT NULL,
    "clothServiceProvider" "MaterialProvider" NOT NULL,
    "mopServiceProvider" "MaterialProvider" NOT NULL,
    "materialBillingType" "MaterialBillingType" NOT NULL,
    "cleaningMaterialFlatRate" DECIMAL(10,2),
    "serviceFlatRate" DECIMAL(10,2),
    "materialNotes" TEXT,
    "storageLocation" TEXT,
    "minimumStockNote" TEXT,
    "orderInterval" "IntervalType",
    "lastOrderDate" TIMESTAMP(3),
    "nextOrderDate" TIMESTAMP(3),
    "clothWashInterval" "IntervalType",
    "mopWashInterval" "IntervalType",
    "clothReplacementInterval" "IntervalType",
    "mopReplacementInterval" "IntervalType",
    "lastMaintenanceDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialItem" (
    "id" TEXT NOT NULL,
    "materialAgreementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT,
    "standardQuantity" DECIMAL(10,2),
    "minimumStock" DECIMAL(10,2),
    "reorderQuantity" DECIMAL(10,2),
    "supplier" TEXT,
    "unitPrice" DECIMAL(10,2),
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "includedInFlatRate" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "servicePeriodFrom" TIMESTAMP(3) NOT NULL,
    "servicePeriodTo" TIMESTAMP(3) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ENTWURF',
    "qontoExported" BOOLEAN NOT NULL DEFAULT false,
    "pdfPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "InvoiceItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" TEXT,
    "unitPrice" DECIMAL(10,2),
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- CreateIndex
CREATE INDEX "Property_customerId_idx" ON "Property"("customerId");

-- CreateIndex
CREATE INDEX "ServiceContract_customerId_idx" ON "ServiceContract"("customerId");

-- CreateIndex
CREATE INDEX "ServiceContract_propertyId_idx" ON "ServiceContract"("propertyId");

-- CreateIndex
CREATE INDEX "Appointment_propertyId_idx" ON "Appointment"("propertyId");

-- CreateIndex
CREATE INDEX "Appointment_serviceContractId_idx" ON "Appointment"("serviceContractId");

-- CreateIndex
CREATE INDEX "CleaningJob_customerId_idx" ON "CleaningJob"("customerId");

-- CreateIndex
CREATE INDEX "CleaningJob_propertyId_idx" ON "CleaningJob"("propertyId");

-- CreateIndex
CREATE INDEX "CleaningJob_appointmentId_idx" ON "CleaningJob"("appointmentId");

-- CreateIndex
CREATE INDEX "CleaningJob_date_idx" ON "CleaningJob"("date");

-- CreateIndex
CREATE INDEX "ExtraWork_customerId_idx" ON "ExtraWork"("customerId");

-- CreateIndex
CREATE INDEX "ExtraWork_propertyId_idx" ON "ExtraWork"("propertyId");

-- CreateIndex
CREATE INDEX "ExtraWork_cleaningJobId_idx" ON "ExtraWork"("cleaningJobId");

-- CreateIndex
CREATE INDEX "ExtraWork_invoiceId_idx" ON "ExtraWork"("invoiceId");

-- CreateIndex
CREATE INDEX "ExtraWork_date_idx" ON "ExtraWork"("date");

-- CreateIndex
CREATE INDEX "MaterialAgreement_customerId_idx" ON "MaterialAgreement"("customerId");

-- CreateIndex
CREATE INDEX "MaterialAgreement_propertyId_idx" ON "MaterialAgreement"("propertyId");

-- CreateIndex
CREATE INDEX "MaterialItem_materialAgreementId_idx" ON "MaterialItem"("materialAgreementId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_propertyId_idx" ON "Invoice"("propertyId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceContract" ADD CONSTRAINT "ServiceContract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceContract" ADD CONSTRAINT "ServiceContract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceContractId_fkey" FOREIGN KEY ("serviceContractId") REFERENCES "ServiceContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningJob" ADD CONSTRAINT "CleaningJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningJob" ADD CONSTRAINT "CleaningJob_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningJob" ADD CONSTRAINT "CleaningJob_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraWork" ADD CONSTRAINT "ExtraWork_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraWork" ADD CONSTRAINT "ExtraWork_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraWork" ADD CONSTRAINT "ExtraWork_cleaningJobId_fkey" FOREIGN KEY ("cleaningJobId") REFERENCES "CleaningJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraWork" ADD CONSTRAINT "ExtraWork_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAgreement" ADD CONSTRAINT "MaterialAgreement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAgreement" ADD CONSTRAINT "MaterialAgreement_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialItem" ADD CONSTRAINT "MaterialItem_materialAgreementId_fkey" FOREIGN KEY ("materialAgreementId") REFERENCES "MaterialAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
