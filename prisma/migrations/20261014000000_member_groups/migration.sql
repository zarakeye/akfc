-- CreateTable
CREATE TABLE "MemberGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemberGroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocumentGroup" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "MemberDocumentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberGroupMembership_groupId_userId_key" ON "MemberGroupMembership"("groupId", "userId");
CREATE INDEX "MemberGroupMembership_userId_idx" ON "MemberGroupMembership"("userId");
CREATE UNIQUE INDEX "MemberDocumentGroup_memberDocumentId_groupId_key" ON "MemberDocumentGroup"("memberDocumentId", "groupId");
CREATE INDEX "MemberDocumentGroup_groupId_idx" ON "MemberDocumentGroup"("groupId");

-- AddForeignKey
ALTER TABLE "MemberGroupMembership" ADD CONSTRAINT "MemberGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberGroupMembership" ADD CONSTRAINT "MemberGroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentGroup" ADD CONSTRAINT "MemberDocumentGroup_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentGroup" ADD CONSTRAINT "MemberDocumentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
