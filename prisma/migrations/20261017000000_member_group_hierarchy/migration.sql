-- AlterTable
ALTER TABLE "MemberGroup" ADD COLUMN "parentGroupId" TEXT;

-- CreateIndex
CREATE INDEX "MemberGroup_parentGroupId_idx" ON "MemberGroup"("parentGroupId");

-- AddForeignKey
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "MemberGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
