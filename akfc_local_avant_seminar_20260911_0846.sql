--
-- PostgreSQL database dump
--

\restrict ybr2uNOmIwpUfCVXgbagk8pAGcWqmQp5iFWIzx5EQA68gKEaM7ZNltPqtwIpeRV

-- Dumped from database version 17.6 (Homebrew)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Audience; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."Audience" AS ENUM (
    'KIDS',
    'TEENAGERS',
    'ADULTS',
    'ALL_AGES'
);


ALTER TYPE public."Audience" OWNER TO akfc;

--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."AuditAction" AS ENUM (
    'USER_ROLE_CHANGED'
);


ALTER TYPE public."AuditAction" OWNER TO akfc;

--
-- Name: CloudinaryFolderStatus; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."CloudinaryFolderStatus" AS ENUM (
    'pending',
    'published',
    'bin'
);


ALTER TYPE public."CloudinaryFolderStatus" OWNER TO akfc;

--
-- Name: Day; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."Day" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);


ALTER TYPE public."Day" OWNER TO akfc;

--
-- Name: DisciplineType; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."DisciplineType" AS ENUM (
    'MARTIAL_ART',
    'CALLIGRAPHY'
);


ALTER TYPE public."DisciplineType" OWNER TO akfc;

--
-- Name: DocumentAudience; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."DocumentAudience" AS ENUM (
    'ALL_MEMBERS',
    'SPECIFIC'
);


ALTER TYPE public."DocumentAudience" OWNER TO akfc;

--
-- Name: MemberGroupAccess; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."MemberGroupAccess" AS ENUM (
    'VIEWER',
    'EDITOR'
);


ALTER TYPE public."MemberGroupAccess" OWNER TO akfc;

--
-- Name: PageReferencerKind; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."PageReferencerKind" AS ENUM (
    'COURSE',
    'STAGE_DESCRIPTION',
    'STAGE_PROGRAM',
    'POST',
    'DISCIPLINE',
    'EVENT',
    'SITE_PAGE',
    'STAGE_SUMMARY',
    'EVENT_SUMMARY'
);


ALTER TYPE public."PageReferencerKind" OWNER TO akfc;

--
-- Name: ReactionTarget; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."ReactionTarget" AS ENUM (
    'POST',
    'COMMENT'
);


ALTER TYPE public."ReactionTarget" OWNER TO akfc;

--
-- Name: TrashEntryKind; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."TrashEntryKind" AS ENUM (
    'folder',
    'file'
);


ALTER TYPE public."TrashEntryKind" OWNER TO akfc;

--
-- Name: TrashEntryStatus; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."TrashEntryStatus" AS ENUM (
    'IN_BIN',
    'RESTORED',
    'DELETED'
);


ALTER TYPE public."TrashEntryStatus" OWNER TO akfc;

--
-- Name: Visibility; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."Visibility" AS ENUM (
    'PUBLIC',
    'MEMBERS'
);


ALTER TYPE public."Visibility" OWNER TO akfc;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "actorUserId" text,
    "actorEmail" text,
    action public."AuditAction" NOT NULL,
    "targetUserId" text,
    meta jsonb
);


ALTER TABLE public."AuditLog" OWNER TO akfc;

--
-- Name: BreakingNews; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."BreakingNews" (
    id integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    href text,
    "publicationDate" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BreakingNews" OWNER TO akfc;

--
-- Name: BreakingNews_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."BreakingNews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."BreakingNews_id_seq" OWNER TO akfc;

--
-- Name: BreakingNews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."BreakingNews_id_seq" OWNED BY public."BreakingNews".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    type text NOT NULL
);


ALTER TABLE public."Category" OWNER TO akfc;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO akfc;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: CloudinaryFolder; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."CloudinaryFolder" (
    id text NOT NULL,
    "appRoot" text NOT NULL,
    "fullPath" text NOT NULL,
    status public."CloudinaryFolderStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CloudinaryFolder" OWNER TO akfc;

--
-- Name: Comment; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "postId" integer NOT NULL,
    "parentId" integer,
    content jsonb NOT NULL
);


ALTER TABLE public."Comment" OWNER TO akfc;

--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Comment_id_seq" OWNER TO akfc;

--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: Course; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Course" (
    id integer NOT NULL,
    "disciplineId" integer NOT NULL,
    audience public."Audience" NOT NULL,
    day public."Day" NOT NULL,
    "beginTime" integer NOT NULL,
    "endTime" integer NOT NULL,
    "instructorId" text,
    requisites text[],
    content jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Course" OWNER TO akfc;

--
-- Name: Course_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Course_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Course_id_seq" OWNER TO akfc;

--
-- Name: Course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Course_id_seq" OWNED BY public."Course".id;


--
-- Name: Discipline; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Discipline" (
    id integer NOT NULL,
    name text NOT NULL,
    type public."DisciplineType" NOT NULL,
    school text,
    classification text,
    "categoryId" integer NOT NULL,
    "instructorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "originId" integer,
    description jsonb DEFAULT '{"blocks": [], "version": 1}'::jsonb NOT NULL,
    "familyId" integer,
    slug text,
    summary jsonb DEFAULT '{"blocks": [], "version": 1}'::jsonb NOT NULL,
    "summaryMediaId" text,
    "publicationDate" timestamp(3) without time zone
);


ALTER TABLE public."Discipline" OWNER TO akfc;

--
-- Name: DisciplineFamily; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."DisciplineFamily" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DisciplineFamily" OWNER TO akfc;

--
-- Name: DisciplineFamily_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."DisciplineFamily_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DisciplineFamily_id_seq" OWNER TO akfc;

--
-- Name: DisciplineFamily_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."DisciplineFamily_id_seq" OWNED BY public."DisciplineFamily".id;


--
-- Name: Discipline_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Discipline_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Discipline_id_seq" OWNER TO akfc;

--
-- Name: Discipline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Discipline_id_seq" OWNED BY public."Discipline".id;


--
-- Name: DocumentReceipt; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."DocumentReceipt" (
    id text NOT NULL,
    "memberDocumentId" text NOT NULL,
    "userId" text NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public."DocumentReceipt" OWNER TO akfc;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    label text NOT NULL,
    content jsonb DEFAULT '{"blocks": [], "version": 1}'::jsonb NOT NULL,
    audience public."Audience" NOT NULL,
    "originId" integer,
    "organizerId" text NOT NULL,
    "publicationDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    slug text,
    "externalDisciplineLabels" text[] DEFAULT ARRAY[]::text[] NOT NULL,
    summary jsonb DEFAULT '{"blocks": [], "version": 1}'::jsonb NOT NULL,
    "summaryMediaId" text
);


ALTER TABLE public."Event" OWNER TO akfc;

--
-- Name: EventDiscipline; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."EventDiscipline" (
    "eventId" integer NOT NULL,
    "disciplineId" integer NOT NULL
);


ALTER TABLE public."EventDiscipline" OWNER TO akfc;

--
-- Name: EventSession; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."EventSession" (
    id integer NOT NULL,
    "eventId" integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "beginTime" integer NOT NULL,
    "endTime" integer NOT NULL,
    location text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EventSession" OWNER TO akfc;

--
-- Name: EventSession_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."EventSession_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EventSession_id_seq" OWNER TO akfc;

--
-- Name: EventSession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."EventSession_id_seq" OWNED BY public."EventSession".id;


--
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Event_id_seq" OWNER TO akfc;

--
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- Name: FolderLabel; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."FolderLabel" (
    path text NOT NULL,
    "displayName" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FolderLabel" OWNER TO akfc;

--
-- Name: Gallery; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Gallery" (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    visibility public."Visibility" DEFAULT 'PUBLIC'::public."Visibility" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "disciplineId" integer,
    "stageId" integer,
    "eventId" integer,
    "categoryId" integer,
    date timestamp(3) without time zone,
    "originId" integer
);


ALTER TABLE public."Gallery" OWNER TO akfc;

--
-- Name: GalleryItem; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."GalleryItem" (
    id integer NOT NULL,
    "galleryId" integer NOT NULL,
    "mediaAssetId" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."GalleryItem" OWNER TO akfc;

--
-- Name: GalleryItem_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."GalleryItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GalleryItem_id_seq" OWNER TO akfc;

--
-- Name: GalleryItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."GalleryItem_id_seq" OWNED BY public."GalleryItem".id;


--
-- Name: Gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Gallery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Gallery_id_seq" OWNER TO akfc;

--
-- Name: Gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Gallery_id_seq" OWNED BY public."Gallery".id;


--
-- Name: HomeHero; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."HomeHero" (
    id text DEFAULT 'home'::text NOT NULL,
    title text NOT NULL,
    body text NOT NULL
);


ALTER TABLE public."HomeHero" OWNER TO akfc;

--
-- Name: MediaAsset; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."MediaAsset" (
    id text NOT NULL,
    "publicId" text,
    "secureUrl" text,
    "resourceType" text,
    "mimeType" text NOT NULL,
    format text,
    "originalFileName" text NOT NULL,
    "displayName" text,
    description text,
    bytes integer NOT NULL,
    width integer,
    height integer,
    duration double precision,
    "appRoot" text NOT NULL,
    status text NOT NULL,
    "categoryId" integer,
    "disciplineId" integer,
    "proposedDisciplineName" text,
    "eventDate" timestamp(3) without time zone,
    "uploaderUserId" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fullPath" text NOT NULL,
    "cloudinaryAssetId" text,
    "eventId" integer
);


ALTER TABLE public."MediaAsset" OWNER TO akfc;

--
-- Name: MemberDocument; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."MemberDocument" (
    id text NOT NULL,
    "mediaAssetId" text NOT NULL,
    title text,
    audience public."DocumentAudience" DEFAULT 'ALL_MEMBERS'::public."DocumentAudience" NOT NULL,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "publishedById" text
);


ALTER TABLE public."MemberDocument" OWNER TO akfc;

--
-- Name: MemberDocumentGroup; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."MemberDocumentGroup" (
    id text NOT NULL,
    "memberDocumentId" text NOT NULL,
    "groupId" text NOT NULL
);


ALTER TABLE public."MemberDocumentGroup" OWNER TO akfc;

--
-- Name: MemberDocumentRecipient; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."MemberDocumentRecipient" (
    id text NOT NULL,
    "memberDocumentId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."MemberDocumentRecipient" OWNER TO akfc;

--
-- Name: MemberGroup; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."MemberGroup" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isCollaborative" boolean DEFAULT false NOT NULL,
    "isAdminGroup" boolean DEFAULT false NOT NULL,
    "parentGroupId" text
);


ALTER TABLE public."MemberGroup" OWNER TO akfc;

--
-- Name: MemberGroupMembership; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."MemberGroupMembership" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    "userId" text NOT NULL,
    access public."MemberGroupAccess" DEFAULT 'EDITOR'::public."MemberGroupAccess" NOT NULL
);


ALTER TABLE public."MemberGroupMembership" OWNER TO akfc;

--
-- Name: Origin; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Origin" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    country text,
    region text,
    flag text,
    "historicalPeriod" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Origin" OWNER TO akfc;

--
-- Name: Origin_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Origin_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Origin_id_seq" OWNER TO akfc;

--
-- Name: Origin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Origin_id_seq" OWNED BY public."Origin".id;


--
-- Name: PageMediaReference; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."PageMediaReference" (
    id text NOT NULL,
    "mediaAssetId" text NOT NULL,
    "pageType" public."PageReferencerKind" NOT NULL,
    "pageId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PageMediaReference" OWNER TO akfc;

--
-- Name: PageVisibility; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."PageVisibility" (
    key text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PageVisibility" OWNER TO akfc;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "tokenHash" text NOT NULL,
    "userId" text NOT NULL,
    "requestIp" text,
    "userAgent" text
);


ALTER TABLE public."PasswordResetToken" OWNER TO akfc;

--
-- Name: Poll; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Poll" (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    question text NOT NULL,
    multiple boolean DEFAULT false NOT NULL,
    "closesAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Poll" OWNER TO akfc;

--
-- Name: PollOption; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."PollOption" (
    id integer NOT NULL,
    "pollId" integer NOT NULL,
    label text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."PollOption" OWNER TO akfc;

--
-- Name: PollOption_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."PollOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PollOption_id_seq" OWNER TO akfc;

--
-- Name: PollOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."PollOption_id_seq" OWNED BY public."PollOption".id;


--
-- Name: PollVote; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."PollVote" (
    id integer NOT NULL,
    "optionId" integer NOT NULL,
    "pollId" integer NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PollVote" OWNER TO akfc;

--
-- Name: PollVote_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."PollVote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PollVote_id_seq" OWNER TO akfc;

--
-- Name: PollVote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."PollVote_id_seq" OWNED BY public."PollVote".id;


--
-- Name: Poll_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Poll_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Poll_id_seq" OWNER TO akfc;

--
-- Name: Poll_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Poll_id_seq" OWNED BY public."Poll".id;


--
-- Name: Post; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Post" (
    id integer NOT NULL,
    title text NOT NULL,
    content jsonb NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publicationDate" timestamp(3) without time zone
);


ALTER TABLE public."Post" OWNER TO akfc;

--
-- Name: Post_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Post_id_seq" OWNER TO akfc;

--
-- Name: Post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Post_id_seq" OWNED BY public."Post".id;


--
-- Name: Preferences; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Preferences" (
    id integer NOT NULL,
    "displayEmail" boolean DEFAULT false NOT NULL,
    "displayPhone" boolean DEFAULT false NOT NULL,
    "darkMode" boolean DEFAULT true NOT NULL,
    "userId" text NOT NULL,
    description text
);


ALTER TABLE public."Preferences" OWNER TO akfc;

--
-- Name: Preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Preferences_id_seq" OWNER TO akfc;

--
-- Name: Preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Preferences_id_seq" OWNED BY public."Preferences".id;


--
-- Name: Reaction; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Reaction" (
    id integer NOT NULL,
    emoji text NOT NULL,
    "userId" text NOT NULL,
    "targetType" public."ReactionTarget" NOT NULL,
    "targetId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Reaction" OWNER TO akfc;

--
-- Name: Reaction_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Reaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reaction_id_seq" OWNER TO akfc;

--
-- Name: Reaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Reaction_id_seq" OWNED BY public."Reaction".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO akfc;

--
-- Name: SitePage; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."SitePage" (
    slug text NOT NULL,
    title text NOT NULL,
    content jsonb DEFAULT '{"blocks": [], "version": 1}'::jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SitePage" OWNER TO akfc;

--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."SiteSettings" (
    id text DEFAULT 'site'::text NOT NULL,
    "shortTitle" text DEFAULT 'AKFC'::text NOT NULL,
    "longTitle" text DEFAULT 'Association de Kung Fu de Chambéry'::text NOT NULL,
    tagline text,
    "supportEmail" text,
    "defaultLocale" text DEFAULT 'fr'::text NOT NULL,
    "logoAssetId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SiteSettings" OWNER TO akfc;

--
-- Name: SiteStyle; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."SiteStyle" (
    id integer DEFAULT 1 NOT NULL,
    variables jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "summaryMaxChars" integer DEFAULT 600 NOT NULL,
    "cardCollapsedHeight" integer DEFAULT 220 NOT NULL
);


ALTER TABLE public."SiteStyle" OWNER TO akfc;

--
-- Name: Stage; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Stage" (
    id integer NOT NULL,
    "disciplineId" integer,
    label text NOT NULL,
    audience public."Audience" NOT NULL,
    description jsonb NOT NULL,
    program jsonb NOT NULL,
    "preRegistered" text[],
    "primaryAnimatorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "externalDisciplineLabel" text,
    "originId" integer,
    slug text,
    "publicationDate" timestamp(3) without time zone,
    summary jsonb DEFAULT '{"blocks": [], "version": 1}'::jsonb NOT NULL,
    "summaryMediaId" text
);


ALTER TABLE public."Stage" OWNER TO akfc;

--
-- Name: StageSession; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."StageSession" (
    id integer NOT NULL,
    "stageId" integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "beginTime" integer NOT NULL,
    "endTime" integer NOT NULL,
    location text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StageSession" OWNER TO akfc;

--
-- Name: StageSession_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."StageSession_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StageSession_id_seq" OWNER TO akfc;

--
-- Name: StageSession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."StageSession_id_seq" OWNED BY public."StageSession".id;


--
-- Name: Stage_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Stage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Stage_id_seq" OWNER TO akfc;

--
-- Name: Stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Stage_id_seq" OWNED BY public."Stage".id;


--
-- Name: TrashEntry; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."TrashEntry" (
    id text NOT NULL,
    "appRoot" text NOT NULL,
    kind public."TrashEntryKind" NOT NULL,
    status public."TrashEntryStatus" DEFAULT 'IN_BIN'::public."TrashEntryStatus" NOT NULL,
    "displayName" text NOT NULL,
    "previousPath" text NOT NULL,
    "storageRoot" text NOT NULL,
    "trashedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "restoredAt" timestamp(3) without time zone,
    "restoredToPath" text,
    "deletedAt" timestamp(3) without time zone,
    "sizeBytes" bigint,
    "cloudinaryCreatedAt" timestamp(3) without time zone,
    "mediaKind" text
);


ALTER TABLE public."TrashEntry" OWNER TO akfc;

--
-- Name: User; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "firstName" text,
    "lastName" text,
    email text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    password text NOT NULL,
    "birthDate" timestamp(3) without time zone,
    phone text,
    image text,
    "memberSince" timestamp(3) without time zone,
    "isFirstLogin" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "aboutMe" text,
    pseudo text,
    avatar text,
    "instructorBio" jsonb,
    "instructorOrder" integer
);


ALTER TABLE public."User" OWNER TO akfc;

--
-- Name: Verification; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Verification" (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Verification" OWNER TO akfc;

--
-- Name: _StageAnimators; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."_StageAnimators" (
    "A" integer NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_StageAnimators" OWNER TO akfc;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO akfc;

--
-- Name: BreakingNews id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."BreakingNews" ALTER COLUMN id SET DEFAULT nextval('public."BreakingNews_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: Course id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Course" ALTER COLUMN id SET DEFAULT nextval('public."Course_id_seq"'::regclass);


--
-- Name: Discipline id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline" ALTER COLUMN id SET DEFAULT nextval('public."Discipline_id_seq"'::regclass);


--
-- Name: DisciplineFamily id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."DisciplineFamily" ALTER COLUMN id SET DEFAULT nextval('public."DisciplineFamily_id_seq"'::regclass);


--
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- Name: EventSession id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."EventSession" ALTER COLUMN id SET DEFAULT nextval('public."EventSession_id_seq"'::regclass);


--
-- Name: Gallery id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery" ALTER COLUMN id SET DEFAULT nextval('public."Gallery_id_seq"'::regclass);


--
-- Name: GalleryItem id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."GalleryItem" ALTER COLUMN id SET DEFAULT nextval('public."GalleryItem_id_seq"'::regclass);


--
-- Name: Origin id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Origin" ALTER COLUMN id SET DEFAULT nextval('public."Origin_id_seq"'::regclass);


--
-- Name: Poll id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Poll" ALTER COLUMN id SET DEFAULT nextval('public."Poll_id_seq"'::regclass);


--
-- Name: PollOption id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollOption" ALTER COLUMN id SET DEFAULT nextval('public."PollOption_id_seq"'::regclass);


--
-- Name: PollVote id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollVote" ALTER COLUMN id SET DEFAULT nextval('public."PollVote_id_seq"'::regclass);


--
-- Name: Post id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Post" ALTER COLUMN id SET DEFAULT nextval('public."Post_id_seq"'::regclass);


--
-- Name: Preferences id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Preferences" ALTER COLUMN id SET DEFAULT nextval('public."Preferences_id_seq"'::regclass);


--
-- Name: Reaction id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Reaction" ALTER COLUMN id SET DEFAULT nextval('public."Reaction_id_seq"'::regclass);


--
-- Name: Stage id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Stage" ALTER COLUMN id SET DEFAULT nextval('public."Stage_id_seq"'::regclass);


--
-- Name: StageSession id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."StageSession" ALTER COLUMN id SET DEFAULT nextval('public."StageSession_id_seq"'::regclass);


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."AuditLog" (id, "createdAt", "actorUserId", "actorEmail", action, "targetUserId", meta) FROM stdin;
\.


--
-- Data for Name: BreakingNews; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."BreakingNews" (id, title, body, href, "publicationDate", "expiresAt", "createdAt", "updatedAt") FROM stdin;
1	Journée stage de clôture de l'année le 13/06/2026 au Mottay	Tout est dans le titre	\N	2026-05-06 07:13:00	2026-06-13 07:14:00	2026-07-03 07:14:49.42	2026-07-03 07:14:49.42
3	Restez attentifs pour les sessions hors AKFC des congés d'été	Ils auront toujours lieux du côté de Buisson-Rond	\N	2026-06-03 07:27:00	2026-07-31 07:27:00	2026-07-03 07:28:00.487	2026-07-03 07:28:00.487
2	Relance du cours "Joues-la comme Bruce !"	Relance du cours de chorégraphie inspiré de scènes mythiques du cinéma d'art martiaux	\N	\N	2026-12-01 08:17:00	2026-07-03 07:17:44.799	2026-07-03 07:32:06.611
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Category" (id, type) FROM stdin;
1	Cours
\.


--
-- Data for Name: CloudinaryFolder; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."CloudinaryFolder" (id, "appRoot", "fullPath", status, "createdAt", "updatedAt") FROM stdin;
cmtpvg9sl00007uoekcigeizf	AKFC	AKFC/collaborative-group-spaces	published	2026-09-06 13:52:59.541	2026-09-06 13:52:59.541
cmtsgldc600067uoa9mhufi0t	AKFC	AKFC/avatars/cmtek0rt80003qj0jbejg4u0z	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc600077uoa25m79x43	AKFC	AKFC/common-repository/depot_stephane-bazze-cmp6s16gw0001i51z30km4p2o	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc600087uoa4ezmzjyd	AKFC	AKFC/courses	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc600097uoact36gh8i	AKFC	AKFC/courses/kali-escrima	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc6000a7uoa7vciu7lc	AKFC	AKFC/courses/taolu-multi-styles	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc6000b7uoahixk1x8p	AKFC	AKFC/seminars	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc6000c7uoa3n5b8nw3	AKFC	AKFC/seminars/stage-baton-long	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtsgldc6000d7uoa5jso4cne	AKFC	AKFC/courses/tchoy-lee-fut	pending	2026-09-08 09:20:21.702	2026-09-08 09:20:21.702
cmtmripcg00007ui841yskrqj	AKFC	AKFC/bin	bin	2026-09-04 09:39:36.016	2026-09-04 09:39:36.016
cmpdtrf9g0002gpovbgguspq9	AKFC	AKFC	pending	2026-05-20 08:53:37.157	2026-07-17 16:11:51.923
cmrev81ea00007um5jsclsc0e	AKFC	AKFC/avatars	pending	2026-07-10 11:41:42.803	2026-07-10 11:41:42.803
cmrev81eb00017um50n7ksb31	AKFC	AKFC/avatars/cmp6s16gw0001i51z30km4p2o	pending	2026-07-10 11:41:42.803	2026-07-10 11:41:42.803
cmtouvnt100017utpa3emgdot	AKFC	AKFC/collaborative-group-spaces/administrateurs-cmsuuayos00027unk2tkok95v	published	2026-09-05 20:49:11.749	2026-09-05 20:49:11.749
cmtouvnt900037utplqy2ugrs	AKFC	AKFC/collaborative-group-spaces/bureau-cmst5hqdt00007u2l4otzfk7y	published	2026-09-05 20:49:11.757	2026-09-05 20:49:11.757
cmtjx4gjy00087uw77xyf14gj	AKFC	AKFC/avatars/cmtg7bkn400067us7jco206eq	pending	2026-09-02 09:53:10.606	2026-09-02 09:53:10.606
cmtr2hxzx00067up7ao38njy1	AKFC	AKFC/avatars/cmt68fx1z0005om0juu39p05y	pending	2026-09-07 09:58:01.054	2026-09-07 09:58:01.054
cmtr2hxzx00077up7le8vl9zx	AKFC	AKFC/common-repository	pending	2026-09-07 09:58:01.054	2026-09-07 09:58:01.054
cmtr2hxzx00087up7hshw7q7r	AKFC	AKFC/common-repository/depot_adrien-sommer-cmt68fx1z0005om0juu39p05y	pending	2026-09-07 09:58:01.054	2026-09-07 09:58:01.054
cmtr2hxzx00097up7knaetod7	AKFC	AKFC/stage	pending	2026-09-07 09:58:01.054	2026-09-07 09:58:01.054
cmtr2hxzx000a7up7phrntsfl	AKFC	AKFC/stage/stage-baton-long	pending	2026-09-07 09:58:01.054	2026-09-07 09:58:01.054
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Comment" (id, "authorId", "createdAt", "updatedAt", "postId", "parentId", content) FROM stdin;
1	cmp6s16gw0001i51z30km4p2o	2026-07-02 12:08:08.961	2026-07-02 12:08:08.961	1	\N	{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Ok c'est noté 👍", "type": "text"}]}]}
2	cmp6s16gw0001i51z30km4p2o	2026-07-02 12:17:45.542	2026-07-02 12:21:02.762	1	1	{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Très bien. à bientôt", "type": "text"}]}]}
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Course" (id, "disciplineId", audience, day, "beginTime", "endTime", "instructorId", requisites, content, "createdAt", "updatedAt") FROM stdin;
1	1	ADULTS	WEDNESDAY	1800	1900	cmp6s16gw0001i51z30km4p2o	{}	{"blocks": [], "version": 1}	2026-06-12 18:32:07	2026-06-12 20:00:42.732
2	2	ADULTS	WEDNESDAY	1900	2030	cmp6s16gw0001i51z30km4p2o	{"Entretenir son corps et sa santé grâce à l'apprentissage de différentes formes de boxes chinoises, les tao-lus"}	{"blocks": [], "version": 1}	2026-06-12 20:05:48.835	2026-06-12 20:05:48.835
3	4	ADULTS	THURSDAY	2000	2200	cmp6s16gw0001i51z30km4p2o	{"Le Kali-Escrima est un art martial né aux Philippines. Se pratiquant avec des batons courts, il offre un excellent panel de techniques accessibles à tous et facilement applicables."}	{"blocks": [], "version": 1}	2026-06-12 20:11:13.319	2026-06-12 20:11:13.319
4	3	ADULTS	FRIDAY	1800	1930	cmp6s16gw0001i51z30km4p2o	{}	{"blocks": [], "version": 1}	2026-06-12 20:12:20.752	2026-06-12 20:12:20.752
\.


--
-- Data for Name: Discipline; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Discipline" (id, name, type, school, classification, "categoryId", "instructorId", "createdAt", "updatedAt", "originId", description, "familyId", slug, summary, "summaryMediaId", "publicationDate") FROM stdin;
1	Taï-chi	MARTIAL_ART	Chen	interne (yin)	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.062	2026-06-04 09:40:56.653	\N	{"blocks": [], "version": 1}	1	tai-chi	{"blocks": [], "version": 1}	\N	\N
2	Taolu multi-styles	MARTIAL_ART	\N	\N	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.171	2026-06-04 09:40:56.659	\N	{"blocks": [], "version": 1}	1	taolu-multi-styles	{"blocks": [], "version": 1}	\N	\N
3	Tchoy-Lee-Fut	MARTIAL_ART	\N	externe (yang)	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.174	2026-07-22 20:48:20.761	\N	{"blocks": [{"id": "064faff8-5489-4a20-ac9f-7bbdd83f2c81", "type": "media-text", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le Tchoy Lee Fut est un art martial chinois puissant, fluide et explosif, réputé pour son efficacité en combat et la richesse de ses techniques.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Les cours du mercredi et du vendredi sont orientés vers le combat, avec une alternance entre cours traditionnels (taolu, techniques, applications) et cours de boxe (sparring, réactivité, créativité).", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Chaque séance commence par une préparation physique et se termine par un temps d’étirements pour favoriser la progression et le bien‑être.", "type": "text"}]}]}}, {"id": "fc22f1c3-5a45-4458-9df9-a00a643dfcd1", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsbohno000o5tb270madpo4"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "⚔️ Objectifs et bienfaits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développer une maîtrise technique solide grâce aux taolus traditionnels", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Renforcer la puissance, la vitesse et la coordination", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Améliorer la réactivité, la créativité et la prise de décision en combat", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Comprendre la logique martiale des mouvements et leur application réelle", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développer la confiance en soi, le self‑control et la gestion du stress", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travailler le corps complet : mobilité, explosivité, endurance, précision", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "94864a6e-aba8-4a8a-b110-802e29ca57fd", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsboh9l000k5tb26el696q7"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🥋 Structure des cours", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔸 Cours traditionnels (Taolu & Techniques)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le taolu est le terreau de l’apprentissage :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail des formes traditionnelles du Tchoy Lee Fut", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Décomposition des mouvements pour comprendre la mécanique et l’intention", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exercices seuls, à deux ou en groupe pour travailler des aspects précis :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "trajectoires circulaires", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "puissance des hanches", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "déplacements", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "timing et coordination", "type": "text"}]}]}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Applications martiales pour relier le taolu au combat réel", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔸 Cours de boxe (Combat & Sparring)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Un entraînement orienté mise en pratique réaliste, mais toujours codifié pour un apprentissage progressif :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail des frappes, esquives, déplacements et combinaisons", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exercices de réactivité et de créativité en situation dynamique", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Sparring contrôlé, adapté au niveau de chacun", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développement du timing, de la distance et de la lecture de l’adversaire", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Construction d’une attitude martiale solide, mais respectueuse et sécurisée", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "f4762ba0-14e5-4157-a319-26d543cbd172", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsbohwc000q5tb2c20rv70u"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💪 Préparation physique & étirements", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Chaque cours inclut :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Une préparation physique ciblée (gainage, explosivité, mobilité, cardio)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Un retour au calme avec étirements pour favoriser la récupération, la souplesse et la prévention des blessures", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "6d9d0217-5ebe-493d-9bf7-1094a47f71d2", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsbojh300125tb2c82hb224"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🤝 L’esprit du club", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Les valeurs restent les mêmes, quel que soit le cours :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Convivialité : un cadre chaleureux où chacun progresse à son rythme", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bienveillance : sécurité, respect et écoute sont prioritaires", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Entraide : les pratiquants se soutiennent et s’accompagnent dans leur progression", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le Tchoy Lee Fut est ici enseigné comme un art martial complet, où la technique nourrit le combat, et où le combat révèle la technique — toujours dans un environnement sain, motivant et respectueux.", "type": "text"}]}]}}], "version": 1}	1	tchoy-lee-fut	{"blocks": [], "version": 1}	\N	\N
4	Kali Escrima	MARTIAL_ART	\N	\N	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.176	2026-08-25 21:48:45.849	2	{"blocks": [{"id": "17d0f8cc-3422-40b4-9422-3fef002838a6", "type": "media-text", "media": {"kind": "avatar", "userId": "cmp6s16gw0001i51z30km4p2o"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le ", "type": "text"}, {"text": "Kali", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", art martial philippin, est une discipline complète qui développe à la fois le corps, l’esprit et la confiance en soi. Chaque jeudi de ", "type": "text"}, {"text": "20h à 22h", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", le club ouvre un espace d’apprentissage dynamique, accessible à tous, où la progression se fait dans la convivialité et la bienveillance.", "type": "text"}]}]}}, {"id": "075592e2-2fe7-4a02-aa7f-cd8e9091d2f4", "type": "media-text", "media": {"kind": "library", "mediaId": "cmreva9u400037um54qp8y3al"}, "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "💪 Bienfaits physiques", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Amélioration de la ", "type": "text"}, {"text": "condition physique générale", "type": "text", "marks": [{"type": "bold"}]}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développement de la ", "type": "text"}, {"text": "force fonctionnelle", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la tonicité", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail intensif de la ", "type": "text"}, {"text": "coordination", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la motricité fine", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gain de ", "type": "text"}, {"text": "souplesse", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", de mobilité et de vitesse d’exécution", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Renforcement du ", "type": "text"}, {"text": "schéma corporel", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la maîtrise du mouvement", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "e0975c88-27d4-4558-b1ea-9359204d295d", "type": "media-text", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "🧠 Bienfaits mentaux et émotionnels", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Construction d’une ", "type": "text"}, {"text": "confiance en soi solide", "type": "text", "marks": [{"type": "bold"}]}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développement du ", "type": "text"}, {"text": "self-control", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la gestion du stress", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Amélioration de la ", "type": "text"}, {"text": "concentration", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la prise de décision rapide", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Apprentissage de la ", "type": "text"}, {"text": "maîtrise émotionnelle", "type": "text", "marks": [{"type": "bold"}]}, {"text": " en situation dynamique", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "ff84a93b-76c2-42e0-8541-beacdff19afc", "type": "media-text", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "⚔️ Apprentissage technique", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le cours s’articule autour de :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Mouvements fondamentaux", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": "du Kali (bâtons, mains nues, angles, déplacements)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Séries techniques", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": "permettant d’intégrer les automatismes", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Mise en pratique en ", "type": "text"}, {"text": "sparring contrôlé", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", pour éprouver les acquis en conditions réelles", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail sur la ", "type": "text"}, {"text": "défense personnelle", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", en apprenant à utiliser ", "type": "text"}, {"text": "tout ce qui est disponible", "type": "text", "marks": [{"type": "italic"}]}, {"text": " pour se protéger efficacement", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "3144c59c-516b-480d-a12d-03f75d6bd549", "type": "media-text", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "🤝 L’esprit du club", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Notre club repose sur trois piliers :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Convivialité", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": ": un cadre chaleureux où chacun progresse à son rythme", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bienveillance", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": ": respect mutuel, écoute et sécurité avant tout", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Entraide", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": ": les plus expérimentés accompagnent les nouveaux, et chacun contribue à la progression du groupe", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Ici, pas de compétition d’ego : seulement la recherche du ", "type": "text"}, {"text": "bien-être", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", de la progression personnelle et du plaisir de pratiquer un art martial riche et vivant.", "type": "text"}]}]}}], "version": 1}	2	kali-escrima	{"blocks": [{"id": "80367952-31a4-44ee-8882-a8ebdf2c40b6", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porttitor fringilla urna, eget auctor nunc varius vitae. Nulla tempor sem massa, sit amet placerat tellus aliquet sit amet. Phasellus ultrices fermentum elementum. Nunc mauris justo, pellentesque nec libero ac, vulputate semper turpis. Proin libero risus, varius non auctor in, ullamcorper eget justo. Donec aliquam lacus eget neque egestas, id ornare nisl accumsan. In dapibus leo enim, at varius tellus auctor a. Aliquam feugiat, magna sed scelerisque imperdiet, justo nulla bibendum leo, in bibendum nisl nisi ut mauris.", "type": "text"}]}]}}], "version": 1}	cmreva9u400037um54qp8y3al	\N
\.


--
-- Data for Name: DisciplineFamily; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."DisciplineFamily" (id, name, slug, "sortOrder", "createdAt", "updatedAt") FROM stdin;
1	Kung-fu Wushu	kung-fu-wushu	0	2026-06-04 09:40:56.639	2026-06-04 09:40:56.639
2	Escrima	escrima	0	2026-06-13 03:59:21.113	2026-06-13 03:59:21.113
3	Calligraphie	calligraphie	0	2026-06-13 04:00:15.044	2026-06-13 04:00:15.044
\.


--
-- Data for Name: DocumentReceipt; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."DocumentReceipt" (id, "memberDocumentId", "userId", "readAt") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Event" (id, label, content, audience, "originId", "organizerId", "publicationDate", "createdAt", "updatedAt", slug, "externalDisciplineLabels", summary, "summaryMediaId") FROM stdin;
\.


--
-- Data for Name: EventDiscipline; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."EventDiscipline" ("eventId", "disciplineId") FROM stdin;
\.


--
-- Data for Name: EventSession; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."EventSession" (id, "eventId", date, "beginTime", "endTime", location, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FolderLabel; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."FolderLabel" (path, "displayName", "updatedAt") FROM stdin;
AKFC/common-repository	Dépôt commun	2026-09-08 09:18:56.25
AKFC/bin	Corbeille	2026-09-08 09:18:56.269
AKFC/personal-space	Espace personnel	2026-09-08 09:18:56.279
AKFC/collaborative-group-spaces	Espaces de groupes collaboratifs	2026-09-08 09:18:56.286
AKFC/seminars	Stages	2026-09-08 09:18:56.29
AKFC/events	Événements	2026-09-08 09:18:56.292
AKFC/courses	Cours	2026-09-08 09:18:56.401
AKFC/cours	Cours	2026-09-06 04:42:12.163
AKFC/personal-spaces	Espaces personnels	2026-09-06 13:17:10.185
\.


--
-- Data for Name: Gallery; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Gallery" (id, slug, title, visibility, "sortOrder", "disciplineId", "stageId", "eventId", "categoryId", date, "originId") FROM stdin;
1	home-carousel	Home carousel	PUBLIC	0	\N	\N	\N	\N	\N	\N
3	taolus	Taolus	PUBLIC	0	2	\N	\N	1	\N	1
\.


--
-- Data for Name: GalleryItem; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."GalleryItem" (id, "galleryId", "mediaAssetId", "sortOrder") FROM stdin;
\.


--
-- Data for Name: HomeHero; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."HomeHero" (id, title, body) FROM stdin;
\.


--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MediaAsset" (id, "publicId", "secureUrl", "resourceType", "mimeType", format, "originalFileName", "displayName", description, bytes, width, height, duration, "appRoot", status, "categoryId", "disciplineId", "proposedDisciplineName", "eventDate", "uploaderUserId", "uploadedAt", "createdAt", "updatedAt", "fullPath", "cloudinaryAssetId", "eventId") FROM stdin;
\.


--
-- Data for Name: MemberDocument; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberDocument" (id, "mediaAssetId", title, audience, "publishedAt", "publishedById") FROM stdin;
\.


--
-- Data for Name: MemberDocumentGroup; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberDocumentGroup" (id, "memberDocumentId", "groupId") FROM stdin;
\.


--
-- Data for Name: MemberDocumentRecipient; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberDocumentRecipient" (id, "memberDocumentId", "userId") FROM stdin;
\.


--
-- Data for Name: MemberGroup; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberGroup" (id, name, description, "createdAt", "isCollaborative", "isAdminGroup", "parentGroupId") FROM stdin;
cmsuuayos00027unk2tkok95v	Administrateurs	\N	2026-08-15 20:40:00.797	t	t	\N
cmst5hqdt00007u2l4otzfk7y	Bureau	\N	2026-08-14 16:17:40.049	t	f	cmsuuayos00027unk2tkok95v
\.


--
-- Data for Name: MemberGroupMembership; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberGroupMembership" (id, "groupId", "userId", access) FROM stdin;
cmsuthjv500037uaf0oqli76s	cmst5hqdt00007u2l4otzfk7y	cmp6s16gw0001i51z30km4p2o	EDITOR
cmsutho3b00057uafimy311kq	cmst5hqdt00007u2l4otzfk7y	cmrtr3wg100012ge38qek9lg0	EDITOR
cmsuuayp900047unkrvm4owgt	cmsuuayos00027unk2tkok95v	cmp6s16gw0001i51z30km4p2o	EDITOR
cmtg7bkn400077us7ymvhpucs	cmst5hqdt00007u2l4otzfk7y	cmtg7bkn400067us7jco206eq	EDITOR
\.


--
-- Data for Name: Origin; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Origin" (id, name, slug, description, country, region, flag, "historicalPeriod", "sortOrder", "createdAt", "updatedAt") FROM stdin;
1	Chine	chine	\N	\N	\N	\N	\N	0	2026-06-13 03:57:04.472	2026-06-13 03:57:04.472
2	Philipines	philipines	\N	\N	\N	\N	\N	0	2026-06-13 03:57:56.768	2026-06-13 03:57:56.768
\.


--
-- Data for Name: PageMediaReference; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PageMediaReference" (id, "mediaAssetId", "pageType", "pageId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PageVisibility; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PageVisibility" (key, published, "updatedAt") FROM stdin;
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PasswordResetToken" (id, "createdAt", "expiresAt", "usedAt", "tokenHash", "userId", "requestIp", "userAgent") FROM stdin;
\.


--
-- Data for Name: Poll; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Poll" (id, "postId", question, multiple, "closesAt", "createdAt") FROM stdin;
1	1	Entre nous, quelle date préférz-vous pour la rentrée? Choix multiple	t	2026-07-31 05:06:00	2026-07-03 05:07:01.963
\.


--
-- Data for Name: PollOption; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PollOption" (id, "pollId", label, "sortOrder") FROM stdin;
1	1	04/09	0
2	1	11/09	1
3	1	18/09	2
\.


--
-- Data for Name: PollVote; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PollVote" (id, "optionId", "pollId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Post" (id, title, content, "authorId", "createdAt", "updatedAt", "publicationDate") FROM stdin;
1	Rentrée 2026 - 2027	{"blocks": [{"id": "2fe3ec46-10e5-4205-b5ab-6fdb2fe0f6d0", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "La rentrée aura lieu le blabla.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "bfaljbzeflgzfnmzhfzmfgbzlfjb:bfbmzfbzemlbf zeblfbbflbzf:bzvfbebflebvebvebfvlezbvvevlzbvzbjhelfvhevzfhjvlzeflhzelfvelvflezlrjfhvlebvflelvlelelvee", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "efvevzhflhvlzeblfzlvfblzvfvzvflzjbfvzlbfzlvbfzvlfzlvflzlfz", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "fzlufblzgflguzfbzuflzbfljzlvlfbhlzvfljkzbflvz", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "fgélgflhmgféihfgéblfhémghféfjémfjoéf", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "féiufhéhfgéfbiéhfoiéfoébfuiéfioéfbéfléllfblabféfé", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "énffkvbvkjfbckjezjujgfgefoéglfkéliufgléfvyéfdgléfgéluféiuéhlfigbkjégfkébj;fékfgbjfkékfbkébfkueygfdkyegfldkuéygfgégfkgéuyfgkékfdvkébuvfkéudvféfuckévfckuvéfjhéjfkévfévf", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "dféfogékgifvukéjfgléifhgmé", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "$féfofhl”gflé”glfmgfhmoéimfé", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "déoglfbé”fvbé”lfépuifjléghfmioéfjé", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "élfbélbfgéfbmimé”fgéfhébomifégfmébmfé”", "type": "text"}]}]}}], "version": 1}	cmp6s16gw0001i51z30km4p2o	2026-07-01 18:22:03.698	2026-07-02 17:25:19.315	2026-07-01 18:21:00
\.


--
-- Data for Name: Preferences; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Preferences" (id, "displayEmail", "displayPhone", "darkMode", "userId", description) FROM stdin;
\.


--
-- Data for Name: Reaction; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Reaction" (id, emoji, "userId", "targetType", "targetId", "createdAt") FROM stdin;
1	👍	cmp6s16gw0001i51z30km4p2o	POST	1	2026-07-02 12:07:15.713
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Session" (id, "userId", "createdAt", "expiresAt") FROM stdin;
cmpdtr5wj0001gpoviq6mirnp	cmp6s16gw0001i51z30km4p2o	2026-05-20 08:53:25.026	2026-05-27 08:53:25.025
cmpqbn1pu0001i8c25phcnjbo	cmp6s16gw0001i51z30km4p2o	2026-05-29 02:47:20.178	2026-06-05 02:47:20.177
cmqaibh9e00012gtaifeso2uh	cmp6s16gw0001i51z30km4p2o	2026-06-12 05:49:41.282	2026-06-19 05:49:41.28
cmqkqerns00032g1jtjx9vaz3	cmp6s16gw0001i51z30km4p2o	2026-06-19 09:33:53.416	2026-06-26 09:33:53.414
cmr4gudfl00015tl1ofgix26e	cmp6s16gw0001i51z30km4p2o	2026-07-03 05:01:28.833	2026-07-10 05:01:28.832
cmrej8do300012gulybtp0cu0	cmp6s16gw0001i51z30km4p2o	2026-07-10 06:06:03.315	2026-07-17 06:06:03.314
cmrp4x62j000l2gtazhx9sddj	cmp6s16gw0001i51z30km4p2o	2026-07-17 16:10:53.562	2026-07-24 16:10:53.56
cmrt4iszp00015tsh36of2reh	cmp6s16gw0001i51z30km4p2o	2026-07-20 11:10:48.132	2026-07-27 11:10:48.131
cmrz5ioom00012gqwa28tcvhw	cmp6s16gw0001i51z30km4p2o	2026-07-24 16:25:19.222	2026-07-31 16:25:19.22
cms97cdll00012grwxf54rl7s	cmp6s16gw0001i51z30km4p2o	2026-07-31 17:14:05.914	2026-08-07 17:14:05.912
cmsmvpjit00012g77hjqw38f6	cmp6s16gw0001i51z30km4p2o	2026-08-10 06:57:11.188	2026-08-17 06:57:11.187
cmtg7phf9000b7us7fmxw0pj6	cmtg7bkn400067us7jco206eq	2026-08-30 19:38:22.965	2026-09-06 19:38:22.964
cmtn61f94000p7uwzrkxpbj4t	cmp6s16gw0001i51z30km4p2o	2026-09-04 16:26:04.024	2026-09-11 16:26:04.023
\.


--
-- Data for Name: SitePage; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."SitePage" (slug, title, content, "updatedAt") FROM stdin;
association	L'association	{"blocks": [{"id": "47d9a99f-4957-44e0-8a15-c921573e6a2f", "side": "left", "type": "float-text", "media": {"kind": "library", "mediaId": "cms7qxcar00012gsw1mduxdsj"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porttitor fringilla urna, eget auctor nunc varius vitae. Nulla tempor sem massa, sit amet placerat tellus aliquet sit amet. Phasellus ultrices fermentum elementum. Nunc mauris justo, pellentesque nec libero ac, vulputate semper turpis. Proin libero risus, varius non auctor in, ullamcorper eget justo. Donec aliquam lacus eget neque egestas, id ornare nisl accumsan. In dapibus leo enim, at varius tellus auctor a. Aliquam feugiat, magna sed scelerisque imperdiet, justo nulla bibendum leo, in bibendum nisl nisi ut mauris. Nulla vel eleifend eros.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Nunc a eleifend massa. Morbi magna neque, congue id pretium non, aliquet ut leo. Praesent ut volutpat risus. Pellentesque vel est sit amet sem posuere aliquam. Maecenas posuere varius cursus. Quisque aliquam metus vel faucibus egestas. Morbi id urna at magna blandit pulvinar ut id ipsum. Aliquam in vulputate eros. Etiam sit amet lectus urna. Sed varius erat eu laoreet euismod.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Donec tristique laoreet blandit. Aliquam suscipit, nibh ac tincidunt fermentum, nisl metus feugiat lacus, at tincidunt augue lorem sed nibh. Ut hendrerit, lectus ac consequat consequat, enim neque facilisis urna, ut rhoncus est sem vel nisl. Vestibulum iaculis diam nisl, vitae porta nunc lacinia non. Curabitur rhoncus ligula vel ante pretium sodales. Etiam aliquet, ante non pulvinar elementum, augue nulla iaculis orci, sagittis pretium lectus turpis et eros. Nullam ante nisi, semper non ullamcorper sed, condimentum vel urna. Proin eu venenatis eros.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Praesent quis tincidunt ligula, a pretium nulla. Morbi sed varius nulla. Mauris sed massa et nibh accumsan pharetra. Sed pretium ipsum venenatis enim posuere, maximus auctor libero semper. Phasellus imperdiet imperdiet arcu. Maecenas vel odio vitae lacus consequat porttitor at ac risus. Etiam est eros, condimentum maximus ullamcorper et, facilisis non felis. Fusce eleifend sollicitudin dolor ut scelerisque. Mauris vehicula eu erat quis euismod. Etiam at purus eleifend, aliquam sem eu, vehicula quam. Donec aliquet turpis nec quam auctor, ut tincidunt est vestibulum. Curabitur non massa aliquet, tristique libero id, consequat orci. Morbi malesuada diam tempus maximus pellentesque. Proin nec lorem ut mauris pretium dignissim quis sit amet velit. Proin vitae ligula quam. Vestibulum tempor sollicitudin sem, ut gravida tellus sollicitudin eget.", "type": "text"}]}]}}], "version": 1}	2026-07-30 16:50:52.352
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."SiteSettings" (id, "shortTitle", "longTitle", tagline, "supportEmail", "defaultLocale", "logoAssetId", "updatedAt") FROM stdin;
site	AKFC	Association de Kung Fu de Chambéry	\N	\N	fr	\N	2026-08-28 03:40:08.66
\.


--
-- Data for Name: SiteStyle; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."SiteStyle" (id, variables, "updatedAt", "summaryMaxChars", "cardCollapsedHeight") FROM stdin;
1	{"--akfc-h1": "2em", "--akfc-h2": "1.5em", "--akfc-h3": "1.25em", "--akfc-h4": "1.05em", "--akfc-h5": "1em", "--akfc-h6": "0.875em", "--akfc-leading": "1.2", "--akfc-measure": "68ch", "--akfc-base-max": "1.25rem", "--akfc-item-gap": "0.45rem", "--akfc-list-gap": "0.35em", "--akfc-para-gap": "0.5em", "--akfc-text-col": "7fr", "--akfc-media-col": "5fr", "--akfc-column-gap": "2.5rem", "--akfc-rule-width": "0px", "--akfc-heading-gap": "1.8em", "--akfc-list-indent": "1.5em", "--akfc-caption-size": "0.875rem", "--akfc-card-padding": "0.75rem", "--akfc-block-gap-max": "2.75rem", "--akfc-page-max-width": "68rem"}	2026-07-24 16:26:51.529	600	220
\.


--
-- Data for Name: Stage; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Stage" (id, "disciplineId", label, audience, description, program, "preRegistered", "primaryAnimatorId", "createdAt", "updatedAt", "externalDisciplineLabel", "originId", slug, "publicationDate", summary, "summaryMediaId") FROM stdin;
1	\N	Stage Bâton long	ADULTS	{"blocks": [{"id": "4870a2a8-73bf-449b-ad46-5128a0bf3696", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Description Stage", "type": "text"}]}]}}], "version": 1}	{"blocks": [{"id": "7f71ac0e-cce0-41a9-a77b-e282fa58383b", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Donner des coups de bâton", "type": "text"}]}]}}], "version": 1}	{}	cmp6s16gw0001i51z30km4p2o	2026-07-01 13:01:15.248	2026-07-01 13:01:15.248	stage tchoy-lee-fut	1	stage-baton-long	2026-07-01 13:01:11.947	{"blocks": [], "version": 1}	\N
2	1	Stage Taï-chi éventail	ADULTS	{"blocks": [{"id": "1a7f344b-acaa-4856-9e78-a09cb9454767", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Description stage", "type": "text"}]}]}}], "version": 1}	{"blocks": [], "version": 1}	{}	cmp6s16gw0001i51z30km4p2o	2026-07-01 13:12:11.258	2026-08-21 03:28:12.755	\N	1	stage-tai-chi-eventail	\N	{"blocks": [], "version": 1}	\N
\.


--
-- Data for Name: StageSession; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."StageSession" (id, "stageId", date, "beginTime", "endTime", location, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrashEntry; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."TrashEntry" (id, "appRoot", kind, status, "displayName", "previousPath", "storageRoot", "trashedAt", "restoredAt", "restoredToPath", "deletedAt", "sizeBytes", "cloudinaryCreatedAt", "mediaKind") FROM stdin;
9919fd22-f244-4a62-a6b9-e3d384ddb3d8	AKFC	folder	DELETED	dabakwondo	AKFC/published/dabakwondo	AKFC/bin/.trash/9919fd22-f244-4a62-a6b9-e3d384ddb3d8/dabakwondo	2026-06-21 09:23:22.839	\N	\N	2026-06-21 22:47:49.249	\N	\N	\N
a99e5c25-d7e0-4bf4-bc15-096d38a3481c	AKFC	folder	DELETED	dabakwondo	AKFC/published/cours/tchoy-lee-fut/dabakwondo	AKFC/bin/.trash/a99e5c25-d7e0-4bf4-bc15-096d38a3481c/dabakwondo	2026-06-24 11:17:45.902	\N	\N	2026-07-03 20:14:11.402	\N	\N	\N
50690c18-9128-42ad-b97f-b466da795ceb	AKFC	folder	DELETED	3	AKFC/pending/cours/3	AKFC/bin/.trash/50690c18-9128-42ad-b97f-b466da795ceb/3	2026-07-03 19:38:19.562	\N	\N	2026-07-03 20:14:12.117	\N	\N	\N
92e7baf4-4018-4ccf-98a1-002ad464e1f8	AKFC	folder	DELETED	taolu-multi-styles	AKFC/pending/taolu-multi-styles	AKFC/bin/.trash/92e7baf4-4018-4ccf-98a1-002ad464e1f8/taolu-multi-styles	2026-07-03 20:13:46.025	\N	\N	2026-07-03 20:14:12.827	\N	\N	\N
15117127-7577-4772-82ca-0c19d580ad5d	AKFC	folder	DELETED	taolu-multi-styles	AKFC/pending/cours/taolu-multi-styles	AKFC/bin/.trash/15117127-7577-4772-82ca-0c19d580ad5d/taolu-multi-styles	2026-07-04 20:01:48.589	\N	\N	2026-07-04 20:44:20.947	\N	\N	\N
efab4e48-0bd7-4859-8a10-d46e448ce673	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/efab4e48-0bd7-4859-8a10-d46e448ce673/cours	2026-07-04 20:43:40.744	\N	\N	2026-07-04 20:44:21.51	\N	\N	\N
5ff5b17c-df32-4382-801e-e79a41834c6f	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/5ff5b17c-df32-4382-801e-e79a41834c6f/cours	2026-07-04 21:00:56.675	\N	\N	2026-07-04 21:01:09.483	\N	\N	\N
4da97397-f38d-4a8f-9c66-1a4eb2794270	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/4da97397-f38d-4a8f-9c66-1a4eb2794270/cours	2026-07-04 21:08:55.259	\N	\N	2026-07-04 21:09:07.002	\N	\N	\N
f8ae53b2-63f5-429e-8f5e-cc51cfbad03c	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/f8ae53b2-63f5-429e-8f5e-cc51cfbad03c/cours	2026-07-04 21:14:07.062	\N	\N	2026-07-05 01:31:08.977	\N	\N	\N
f3d1219d-d897-41f3-bda0-6dbec9bb7205	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/f3d1219d-d897-41f3-bda0-6dbec9bb7205/cours	2026-07-04 21:15:11.545	\N	\N	2026-07-05 01:31:09.58	\N	\N	\N
12ad7384-d6dc-4162-809a-c801d20d2660	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/12ad7384-d6dc-4162-809a-c801d20d2660/cours	2026-07-05 01:30:51.45	\N	\N	2026-07-05 01:31:10.121	\N	\N	\N
25a83196-0d0e-4b23-a7ee-926751da6aac	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/25a83196-0d0e-4b23-a7ee-926751da6aac/cours	2026-07-05 02:06:28.501	\N	\N	2026-07-05 02:06:43.601	\N	\N	\N
d789ee78-8b51-4d1b-a692-da45ce3e222a	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/d789ee78-8b51-4d1b-a692-da45ce3e222a/cours	2026-07-06 05:48:24.007	\N	\N	2026-07-06 05:48:35.202	\N	\N	\N
963bbfd0-ac48-4a6d-acc8-606510f0c920	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/963bbfd0-ac48-4a6d-acc8-606510f0c920/cours	2026-07-06 05:57:53.692	\N	\N	2026-07-06 05:58:06.769	\N	\N	\N
f868f4d1-d59d-420f-a378-fa15ed4e40cd	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/f868f4d1-d59d-420f-a378-fa15ed4e40cd/cours	2026-07-06 11:28:42.171	\N	\N	2026-07-06 11:28:58.659	\N	\N	\N
59430804-addd-4b5d-9efd-223d4b4feb6d	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/59430804-addd-4b5d-9efd-223d4b4feb6d/cours	2026-07-06 12:06:21.628	\N	\N	2026-07-06 12:06:33.019	\N	\N	\N
11ad4d31-d5da-44fd-9306-e48cd67eaffc	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/11ad4d31-d5da-44fd-9306-e48cd67eaffc/cours	2026-07-06 12:13:32.649	\N	\N	2026-07-06 12:14:35.133	\N	\N	\N
85a56d3c-77c4-4b9f-8b0e-ffa9640e9a3f	AKFC	folder	DELETED	cours	AKFC/pending/cours	AKFC/bin/.trash/85a56d3c-77c4-4b9f-8b0e-ffa9640e9a3f/cours	2026-07-06 12:14:22.088	\N	\N	2026-07-06 12:14:35.762	\N	\N	\N
628bb8e1-3f63-43a7-bb04-19875dda7cdf	AKFC	file	RESTORED	1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	AKFC/published/cours/taolu-multi-styles/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	AKFC/bin/.trash/628bb8e1-3f63-43a7-bb04-19875dda7cdf/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	2026-07-16 23:16:37.822	2026-07-16 23:17:04.925	AKFC/published/cours/taolu-multi-styles/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	\N	1756407	2026-06-13 06:01:53	image
e86ca3af-0942-4069-a860-428d6cebdd6b	AKFC	file	RESTORED	1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	AKFC/published/cours/taolu-multi-styles/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	AKFC/bin/.trash/e86ca3af-0942-4069-a860-428d6cebdd6b/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	2026-07-16 23:17:21.719	2026-07-16 23:17:34.996	AKFC/published/cours/taolu-multi-styles/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de	\N	1756407	2026-06-13 06:01:53	image
3fc77189-eed3-4171-9078-26167adf0583	AKFC	file	RESTORED	stage-Kung-fu	AKFC/published/cours/taolu-multi-styles/stage-Kung-fu	AKFC/bin/.trash/3fc77189-eed3-4171-9078-26167adf0583/stage-Kung-fu	2026-07-17 16:11:24.554	2026-07-17 16:11:53.438	AKFC/published/cours/taolu-multi-styles/stage-Kung-fu	\N	177696	2026-06-13 06:01:53	image
c026efbb-654c-474f-856a-98695659f924	AKFC	folder	DELETED	zarak-eye-cmtg7bkn400067us7jco206eq	AKFC/common_repository/zarak-eye-cmtg7bkn400067us7jco206eq	AKFC/bin/.trash/c026efbb-654c-474f-856a-98695659f924/zarak-eye-cmtg7bkn400067us7jco206eq	2026-09-03 01:59:49.414	\N	\N	2026-09-04 21:26:48.241	117835	2026-09-02 17:01:11	\N
c0c7daa9-3688-429b-9244-5ee101fa2e57	AKFC	folder	DELETED	stage-baton-long_zarak-eye-cmtg7bkn400067us7jco206eq	AKFC/common_repository/stage-baton-long_zarak-eye-cmtg7bkn400067us7jco206eq	AKFC/bin/.trash/c0c7daa9-3688-429b-9244-5ee101fa2e57/stage-baton-long_zarak-eye-cmtg7bkn400067us7jco206eq	2026-09-04 06:11:01.249	\N	\N	2026-09-04 21:26:49.269	8341	2026-09-03 02:01:18	\N
cd2344d0-4287-46ba-9790-1a941ded8ef9	AKFC	folder	DELETED	groups	AKFC/groups	AKFC/bin/.trash/cd2344d0-4287-46ba-9790-1a941ded8ef9/groups	2026-09-06 04:51:18.637	\N	\N	2026-09-06 04:51:31.472	\N	\N	\N
1096cbd8-3c11-4049-8449-ae7ec97c2ade	AKFC	folder	DELETED	groups	AKFC/groups	AKFC/bin/.trash/1096cbd8-3c11-4049-8449-ae7ec97c2ade/groups	2026-09-06 05:11:00.24	\N	\N	2026-09-06 05:11:39.959	\N	\N	\N
7d570157-0e2b-4fb9-878c-65435cf73bdb	AKFC	folder	DELETED	groups	AKFC/groups	AKFC/bin/.trash/7d570157-0e2b-4fb9-878c-65435cf73bdb/groups	2026-09-06 13:22:03.957	\N	\N	2026-09-06 13:54:33.751	\N	\N	\N
8dbe84ee-e1fb-4b12-aecf-71415e076702	AKFC	folder	DELETED	groups	AKFC/groups	AKFC/bin/.trash/8dbe84ee-e1fb-4b12-aecf-71415e076702/groups	2026-09-06 13:32:24.045	\N	\N	2026-09-06 13:54:34.556	\N	\N	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."User" (id, "firstName", "lastName", email, "emailVerified", password, "birthDate", phone, image, "memberSince", "isFirstLogin", "createdAt", "updatedAt", "aboutMe", pseudo, avatar, "instructorBio", "instructorOrder") FROM stdin;
cmpjg0j1d0000gsp7o0fkcsby	Legacy	Import	legacy-import@akfc.internal	f	legacy-import-no-login-0.c5eyanaqzcr	\N	\N	\N	\N	f	2026-05-24 07:15:24.385	2026-05-24 07:15:24.385	\N	Legacy Import	\N	\N	\N
cmrtr3wg100012ge38qek9lg0	\N	\N	eugenie.maguy@gmail.com	f	$2b$12$GO67Da9HgRcrXPQ0fyWpXeJeCO0AhibQKkXVsKKnANesv1jQJuWOO	\N	\N	\N	\N	t	2026-07-20 21:43:03.937	2026-07-20 21:43:03.937	\N	\N	\N	\N	\N
cmp6s16gw0001i51z30km4p2o	Stéphane	BAZZÉ	stephane.bazze@outlook.fr	t	$2b$12$3eQJzb3iQZZfLS8kG2oWFeeE5JSWWY/MFzw.NRG8BuYUxOCujLLTi	1981-10-15 00:00:00	06 69 98 91 94	\N	\N	f	2026-05-15 10:30:49.857	2026-07-29 16:55:33.998	Le dev	Zarakeye	AKFC/avatars/cmp6s16gw0001i51z30km4p2o/1783632017666-8bd01c	{"blocks": [{"id": "a026490c-1b0c-456f-b44b-94e94e9f925e", "side": "left", "type": "float-text", "media": {"kind": "avatar", "userId": "cmp6s16gw0001i51z30km4p2o"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porttitor fringilla urna, eget auctor nunc varius vitae. Nulla tempor sem massa, sit amet placerat tellus aliquet sit amet. Phasellus ultrices fermentum elementum. Nunc mauris justo, pellentesque nec libero ac, vulputate semper turpis. Proin libero risus, varius non auctor in, ullamcorper eget justo. Donec aliquam lacus eget neque egestas, id ornare nisl accumsan. In dapibus leo enim, at varius tellus auctor a. Aliquam feugiat, magna sed scelerisque imperdiet, justo nulla bibendum leo, in bibendum nisl nisi ut mauris. Nulla vel eleifend eros.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Nunc a eleifend massa. Morbi magna neque, congue id pretium non, aliquet ut leo. Praesent ut volutpat risus. Pellentesque vel est sit amet sem posuere aliquam. Maecenas posuere varius cursus. Quisque aliquam metus vel faucibus egestas. Morbi id urna at magna blandit pulvinar ut id ipsum. Aliquam in vulputate eros. Etiam sit amet lectus urna. Sed varius erat eu laoreet euismod.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Donec tristique laoreet blandit. Aliquam suscipit, nibh ac tincidunt fermentum, nisl metus feugiat lacus, at tincidunt augue lorem sed nibh. Ut hendrerit, lectus ac consequat consequat, enim neque facilisis urna, ut rhoncus est sem vel nisl. Vestibulum iaculis diam nisl, vitae porta nunc lacinia non. Curabitur rhoncus ligula vel ante pretium sodales. Etiam aliquet, ante non pulvinar elementum, augue nulla iaculis orci, sagittis pretium lectus turpis et eros. Nullam ante nisi, semper non ullamcorper sed, condimentum vel urna. Proin eu venenatis eros.", "type": "text"}]}]}}], "version": 1}	\N
cmtg7bkn400067us7jco206eq	Zarak	Eye	stephane.bazze@gmail.com	f	$2b$12$Lq9lh7nJeuZHTHWqzKGWIeunB94vj5iC8TevDG72bi7o.RtjGFo8i	1981-10-15 00:00:00	0615401908	\N	\N	f	2026-08-30 19:27:33.953	2026-08-30 19:34:14.213	Coup d'essai	Zarakeye	AKFC/avatars/cmtg7bkn400067us7jco206eq/1788118440227-b87892	\N	\N
\.


--
-- Data for Name: Verification; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Verification" (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _StageAnimators; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."_StageAnimators" ("A", "B") FROM stdin;
1	cmp6s16gw0001i51z30km4p2o
2	cmp6s16gw0001i51z30km4p2o
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b86c13ca-a2d3-4962-930a-e07e740ce158	f8ddb62cbfc88100b755de44f79ddb242ac56f57ef5ca43edaf63829a925a9b5	2026-08-31 03:25:01.56207+02	20261101010000_fix_mediaasset_fk	\N	\N	2026-08-31 03:25:01.48498+02	1
c9fc22a6-af37-4dcb-b6fd-d8bfc00c1625	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2026-08-31 03:27:42.500689+02	20260831012611_check_baseline	\N	\N	2026-08-31 03:27:42.475103+02	1
91a78d60-09b3-4d09-a396-7848094fd0f0	ee009124452e155e65b124c8423d226ddbc23c8d41643cfcb1a7b6413c829b0f	2026-09-04 06:39:45.655517+02	20261101120000_add_common_repository_label		\N	2026-09-04 06:39:45.655517+02	0
b9910414-997e-4e1c-b808-e42dd6b4ccb1	d3d23bd2d1e2dec6323fd71efc856eb84d2770be62298744ef2dc192b86cf8e9	2026-08-31 03:21:37.443368+02	0_init		\N	2026-08-31 03:21:37.443368+02	0
\.


--
-- Name: BreakingNews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."BreakingNews_id_seq"', 3, true);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Category_id_seq"', 4, true);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 2, true);


--
-- Name: Course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Course_id_seq"', 4, true);


--
-- Name: DisciplineFamily_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."DisciplineFamily_id_seq"', 3, true);


--
-- Name: Discipline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Discipline_id_seq"', 4, true);


--
-- Name: EventSession_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."EventSession_id_seq"', 1, false);


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Event_id_seq"', 1, false);


--
-- Name: GalleryItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."GalleryItem_id_seq"', 29, true);


--
-- Name: Gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Gallery_id_seq"', 3, true);


--
-- Name: Origin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Origin_id_seq"', 2, true);


--
-- Name: PollOption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."PollOption_id_seq"', 3, true);


--
-- Name: PollVote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."PollVote_id_seq"', 1, false);


--
-- Name: Poll_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Poll_id_seq"', 1, true);


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Post_id_seq"', 1, true);


--
-- Name: Preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Preferences_id_seq"', 1, false);


--
-- Name: Reaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Reaction_id_seq"', 1, true);


--
-- Name: StageSession_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."StageSession_id_seq"', 1, false);


--
-- Name: Stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Stage_id_seq"', 2, true);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BreakingNews BreakingNews_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."BreakingNews"
    ADD CONSTRAINT "BreakingNews_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: CloudinaryFolder CloudinaryFolder_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."CloudinaryFolder"
    ADD CONSTRAINT "CloudinaryFolder_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: DisciplineFamily DisciplineFamily_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."DisciplineFamily"
    ADD CONSTRAINT "DisciplineFamily_pkey" PRIMARY KEY (id);


--
-- Name: Discipline Discipline_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_pkey" PRIMARY KEY (id);


--
-- Name: DocumentReceipt DocumentReceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."DocumentReceipt"
    ADD CONSTRAINT "DocumentReceipt_pkey" PRIMARY KEY (id);


--
-- Name: EventDiscipline EventDiscipline_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_pkey" PRIMARY KEY ("eventId", "disciplineId");


--
-- Name: EventSession EventSession_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."EventSession"
    ADD CONSTRAINT "EventSession_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: FolderLabel FolderLabel_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."FolderLabel"
    ADD CONSTRAINT "FolderLabel_pkey" PRIMARY KEY (path);


--
-- Name: GalleryItem GalleryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."GalleryItem"
    ADD CONSTRAINT "GalleryItem_pkey" PRIMARY KEY (id);


--
-- Name: Gallery Gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_pkey" PRIMARY KEY (id);


--
-- Name: HomeHero HomeHero_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."HomeHero"
    ADD CONSTRAINT "HomeHero_pkey" PRIMARY KEY (id);


--
-- Name: MediaAsset MediaAsset_fullPath_key; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_fullPath_key" UNIQUE ("fullPath");


--
-- Name: MediaAsset MediaAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_pkey" PRIMARY KEY (id);


--
-- Name: MemberDocumentGroup MemberDocumentGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocumentGroup"
    ADD CONSTRAINT "MemberDocumentGroup_pkey" PRIMARY KEY (id);


--
-- Name: MemberDocumentRecipient MemberDocumentRecipient_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocumentRecipient"
    ADD CONSTRAINT "MemberDocumentRecipient_pkey" PRIMARY KEY (id);


--
-- Name: MemberDocument MemberDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocument"
    ADD CONSTRAINT "MemberDocument_pkey" PRIMARY KEY (id);


--
-- Name: MemberGroupMembership MemberGroupMembership_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberGroupMembership"
    ADD CONSTRAINT "MemberGroupMembership_pkey" PRIMARY KEY (id);


--
-- Name: MemberGroup MemberGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberGroup"
    ADD CONSTRAINT "MemberGroup_pkey" PRIMARY KEY (id);


--
-- Name: Origin Origin_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Origin"
    ADD CONSTRAINT "Origin_pkey" PRIMARY KEY (id);


--
-- Name: PageMediaReference PageMediaReference_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PageMediaReference"
    ADD CONSTRAINT "PageMediaReference_pkey" PRIMARY KEY (id);


--
-- Name: PageVisibility PageVisibility_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PageVisibility"
    ADD CONSTRAINT "PageVisibility_pkey" PRIMARY KEY (key);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: PollOption PollOption_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollOption"
    ADD CONSTRAINT "PollOption_pkey" PRIMARY KEY (id);


--
-- Name: PollVote PollVote_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollVote"
    ADD CONSTRAINT "PollVote_pkey" PRIMARY KEY (id);


--
-- Name: Poll Poll_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "Poll_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: Preferences Preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Preferences"
    ADD CONSTRAINT "Preferences_pkey" PRIMARY KEY (id);


--
-- Name: Reaction Reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Reaction"
    ADD CONSTRAINT "Reaction_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SitePage SitePage_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."SitePage"
    ADD CONSTRAINT "SitePage_pkey" PRIMARY KEY (slug);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: SiteStyle SiteStyle_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."SiteStyle"
    ADD CONSTRAINT "SiteStyle_pkey" PRIMARY KEY (id);


--
-- Name: StageSession StageSession_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."StageSession"
    ADD CONSTRAINT "StageSession_pkey" PRIMARY KEY (id);


--
-- Name: Stage Stage_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Stage"
    ADD CONSTRAINT "Stage_pkey" PRIMARY KEY (id);


--
-- Name: TrashEntry TrashEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."TrashEntry"
    ADD CONSTRAINT "TrashEntry_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Verification Verification_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Verification"
    ADD CONSTRAINT "Verification_pkey" PRIMARY KEY (id);


--
-- Name: _StageAnimators _StageAnimators_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."_StageAnimators"
    ADD CONSTRAINT "_StageAnimators_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_action_createdAt_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "AuditLog_action_createdAt_idx" ON public."AuditLog" USING btree (action, "createdAt");


--
-- Name: AuditLog_actorUserId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "AuditLog_actorUserId_idx" ON public."AuditLog" USING btree ("actorUserId");


--
-- Name: AuditLog_targetUserId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "AuditLog_targetUserId_idx" ON public."AuditLog" USING btree ("targetUserId");


--
-- Name: BreakingNews_publicationDate_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "BreakingNews_publicationDate_idx" ON public."BreakingNews" USING btree ("publicationDate");


--
-- Name: Category_type_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Category_type_key" ON public."Category" USING btree (type);


--
-- Name: CloudinaryFolder_appRoot_fullPath_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "CloudinaryFolder_appRoot_fullPath_key" ON public."CloudinaryFolder" USING btree ("appRoot", "fullPath");


--
-- Name: CloudinaryFolder_appRoot_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "CloudinaryFolder_appRoot_idx" ON public."CloudinaryFolder" USING btree ("appRoot");


--
-- Name: CloudinaryFolder_appRoot_status_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "CloudinaryFolder_appRoot_status_idx" ON public."CloudinaryFolder" USING btree ("appRoot", status);


--
-- Name: Comment_parentId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Comment_parentId_idx" ON public."Comment" USING btree ("parentId");


--
-- Name: Comment_postId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Comment_postId_idx" ON public."Comment" USING btree ("postId");


--
-- Name: Course_disciplineId_day_beginTime_audience_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Course_disciplineId_day_beginTime_audience_key" ON public."Course" USING btree ("disciplineId", day, "beginTime", audience);


--
-- Name: Course_disciplineId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Course_disciplineId_idx" ON public."Course" USING btree ("disciplineId");


--
-- Name: Course_instructorId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Course_instructorId_idx" ON public."Course" USING btree ("instructorId");


--
-- Name: DisciplineFamily_name_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "DisciplineFamily_name_key" ON public."DisciplineFamily" USING btree (name);


--
-- Name: DisciplineFamily_slug_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "DisciplineFamily_slug_key" ON public."DisciplineFamily" USING btree (slug);


--
-- Name: DisciplineFamily_sortOrder_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "DisciplineFamily_sortOrder_idx" ON public."DisciplineFamily" USING btree ("sortOrder");


--
-- Name: Discipline_categoryId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_categoryId_idx" ON public."Discipline" USING btree ("categoryId");


--
-- Name: Discipline_categoryId_name_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Discipline_categoryId_name_key" ON public."Discipline" USING btree ("categoryId", name);


--
-- Name: Discipline_familyId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_familyId_idx" ON public."Discipline" USING btree ("familyId");


--
-- Name: Discipline_instructorId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_instructorId_idx" ON public."Discipline" USING btree ("instructorId");


--
-- Name: Discipline_originId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_originId_idx" ON public."Discipline" USING btree ("originId");


--
-- Name: Discipline_slug_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Discipline_slug_key" ON public."Discipline" USING btree (slug);


--
-- Name: Discipline_type_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_type_idx" ON public."Discipline" USING btree (type);


--
-- Name: DocumentReceipt_memberDocumentId_userId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "DocumentReceipt_memberDocumentId_userId_key" ON public."DocumentReceipt" USING btree ("memberDocumentId", "userId");


--
-- Name: DocumentReceipt_userId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "DocumentReceipt_userId_idx" ON public."DocumentReceipt" USING btree ("userId");


--
-- Name: EventDiscipline_disciplineId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "EventDiscipline_disciplineId_idx" ON public."EventDiscipline" USING btree ("disciplineId");


--
-- Name: EventSession_date_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "EventSession_date_idx" ON public."EventSession" USING btree (date);


--
-- Name: EventSession_eventId_date_beginTime_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "EventSession_eventId_date_beginTime_key" ON public."EventSession" USING btree ("eventId", date, "beginTime");


--
-- Name: EventSession_eventId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "EventSession_eventId_idx" ON public."EventSession" USING btree ("eventId");


--
-- Name: Event_organizerId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Event_organizerId_idx" ON public."Event" USING btree ("organizerId");


--
-- Name: Event_originId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Event_originId_idx" ON public."Event" USING btree ("originId");


--
-- Name: Event_publicationDate_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Event_publicationDate_idx" ON public."Event" USING btree ("publicationDate");


--
-- Name: Event_slug_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Event_slug_key" ON public."Event" USING btree (slug);


--
-- Name: GalleryItem_galleryId_mediaAssetId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "GalleryItem_galleryId_mediaAssetId_key" ON public."GalleryItem" USING btree ("galleryId", "mediaAssetId");


--
-- Name: GalleryItem_galleryId_sortOrder_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "GalleryItem_galleryId_sortOrder_idx" ON public."GalleryItem" USING btree ("galleryId", "sortOrder");


--
-- Name: Gallery_date_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Gallery_date_idx" ON public."Gallery" USING btree (date);


--
-- Name: Gallery_slug_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Gallery_slug_key" ON public."Gallery" USING btree (slug);


--
-- Name: Gallery_sortOrder_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Gallery_sortOrder_idx" ON public."Gallery" USING btree ("sortOrder");


--
-- Name: MediaAsset_appRoot_fullPath_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_appRoot_fullPath_idx" ON public."MediaAsset" USING btree ("appRoot", "fullPath");


--
-- Name: MediaAsset_categoryId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_categoryId_idx" ON public."MediaAsset" USING btree ("categoryId");


--
-- Name: MediaAsset_cloudinaryAssetId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "MediaAsset_cloudinaryAssetId_key" ON public."MediaAsset" USING btree ("cloudinaryAssetId");


--
-- Name: MediaAsset_disciplineId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_disciplineId_idx" ON public."MediaAsset" USING btree ("disciplineId");


--
-- Name: MediaAsset_eventId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_eventId_idx" ON public."MediaAsset" USING btree ("eventId");


--
-- Name: MediaAsset_publicId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON public."MediaAsset" USING btree ("publicId");


--
-- Name: MediaAsset_status_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_status_idx" ON public."MediaAsset" USING btree (status);


--
-- Name: MediaAsset_uploadedAt_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_uploadedAt_idx" ON public."MediaAsset" USING btree ("uploadedAt");


--
-- Name: MediaAsset_uploaderUserId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_uploaderUserId_idx" ON public."MediaAsset" USING btree ("uploaderUserId");


--
-- Name: MemberDocumentGroup_groupId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MemberDocumentGroup_groupId_idx" ON public."MemberDocumentGroup" USING btree ("groupId");


--
-- Name: MemberDocumentGroup_memberDocumentId_groupId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "MemberDocumentGroup_memberDocumentId_groupId_key" ON public."MemberDocumentGroup" USING btree ("memberDocumentId", "groupId");


--
-- Name: MemberDocumentRecipient_memberDocumentId_userId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "MemberDocumentRecipient_memberDocumentId_userId_key" ON public."MemberDocumentRecipient" USING btree ("memberDocumentId", "userId");


--
-- Name: MemberDocumentRecipient_userId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MemberDocumentRecipient_userId_idx" ON public."MemberDocumentRecipient" USING btree ("userId");


--
-- Name: MemberDocument_audience_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MemberDocument_audience_idx" ON public."MemberDocument" USING btree (audience);


--
-- Name: MemberDocument_mediaAssetId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "MemberDocument_mediaAssetId_key" ON public."MemberDocument" USING btree ("mediaAssetId");


--
-- Name: MemberGroupMembership_groupId_userId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "MemberGroupMembership_groupId_userId_key" ON public."MemberGroupMembership" USING btree ("groupId", "userId");


--
-- Name: MemberGroupMembership_userId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MemberGroupMembership_userId_idx" ON public."MemberGroupMembership" USING btree ("userId");


--
-- Name: MemberGroup_parentGroupId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MemberGroup_parentGroupId_idx" ON public."MemberGroup" USING btree ("parentGroupId");


--
-- Name: Origin_name_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Origin_name_key" ON public."Origin" USING btree (name);


--
-- Name: Origin_slug_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Origin_slug_key" ON public."Origin" USING btree (slug);


--
-- Name: Origin_sortOrder_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Origin_sortOrder_idx" ON public."Origin" USING btree ("sortOrder");


--
-- Name: PageMediaReference_mediaAssetId_pageType_pageId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "PageMediaReference_mediaAssetId_pageType_pageId_key" ON public."PageMediaReference" USING btree ("mediaAssetId", "pageType", "pageId");


--
-- Name: PageMediaReference_pageType_pageId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "PageMediaReference_pageType_pageId_idx" ON public."PageMediaReference" USING btree ("pageType", "pageId");


--
-- Name: PasswordResetToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "PasswordResetToken_expiresAt_idx" ON public."PasswordResetToken" USING btree ("expiresAt");


--
-- Name: PasswordResetToken_tokenHash_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON public."PasswordResetToken" USING btree ("tokenHash");


--
-- Name: PasswordResetToken_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON public."PasswordResetToken" USING btree ("userId", "createdAt");


--
-- Name: PollOption_pollId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "PollOption_pollId_idx" ON public."PollOption" USING btree ("pollId");


--
-- Name: PollVote_optionId_userId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "PollVote_optionId_userId_key" ON public."PollVote" USING btree ("optionId", "userId");


--
-- Name: PollVote_pollId_userId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "PollVote_pollId_userId_idx" ON public."PollVote" USING btree ("pollId", "userId");


--
-- Name: Poll_postId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Poll_postId_key" ON public."Poll" USING btree ("postId");


--
-- Name: Post_publicationDate_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Post_publicationDate_idx" ON public."Post" USING btree ("publicationDate");


--
-- Name: Preferences_userId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Preferences_userId_key" ON public."Preferences" USING btree ("userId");


--
-- Name: Reaction_targetType_targetId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Reaction_targetType_targetId_idx" ON public."Reaction" USING btree ("targetType", "targetId");


--
-- Name: Reaction_userId_targetType_targetId_emoji_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Reaction_userId_targetType_targetId_emoji_key" ON public."Reaction" USING btree ("userId", "targetType", "targetId", emoji);


--
-- Name: StageSession_date_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "StageSession_date_idx" ON public."StageSession" USING btree (date);


--
-- Name: StageSession_stageId_date_beginTime_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "StageSession_stageId_date_beginTime_key" ON public."StageSession" USING btree ("stageId", date, "beginTime");


--
-- Name: StageSession_stageId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "StageSession_stageId_idx" ON public."StageSession" USING btree ("stageId");


--
-- Name: Stage_disciplineId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Stage_disciplineId_idx" ON public."Stage" USING btree ("disciplineId");


--
-- Name: Stage_disciplineId_label_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Stage_disciplineId_label_key" ON public."Stage" USING btree ("disciplineId", label);


--
-- Name: Stage_originId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Stage_originId_idx" ON public."Stage" USING btree ("originId");


--
-- Name: Stage_primaryAnimatorId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Stage_primaryAnimatorId_idx" ON public."Stage" USING btree ("primaryAnimatorId");


--
-- Name: Stage_publicationDate_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Stage_publicationDate_idx" ON public."Stage" USING btree ("publicationDate");


--
-- Name: Stage_slug_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Stage_slug_key" ON public."Stage" USING btree (slug);


--
-- Name: TrashEntry_appRoot_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "TrashEntry_appRoot_idx" ON public."TrashEntry" USING btree ("appRoot");


--
-- Name: TrashEntry_appRoot_kind_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "TrashEntry_appRoot_kind_idx" ON public."TrashEntry" USING btree ("appRoot", kind);


--
-- Name: TrashEntry_appRoot_previousPath_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "TrashEntry_appRoot_previousPath_idx" ON public."TrashEntry" USING btree ("appRoot", "previousPath");


--
-- Name: TrashEntry_appRoot_status_trashedAt_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "TrashEntry_appRoot_status_trashedAt_idx" ON public."TrashEntry" USING btree ("appRoot", status, "trashedAt");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _StageAnimators_B_index; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "_StageAnimators_B_index" ON public."_StageAnimators" USING btree ("B");


--
-- Name: AuditLog AuditLog_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_targetUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Comment Comment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."Discipline"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Course Course_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Discipline Discipline_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Discipline Discipline_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."DisciplineFamily"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Discipline Discipline_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Discipline Discipline_originId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_originId_fkey" FOREIGN KEY ("originId") REFERENCES public."Origin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DocumentReceipt DocumentReceipt_memberDocumentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."DocumentReceipt"
    ADD CONSTRAINT "DocumentReceipt_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES public."MemberDocument"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DocumentReceipt DocumentReceipt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."DocumentReceipt"
    ADD CONSTRAINT "DocumentReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventDiscipline EventDiscipline_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."Discipline"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventDiscipline EventDiscipline_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventSession EventSession_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."EventSession"
    ADD CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Event Event_organizerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_originId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_originId_fkey" FOREIGN KEY ("originId") REFERENCES public."Origin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GalleryItem GalleryItem_galleryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."GalleryItem"
    ADD CONSTRAINT "GalleryItem_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES public."Gallery"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GalleryItem GalleryItem_mediaAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."GalleryItem"
    ADD CONSTRAINT "GalleryItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES public."MediaAsset"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Gallery Gallery_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Gallery Gallery_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."Discipline"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Gallery Gallery_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Gallery Gallery_originId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_originId_fkey" FOREIGN KEY ("originId") REFERENCES public."Origin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Gallery Gallery_stageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES public."Stage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MediaAsset MediaAsset_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MediaAsset MediaAsset_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."Discipline"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MediaAsset MediaAsset_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MediaAsset MediaAsset_uploaderUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MemberDocumentGroup MemberDocumentGroup_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocumentGroup"
    ADD CONSTRAINT "MemberDocumentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."MemberGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDocumentGroup MemberDocumentGroup_memberDocumentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocumentGroup"
    ADD CONSTRAINT "MemberDocumentGroup_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES public."MemberDocument"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDocumentRecipient MemberDocumentRecipient_memberDocumentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocumentRecipient"
    ADD CONSTRAINT "MemberDocumentRecipient_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES public."MemberDocument"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDocumentRecipient MemberDocumentRecipient_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocumentRecipient"
    ADD CONSTRAINT "MemberDocumentRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDocument MemberDocument_mediaAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocument"
    ADD CONSTRAINT "MemberDocument_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES public."MediaAsset"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDocument MemberDocument_publishedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberDocument"
    ADD CONSTRAINT "MemberDocument_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MemberGroupMembership MemberGroupMembership_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberGroupMembership"
    ADD CONSTRAINT "MemberGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."MemberGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberGroupMembership MemberGroupMembership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberGroupMembership"
    ADD CONSTRAINT "MemberGroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberGroup MemberGroup_parentGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MemberGroup"
    ADD CONSTRAINT "MemberGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES public."MemberGroup"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PageMediaReference PageMediaReference_mediaAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PageMediaReference"
    ADD CONSTRAINT "PageMediaReference_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES public."MediaAsset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PollOption PollOption_pollId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollOption"
    ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES public."Poll"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PollVote PollVote_optionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollVote"
    ADD CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES public."PollOption"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PollVote PollVote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PollVote"
    ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Poll Poll_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "Poll_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Preferences Preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Preferences"
    ADD CONSTRAINT "Preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reaction Reaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Reaction"
    ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StageSession StageSession_stageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."StageSession"
    ADD CONSTRAINT "StageSession_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES public."Stage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Stage Stage_disciplineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Stage"
    ADD CONSTRAINT "Stage_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."Discipline"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Stage Stage_originId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Stage"
    ADD CONSTRAINT "Stage_originId_fkey" FOREIGN KEY ("originId") REFERENCES public."Origin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Stage Stage_primaryAnimatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Stage"
    ADD CONSTRAINT "Stage_primaryAnimatorId_fkey" FOREIGN KEY ("primaryAnimatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _StageAnimators _StageAnimators_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."_StageAnimators"
    ADD CONSTRAINT "_StageAnimators_A_fkey" FOREIGN KEY ("A") REFERENCES public."Stage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _StageAnimators _StageAnimators_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."_StageAnimators"
    ADD CONSTRAINT "_StageAnimators_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ybr2uNOmIwpUfCVXgbagk8pAGcWqmQp5iFWIzx5EQA68gKEaM7ZNltPqtwIpeRV

