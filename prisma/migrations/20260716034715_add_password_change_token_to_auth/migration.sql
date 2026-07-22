-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "isPasswordChangeTokenValid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordChangeToken" TEXT;
