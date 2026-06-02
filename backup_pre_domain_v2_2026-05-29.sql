--
-- PostgreSQL database dump
--

\restrict rvKe2gq57HhNRVSjTzq2d92YqtYVDleaH1Pzl8y74T2hisRZZ5x8u49N60ivcJk

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
-- Name: PageReferencerKind; Type: TYPE; Schema: public; Owner: akfc
--

CREATE TYPE public."PageReferencerKind" AS ENUM (
    'COURSE',
    'STAGE_DESCRIPTION',
    'STAGE_PROGRAM',
    'POST'
);


ALTER TYPE public."PageReferencerKind" OWNER TO akfc;

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
    content jsonb NOT NULL,
    "authorId" text NOT NULL,
    "articleId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "postId" integer
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
    family text,
    school text,
    classification text,
    origin text,
    description text,
    "categoryId" integer NOT NULL,
    "instructorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Discipline" OWNER TO akfc;

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
-- Name: Like; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Like" (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" text NOT NULL,
    "like" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Like" OWNER TO akfc;

--
-- Name: Like_id_seq; Type: SEQUENCE; Schema: public; Owner: akfc
--

CREATE SEQUENCE public."Like_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Like_id_seq" OWNER TO akfc;

--
-- Name: Like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akfc
--

ALTER SEQUENCE public."Like_id_seq" OWNED BY public."Like".id;


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
    "categoryId" integer NOT NULL,
    "disciplineId" integer,
    "proposedDisciplineName" text,
    "eventDate" timestamp(3) without time zone,
    "uploaderUserId" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fullPath" text NOT NULL
);


ALTER TABLE public."MediaAsset" OWNER TO akfc;

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
-- Name: Stage; Type: TABLE; Schema: public; Owner: akfc
--

CREATE TABLE public."Stage" (
    id integer NOT NULL,
    "disciplineId" integer NOT NULL,
    label text NOT NULL,
    audience public."Audience" NOT NULL,
    description jsonb NOT NULL,
    program jsonb NOT NULL,
    "preRegistered" text[],
    "primaryAnimatorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    avatar text
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
-- Name: Like id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Like" ALTER COLUMN id SET DEFAULT nextval('public."Like_id_seq"'::regclass);


--
-- Name: Permission id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Permission" ALTER COLUMN id SET DEFAULT nextval('public."Permission_id_seq"'::regclass);


--
-- Name: Post id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Post" ALTER COLUMN id SET DEFAULT nextval('public."Post_id_seq"'::regclass);


--
-- Name: Preferences id; Type: DEFAULT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Preferences" ALTER COLUMN id SET DEFAULT nextval('public."Preferences_id_seq"'::regclass);


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
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Category" (id, type) FROM stdin;
1	Cours
2	Stage
3	Démo
\.


--
-- Data for Name: CloudinaryFolder; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."CloudinaryFolder" (id, "appRoot", "fullPath", status, "createdAt", "updatedAt") FROM stdin;
cmp6s16jl0002i51z43w07qf3	AKFC	AKFC/pending	pending	2026-05-15 10:30:49.954	2026-05-15 10:30:49.954
cmp6s16md0003i51zhzjk12hg	AKFC	AKFC/published	published	2026-05-15 10:30:50.053	2026-05-15 10:30:50.053
cmp6s16mf0004i51zv6j9ltbj	AKFC	AKFC/bin	bin	2026-05-15 10:30:50.055	2026-05-15 10:30:50.055
cmpdtrf9g0002gpovbgguspq9	AKFC	AKFC	pending	2026-05-20 08:53:37.157	2026-05-20 08:53:37.157
cmpdtrf9g0003gpov5a51jbxa	AKFC	AKFC/pending/cours	pending	2026-05-20 08:53:37.157	2026-05-20 08:53:37.157
cmpdtrf9g0004gpov95fpx064	AKFC	AKFC/pending/cours/3	pending	2026-05-20 08:53:37.157	2026-05-20 08:53:37.157
cmpdtrf9g0005gpovuqwfpni3	AKFC	AKFC/published/dabakwondo	published	2026-05-20 08:53:37.157	2026-05-20 08:53:37.157
cmpegfa4w0000i5evw8xqiksp	AKFC	AKFC/pending/cours/tchoy-lee-fut	pending	2026-05-20 19:28:01.809	2026-05-20 19:28:01.809
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Comment" (id, content, "authorId", "articleId", "createdAt", "updatedAt", "postId") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Course" (id, "disciplineId", audience, day, "beginTime", "endTime", "instructorId", requisites, content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Discipline; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Discipline" (id, name, type, family, school, classification, origin, description, "categoryId", "instructorId", "createdAt", "updatedAt") FROM stdin;
1	Taï-chi	MARTIAL_ART	Kung-fu Wushu	Chen	interne (yin)	Chine	Apprentissage des taolus de l'école Chen. Pratique interne, lente et continue.	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.062	2026-05-15 10:30:50.062
2	Taolu multi-styles	MARTIAL_ART	Kung-fu Wushu	\N	\N	Chine	Étude de divers taolus et de leurs applications.	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.171	2026-05-15 10:30:50.171
3	Tchoy-Lee-Fut	MARTIAL_ART	Kung-fu Wushu	\N	externe (yang)	Chine du Sud	Style externe du Sud de la Chine. Pratique adaptée selon le public (adultes / 12-16 ans).	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.174	2026-05-15 10:30:50.174
4	Kali Escrima	MARTIAL_ART	\N	\N	\N	Philippines	Art martial philippin centré sur le travail des armes.	1	cmp6s16gw0001i51z30km4p2o	2026-05-15 10:30:50.176	2026-05-15 10:30:50.176
\.


--
-- Data for Name: Like; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Like" (id, "postId", "userId", "like") FROM stdin;
\.


--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."MediaAsset" (id, "publicId", "secureUrl", "resourceType", "mimeType", format, "originalFileName", "displayName", description, bytes, width, height, duration, "appRoot", status, "categoryId", "disciplineId", "proposedDisciplineName", "eventDate", "uploaderUserId", "uploadedAt", "createdAt", "updatedAt", "fullPath") FROM stdin;
cmpgaavab000ai5evrzukathg	AKFC/pending/cours/tchoy-lee-fut/trotinette	https://res.cloudinary.com/dj7uuagab/image/authenticated/s--XYq8A-EU--/v1779415929/AKFC/pending/cours/tchoy-lee-fut/trotinette.jpg	image	image/jpeg	jpg	trotinette.jpg	\N	Ma lovely trottinette!!	5331688	3000	4000	\N	AKFC	pending	1	3	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-05-22 02:12:10.594	2026-05-22 02:12:10.594	2026-05-25 12:04:38.436	AKFC/pending/cours/tchoy-lee-fut/trotinette.jpg
cmpdttm570007gpovq6nee9pu	AKFC/pending/cours/3/trotinette	https://res.cloudinary.com/dj7uuagab/image/authenticated/s--5XCtxlIc--/v1779267317/AKFC/pending/cours/3/trotinette.jpg	image	image/jpeg	jpg	trotinette.jpg	\N	\N	5331688	3000	4000	\N	AKFC	pending	1	3	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-05-20 08:55:19.387	2026-05-20 08:55:19.387	2026-05-20 08:55:19.387	AKFC/pending/cours/3/trotinette.jpg
cmpedfh4h0001i5teo6ymvcmq	AKFC/pending/cours/3/REC-20260224163706	https://res.cloudinary.com/dj7uuagab/video/authenticated/s--JNMDZCxT--/v1779300249/AKFC/pending/cours/3/REC-20260224163706.mp4	video	video/mp4	mp4	REC-20260224163706.mp4	\N	\N	45326275	1920	1080	\N	AKFC	pending	1	3	\N	\N	cmp6s16gw0001i51z30km4p2o	2026-05-20 18:04:12.017	2026-05-20 18:04:12.017	2026-05-20 18:04:12.017	AKFC/pending/cours/3/REC-20260224163706.mp4
cmpjg0j1w0002gsp7ksyv4idd	AKFC/pending/cours/3/iScreen Shoter - Microsoft Edge - 250430143050	https://res.cloudinary.com/dj7uuagab/image/authenticated/s--WavDN9zt--/v1777321320/AKFC/pending/cours/3/iScreen%20Shoter%20-%20Microsoft%20Edge%20-%20250430143050.png	image	image/png	png	iScreen Shoter - Microsoft Edge - 250430143050	\N	\N	0	\N	\N	\N	AKFC	pending	1	\N	3	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-24 07:15:23.933	2026-05-24 07:15:24.404	2026-05-24 07:15:24.404	AKFC/pending/cours/3/iScreen Shoter - Microsoft Edge - 250430143050.png
cmpjg0j200004gsp71udqhaoo	AKFC/pending/cours/tchoy-lee-fut/REC-20260224163706	https://res.cloudinary.com/dj7uuagab/video/authenticated/s--APJUIx44--/v1779300249/AKFC/pending/cours/tchoy-lee-fut/REC-20260224163706.mp4	image	image/mp4	mp4	REC-20260224163706	\N	\N	0	\N	\N	\N	AKFC	pending	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-24 07:15:23.933	2026-05-24 07:15:24.408	2026-05-24 07:15:24.408	AKFC/pending/cours/tchoy-lee-fut/REC-20260224163706.mp4
cmpkkp76y0005i4cd3wgpfqh1	\N	\N	\N	application/pdf	pdf	exemple-de-formulaire-pdf.pdf	\N	\N	1320840	\N	\N	\N	AKFC	pending	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 17:59:38.767	2026-05-25 02:14:20.068	2026-05-25 02:14:20.068	AKFC/pending/cours/tchoy-lee-fut/exemple-de-formulaire-pdf.pdf
cmpkkp75x0003i4cdhc8dfk1h	\N	\N	\N	audio/mpeg	mp3	bernhoft-cmon-talk-official-video.mp3	\N	\N	6534720	\N	\N	\N	AKFC	pending	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 17:54:12.013	2026-05-25 02:14:20.038	2026-05-25 02:14:20.038	AKFC/pending/cours/tchoy-lee-fut/bernhoft-cmon-talk-official-video.mp3
cmpkkp75u0001i4cdslqx3i2m	\N	\N	\N	text/markdown	md	backend-readme-formation.md	\N	\N	1911	\N	\N	\N	AKFC	pending	1	3	\N	\N	cmpjg0j1d0000gsp7o0fkcsby	2026-05-20 08:55:14.932	2026-05-25 02:14:20.033	2026-05-25 02:14:20.033	AKFC/pending/cours/tchoy-lee-fut/backend-readme-formation.md
\.


--
-- Data for Name: PageMediaReference; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."PageMediaReference" (id, "mediaAssetId", "pageType", "pageId", "createdAt") FROM stdin;
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
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Post" (id, title, content, "authorId", "createdAt", "updatedAt", "publicationDate") FROM stdin;
\.


--
-- Data for Name: Preferences; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Preferences" (id, "displayEmail", "displayPhone", "darkMode", "userId", description) FROM stdin;
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
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Session" (id, "userId", "createdAt", "expiresAt") FROM stdin;
cmpdtr5wj0001gpoviq6mirnp	cmp6s16gw0001i51z30km4p2o	2026-05-20 08:53:25.026	2026-05-27 08:53:25.025
cmpqbn1pu0001i8c25phcnjbo	cmp6s16gw0001i51z30km4p2o	2026-05-29 02:47:20.178	2026-06-05 02:47:20.177
\.


--
-- Data for Name: Stage; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."Stage" (id, "disciplineId", label, audience, description, program, "preRegistered", "primaryAnimatorId", "createdAt", "updatedAt") FROM stdin;
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
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public."User" (id, "firstName", "lastName", email, "emailVerified", password, "birthDate", phone, image, "roleId", "memberSince", "isFirstLogin", "createdAt", "updatedAt", "aboutMe", pseudo, avatar) FROM stdin;
cmp6s16gw0001i51z30km4p2o	Stéphane	\N	stephane.bazze@outlook.fr	t	$2b$12$3eQJzb3iQZZfLS8kG2oWFeeE5JSWWY/MFzw.NRG8BuYUxOCujLLTi	\N	\N	\N	1	\N	f	2026-05-15 10:30:49.857	2026-05-20 08:43:37.095	\N	\N	\N
cmpjg0j1d0000gsp7o0fkcsby	Legacy	Import	legacy-import@akfc.internal	f	legacy-import-no-login-0.c5eyanaqzcr	\N	\N	\N	\N	\N	f	2026-05-24 07:15:24.385	2026-05-24 07:15:24.385	\N	Legacy Import	\N
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
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: akfc
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8a85c2c1-43f1-4d34-801b-1189ae3eaa11	b78ce7b7aa67a35b80dec66d4f64f239d42b9878127cc29fed17b81d1624cc27	2026-05-15 12:30:25.10294+02	20260424093424_init_two_level_domain_model	\N	\N	2026-05-15 12:30:25.02228+02	1
c7f40d54-5f4b-48b4-8341-6911705ebf5f	60a8f9b5a3591d017c4920b23b223e9c752b8568c649febb0d90e62747e3824f	2026-05-15 12:30:25.104509+02	20260507081427_add_mediakind_to_trash_entry	\N	\N	2026-05-15 12:30:25.103268+02	1
706a46ba-5b76-4252-ae93-fdfcb97f32e4	4b8075b09bce824d51f428993514dd0ddcd844fe70cb4bf665f24c944b2bf494	2026-05-24 23:39:13.867559+02	20260524163000_add_full_path_to_media_asset	\N	\N	2026-05-24 23:39:13.809165+02	1
fdd706e4-6760-4724-ac60-c3131802132c	0bda624f42f86e3b2f0dda3dd9ff7197e7286d2c5ee2d432534dcc0738fffc1b	2026-05-24 23:39:13.879082+02	20260524163100_tighten_full_path	\N	\N	2026-05-24 23:39:13.868376+02	1
b6d871b7-a251-4723-ae9d-50fb9edce67c	3e56966288a51aac07f6ff8a52618c5358a7b6280fdfff229dfa580604e85d33	2026-05-26 08:42:37.619903+02	20260526064237_add_page_media_reference	\N	\N	2026-05-26 08:42:37.563501+02	1
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Category_id_seq"', 3, true);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 1, false);


--
-- Name: Course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Course_id_seq"', 1, false);


--
-- Name: Discipline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Discipline_id_seq"', 4, true);


--
-- Name: Like_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Like_id_seq"', 1, false);


--
-- Name: Permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Permission_id_seq"', 10, true);


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Post_id_seq"', 1, false);


--
-- Name: Preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akfc
--

SELECT pg_catalog.setval('public."Preferences_id_seq"', 1, false);


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

SELECT pg_catalog.setval('public."Stage_id_seq"', 1, false);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


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
-- Name: Discipline Discipline_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_pkey" PRIMARY KEY (id);


--
-- Name: Like Like_pkey; Type: CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_pkey" PRIMARY KEY (id);


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
-- Name: Discipline_categoryId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_categoryId_idx" ON public."Discipline" USING btree ("categoryId");


--
-- Name: Discipline_categoryId_name_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Discipline_categoryId_name_key" ON public."Discipline" USING btree ("categoryId", name);


--
-- Name: Discipline_instructorId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_instructorId_idx" ON public."Discipline" USING btree ("instructorId");


--
-- Name: Discipline_type_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Discipline_type_idx" ON public."Discipline" USING btree (type);


--
-- Name: MediaAsset_appRoot_fullPath_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_appRoot_fullPath_idx" ON public."MediaAsset" USING btree ("appRoot", "fullPath");


--
-- Name: MediaAsset_categoryId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_categoryId_idx" ON public."MediaAsset" USING btree ("categoryId");


--
-- Name: MediaAsset_disciplineId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "MediaAsset_disciplineId_idx" ON public."MediaAsset" USING btree ("disciplineId");


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
-- Name: Preferences_userId_key; Type: INDEX; Schema: public; Owner: akfc
--

CREATE UNIQUE INDEX "Preferences_userId_key" ON public."Preferences" USING btree ("userId");


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
-- Name: Stage_primaryAnimatorId_idx; Type: INDEX; Schema: public; Owner: akfc
--

CREATE INDEX "Stage_primaryAnimatorId_idx" ON public."Stage" USING btree ("primaryAnimatorId");


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
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: Discipline Discipline_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Discipline"
    ADD CONSTRAINT "Discipline_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Like Like_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Like Like_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: MediaAsset MediaAsset_uploaderUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akfc
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
    ADD CONSTRAINT "Stage_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES public."Discipline"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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

\unrestrict rvKe2gq57HhNRVSjTzq2d92YqtYVDleaH1Pzl8y74T2hisRZZ5x8u49N60ivcJk

