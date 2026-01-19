-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_moderation_logs" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_moderation_logs_user_id_idx" ON "user_moderation_logs"("user_id");

-- CreateIndex
CREATE INDEX "user_moderation_logs_is_active_idx" ON "user_moderation_logs"("is_active");

-- CreateIndex
CREATE INDEX "user_moderation_logs_action_type_idx" ON "user_moderation_logs"("action_type");

-- AddForeignKey
ALTER TABLE "user_moderation_logs" ADD CONSTRAINT "user_moderation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_moderation_logs" ADD CONSTRAINT "user_moderation_logs_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
