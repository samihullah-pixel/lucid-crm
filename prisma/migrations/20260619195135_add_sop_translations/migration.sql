-- AlterTable
ALTER TABLE "EquipmentItem" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "ProcedureStep" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "SiteProcedure" ADD COLUMN     "translations" JSONB;
