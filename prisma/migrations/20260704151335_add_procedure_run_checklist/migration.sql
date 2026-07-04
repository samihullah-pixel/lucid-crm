-- CreateEnum
CREATE TYPE "ProcedureRunStatus" AS ENUM ('OFFEN', 'ABGESCHLOSSEN');

-- CreateTable
CREATE TABLE "ProcedureRun" (
    "id" TEXT NOT NULL,
    "siteProcedureId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "ProcedureRunStatus" NOT NULL DEFAULT 'OFFEN',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureRunCheck" (
    "id" TEXT NOT NULL,
    "procedureRunId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "ProcedureRunCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureRun_siteProcedureId_idx" ON "ProcedureRun"("siteProcedureId");

-- CreateIndex
CREATE INDEX "ProcedureRun_date_idx" ON "ProcedureRun"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureRun_siteProcedureId_date_key" ON "ProcedureRun"("siteProcedureId", "date");

-- CreateIndex
CREATE INDEX "ProcedureRunCheck_procedureRunId_idx" ON "ProcedureRunCheck"("procedureRunId");

-- CreateIndex
CREATE INDEX "ProcedureRunCheck_stepId_idx" ON "ProcedureRunCheck"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureRunCheck_procedureRunId_stepId_key" ON "ProcedureRunCheck"("procedureRunId", "stepId");

-- AddForeignKey
ALTER TABLE "ProcedureRun" ADD CONSTRAINT "ProcedureRun_siteProcedureId_fkey" FOREIGN KEY ("siteProcedureId") REFERENCES "SiteProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRunCheck" ADD CONSTRAINT "ProcedureRunCheck_procedureRunId_fkey" FOREIGN KEY ("procedureRunId") REFERENCES "ProcedureRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRunCheck" ADD CONSTRAINT "ProcedureRunCheck_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcedureStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
