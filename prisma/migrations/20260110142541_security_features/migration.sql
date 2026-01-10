/*
  Warnings:

  - You are about to drop the column `blockedUntil` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `isCaptchaRequired` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `isPermanentlyBlocked` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `lastAttemptAt` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `registerCount` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `uuidDevice` on the `device_registry` table. All the data in the column will be lost.
  - You are about to drop the column `attemptedAt` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `failureReason` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `isSuccessful` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `usernameOrEmail` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `uuidDevice` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `attemptCount` on the `otp_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `blockedUntil` on the `otp_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `otp_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `otp_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `lastAttemptAt` on the `otp_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `otp_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `otpCode` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_devices` table. All the data in the column will be lost.
  - You are about to drop the column `fcmToken` on the `user_devices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_devices` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_devices` table. All the data in the column will be lost.
  - You are about to drop the column `uuidDevice` on the `user_devices` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `failedLoginResetAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `idUser` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `imageProfile` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isCaptcha` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isLoginFailed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isSuspended` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastFailedLoginAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid_device]` on the table `device_registry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fcm_token]` on the table `user_devices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid_device]` on the table `user_devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uuid_device` to the `device_registry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username_or_email` to the `login_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp_code` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fcm_token` to the `user_devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid_device` to the `user_devices` table without a default value. This is not possible if the table is not empty.
  - The required column `id_user` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "login_attempts" DROP CONSTRAINT "login_attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_devices" DROP CONSTRAINT "user_devices_userId_fkey";

-- DropIndex
DROP INDEX "device_registry_lastAttemptAt_idx";

-- DropIndex
DROP INDEX "device_registry_uuidDevice_idx";

-- DropIndex
DROP INDEX "device_registry_uuidDevice_key";

-- DropIndex
DROP INDEX "login_attempts_attemptedAt_idx";

-- DropIndex
DROP INDEX "login_attempts_userId_idx";

-- DropIndex
DROP INDEX "login_attempts_usernameOrEmail_idx";

-- DropIndex
DROP INDEX "login_attempts_uuidDevice_idx";

-- DropIndex
DROP INDEX "otp_attempts_lastAttemptAt_idx";

-- DropIndex
DROP INDEX "otp_attempts_userId_idx";

-- DropIndex
DROP INDEX "otps_otpCode_idx";

-- DropIndex
DROP INDEX "otps_userId_idx";

-- DropIndex
DROP INDEX "user_devices_fcmToken_idx";

-- DropIndex
DROP INDEX "user_devices_fcmToken_key";

-- DropIndex
DROP INDEX "user_devices_userId_idx";

-- DropIndex
DROP INDEX "user_devices_uuidDevice_idx";

-- DropIndex
DROP INDEX "user_devices_uuidDevice_key";

-- AlterTable
ALTER TABLE "device_registry" DROP COLUMN "blockedUntil",
DROP COLUMN "createdAt",
DROP COLUMN "isCaptchaRequired",
DROP COLUMN "isPermanentlyBlocked",
DROP COLUMN "lastAttemptAt",
DROP COLUMN "registerCount",
DROP COLUMN "uuidDevice",
ADD COLUMN     "blocked_until" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_captcha_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_permanently_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "register_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uuid_device" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "login_attempts" DROP COLUMN "attemptedAt",
DROP COLUMN "failureReason",
DROP COLUMN "ipAddress",
DROP COLUMN "isSuccessful",
DROP COLUMN "userId",
DROP COLUMN "usernameOrEmail",
DROP COLUMN "uuidDevice",
ADD COLUMN     "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "is_successful" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "username_or_email" TEXT NOT NULL,
ADD COLUMN     "uuid_device" TEXT;

-- AlterTable
ALTER TABLE "otp_attempts" DROP COLUMN "attemptCount",
DROP COLUMN "blockedUntil",
DROP COLUMN "createdAt",
DROP COLUMN "isBlocked",
DROP COLUMN "lastAttemptAt",
DROP COLUMN "userId",
ADD COLUMN     "attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "blocked_until" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "expiresAt",
DROP COLUMN "isUsed",
DROP COLUMN "otpCode",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_code" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_devices" DROP COLUMN "createdAt",
DROP COLUMN "fcmToken",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
DROP COLUMN "uuidDevice",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fcm_token" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "uuid_device" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "failedLoginResetAt",
DROP COLUMN "idUser",
DROP COLUMN "imageProfile",
DROP COLUMN "isActive",
DROP COLUMN "isCaptcha",
DROP COLUMN "isEmailVerified",
DROP COLUMN "isLoginFailed",
DROP COLUMN "isSuspended",
DROP COLUMN "lastFailedLoginAt",
DROP COLUMN "postalCode",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "failed_login_reset_at" TIMESTAMP(3),
ADD COLUMN     "id_user" TEXT NOT NULL,
ADD COLUMN     "image_profile" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_captcha" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_login_failed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_failed_login_at" TIMESTAMP(3),
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "device_registry_uuid_device_key" ON "device_registry"("uuid_device");

-- CreateIndex
CREATE INDEX "device_registry_uuid_device_idx" ON "device_registry"("uuid_device");

-- CreateIndex
CREATE INDEX "device_registry_last_attempt_at_idx" ON "device_registry"("last_attempt_at");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_idx" ON "login_attempts"("user_id");

-- CreateIndex
CREATE INDEX "login_attempts_username_or_email_idx" ON "login_attempts"("username_or_email");

-- CreateIndex
CREATE INDEX "login_attempts_uuid_device_idx" ON "login_attempts"("uuid_device");

-- CreateIndex
CREATE INDEX "login_attempts_attempted_at_idx" ON "login_attempts"("attempted_at");

-- CreateIndex
CREATE INDEX "otp_attempts_user_id_idx" ON "otp_attempts"("user_id");

-- CreateIndex
CREATE INDEX "otp_attempts_last_attempt_at_idx" ON "otp_attempts"("last_attempt_at");

-- CreateIndex
CREATE INDEX "otps_user_id_idx" ON "otps"("user_id");

-- CreateIndex
CREATE INDEX "otps_otp_code_idx" ON "otps"("otp_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_fcm_token_key" ON "user_devices"("fcm_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_uuid_device_key" ON "user_devices"("uuid_device");

-- CreateIndex
CREATE INDEX "user_devices_user_id_idx" ON "user_devices"("user_id");

-- CreateIndex
CREATE INDEX "user_devices_fcm_token_idx" ON "user_devices"("fcm_token");

-- CreateIndex
CREATE INDEX "user_devices_uuid_device_idx" ON "user_devices"("uuid_device");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
