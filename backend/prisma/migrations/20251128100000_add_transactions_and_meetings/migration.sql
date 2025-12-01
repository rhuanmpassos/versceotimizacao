-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'pix');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM (
  'requires_payment_method',
  'requires_confirmation',
  'processing',
  'requires_action',
  'requires_capture',
  'canceled',
  'succeeded'
);

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM (
  'scheduled',
  'completed',
  'no_show',
  'cancelled'
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "affiliate_id" TEXT,
    "amount_product" INTEGER NOT NULL DEFAULT 20000,
    "amount_affiliate" INTEGER NOT NULL DEFAULT 6000,
    "payment_method" "PaymentMethod",
    "stripe_payment_intent" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'requires_payment_method',
    "scheduled_date" DATE,
    "scheduled_time" TIME,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "affiliate_id" TEXT,
    "meeting_date" DATE NOT NULL,
    "meeting_time" TIME NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_transaction_id_key" ON "Meeting"("transaction_id");

-- CreateIndex
CREATE INDEX "Transaction_lead_id_idx" ON "Transaction"("lead_id");

-- CreateIndex
CREATE INDEX "Transaction_affiliate_id_idx" ON "Transaction"("affiliate_id");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_stripe_payment_intent_idx" ON "Transaction"("stripe_payment_intent");

-- CreateIndex
CREATE INDEX "Meeting_lead_id_idx" ON "Meeting"("lead_id");

-- CreateIndex
CREATE INDEX "Meeting_affiliate_id_idx" ON "Meeting"("affiliate_id");

-- CreateIndex
CREATE INDEX "Meeting_meeting_date_idx" ON "Meeting"("meeting_date");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "Referrer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "Referrer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

