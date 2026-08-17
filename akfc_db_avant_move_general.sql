--
-- PostgreSQL database dump
--

\restrict 5l3qdd1bkK803HovYJp5ZgAyJhi3uzgzZyoSj5hMf9FKhRwepcgcSQXZNqPOGyi

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
    "summaryMediaId" text
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
    "isAdminGroup" boolean DEFAULT false NOT NULL
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
-- Name: Permission; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Permission" (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."Permission" OWNER TO akfc;

--
-- Name: Permission_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Permission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Permission_id_seq" OWNER TO akfc;

--
-- Name: Permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Permission_id_seq" OWNED BY public."Permission".id;


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
-- Name: Role; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Role" (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."Role" OWNER TO akfc;

--
-- Name: RolePermissions; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."RolePermissions" (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public."RolePermissions" OWNER TO akfc;

--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Role_id_seq" OWNER TO akfc;

--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


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
    "roleId" integer,
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
-- Name: Permission id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Permission" ALTER COLUMN id SET DEFAULT nextval('public."Permission_id_seq"'::regclass);


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
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


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
2	Stage
4	General
3	Event
\.


--
-- Data for Name: CloudinaryFolder; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."CloudinaryFolder" (id, "appRoot", "fullPath", status, "createdAt", "updatedAt") FROM stdin;
cmp6s16mf0004i51zv6j9ltbj	AKFC	AKFC/bin	bin	2026-05-15 10:30:50.055	2026-05-15 10:30:50.055
cmpdtrf9g0002gpovbgguspq9	AKFC	AKFC	pending	2026-05-20 08:53:37.157	2026-07-17 16:11:51.923
cmrsdme8200005tow97ffdc4p	AKFC	AKFC/cours	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300025tow23e1lf6d	AKFC	AKFC/cours/kali-escrima	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300035tow6zylkl9s	AKFC	AKFC/cours/taolu-multi-styles	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300045towqq39g7cm	AKFC	AKFC/cours/tchoy-lee-fut	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300055tow0tpo92lc	AKFC	AKFC/persos	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300065towm4bayuew	AKFC	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300075towrqp69s6t	AKFC	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cmrsdme8300015tow7rr4zg4p	AKFC	AKFC/cours/Taïchi Chuan	pending	2026-07-19 22:37:45.986	2026-07-19 22:37:45.986
cms7r04ue00022gswuy8yfzo1	AKFC	AKFC/general	pending	2026-07-30 16:48:54.662	2026-07-30 16:48:54.662
cmstj1tgs00007upoltk9tykv	AKFC	AKFC/groups	published	2026-08-14 22:37:12.173	2026-08-14 22:37:12.173
cmstj1thm00017upoxjob9lqh	AKFC	AKFC/groups/bureau-cmst5hqdt00007u2l4otzfk7y	published	2026-08-14 22:37:12.202	2026-08-14 22:37:12.202
cmsuuaypl00067unkn2c8vszf	AKFC	AKFC/groups/administrateurs-cmsuuayos00027unk2tkok95v	published	2026-08-15 20:40:00.826	2026-08-15 20:40:00.826
cmrev81ea00007um5jsclsc0e	AKFC	AKFC/avatars	pending	2026-07-10 11:41:42.803	2026-07-10 11:41:42.803
cmrev81eb00017um50n7ksb31	AKFC	AKFC/avatars/cmp6s16gw0001i51z30km4p2o	pending	2026-07-10 11:41:42.803	2026-07-10 11:41:42.803
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

COPY public."Discipline" (id, name, type, school, classification, "categoryId", "instructorId", "createdAt", "updatedAt", "originId", description, "familyId", slug, summary, "summaryMediaId") FROM stdin;
1	Taï-chi	MARTIAL_ART	Chen	interne (yin)	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.062	2026-06-04 09:40:56.653	\N	{"blocks": [], "version": 1}	1	tai-chi	{"blocks": [], "version": 1}	\N
2	Taolu multi-styles	MARTIAL_ART	\N	\N	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.171	2026-06-04 09:40:56.659	\N	{"blocks": [], "version": 1}	1	taolu-multi-styles	{"blocks": [], "version": 1}	\N
3	Tchoy-Lee-Fut	MARTIAL_ART	\N	externe (yang)	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.174	2026-07-22 20:48:20.761	\N	{"blocks": [{"id": "064faff8-5489-4a20-ac9f-7bbdd83f2c81", "type": "media-text", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le Tchoy Lee Fut est un art martial chinois puissant, fluide et explosif, réputé pour son efficacité en combat et la richesse de ses techniques.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Les cours du mercredi et du vendredi sont orientés vers le combat, avec une alternance entre cours traditionnels (taolu, techniques, applications) et cours de boxe (sparring, réactivité, créativité).", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Chaque séance commence par une préparation physique et se termine par un temps d’étirements pour favoriser la progression et le bien‑être.", "type": "text"}]}]}}, {"id": "fc22f1c3-5a45-4458-9df9-a00a643dfcd1", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsbohno000o5tb270madpo4"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "⚔️ Objectifs et bienfaits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développer une maîtrise technique solide grâce aux taolus traditionnels", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Renforcer la puissance, la vitesse et la coordination", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Améliorer la réactivité, la créativité et la prise de décision en combat", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Comprendre la logique martiale des mouvements et leur application réelle", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développer la confiance en soi, le self‑control et la gestion du stress", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travailler le corps complet : mobilité, explosivité, endurance, précision", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "94864a6e-aba8-4a8a-b110-802e29ca57fd", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsboh9l000k5tb26el696q7"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🥋 Structure des cours", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔸 Cours traditionnels (Taolu & Techniques)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le taolu est le terreau de l’apprentissage :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail des formes traditionnelles du Tchoy Lee Fut", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Décomposition des mouvements pour comprendre la mécanique et l’intention", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exercices seuls, à deux ou en groupe pour travailler des aspects précis :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "trajectoires circulaires", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "puissance des hanches", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "déplacements", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "timing et coordination", "type": "text"}]}]}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Applications martiales pour relier le taolu au combat réel", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔸 Cours de boxe (Combat & Sparring)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Un entraînement orienté mise en pratique réaliste, mais toujours codifié pour un apprentissage progressif :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail des frappes, esquives, déplacements et combinaisons", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exercices de réactivité et de créativité en situation dynamique", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Sparring contrôlé, adapté au niveau de chacun", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développement du timing, de la distance et de la lecture de l’adversaire", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Construction d’une attitude martiale solide, mais respectueuse et sécurisée", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "f4762ba0-14e5-4157-a319-26d543cbd172", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsbohwc000q5tb2c20rv70u"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💪 Préparation physique & étirements", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Chaque cours inclut :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Une préparation physique ciblée (gainage, explosivité, mobilité, cardio)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Un retour au calme avec étirements pour favoriser la récupération, la souplesse et la prévention des blessures", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "6d9d0217-5ebe-493d-9bf7-1094a47f71d2", "type": "media-text", "media": {"kind": "library", "mediaId": "cmrsbojh300125tb2c82hb224"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🤝 L’esprit du club", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Les valeurs restent les mêmes, quel que soit le cours :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Convivialité : un cadre chaleureux où chacun progresse à son rythme", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bienveillance : sécurité, respect et écoute sont prioritaires", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Entraide : les pratiquants se soutiennent et s’accompagnent dans leur progression", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le Tchoy Lee Fut est ici enseigné comme un art martial complet, où la technique nourrit le combat, et où le combat révèle la technique — toujours dans un environnement sain, motivant et respectueux.", "type": "text"}]}]}}], "version": 1}	1	tchoy-lee-fut	{"blocks": [], "version": 1}	\N
4	Kali Escrima	MARTIAL_ART	\N	\N	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.176	2026-07-30 11:52:29.925	2	{"blocks": [{"id": "17d0f8cc-3422-40b4-9422-3fef002838a6", "type": "media-text", "media": {"kind": "avatar", "userId": "cmp6s16gw0001i51z30km4p2o"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le ", "type": "text"}, {"text": "Kali", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", art martial philippin, est une discipline complète qui développe à la fois le corps, l’esprit et la confiance en soi. Chaque jeudi de ", "type": "text"}, {"text": "20h à 22h", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", le club ouvre un espace d’apprentissage dynamique, accessible à tous, où la progression se fait dans la convivialité et la bienveillance.", "type": "text"}]}]}}, {"id": "075592e2-2fe7-4a02-aa7f-cd8e9091d2f4", "type": "media-text", "media": {"kind": "library", "mediaId": "cmreva9u400037um54qp8y3al"}, "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "💪 Bienfaits physiques", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Amélioration de la ", "type": "text"}, {"text": "condition physique générale", "type": "text", "marks": [{"type": "bold"}]}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développement de la ", "type": "text"}, {"text": "force fonctionnelle", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la tonicité", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail intensif de la ", "type": "text"}, {"text": "coordination", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la motricité fine", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gain de ", "type": "text"}, {"text": "souplesse", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", de mobilité et de vitesse d’exécution", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Renforcement du ", "type": "text"}, {"text": "schéma corporel", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la maîtrise du mouvement", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "e0975c88-27d4-4558-b1ea-9359204d295d", "type": "media-text", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "🧠 Bienfaits mentaux et émotionnels", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Construction d’une ", "type": "text"}, {"text": "confiance en soi solide", "type": "text", "marks": [{"type": "bold"}]}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Développement du ", "type": "text"}, {"text": "self-control", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la gestion du stress", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Amélioration de la ", "type": "text"}, {"text": "concentration", "type": "text", "marks": [{"type": "bold"}]}, {"text": " et de la prise de décision rapide", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Apprentissage de la ", "type": "text"}, {"text": "maîtrise émotionnelle", "type": "text", "marks": [{"type": "bold"}]}, {"text": " en situation dynamique", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "ff84a93b-76c2-42e0-8541-beacdff19afc", "type": "media-text", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "⚔️ Apprentissage technique", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Le cours s’articule autour de :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Mouvements fondamentaux", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": "du Kali (bâtons, mains nues, angles, déplacements)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Séries techniques", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": "permettant d’intégrer les automatismes", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Mise en pratique en ", "type": "text"}, {"text": "sparring contrôlé", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", pour éprouver les acquis en conditions réelles", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Travail sur la ", "type": "text"}, {"text": "défense personnelle", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", en apprenant à utiliser ", "type": "text"}, {"text": "tout ce qui est disponible", "type": "text", "marks": [{"type": "italic"}]}, {"text": " pour se protéger efficacement", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}}, {"id": "3144c59c-516b-480d-a12d-03f75d6bd549", "type": "media-text", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "🤝 L’esprit du club", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Notre club repose sur trois piliers :", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Convivialité", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": ": un cadre chaleureux où chacun progresse à son rythme", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bienveillance", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": ": respect mutuel, écoute et sécurité avant tout", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Entraide", "type": "text", "marks": [{"type": "bold"}]}, {"type": "hardBreak"}, {"text": ": les plus expérimentés accompagnent les nouveaux, et chacun contribue à la progression du groupe", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Ici, pas de compétition d’ego : seulement la recherche du ", "type": "text"}, {"text": "bien-être", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", de la progression personnelle et du plaisir de pratiquer un art martial riche et vivant.", "type": "text"}]}]}}], "version": 1}	2	kali-escrima	{"blocks": [{"id": "80367952-31a4-44ee-8882-a8ebdf2c40b6", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porttitor fringilla urna, eget auctor nunc varius vitae. Nulla tempor sem massa, sit amet placerat tellus aliquet sit amet. Phasellus ultrices fermentum elementum. Nunc mauris justo, pellentesque nec libero ac, vulputate semper turpis. Proin libero risus, varius non auctor in, ullamcorper eget justo. Donec aliquam lacus eget neque egestas, id ornare nisl accumsan. In dapibus leo enim, at varius tellus auctor a. Aliquam feugiat, magna sed scelerisque imperdiet, justo nulla bibendum leo, in bibendum nisl nisi ut mauris.", "type": "text"}]}]}}], "version": 1}	cmreva9u400037um54qp8y3al
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
10	1	cmrsbojh300125tb2c82hb224	0
11	1	cmrsbogfz000e5tb2j7qjm8pt	1
12	1	cmrsbohwc000q5tb2c20rv70u	2
13	1	cmrsbogok000g5tb2xdzla5yo	3
14	1	cmrsbohno000o5tb270madpo4	4
15	1	cmrsboh9l000k5tb26el696q7	5
16	1	cmrsboh19000i5tb2skqjc4o9	6
17	1	cmrsbohhc000m5tb20y5zzkzn	7
18	1	cmreva9u400037um54qp8y3al	8
19	3	cmrsbojh300125tb2c82hb224	0
20	3	cmrsbogok000g5tb2xdzla5yo	1
21	3	cmrsbohwc000q5tb2c20rv70u	2
22	3	cmrsbogfz000e5tb2j7qjm8pt	3
\.


--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MediaAsset" (id, "publicId", "secureUrl", "resourceType", "mimeType", format, "originalFileName", "displayName", description, bytes, width, height, duration, "appRoot", status, "categoryId", "disciplineId", "proposedDisciplineName", "eventDate", "uploaderUserId", "uploadedAt", "createdAt", "updatedAt", "fullPath", "cloudinaryAssetId", "eventId") FROM stdin;
cmrsbofh800045tb21xv9dr14	AKFC/cours/dabakwondo/analytics_array.jpg	\N	image	image/jpg	jpg	analytics_array.jpg	\N	\N	848833	\N	\N	\N	AKFC	published	1	\N	dabakwondo	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-01-07 21:57:42	2026-07-19 21:43:21.692	2026-07-19 22:18:03.239	AKFC/cours/Taïchi Chuan/analytics_array.jpg	40e55916330ea7d6a09321cad368e882	\N
cmpkkp76y0005i4cd3wgpfqh1	\N	\N	\N	application/pdf	pdf	exemple-de-formulaire-pdf.pdf	\N	\N	1320840	\N	\N	\N	AKFC	published	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 17:59:38.767	2026-05-25 02:14:20.068	2026-07-18 20:58:12.897	AKFC/cours/tchoy-lee-fut/exemple-de-formulaire-pdf.pdf	\N	\N
cmpkkp75u0001i4cdslqx3i2m	\N	\N	\N	text/markdown	md	backend-readme-formation.md	\N	\N	1911	\N	\N	\N	AKFC	published	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 08:55:14.932	2026-05-25 02:14:20.033	2026-07-18 20:58:13.287	AKFC/cours/tchoy-lee-fut/backend-readme-formation.md	\N	\N
cmpkkp75x0003i4cdhc8dfk1h	\N	\N	\N	audio/mpeg	mp3	bernhoft-cmon-talk-official-video.mp3	\N	\N	6534720	\N	\N	\N	AKFC	published	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 17:54:12.013	2026-05-25 02:14:20.038	2026-07-18 20:58:14.015	AKFC/cours/tchoy-lee-fut/bernhoft-cmon-talk-official-video.mp3	\N	\N
cmrsbofnk00065tb2b39guzg4	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/Copie intégrale Steph.jpg	\N	image	image/jpg	jpg	Copie intégrale Steph.jpg	\N	\N	336286	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:21	2026-07-19 21:43:21.921	2026-07-19 22:18:06.506	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/Copie intégrale Steph.jpg	de250734b5b1eac26c86f94846fb3f31	\N
cmrsbogfz000e5tb2j7qjm8pt	AKFC/cours/taolu-multi-styles/stage-Kung-fu.jpg	\N	image	image/jpg	jpg	stage-Kung-fu.jpg	\N	\N	177696	\N	\N	\N	AKFC	published	1	2	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-06-13 06:01:53	2026-07-19 21:43:22.943	2026-07-19 22:18:19.911	AKFC/cours/taolu-multi-styles/stage-Kung-fu.jpg	598c074a6ba54e54d0fa3edc30737f71	\N
cmrsbogok000g5tb2xdzla5yo	AKFC/cours/taolu-multi-styles/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de.png	\N	image	image/png	png	1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de.png	\N	\N	1756407	\N	\N	\N	AKFC	published	1	2	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-06-13 06:01:53	2026-07-19 21:43:23.252	2026-07-19 22:18:23.654	AKFC/cours/taolu-multi-styles/1717085051_506_O-que-voce-precisa-saber-sobre-este-estilo-raro-de.png	ea1c0bd38a85ed38f7418a7c6927f7bf	\N
cmrsboh19000i5tb2skqjc4o9	AKFC/cours/tchoy-lee-fut/REC-20260224163706.mp4	\N	video	video/mp4	mp4	REC-20260224163706.mp4	\N	\N	45326275	\N	\N	\N	AKFC	published	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 18:04:09	2026-07-19 21:43:23.709	2026-07-19 22:26:23.636	AKFC/cours/tchoy-lee-fut/REC-20260224163706.mp4	13094281cec8d91cf46332968c3b6dc7	\N
cmrsboh9l000k5tb26el696q7	AKFC/cours/tchoy-lee-fut/trotinette.jpg	\N	image	image/jpg	jpg	trotinette.jpg	\N	\N	5331688	\N	\N	\N	AKFC	published	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-22 02:12:09	2026-07-19 21:43:24.009	2026-07-19 22:26:27.085	AKFC/cours/tchoy-lee-fut/trotinette.jpg	ebb21a9520a75e365fda404f60e9ad72	\N
cmrsbohhc000m5tb20y5zzkzn	AKFC/cours/kali-escrima/Copilot_20260710_230754.png	\N	image	image/png	png	Copilot_20260710_230754.png	\N	\N	2622603	\N	\N	\N	AKFC	published	1	4	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-10 21:09:16	2026-07-19 21:43:24.289	2026-07-19 22:26:30.583	AKFC/cours/kali-escrima/Copilot_20260710_230754.png	0bd0f9a06b2fd2e0d2b0f3c168070e2b	\N
cmrsbohno000o5tb270madpo4	AKFC/cours/tchoy-lee-fut/N°série.jpg	\N	image	image/jpg	jpg	N°série.jpg	\N	\N	2558691	\N	\N	\N	AKFC	published	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-16 22:27:03	2026-07-19 21:43:24.516	2026-07-19 22:26:35.05	AKFC/cours/tchoy-lee-fut/N°série.jpg	9817a917ec0d209429f9987fff1a7597	\N
cmrsbog0h000a5tb2tas234jy	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/CNI recto PORQUET (ep. BAZZE) Yvonne Louise Julie.jpg	\N	image	image/jpg	jpg	CNI recto PORQUET (ep. BAZZE) Yvonne Louise Julie.jpg	\N	\N	107972	\N	\N	\N	AKFC	published	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:21	2026-07-19 21:43:22.385	2026-07-22 14:42:59.135	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/CNI recto PORQUET (ep. BAZZE) Yvonne Louise Julie.jpg	59e438873354863e4835221241db6643	\N
cmrsboftw00085tb2xiap6vph	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/CNI verso PORQUET (ep. BAZZE) Yvonne Louise Julie.jpg	\N	image	image/jpg	jpg	CNI verso PORQUET (ep. BAZZE) Yvonne Louise Julie.jpg	\N	\N	114162	\N	\N	\N	AKFC	published	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:21	2026-07-19 21:43:22.148	2026-07-22 14:43:06.337	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/CNI verso PORQUET (ep. BAZZE) Yvonne Louise Julie.jpg	00bd1abbc2378c4e5e22b8a7ded567ef	\N
cmrsbog8x000c5tb2vgzovlgy	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/Baccalauréat_Stéphane_Gilles_BAZZÉ	\N	image	image/jpg	jpg	Baccalauréat_Stéphane_BAZZÉ.jpg	\N	\N	2390172	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:22.689	2026-07-22 20:35:57.243	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/Baccalauréat_Stéphane_Gilles_BAZZÉ.jpg	578b2aa0c9f85b5ea87da6d61eb50668	\N
cmsutjeek00077uaf502j8m43	\N	\N	\N	application/pdf	pdf	RetourFreebox.pdf	\N	\N	13163	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-08-15 20:18:34.796	2026-08-15 20:18:34.796	2026-08-15 20:18:34.796	AKFC/groups/bureau-cmst5hqdt00007u2l4otzfk7y/retourfreebox.pdf	\N	\N
cmrsbohwc000q5tb2c20rv70u	AKFC/cours/taolu-multi-styles/IMG_6560-1020x600.jpg	\N	image	image/jpg	jpg	IMG_6560-1020x600.jpg	\N	\N	89029	\N	\N	\N	AKFC	published	1	2	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-06-13 06:01:53	2026-07-19 21:43:24.828	2026-07-19 22:26:38.592	AKFC/cours/taolu-multi-styles/IMG_6560-1020x600.jpg	0678996c14cc31f370b4799dd4d8a276	\N
cmrp5klkq000s2gtaxwh0kphj	\N	\N	\N	application/pdf	pdf	Commande Besson n° 000434515.pdf	\N	\N	237763	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-07-17 16:29:06.745	2026-07-17 16:29:06.745	2026-07-19 22:27:33.555	AKFC/general/commande-besson-n-000434515.pdf	\N	\N
cmrsboi9e000u5tb2zf6e12u8	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/iScreen Shoter - Microsoft Edge - 250430143141.png	\N	image	image/png	png	iScreen Shoter - Microsoft Edge - 250430143141.png	\N	\N	347744	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:15:45	2026-07-19 21:43:25.298	2026-07-19 22:26:45.844	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/iScreen Shoter - Microsoft Edge - 250430143141.png	27286b0dba2d68b2a8791b9749a2279d	\N
cmrsboihr000w5tb2vg1180ou	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/iScreen Shoter - Microsoft Edge - 250430142919.png	\N	image	image/png	png	iScreen Shoter - Microsoft Edge - 250430142919.png	\N	\N	4491151	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:15:45	2026-07-19 21:43:25.599	2026-07-19 22:26:49.247	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/iScreen Shoter - Microsoft Edge - 250430142919.png	ddf7981910aed115a5cfdcfe9ca59ad2	\N
cmrsboj1a000y5tb2ksx1isus	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/iScreen Shoter - Microsoft Edge - 250428231924.jpg	\N	image	image/jpg	jpg	iScreen Shoter - Microsoft Edge - 250428231924.jpg	\N	\N	848833	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:15:45	2026-07-19 21:43:26.302	2026-07-19 22:26:52.738	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/iScreen Shoter - Microsoft Edge - 250428231924.jpg	fb393160c6a55d7d456d077462bae126	\N
cmreva9u400037um54qp8y3al	AKFC/cours/kali-escrima/KALI-1.png	https://res.cloudinary.com/dj7uuagab/image/authenticated/s--5eQZ8hpc--/v1783683805/AKFC/pending/cours/kali-escrima/KALI-1.png	image	image/png	png	KALI-1.png	\N	\N	1172534	1400	900	\N	AKFC	published	1	4	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-07-10 11:43:27.052	2026-07-10 11:43:27.052	2026-07-19 22:26:57.098	AKFC/cours/kali-escrima/KALI-1.png	d536d18c50f99e703b87ae2e467ac55f	\N
cmrsbojh300125tb2c82hb224	AKFC/cours/taolu-multi-styles/15167532_969257399885919_299849553367439684_o.jpg	\N	image	image/jpg	jpg	15167532_969257399885919_299849553367439684_o.jpg	\N	\N	150439	\N	\N	\N	AKFC	published	1	2	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-06-13 06:01:53	2026-07-19 21:43:26.871	2026-07-19 22:27:03.992	AKFC/cours/taolu-multi-styles/15167532_969257399885919_299849553367439684_o.jpg	0853191855929d3f3c79d7e86607ce3b	\N
cmrsbojow00145tb21b94mhkg	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/trotinette.jpg	\N	image	image/jpg	jpg	trotinette.jpg	\N	\N	5331688	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:27.152	2026-07-19 22:27:07.778	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/trotinette.jpg	68a148d78f5662945343906acbb1a201	\N
cmrsbojul00165tb2rtzfnfn9	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/N°série.jpg	\N	image	image/jpg	jpg	N°série.jpg	\N	\N	2558691	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:27.357	2026-07-19 22:27:11.573	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/N°série.jpg	2ffc7ff217e6bc12fb03eb6e2f358cc0	\N
cmrsbok0700185tb284v55lgu	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2025-09-14 at 18.20.41.jpg	\N	image	image/jpg	jpg	WhatsApp Image 2025-09-14 at 18.20.41.jpg	\N	\N	189022	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:27.559	2026-07-19 22:27:14.915	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2025-09-14 at 18.20.41.jpg	a38d03a2f6c28ee3b385242f1bebdef2	\N
cmrsbok6a001a5tb2u76qo4su	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2026-06-17 at 00.49.00.jpg	\N	image	image/jpg	jpg	WhatsApp Image 2026-06-17 at 00.49.00.jpg	\N	\N	242186	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:27.778	2026-07-19 22:27:18.399	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2026-06-17 at 00.49.00.jpg	23750fc9bacc15f824da1ebe907a5de3	\N
cmrsbokdo001c5tb28dxq2uxd	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2026-06-15 at 17.57.13.jpg	\N	image	image/jpg	jpg	WhatsApp Image 2026-06-15 at 17.57.13.jpg	\N	\N	280826	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:28.044	2026-07-19 22:27:21.785	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2026-06-15 at 17.57.13.jpg	efd5ee9b72d18bafca5164ed1ee6f15e	\N
cmrsbokjr001e5tb2zpx4or4p	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2026-06-18 at 11.54.39.jpg	\N	image	image/jpg	jpg	WhatsApp Image 2026-06-18 at 11.54.39.jpg	\N	\N	299103	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:28.263	2026-07-19 22:27:24.874	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/WhatsApp Image 2026-06-18 at 11.54.39.jpg	f78c13d18548e8b55031795f33bf6bae	\N
cmrsbokq9001g5tb2zhho0sez	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/GithubSnapshot.png	\N	image	image/png	png	GithubSnapshot.png	\N	\N	53876	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:23	2026-07-19 21:43:28.497	2026-07-19 22:27:27.629	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/GithubSnapshot.png	85c679eee4301c25dff9c05c6738677a	\N
cmrsbokxl001i5tb2tsoqrd3o	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/Extrait de naissance Stephane BAZZE.jpg	\N	image	image/jpg	jpg	Extrait de naissance Stephane BAZZE.jpg	\N	\N	284464	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:23	2026-07-19 21:43:28.761	2026-07-19 22:27:33.048	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/Extrait de naissance Stephane BAZZE.jpg	5ef5ac8d8f157a18fa2f2b84390c5167	\N
cmrsbof7800025tb2a5uqzgdd	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/DEAMP_Stéphane_BAZZÉ.jpg	\N	image	image/jpg	jpg	DEAMP_Stéphane_BAZZÉ.jpg	\N	\N	2622784	\N	\N	\N	AKFC	pending	\N	\N	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-07-13 21:29:22	2026-07-19 21:43:21.332	2026-07-19 22:17:58.6	AKFC/persos/stephane-bazze-cmp6s16gw0001i51z30km4p2o/photos/DEAMP_Stéphane_BAZZÉ.jpg	5828f89df0c5657d0989d73d509959ad	\N
cmrsboj8g00105tb2xbggh29l	AKFC/cours/taolu-multi-styles/81356556-58615027.jpg	\N	image	image/jpg	jpg	81356556-58615027.jpg	\N	\N	200434	\N	\N	\N	AKFC	pending	1	2	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-06-13 06:01:53	2026-07-19 21:43:26.56	2026-07-20 11:24:52.858	AKFC/cours/taolu-multi-styles/81356556-58615027.jpg	5d8416d8359624067b7a976e5969a87f	\N
cmrsboi2f000s5tb2rbis8a5h	AKFC/cours/taolu-multi-styles/Adults-Kung-Fu-Drills-Head-Academy-352-scaled.jpg	\N	image	image/jpg	jpg	Adults-Kung-Fu-Drills-Head-Academy-352-scaled.jpg	\N	\N	535718	\N	\N	\N	AKFC	pending	1	2	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-06-13 06:01:53	2026-07-19 21:43:25.048	2026-07-20 11:24:52.86	AKFC/cours/taolu-multi-styles/Adults-Kung-Fu-Drills-Head-Academy-352-scaled.jpg	58ff7fa8fadaf0de003df915d3035a4b	\N
cms7qxcar00012gsw1mduxdsj	AKFC/general/AKFC_logo	https://res.cloudinary.com/dj7uuagab/image/authenticated/s--9lt7Ra-0--/v1785428774/AKFC/general/AKFC_logo.svg	image	image/svg+xml	svg	AKFC_logo.svg	\N	\N	428686	5228	5953	\N	AKFC	published	\N	\N	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-07-30 16:46:44.355	2026-07-30 16:46:44.355	2026-07-30 16:49:10.829	AKFC/general/AKFC_logo.svg	c95785979ca795eb8afc0d7303753ca9	\N
\.


--
-- Data for Name: MemberDocument; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberDocument" (id, "mediaAssetId", title, audience, "publishedAt", "publishedById") FROM stdin;
cmsutjexk00097uafqhvzeft4	cmsutjeek00077uaf502j8m43	\N	SPECIFIC	2026-08-15 20:18:35.48	cmp6s16gw0001i51z30km4p2o
\.


--
-- Data for Name: MemberDocumentGroup; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberDocumentGroup" (id, "memberDocumentId", "groupId") FROM stdin;
cmsutjexk000b7uaftonw1l1h	cmsutjexk00097uafqhvzeft4	cmst5hqdt00007u2l4otzfk7y
\.


--
-- Data for Name: MemberDocumentRecipient; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberDocumentRecipient" (id, "memberDocumentId", "userId") FROM stdin;
\.


--
-- Data for Name: MemberGroup; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberGroup" (id, name, description, "createdAt", "isCollaborative", "isAdminGroup") FROM stdin;
cmst5hqdt00007u2l4otzfk7y	Bureau	\N	2026-08-14 16:17:40.049	t	f
cmsuuayos00027unk2tkok95v	Administrateurs	\N	2026-08-15 20:40:00.797	t	t
\.


--
-- Data for Name: MemberGroupMembership; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MemberGroupMembership" (id, "groupId", "userId", access) FROM stdin;
cmsuthjv500037uaf0oqli76s	cmst5hqdt00007u2l4otzfk7y	cmp6s16gw0001i51z30km4p2o	EDITOR
cmsutho3b00057uafimy311kq	cmst5hqdt00007u2l4otzfk7y	cmrtr3wg100012ge38qek9lg0	EDITOR
cmsuuayp900047unkrvm4owgt	cmsuuayos00027unk2tkok95v	cmp6s16gw0001i51z30km4p2o	EDITOR
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
cmrevca4j00077um5kdqxbmzn	cmreva9u400037um54qp8y3al	DISCIPLINE	4	2026-07-10 11:45:00.74
cmrwk18km00002g4lkaot5hb7	cmrsbohno000o5tb270madpo4	DISCIPLINE	3	2026-07-22 20:48:20.903
cmrwk18kn00012g4ls1lhf92p	cmrsboh9l000k5tb26el696q7	DISCIPLINE	3	2026-07-22 20:48:20.903
cmrwk18kn00022g4lot52nkis	cmrsbohwc000q5tb2c20rv70u	DISCIPLINE	3	2026-07-22 20:48:20.903
cmrwk18kn00032g4ls040yg73	cmrsbojh300125tb2c82hb224	DISCIPLINE	3	2026-07-22 20:48:20.903
cms7r2nnz00032gswcjr8dlzs	cms7qxcar00012gsw1mduxdsj	SITE_PAGE	association	2026-07-30 16:50:52.368
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PasswordResetToken" (id, "createdAt", "expiresAt", "usedAt", "tokenHash", "userId", "requestIp", "userAgent") FROM stdin;
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Permission" (id, name, description) FROM stdin;
1	manage_users	\N
2	manage_roles	\N
3	manage_permissions	\N
4	manage_posts	\N
5	manage_comments	\N
6	manage_categories	\N
7	manage_disciplines	\N
8	manage_courses	\N
9	manage_stages	\N
10	view_posts	\N
11	manage_galleries	\N
13	manage_breaking_news	Gérer les actualités (BreakingNews)
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
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Role" (id, name, description) FROM stdin;
2	GUEST	Intervenant extérieur — référencement nominal pour les stages, ne se connecte pas
1	ADMIN	Administrateur — accès total
\.


--
-- Data for Name: RolePermissions; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."RolePermissions" ("roleId", "permissionId") FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	13
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
\.


--
-- Data for Name: SitePage; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."SitePage" (slug, title, content, "updatedAt") FROM stdin;
association	L'association	{"blocks": [{"id": "47d9a99f-4957-44e0-8a15-c921573e6a2f", "side": "left", "type": "float-text", "media": {"kind": "library", "mediaId": "cms7qxcar00012gsw1mduxdsj"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porttitor fringilla urna, eget auctor nunc varius vitae. Nulla tempor sem massa, sit amet placerat tellus aliquet sit amet. Phasellus ultrices fermentum elementum. Nunc mauris justo, pellentesque nec libero ac, vulputate semper turpis. Proin libero risus, varius non auctor in, ullamcorper eget justo. Donec aliquam lacus eget neque egestas, id ornare nisl accumsan. In dapibus leo enim, at varius tellus auctor a. Aliquam feugiat, magna sed scelerisque imperdiet, justo nulla bibendum leo, in bibendum nisl nisi ut mauris. Nulla vel eleifend eros.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Nunc a eleifend massa. Morbi magna neque, congue id pretium non, aliquet ut leo. Praesent ut volutpat risus. Pellentesque vel est sit amet sem posuere aliquam. Maecenas posuere varius cursus. Quisque aliquam metus vel faucibus egestas. Morbi id urna at magna blandit pulvinar ut id ipsum. Aliquam in vulputate eros. Etiam sit amet lectus urna. Sed varius erat eu laoreet euismod.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Donec tristique laoreet blandit. Aliquam suscipit, nibh ac tincidunt fermentum, nisl metus feugiat lacus, at tincidunt augue lorem sed nibh. Ut hendrerit, lectus ac consequat consequat, enim neque facilisis urna, ut rhoncus est sem vel nisl. Vestibulum iaculis diam nisl, vitae porta nunc lacinia non. Curabitur rhoncus ligula vel ante pretium sodales. Etiam aliquet, ante non pulvinar elementum, augue nulla iaculis orci, sagittis pretium lectus turpis et eros. Nullam ante nisi, semper non ullamcorper sed, condimentum vel urna. Proin eu venenatis eros.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Praesent quis tincidunt ligula, a pretium nulla. Morbi sed varius nulla. Mauris sed massa et nibh accumsan pharetra. Sed pretium ipsum venenatis enim posuere, maximus auctor libero semper. Phasellus imperdiet imperdiet arcu. Maecenas vel odio vitae lacus consequat porttitor at ac risus. Etiam est eros, condimentum maximus ullamcorper et, facilisis non felis. Fusce eleifend sollicitudin dolor ut scelerisque. Mauris vehicula eu erat quis euismod. Etiam at purus eleifend, aliquam sem eu, vehicula quam. Donec aliquet turpis nec quam auctor, ut tincidunt est vestibulum. Curabitur non massa aliquet, tristique libero id, consequat orci. Morbi malesuada diam tempus maximus pellentesque. Proin nec lorem ut mauris pretium dignissim quis sit amet velit. Proin vitae ligula quam. Vestibulum tempor sollicitudin sem, ut gravida tellus sollicitudin eget.", "type": "text"}]}]}}], "version": 1}	2026-07-30 16:50:52.352
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
2	\N	Stage Taï-chi éventail	ADULTS	{"blocks": [{"id": "1a7f344b-acaa-4856-9e78-a09cb9454767", "type": "tiptap", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Description stage", "type": "text"}]}]}}], "version": 1}	{"blocks": [], "version": 1}	{}	cmp6s16gw0001i51z30km4p2o	2026-07-01 13:12:11.258	2026-07-01 13:12:11.258	Taï-chi	\N	stage-tai-chi-eventail	\N	{"blocks": [], "version": 1}	\N
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
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."User" (id, "firstName", "lastName", email, "emailVerified", password, "birthDate", phone, image, "roleId", "memberSince", "isFirstLogin", "createdAt", "updatedAt", "aboutMe", pseudo, avatar, "instructorBio", "instructorOrder") FROM stdin;
cmpjg0j1d0000gsp7o0fkcsby	Legacy	Import	legacy-import@akfc.internal	f	legacy-import-no-login-0.c5eyanaqzcr	\N	\N	\N	\N	\N	f	2026-05-24 07:15:24.385	2026-05-24 07:15:24.385	\N	Legacy Import	\N	\N	\N
cmrtr3wg100012ge38qek9lg0	\N	\N	eugenie.maguy@gmail.com	f	$2b$12$GO67Da9HgRcrXPQ0fyWpXeJeCO0AhibQKkXVsKKnANesv1jQJuWOO	\N	\N	\N	2	\N	t	2026-07-20 21:43:03.937	2026-07-20 21:43:03.937	\N	\N	\N	\N	\N
cmp6s16gw0001i51z30km4p2o	Stéphane	BAZZÉ	stephane.bazze@outlook.fr	t	$2b$12$3eQJzb3iQZZfLS8kG2oWFeeE5JSWWY/MFzw.NRG8BuYUxOCujLLTi	1981-10-15 00:00:00	06 69 98 91 94	\N	1	\N	f	2026-05-15 10:30:49.857	2026-07-29 16:55:33.998	Le dev	Zarakeye	AKFC/avatars/cmp6s16gw0001i51z30km4p2o/1783632017666-8bd01c	{"blocks": [{"id": "a026490c-1b0c-456f-b44b-94e94e9f925e", "side": "left", "type": "float-text", "media": {"kind": "avatar", "userId": "cmp6s16gw0001i51z30km4p2o"}, "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porttitor fringilla urna, eget auctor nunc varius vitae. Nulla tempor sem massa, sit amet placerat tellus aliquet sit amet. Phasellus ultrices fermentum elementum. Nunc mauris justo, pellentesque nec libero ac, vulputate semper turpis. Proin libero risus, varius non auctor in, ullamcorper eget justo. Donec aliquam lacus eget neque egestas, id ornare nisl accumsan. In dapibus leo enim, at varius tellus auctor a. Aliquam feugiat, magna sed scelerisque imperdiet, justo nulla bibendum leo, in bibendum nisl nisi ut mauris. Nulla vel eleifend eros.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Nunc a eleifend massa. Morbi magna neque, congue id pretium non, aliquet ut leo. Praesent ut volutpat risus. Pellentesque vel est sit amet sem posuere aliquam. Maecenas posuere varius cursus. Quisque aliquam metus vel faucibus egestas. Morbi id urna at magna blandit pulvinar ut id ipsum. Aliquam in vulputate eros. Etiam sit amet lectus urna. Sed varius erat eu laoreet euismod.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "justify"}, "content": [{"text": "Donec tristique laoreet blandit. Aliquam suscipit, nibh ac tincidunt fermentum, nisl metus feugiat lacus, at tincidunt augue lorem sed nibh. Ut hendrerit, lectus ac consequat consequat, enim neque facilisis urna, ut rhoncus est sem vel nisl. Vestibulum iaculis diam nisl, vitae porta nunc lacinia non. Curabitur rhoncus ligula vel ante pretium sodales. Etiam aliquet, ante non pulvinar elementum, augue nulla iaculis orci, sagittis pretium lectus turpis et eros. Nullam ante nisi, semper non ullamcorper sed, condimentum vel urna. Proin eu venenatis eros.", "type": "text"}]}]}}], "version": 1}	\N
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
3045069f-0d3a-4bd5-b0ba-dd3b9f0a410f	2d70d1b6856e21da2c5954f6bc62c97115bfa960fe0f40b8f82f9abbfd038a96	\N	20261007152335_add_galleries	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261007152335_add_galleries\n\nDatabase error code: 42804\n\nDatabase error:\nERROR: foreign key constraint "GalleryItem_mediaAssetId_fkey" cannot be implemented\nDETAIL: Key columns "mediaAssetId" and "id" are of incompatible types: integer and text.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42804), message: "foreign key constraint \\"GalleryItem_mediaAssetId_fkey\\" cannot be implemented", detail: Some("Key columns \\"mediaAssetId\\" and \\"id\\" are of incompatible types: integer and text."), hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9905), routine: Some("ATAddForeignKeyConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-06-10 15:44:43.930501+02	2026-06-10 15:30:00.886126+02	0
8a85c2c1-43f1-4d34-801b-1189ae3eaa11	b78ce7b7aa67a35b80dec66d4f64f239d42b9878127cc29fed17b81d1624cc27	2026-05-15 12:30:25.10294+02	20260424093424_init_two_level_domain_model	\N	\N	2026-05-15 12:30:25.02228+02	1
c7f40d54-5f4b-48b4-8341-6911705ebf5f	60a8f9b5a3591d017c4920b23b223e9c752b8568c649febb0d90e62747e3824f	2026-05-15 12:30:25.104509+02	20260507081427_add_mediakind_to_trash_entry	\N	\N	2026-05-15 12:30:25.103268+02	1
706a46ba-5b76-4252-ae93-fdfcb97f32e4	4b8075b09bce824d51f428993514dd0ddcd844fe70cb4bf665f24c944b2bf494	2026-05-24 23:39:13.867559+02	20260524163000_add_full_path_to_media_asset	\N	\N	2026-05-24 23:39:13.809165+02	1
996043af-f6ed-4014-9a36-f5ae1b612d8b	2d70d1b6856e21da2c5954f6bc62c97115bfa960fe0f40b8f82f9abbfd038a96	\N	20261007152335_add_galleries	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261007152335_add_galleries\n\nDatabase error code: 42804\n\nDatabase error:\nERROR: foreign key constraint "GalleryItem_mediaAssetId_fkey" cannot be implemented\nDETAIL: Key columns "mediaAssetId" and "id" are of incompatible types: integer and text.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42804), message: "foreign key constraint \\"GalleryItem_mediaAssetId_fkey\\" cannot be implemented", detail: Some("Key columns \\"mediaAssetId\\" and \\"id\\" are of incompatible types: integer and text."), hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9905), routine: Some("ATAddForeignKeyConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-06-10 15:45:40.557708+02	2026-06-10 15:45:10.354029+02	0
fdd706e4-6760-4724-ac60-c3131802132c	0bda624f42f86e3b2f0dda3dd9ff7197e7286d2c5ee2d432534dcc0738fffc1b	2026-05-24 23:39:13.879082+02	20260524163100_tighten_full_path	\N	\N	2026-05-24 23:39:13.868376+02	1
b6d871b7-a251-4723-ae9d-50fb9edce67c	3e56966288a51aac07f6ff8a52618c5358a7b6280fdfff229dfa580604e85d33	2026-05-26 08:42:37.619903+02	20260526064237_add_page_media_reference	\N	\N	2026-05-26 08:42:37.563501+02	1
846e1cf1-5f61-46fc-94c3-5b06e2280477	f3f8de5910bba31fc206be761fd3ff6b2c04391e388ebd2eb17150c5c636d551	2026-05-30 00:29:05.655283+02	20260529222905_domain_v2_expansion	\N	\N	2026-05-30 00:29:05.494263+02	1
7f40719a-a702-4dfd-a080-12bbe6a4b421	fe0c3fc62055781f1f951aa02aa36305169d4ff6d477764d13227557fa3ee31f	2026-06-01 09:44:00.340568+02	20260601074400_social_system	\N	\N	2026-06-01 09:44:00.058916+02	1
711d2ba6-a091-43f3-b15e-57b103e1d5df	4751a06a56b286c5a29cacee077f208f859fb94d776c16a5e16a83dff3e54a79	2026-06-03 17:15:57.615869+02	20260603151557_nav_socle_phase_a	\N	\N	2026-06-03 17:15:57.533981+02	1
20e1b225-2f74-4dc5-a4a7-57f346b3ffe4	56b5e20e8ca607faac7c452299c24a0d42b1f912cbc1310f2822a006cac82657	2026-06-04 11:44:19.711628+02	20260604094419_nav_socle_event_slug	\N	\N	2026-06-04 11:44:19.704298+02	1
fb317a56-5912-4b83-86e7-4231ceee9edb	c2e3c7e6480d4c4859cd59b6b3226de729bdaae1b56f862688acece2c5ddd204	2026-06-04 16:32:55.362296+02	20260604143255_nav_socle_phase_b	\N	\N	2026-06-04 16:32:55.344422+02	1
a0f27420-18d9-4d7f-b74d-32e7fcf907f8	3084b4e26e363af70d3426acdb0f36832e7f1d9ae7c5ef9896c47f3d701ce25e	2026-06-04 23:56:18.913233+02	20260604215618_discipline_slug_unique	\N	\N	2026-06-04 23:56:18.894856+02	1
9e4a01b1-1e5b-4607-9756-b634dfaa28ef	2d70d1b6856e21da2c5954f6bc62c97115bfa960fe0f40b8f82f9abbfd038a96	\N	20261007152335_add_galleries	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261007152335_add_galleries\n\nDatabase error code: 42804\n\nDatabase error:\nERROR: foreign key constraint "GalleryItem_mediaAssetId_fkey" cannot be implemented\nDETAIL: Key columns "mediaAssetId" and "id" are of incompatible types: integer and text.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42804), message: "foreign key constraint \\"GalleryItem_mediaAssetId_fkey\\" cannot be implemented", detail: Some("Key columns \\"mediaAssetId\\" and \\"id\\" are of incompatible types: integer and text."), hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9905), routine: Some("ATAddForeignKeyConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-06-10 15:47:52.812714+02	2026-06-10 15:45:57.587124+02	0
3dac191b-2fb7-4c63-aae4-f635ce6b0c14	2d70d1b6856e21da2c5954f6bc62c97115bfa960fe0f40b8f82f9abbfd038a96	\N	20261007152335_add_galleries	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261007152335_add_galleries\n\nDatabase error code: 42804\n\nDatabase error:\nERROR: foreign key constraint "GalleryItem_mediaAssetId_fkey" cannot be implemented\nDETAIL: Key columns "mediaAssetId" and "id" are of incompatible types: integer and text.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42804), message: "foreign key constraint \\"GalleryItem_mediaAssetId_fkey\\" cannot be implemented", detail: Some("Key columns \\"mediaAssetId\\" and \\"id\\" are of incompatible types: integer and text."), hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9905), routine: Some("ATAddForeignKeyConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-06-10 15:49:42.181608+02	2026-06-10 15:47:56.885498+02	0
a0edd5e8-601e-4017-866f-64a9b1204d74	2d70d1b6856e21da2c5954f6bc62c97115bfa960fe0f40b8f82f9abbfd038a96	\N	20261007152335_add_galleries	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261007152335_add_galleries\n\nDatabase error code: 42804\n\nDatabase error:\nERROR: foreign key constraint "GalleryItem_mediaAssetId_fkey" cannot be implemented\nDETAIL: Key columns "mediaAssetId" and "id" are of incompatible types: integer and text.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42804), message: "foreign key constraint \\"GalleryItem_mediaAssetId_fkey\\" cannot be implemented", detail: Some("Key columns \\"mediaAssetId\\" and \\"id\\" are of incompatible types: integer and text."), hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9905), routine: Some("ATAddForeignKeyConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261007152335_add_galleries"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-06-10 15:53:57.956016+02	2026-06-10 15:49:46.225788+02	0
d7b236ac-2439-4585-ac7a-90bdf606722b	4d568062df17b21b64739f4a09bb814498c47ad0b452892ef01a4c4e61ed4149	2026-07-30 13:14:54.124703+02	20260730180000_site_pages	\N	\N	2026-07-30 13:14:54.008906+02	1
955e8be1-9298-4758-babc-eee072dda6ce	37de084301c9ea837f4b81cac0cab8e8b469e73b7332bfadde1e479eef883272	2026-06-10 15:54:03.17115+02	20261007152335_add_galleries	\N	\N	2026-06-10 15:54:02.947301+02	1
0b9f0b06-f4d6-4db6-9c6d-983dbede218e	4d25f62db00b51f5fa42627f50a17bde83d04dede59216ae4c05920b739a4c0d	2026-06-28 05:25:28.78674+02	20261008000000_add_cloudinary_asset_id		\N	2026-06-28 05:25:28.78674+02	0
24311592-872d-4fde-912c-c1a72ae6a6ad	a2638825ffd2c48013a20a011f652e6cdec236806f438bb8b8eab48a424d5a85	2026-07-01 12:00:28.607318+02	20261009000000_add_publication_date_to_stage		\N	2026-07-01 12:00:28.607318+02	0
073a108c-fdcb-4e0c-a9d5-7ea7971a5666	a145a03d4bc80fd81f916e5acc6fd62c7624a3a3c351e84dacea9036e6525d2b	2026-07-02 10:57:20.372815+02	20260702100000_comment_content_json		\N	2026-07-02 10:57:20.372815+02	0
9f32b07e-cd49-4e7c-a59a-faf3beb8da4c	81591f038de19a5d51908c169f3813e62956f2f2996acbc9c85e91005fac1ee8	2026-07-03 08:43:26.878945+02	20260703090000_breaking_news		\N	2026-07-03 08:43:26.878945+02	0
23a4e729-08fc-469e-af8c-0db66226b104	79ec95ced888f8f7f10cbed0d171ad4c8dd0efa0ef4b9888b2666293508313b7	2026-07-03 12:55:16.45812+02	20260703120000_gallery_metadata		\N	2026-07-03 12:55:16.45812+02	0
77678772-f380-4e8a-86ba-0a9c80776224	ac5826d0a7c943152ff81a6cf0b34c0699570a7b063f8402949b0919606646d1	2026-07-12 20:42:58.555617+02	20261010000000_media_asset_category_nullable	\N	\N	2026-07-12 20:42:58.509484+02	1
6dba8c48-5421-4e11-8278-466dca3cb30f	83f60f83286dd44d0b03926926edbd743b077946aa6c2f735d2f08a8df88f5a0	2026-07-14 22:44:15.68956+02	20261011000000_event_disciplines_m2n	\N	\N	2026-07-14 22:44:13.793779+02	1
a6d884d8-b427-4439-b5ab-43fdc6a0c28c	863c74e71d7c5fd6d0367416271b7d2a37f5d139b0d7688a8d81c700f32fe6e4	2026-07-30 13:28:46.219771+02	20260730200000_discipline_summary_image	\N	\N	2026-07-30 13:28:46.199636+02	1
00afcac4-ac9d-4d39-b1da-6f05cf683255	5b8a6032f6c0e999baa8b4fb6d32a25f8ad0f4e7ba577808922e12b6f2dd6b17	2026-07-24 09:25:51.000388+02	20260724000000_site_style	\N	\N	2026-07-24 09:25:50.831385+02	1
d670f298-5b95-4373-b399-3b3242020cbb	95754c29525ab0a7055f87488a50e2e2c94a530f8fe0f15e23f92cce612e7489	2026-07-24 09:25:51.315872+02	20261012000000_drop_event_legacy_discipline	\N	\N	2026-07-24 09:25:51.000954+02	1
5c1752a7-e80e-451e-8be0-8e712443c337	38aa0a645770edb64f9115a090c53b4275e7652a792a5d4d2549ab5ad6673355	2026-07-24 21:14:23.85904+02	20260724010000_instructor_bio	\N	\N	2026-07-24 21:14:23.812263+02	1
f85f8a7d-a729-45ac-9fe3-69634aee3930	01564812619a14532f643d41d15a0dd3827cd9c499fafbeb63495d2387c9de1a	2026-07-31 18:56:32.69248+02	20260731100000_agenda_summaries	\N	\N	2026-07-31 18:56:31.130522+02	1
b0518c68-b3ac-40d9-b21f-0ae80652b3bf	e58fb7211f5bc463b92da78592dbd093085c616018ffcf5271e6a012aecb39ce	2026-07-30 11:07:43.493296+02	20260730120000_discipline_summary	\N	\N	2026-07-30 11:07:43.441445+02	1
6c840e1e-f88a-4194-932e-3dfd1d69f263	f39606f7aafd00f2cc2a45dcc98a20a136c61ffe507d40e832662f1f7993feee	2026-07-30 13:03:41.603637+02	20260730160000_editorial_limits	\N	\N	2026-07-30 13:03:41.555769+02	1
5579df64-c693-4dd9-88cb-abc1091cc382	49847a088caff9eff4c7e00bd17659db6c02f839f34da9e5501fe523cc921af5	2026-08-15 22:39:41.118099+02	20261016000000_member_group_admin_flag	\N	\N	2026-08-15 22:39:41.081533+02	1
3dd1e8a8-c7c3-4480-8575-7cd88e010a3a	a36394bdb7ba6e776445db46097ffac221071eaca623cdcc64790cde254c1296	2026-08-09 07:10:05.127213+02	20261013000000_member_documents	\N	\N	2026-08-09 07:10:04.728932+02	1
1e317b0b-319e-43ac-bcc4-4e3d4a07c508	7bf3f40350e7683f9aea4cbc78300a2f0cdcf7d795c48b47c9cfc946012307ab	2026-08-10 23:29:45.835613+02	20261014000000_member_groups	\N	\N	2026-08-10 23:29:45.620151+02	1
6b9c1eb6-99b4-4273-b64d-4fed72f851ad	2fa20d8bf65b784a072607660afc9999b9fa7443151f75f085bbf293eea8507d	2026-08-14 18:16:37.222125+02	20261015000000_member_group_collaborative_access	\N	\N	2026-08-14 18:16:37.144412+02	1
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

SELECT pg_catalog.setval('public."GalleryItem_id_seq"', 22, true);


--
-- Name: Gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Gallery_id_seq"', 3, true);


--
-- Name: Origin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Origin_id_seq"', 2, true);


--
-- Name: Permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Permission_id_seq"', 13, true);


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
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Role_id_seq"', 2, true);


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
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


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
-- Name: RolePermissions RolePermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


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
-- Name: Permission_name_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Permission_name_key" ON public."Permission" USING btree (name);


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
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


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
    ADD CONSTRAINT "MediaAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: RolePermissions RolePermissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermissions RolePermissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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

\unrestrict 5l3qdd1bkK803HovYJp5ZgAyJhi3uzgzZyoSj5hMf9FKhRwepcgcSQXZNqPOGyi

