-- CreateTable
CREATE TABLE "master_user_devices" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fcmToken" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_user_devices_fcmToken_key" ON "master_user_devices"("fcmToken");

-- CreateIndex
CREATE INDEX "master_user_devices_userId_idx" ON "master_user_devices"("userId");

-- CreateIndex
CREATE INDEX "master_user_devices_fcmToken_idx" ON "master_user_devices"("fcmToken");

-- AddForeignKey
ALTER TABLE "master_user_devices" ADD CONSTRAINT "master_user_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "master_users"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;
