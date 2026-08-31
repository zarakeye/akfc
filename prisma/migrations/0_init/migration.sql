-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_ROLE_CHANGED');

-- CreateEnum
CREATE TYPE "DisciplineType" AS ENUM ('MARTIAL_ART', 'CALLIGRAPHY');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('KIDS', 'TEENAGERS', 'ADULTS', 'ALL_AGES');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "CloudinaryFolderStatus" AS ENUM ('pending', 'published', 'bin');

-- CreateEnum
CREATE TYPE "TrashEntryKind" AS ENUM ('folder', 'file');

-- CreateEnum
CREATE TYPE "TrashEntryStatus" AS ENUM ('IN_BIN', 'RESTORED', 'DELETED');

-- CreateEnum
CREATE TYPE "ReactionTarget" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "PageReferencerKind" AS ENUM ('COURSE', 'STAGE_DESCRIPTION', 'STAGE_PROGRAM', 'POST', 'DISCIPLINE', 'EVENT', 'SITE_PAGE', 'STAGE_SUMMARY', 'EVENT_SUMMARY');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'MEMBERS');

-- CreateEnum
CREATE TYPE "DocumentAudience" AS ENUM ('ALL_MEMBERS', 'SPECIFIC');

-- CreateEnum
CREATE TYPE "MemberGroupAccess" AS ENUM ('VIEWER', 'EDITOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "image" TEXT,
    "memberSince" TIMESTAMP(3),
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aboutMe" TEXT,
    "pseudo" TEXT,
    "avatar" TEXT,
    "instructorBio" JSONB,
    "instructorOrder" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "id" SERIAL NOT NULL,
    "displayEmail" BOOLEAN NOT NULL DEFAULT false,
    "displayPhone" BOOLEAN NOT NULL DEFAULT false,
    "darkMode" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "action" "AuditAction" NOT NULL,
    "targetUserId" TEXT,
    "meta" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Origin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT,
    "region" TEXT,
    "flag" TEXT,
    "historicalPeriod" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Origin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineFamily" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplineFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DisciplineType" NOT NULL,
    "slug" TEXT,
    "publicationDate" TIMESTAMP(3),
    "familyId" INTEGER,
    "school" TEXT,
    "classification" TEXT,
    "originId" INTEGER,
    "description" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "summaryMediaId" TEXT,
    "categoryId" INTEGER NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "disciplineId" INTEGER NOT NULL,
    "audience" "Audience" NOT NULL,
    "day" "Day" NOT NULL,
    "beginTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "instructorId" TEXT,
    "requisites" TEXT[],
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" SERIAL NOT NULL,
    "disciplineId" INTEGER,
    "externalDisciplineLabel" TEXT,
    "originId" INTEGER,
    "label" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "description" JSONB NOT NULL,
    "program" JSONB NOT NULL,
    "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "summaryMediaId" TEXT,
    "preRegistered" TEXT[],
    "primaryAnimatorId" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageSession" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "beginTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "summaryMediaId" TEXT,
    "audience" "Audience" NOT NULL,
    "externalDisciplineLabels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "originId" INTEGER,
    "organizerId" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSession" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "beginTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "publicId" TEXT,
    "secureUrl" TEXT,
    "resourceType" TEXT,
    "fullPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "format" TEXT,
    "originalFileName" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "appRoot" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "categoryId" INTEGER,
    "disciplineId" INTEGER,
    "proposedDisciplineName" TEXT,
    "eventDate" TIMESTAMP(3),
    "eventId" INTEGER,
    "uploaderUserId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cloudinaryAssetId" TEXT,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudinaryFolder" (
    "id" TEXT NOT NULL,
    "appRoot" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "status" "CloudinaryFolderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudinaryFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrashEntry" (
    "id" TEXT NOT NULL,
    "appRoot" TEXT NOT NULL,
    "kind" "TrashEntryKind" NOT NULL,
    "status" "TrashEntryStatus" NOT NULL DEFAULT 'IN_BIN',
    "displayName" TEXT NOT NULL,
    "previousPath" TEXT NOT NULL,
    "storageRoot" TEXT NOT NULL,
    "trashedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" TIMESTAMP(3),
    "restoredToPath" TEXT,
    "deletedAt" TIMESTAMP(3),
    "sizeBytes" BIGINT,
    "cloudinaryCreatedAt" TIMESTAMP(3),
    "mediaKind" TEXT,

    CONSTRAINT "TrashEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "ReactionTarget" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "multiple" BOOLEAN NOT NULL DEFAULT false,
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" SERIAL NOT NULL,
    "pollId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" SERIAL NOT NULL,
    "optionId" INTEGER NOT NULL,
    "pollId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageMediaReference" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "pageType" "PageReferencerKind" NOT NULL,
    "pageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageMediaReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3),
    "disciplineId" INTEGER,
    "stageId" INTEGER,
    "eventId" INTEGER,
    "categoryId" INTEGER,
    "originId" INTEGER,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" SERIAL NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakingNews" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "publicationDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakingNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDiscipline" (
    "eventId" INTEGER NOT NULL,
    "disciplineId" INTEGER NOT NULL,

    CONSTRAINT "EventDiscipline_pkey" PRIMARY KEY ("eventId","disciplineId")
);

-- CreateTable
CREATE TABLE "SitePage" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "SiteStyle" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "variables" JSONB NOT NULL,
    "summaryMaxChars" INTEGER NOT NULL DEFAULT 600,
    "cardCollapsedHeight" INTEGER NOT NULL DEFAULT 220,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocument" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "title" TEXT,
    "audience" "DocumentAudience" NOT NULL DEFAULT 'ALL_MEMBERS',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" TEXT,

    CONSTRAINT "MemberDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocumentRecipient" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemberDocumentRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentReceipt" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "DocumentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCollaborative" BOOLEAN NOT NULL DEFAULT false,
    "isAdminGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentGroupId" TEXT,

    CONSTRAINT "MemberGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "access" "MemberGroupAccess" NOT NULL DEFAULT 'EDITOR',

    CONSTRAINT "MemberGroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocumentGroup" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "MemberDocumentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVisibility" (
    "key" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageVisibility_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "HomeHero" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "shortTitle" TEXT NOT NULL DEFAULT 'AKFC',
    "longTitle" TEXT NOT NULL DEFAULT 'Association de Kung Fu de Chambéry',
    "tagline" TEXT,
    "supportEmail" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'fr',
    "logoAssetId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderLabel" (
    "path" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FolderLabel_pkey" PRIMARY KEY ("path")
);

-- CreateTable
CREATE TABLE "_StageAnimators" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StageAnimators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_userId_key" ON "Preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "PasswordResetToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_targetUserId_idx" ON "AuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Origin_name_key" ON "Origin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Origin_slug_key" ON "Origin"("slug");

-- CreateIndex
CREATE INDEX "Origin_sortOrder_idx" ON "Origin"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_type_key" ON "Category"("type");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineFamily_name_key" ON "DisciplineFamily"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineFamily_slug_key" ON "DisciplineFamily"("slug");

-- CreateIndex
CREATE INDEX "DisciplineFamily_sortOrder_idx" ON "DisciplineFamily"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_slug_key" ON "Discipline"("slug");

-- CreateIndex
CREATE INDEX "Discipline_categoryId_idx" ON "Discipline"("categoryId");

-- CreateIndex
CREATE INDEX "Discipline_instructorId_idx" ON "Discipline"("instructorId");

-- CreateIndex
CREATE INDEX "Discipline_originId_idx" ON "Discipline"("originId");

-- CreateIndex
CREATE INDEX "Discipline_type_idx" ON "Discipline"("type");

-- CreateIndex
CREATE INDEX "Discipline_familyId_idx" ON "Discipline"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_categoryId_name_key" ON "Discipline"("categoryId", "name");

-- CreateIndex
CREATE INDEX "Course_disciplineId_idx" ON "Course"("disciplineId");

-- CreateIndex
CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_disciplineId_day_beginTime_audience_key" ON "Course"("disciplineId", "day", "beginTime", "audience");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_slug_key" ON "Stage"("slug");

-- CreateIndex
CREATE INDEX "Stage_disciplineId_idx" ON "Stage"("disciplineId");

-- CreateIndex
CREATE INDEX "Stage_originId_idx" ON "Stage"("originId");

-- CreateIndex
CREATE INDEX "Stage_primaryAnimatorId_idx" ON "Stage"("primaryAnimatorId");

-- CreateIndex
CREATE INDEX "Stage_publicationDate_idx" ON "Stage"("publicationDate");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_disciplineId_label_key" ON "Stage"("disciplineId", "label");

-- CreateIndex
CREATE INDEX "StageSession_stageId_idx" ON "StageSession"("stageId");

-- CreateIndex
CREATE INDEX "StageSession_date_idx" ON "StageSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StageSession_stageId_date_beginTime_key" ON "StageSession"("stageId", "date", "beginTime");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_originId_idx" ON "Event"("originId");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_publicationDate_idx" ON "Event"("publicationDate");

-- CreateIndex
CREATE INDEX "EventSession_eventId_idx" ON "EventSession"("eventId");

-- CreateIndex
CREATE INDEX "EventSession_date_idx" ON "EventSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EventSession_eventId_date_beginTime_key" ON "EventSession"("eventId", "date", "beginTime");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_fullPath_key" ON "MediaAsset"("fullPath");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_cloudinaryAssetId_key" ON "MediaAsset"("cloudinaryAssetId");

-- CreateIndex
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");

-- CreateIndex
CREATE INDEX "MediaAsset_categoryId_idx" ON "MediaAsset"("categoryId");

-- CreateIndex
CREATE INDEX "MediaAsset_disciplineId_idx" ON "MediaAsset"("disciplineId");

-- CreateIndex
CREATE INDEX "MediaAsset_eventId_idx" ON "MediaAsset"("eventId");

-- CreateIndex
CREATE INDEX "MediaAsset_uploaderUserId_idx" ON "MediaAsset"("uploaderUserId");

-- CreateIndex
CREATE INDEX "MediaAsset_uploadedAt_idx" ON "MediaAsset"("uploadedAt");

-- CreateIndex
CREATE INDEX "MediaAsset_appRoot_fullPath_idx" ON "MediaAsset"("appRoot", "fullPath");

-- CreateIndex
CREATE INDEX "CloudinaryFolder_appRoot_idx" ON "CloudinaryFolder"("appRoot");

-- CreateIndex
CREATE INDEX "CloudinaryFolder_appRoot_status_idx" ON "CloudinaryFolder"("appRoot", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CloudinaryFolder_appRoot_fullPath_key" ON "CloudinaryFolder"("appRoot", "fullPath");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_idx" ON "TrashEntry"("appRoot");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_status_trashedAt_idx" ON "TrashEntry"("appRoot", "status", "trashedAt");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_previousPath_idx" ON "TrashEntry"("appRoot", "previousPath");

-- CreateIndex
CREATE INDEX "TrashEntry_appRoot_kind_idx" ON "TrashEntry"("appRoot", "kind");

-- CreateIndex
CREATE INDEX "Post_publicationDate_idx" ON "Post"("publicationDate");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Reaction_targetType_targetId_idx" ON "Reaction"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_targetType_targetId_emoji_key" ON "Reaction"("userId", "targetType", "targetId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_postId_key" ON "Poll"("postId");

-- CreateIndex
CREATE INDEX "PollOption_pollId_idx" ON "PollOption"("pollId");

-- CreateIndex
CREATE INDEX "PollVote_pollId_userId_idx" ON "PollVote"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_optionId_userId_key" ON "PollVote"("optionId", "userId");

-- CreateIndex
CREATE INDEX "PageMediaReference_pageType_pageId_idx" ON "PageMediaReference"("pageType", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageMediaReference_mediaAssetId_pageType_pageId_key" ON "PageMediaReference"("mediaAssetId", "pageType", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_slug_key" ON "Gallery"("slug");

-- CreateIndex
CREATE INDEX "Gallery_sortOrder_idx" ON "Gallery"("sortOrder");

-- CreateIndex
CREATE INDEX "Gallery_date_idx" ON "Gallery"("date");

-- CreateIndex
CREATE INDEX "GalleryItem_galleryId_sortOrder_idx" ON "GalleryItem"("galleryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryItem_galleryId_mediaAssetId_key" ON "GalleryItem"("galleryId", "mediaAssetId");

-- CreateIndex
CREATE INDEX "BreakingNews_publicationDate_idx" ON "BreakingNews"("publicationDate");

-- CreateIndex
CREATE INDEX "EventDiscipline_disciplineId_idx" ON "EventDiscipline"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberDocument_mediaAssetId_key" ON "MemberDocument"("mediaAssetId");

-- CreateIndex
CREATE INDEX "MemberDocument_audience_idx" ON "MemberDocument"("audience");

-- CreateIndex
CREATE INDEX "MemberDocumentRecipient_userId_idx" ON "MemberDocumentRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberDocumentRecipient_memberDocumentId_userId_key" ON "MemberDocumentRecipient"("memberDocumentId", "userId");

-- CreateIndex
CREATE INDEX "DocumentReceipt_userId_idx" ON "DocumentReceipt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentReceipt_memberDocumentId_userId_key" ON "DocumentReceipt"("memberDocumentId", "userId");

-- CreateIndex
CREATE INDEX "MemberGroup_parentGroupId_idx" ON "MemberGroup"("parentGroupId");

-- CreateIndex
CREATE INDEX "MemberGroupMembership_userId_idx" ON "MemberGroupMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberGroupMembership_groupId_userId_key" ON "MemberGroupMembership"("groupId", "userId");

-- CreateIndex
CREATE INDEX "MemberDocumentGroup_groupId_idx" ON "MemberDocumentGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberDocumentGroup_memberDocumentId_groupId_key" ON "MemberDocumentGroup"("memberDocumentId", "groupId");

-- CreateIndex
CREATE INDEX "_StageAnimators_B_index" ON "_StageAnimators"("B");

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "DisciplineFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_primaryAnimatorId_fkey" FOREIGN KEY ("primaryAnimatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageSession" ADD CONSTRAINT "StageSession_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSession" ADD CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageMediaReference" ADD CONSTRAINT "PageMediaReference_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDiscipline" ADD CONSTRAINT "EventDiscipline_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDiscipline" ADD CONSTRAINT "EventDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDocumentRecipient" ADD CONSTRAINT "MemberDocumentRecipient_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDocumentRecipient" ADD CONSTRAINT "MemberDocumentRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReceipt" ADD CONSTRAINT "DocumentReceipt_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReceipt" ADD CONSTRAINT "DocumentReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "MemberGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGroupMembership" ADD CONSTRAINT "MemberGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGroupMembership" ADD CONSTRAINT "MemberGroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDocumentGroup" ADD CONSTRAINT "MemberDocumentGroup_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDocumentGroup" ADD CONSTRAINT "MemberDocumentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StageAnimators" ADD CONSTRAINT "_StageAnimators_A_fkey" FOREIGN KEY ("A") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StageAnimators" ADD CONSTRAINT "_StageAnimators_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

