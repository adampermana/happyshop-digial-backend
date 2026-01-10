-- AlterTable
ALTER TABLE "device_registry" ADD COLUMN     "isCaptchaRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPermanentlyBlocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "otp_attempts" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedLoginResetAt" TIMESTAMP(3),
ADD COLUMN     "lastFailedLoginAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "otp_attempts_userId_idx" ON "otp_attempts"("userId");
