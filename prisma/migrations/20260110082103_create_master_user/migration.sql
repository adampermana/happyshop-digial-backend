-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "master_users" (
    "idUser" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "imageProfile" TEXT,

    CONSTRAINT "master_users_pkey" PRIMARY KEY ("idUser")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_users_email_key" ON "master_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "master_users_username_key" ON "master_users"("username");

-- CreateIndex
CREATE INDEX "master_users_email_idx" ON "master_users"("email");

-- CreateIndex
CREATE INDEX "master_users_username_idx" ON "master_users"("username");
