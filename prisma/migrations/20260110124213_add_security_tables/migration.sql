/*
  Warnings:

  - You are about to drop the `master_user_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `master_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "master_user_devices" DROP CONSTRAINT "master_user_devices_userId_fkey";

-- DropTable
DROP TABLE "master_user_devices";

-- DropTable
DROP TABLE "master_users";

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "otpCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "idUser" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isLoginFailed" BOOLEAN NOT NULL DEFAULT false,
    "isCaptcha" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "imageProfile" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Indonesia',

    CONSTRAINT "users_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fcmToken" TEXT NOT NULL,
    "uuidDevice" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_registry" (
    "id" TEXT NOT NULL,
    "uuidDevice" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "registerCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "usernameOrEmail" TEXT NOT NULL,
    "ipAddress" TEXT,
    "uuidDevice" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_userId_idx" ON "otps"("userId");

-- CreateIndex
CREATE INDEX "otps_email_idx" ON "otps"("email");

-- CreateIndex
CREATE INDEX "otps_otpCode_idx" ON "otps"("otpCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_fcmToken_key" ON "user_devices"("fcmToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_uuidDevice_key" ON "user_devices"("uuidDevice");

-- CreateIndex
CREATE INDEX "user_devices_userId_idx" ON "user_devices"("userId");

-- CreateIndex
CREATE INDEX "user_devices_fcmToken_idx" ON "user_devices"("fcmToken");

-- CreateIndex
CREATE INDEX "user_devices_uuidDevice_idx" ON "user_devices"("uuidDevice");

-- CreateIndex
CREATE UNIQUE INDEX "device_registry_uuidDevice_key" ON "device_registry"("uuidDevice");

-- CreateIndex
CREATE INDEX "device_registry_uuidDevice_idx" ON "device_registry"("uuidDevice");

-- CreateIndex
CREATE INDEX "device_registry_lastAttemptAt_idx" ON "device_registry"("lastAttemptAt");

-- CreateIndex
CREATE INDEX "login_attempts_userId_idx" ON "login_attempts"("userId");

-- CreateIndex
CREATE INDEX "login_attempts_usernameOrEmail_idx" ON "login_attempts"("usernameOrEmail");

-- CreateIndex
CREATE INDEX "login_attempts_uuidDevice_idx" ON "login_attempts"("uuidDevice");

-- CreateIndex
CREATE INDEX "login_attempts_attemptedAt_idx" ON "login_attempts"("attemptedAt");

-- CreateIndex
CREATE INDEX "otp_attempts_email_idx" ON "otp_attempts"("email");

-- CreateIndex
CREATE INDEX "otp_attempts_phone_idx" ON "otp_attempts"("phone");

-- CreateIndex
CREATE INDEX "otp_attempts_lastAttemptAt_idx" ON "otp_attempts"("lastAttemptAt");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;
