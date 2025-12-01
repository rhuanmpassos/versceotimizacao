-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "tracking_id" TEXT;

-- CreateIndex
CREATE INDEX "Lead_tracking_id_idx" ON "Lead"("tracking_id");

