-- AlterTable
ALTER TABLE "master_users" ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Indonesia',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "province" TEXT;

-- CreateIndex
CREATE INDEX "master_users_phone_idx" ON "master_users"("phone");
