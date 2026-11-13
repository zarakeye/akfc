import { router } from "#trpc/core.ts";

import { authRouter } from "#modules/auth/router.ts";
import { userRouter } from "#modules/users/router.ts";
import { avatarRouter } from "#modules/avatar/router.ts";
import { imageConsentRouter } from "#modules/imageConsent/router.ts";
import { mediaPeopleRouter } from "#modules/mediaPeople/router.ts";
import { trashRouter } from "#modules/trash/router.ts";
import { fileVersionRouter } from "#modules/fileVersions/router.ts";
import { categoryRouter } from "#modules/categories/router.ts";
import { courseRouter } from "#modules/courses/router.ts";
import { disciplineRouter } from "#modules/disciplines/router.ts";
import { seminarRouter } from "#modules/seminars/router.ts";
import { seminarSessionRouter } from "#modules/seminarSessions/router.ts";
import { eventRouter } from "#modules/events/router.ts";
import { eventSessionRouter } from "#modules/eventSessions/router.ts";
import { postRouter } from "#modules/posts/router.ts";
import { storageRouter } from "#modules/storage/router.ts";
import { mediaRouter } from "#modules/media/router.ts";
import { originRouter } from "#modules/origins/router.ts";
import { commentRouter } from "#modules/comments/router.ts";
import { reactionRouter } from "#modules/reactions/router.ts";
import { pollRouter } from "#modules/polls/router.ts";
import { disciplineFamilyRouter } from "#modules/disciplineFamilies/router.ts";
import { galleryRouter } from "#modules/galleries/router.ts";
import { breakingNewsRouter } from "#modules/breakingNews/router.ts";
import { siteStyleRouter } from "#modules/siteStyle/router.ts";
import { sitePageRouter } from "#modules/sitePages/router.ts";
import { memberDocumentRouter } from "#modules/memberDocuments/router.ts";
import { memberGroupRouter } from "#modules/memberGroups/router.ts";
import { homeHeroRouter } from "#modules/homeHero/router.ts";
import { siteSettingsRouter } from "#modules/siteSettings/router.ts";
import { pageVisibilityRouter } from "#modules/pageVisibility/router.ts";
import { ticketRouter } from "#modules/tickets/router.ts";
import { sitePartnerRouter } from "#modules/sitePartners/router.ts";

export const appRouter = router({
  homeHero: homeHeroRouter,
  siteSettings: siteSettingsRouter,
  pageVisibility: pageVisibilityRouter,
  ticket: ticketRouter,
  sitePartner: sitePartnerRouter,
  siteStyle: siteStyleRouter,
  sitePage: sitePageRouter,
  auth: authRouter,
  user: userRouter,
  avatar: avatarRouter,
  imageConsent: imageConsentRouter,
  mediaPeople: mediaPeopleRouter,
  trash: trashRouter,
  fileVersion: fileVersionRouter,
  category: categoryRouter,
  course: courseRouter,
  discipline: disciplineRouter,
  origin: originRouter,
  seminar: seminarRouter,
  seminarSession: seminarSessionRouter,
  event: eventRouter,
  eventSession: eventSessionRouter,
  post: postRouter,
  storage: storageRouter,
  media: mediaRouter,
  comment: commentRouter,
  reaction: reactionRouter,
  poll: pollRouter,
  disciplineFamily: disciplineFamilyRouter,
  gallery: galleryRouter,
  breakingNews: breakingNewsRouter,
  memberDocument: memberDocumentRouter,
  memberGroup: memberGroupRouter,
});

export type AppRouter = typeof appRouter;
