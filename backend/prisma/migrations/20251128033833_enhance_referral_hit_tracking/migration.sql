-- AlterTable
ALTER TABLE "ReferralHit" ADD COLUMN "referrer" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "utm_source" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "utm_medium" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "utm_campaign" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "device_type" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "os" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "browser" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "screen_width" INTEGER;
ALTER TABLE "ReferralHit" ADD COLUMN "screen_height" INTEGER;
ALTER TABLE "ReferralHit" ADD COLUMN "country" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "city" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "region" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "language" TEXT;
ALTER TABLE "ReferralHit" ADD COLUMN "timezone" TEXT;
