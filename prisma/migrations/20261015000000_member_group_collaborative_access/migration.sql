-- CreateEnum
CREATE TYPE "MemberGroupAccess" AS ENUM ('VIEWER', 'EDITOR');

-- AlterTable
ALTER TABLE "MemberGroup" ADD COLUMN "isCollaborative" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MemberGroupMembership" ADD COLUMN "access" "MemberGroupAccess" NOT NULL DEFAULT 'EDITOR';
