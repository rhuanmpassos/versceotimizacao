-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NA_BASE', 'EM_CONTATO', 'COMPRADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "ReferrerType" AS ENUM ('NORMAL', 'INFLUENCER');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "stage" "LeadStage" NOT NULL DEFAULT 'NA_BASE';

-- AlterTable
ALTER TABLE "Referrer" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Referrer" ADD COLUMN "created_by" TEXT;
ALTER TABLE "Referrer" ADD COLUMN "tipo" "ReferrerType" NOT NULL DEFAULT 'NORMAL';

