-- CreateEnum
CREATE TYPE "SubcontractStatus" AS ENUM ('ANGEFRAGT', 'TERMIN_VORGESCHLAGEN', 'BESTAETIGT', 'ABGELEHNT', 'STORNIERT');

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "serviceArea" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcontractRequest" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "partnerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "proposedDate" TIMESTAMP(3),
    "status" "SubcontractStatus" NOT NULL DEFAULT 'ANGEFRAGT',
    "confirmToken" TEXT NOT NULL,
    "partnerPrice" DECIMAL(10,2) NOT NULL,
    "partnerNote" TEXT,
    "customerPrice" DECIMAL(10,2),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "customerNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubcontractRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubcontractRequest_confirmToken_key" ON "SubcontractRequest"("confirmToken");

-- CreateIndex
CREATE INDEX "SubcontractRequest_partnerId_idx" ON "SubcontractRequest"("partnerId");

-- CreateIndex
CREATE INDEX "SubcontractRequest_propertyId_idx" ON "SubcontractRequest"("propertyId");

-- CreateIndex
CREATE INDEX "SubcontractRequest_appointmentId_idx" ON "SubcontractRequest"("appointmentId");

-- CreateIndex
CREATE INDEX "SubcontractRequest_status_idx" ON "SubcontractRequest"("status");

-- AddForeignKey
ALTER TABLE "SubcontractRequest" ADD CONSTRAINT "SubcontractRequest_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcontractRequest" ADD CONSTRAINT "SubcontractRequest_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcontractRequest" ADD CONSTRAINT "SubcontractRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
