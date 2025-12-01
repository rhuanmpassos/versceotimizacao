-- AlterTable
ALTER TABLE "Referrer" ADD COLUMN "access_token" TEXT;

-- Gerar tokens para referrers existentes
UPDATE "Referrer" SET "access_token" = gen_random_uuid()::text || '-' || encode(gen_random_bytes(16), 'hex') WHERE "access_token" IS NULL;

-- Tornar o campo obrigatório e único
ALTER TABLE "Referrer" ALTER COLUMN "access_token" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Referrer_access_token_key" ON "Referrer"("access_token");
