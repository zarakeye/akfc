#!/usr/bin/env bash
# AKFC — Logo dans le builder (Volet 1bis, inc 1+2 fusionné : contrat + rendu).
#  - contrat : kind "site-logo" (idempotent, déjà posé par inc1 → skip si présent).
#  - BlockViewProps : + siteLogo?: ResolvedMedia | null
#  - PageRenderer : lit siteSettings → siteLogo (repli /AKFC_logo.svg) → passé aux blocs
#  - view.server (media-text + float-text) : branche kind "site-logo"
#  - *Preview (media-text + float-text) : branche "site-logo" via siteSettings.get
# Usage : bash apply-logo-builder-2-render.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
CONTRACT="packages/contracts/src/page/blocks.v1.ts"
PROPS="apps/web/src/features/page-builder/BlockDefinition.types.ts"
RENDERER="apps/web/src/features/page-builder/PageRenderer.tsx"
MV="apps/web/src/features/page-builder/blocks/media-text/view.server.tsx"
FV="apps/web/src/features/page-builder/blocks/float-text/view.server.tsx"
MP="apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
FP="apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"
for f in "$CONTRACT" "$PROPS" "$RENDERER" "$MV" "$FV" "$MP" "$FP"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

python3 - "$CONTRACT" "$PROPS" "$RENDERER" "$MV" "$FV" "$MP" "$FP" <<'PY'
import sys, pathlib
CONTRACT, PROPS, RENDERER, MV, FV, MP, FP = sys.argv[1:8]
def rd(p): return pathlib.Path(p).read_text(encoding="utf-8")
def wr(p,s): pathlib.Path(p).write_text(s, encoding="utf-8")
def one(s, old, new, label):
    assert s.count(old) == 1, f"{label}: ancre ×{s.count(old)}"
    return s.replace(old, new)

# ---------- 1) contrat (si pas déjà posé) ----------
s = rd(CONTRACT)
if '"site-logo"' not in s:
    anchor = 'const mediaTextItemSchema = z.discriminatedUnion("kind", ['
    schema = '''/**
 * Référence LOGIQUE au logo du site (pas au binaire). Unique — aucun id. Résolue
 * au rendu via SiteSettings : si l'admin change le logo, les pages suivent.
 */
const siteLogoMediaItemSchema = z.object({
  kind: z.literal("site-logo"),
  caption: z.string().optional(),
});

'''
    s = one(s, anchor, schema + anchor, "contrat def")
    s = one(s,
        '''  libraryMediaItemSchema,
  avatarMediaItemSchema,
]);''',
        '''  libraryMediaItemSchema,
  avatarMediaItemSchema,
  siteLogoMediaItemSchema,
]);''', "contrat membre")
    wr(CONTRACT, s); print("  ok  contrat")
else:
    print("  — contrat déjà posé")

# ---------- 2) BlockViewProps : + siteLogo ----------
s = rd(PROPS)
if "siteLogo" not in s:
    anchor = '  resolveAvatar?: (userId: string) => ResolvedMedia | null;'
    add = anchor + '''
  /**
   * Logo du site résolu (unique). Fourni par le PageRenderer depuis
   * SiteSettings (repli embarqué). Utilisé par les items { kind: "site-logo" }
   * des blocs media-text / float-text.
   */
  siteLogo?: ResolvedMedia | null;'''
    s = one(s, anchor, add, "props siteLogo")
    wr(PROPS, s); print("  ok  BlockViewProps")
else:
    print("  — BlockViewProps déjà")

# ---------- 3) PageRenderer : lire siteSettings + passer siteLogo ----------
s = rd(RENDERER)
if "siteLogo" not in s:
    # import prisma déjà présent (resolveAvatarsByUserIds l'utilise) ; on ajoute la lecture
    anchor_av = '''  const avatarMap = await resolveAvatarsByUserIds(prisma, avatarUserIds);
  const resolveAvatar = (userId: string): ResolvedMedia | null =>
    avatarMap[userId] ?? null;'''
    add_logo = anchor_av + '''

  // Logo du site (unique, hors finder) : résolu une fois, repli embarqué.
  const siteSettingsRow = await prisma.siteSettings.findUnique({
    where: { id: "site" },
    select: { logoKey: true, updatedAt: true },
  });
  const siteLogo: ResolvedMedia | null = {
    url: siteSettingsRow?.logoKey
      ? `/api/media/site-logo?v=${siteSettingsRow.updatedAt.getTime()}`
      : "/AKFC_logo.svg",
    kind: "image",
    posterUrl: null,
  };'''
    s = one(s, anchor_av, add_logo, "renderer siteLogo calc")
    s = one(s,
        '''            resolveMedia={resolveMedia}
            resolveAvatar={resolveAvatar}
            mediaSide={sideFor(block.id)}''',
        '''            resolveMedia={resolveMedia}
            resolveAvatar={resolveAvatar}
            siteLogo={siteLogo}
            mediaSide={sideFor(block.id)}''', "renderer pass prop")
    wr(RENDERER, s); print("  ok  PageRenderer")
else:
    print("  — PageRenderer déjà")

# ---------- 4) view.server (media-text + float-text) : branche site-logo ----------
for path, sig in ((MV, "MediaTextView"), (FV, "FloatTextView")):
    s = rd(path)
    if 'kind === "site-logo"' in s: print(f"  — {sig} déjà"); continue
    # ajouter siteLogo à la déstructuration des props
    s = one(s,
        "  block,\n  resolveMedia,\n  resolveAvatar,",
        "  block,\n  resolveMedia,\n  resolveAvatar,\n  siteLogo,",
        f"{sig} props")
    # brancher la résolution (3 cas)
    s = one(s,
        '''    : block.media.kind === "avatar"
      ? (resolveAvatar?.(block.media.userId) ?? null)
      : resolveMedia(block.media.mediaId);''',
        '''    : block.media.kind === "avatar"
      ? (resolveAvatar?.(block.media.userId) ?? null)
      : block.media.kind === "site-logo"
        ? (siteLogo ?? null)
        : resolveMedia(block.media.mediaId);''',
        f"{sig} resolve")
    wr(path, s); print(f"  ok  {sig}")

# ---------- 5) *Preview (media-text + float-text) : branche site-logo ----------
OLD_KEY = 'm == null ? null : m.kind === "avatar" ? `avatar:${m.userId}` : m.mediaId;'
NEW_KEY = ('m == null\n'
    '      ? null\n'
    '      : m.kind === "avatar"\n'
    '        ? `avatar:${m.userId}`\n'
    '        : m.kind === "site-logo"\n'
    '          ? "site-logo"\n'
    '          : m.mediaId;')
BRANCH = '''    } else if (m.kind === "site-logo") {
      // Logo du site : URL publique via siteSettings.get (repli embarqué).
      void trpcClient.siteSettings.get
        .query()
        .then((s) => {
          if (cancelled) return;
          setMedia({
            url: s?.logoUrl ?? "/AKFC_logo.svg",
            kind: "image",
            posterUrl: null,
            caption: m.caption,
          });
          setResolution("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });
'''
for path, name, has_comment in ((MP, "MediaTextPreview", True), (FP, "FloatTextPreview", False)):
    s2 = rd(path)
    if 'else if (m.kind === "site-logo")' in s2:
        print(f"  — {name} déjà"); continue
    # 5a) mediaKey (garde dédiée)
    if '? "site-logo"' not in s2:
        s2 = one(s2, OLD_KEY, NEW_KEY, f"{name} mediaKey")
    # 5b) branche de résolution : ancre selon présence du commentaire
    if has_comment:
        anchor = '    } else {\n      // Média de bibliothèque.\n      void trpcClient.media.resolveByIds'
        tail = '    } else {\n      // Média de bibliothèque.\n      void trpcClient.media.resolveByIds'
    else:
        anchor = '    } else {\n      void trpcClient.media.resolveByIds'
        tail = '    } else {\n      void trpcClient.media.resolveByIds'
    s2 = one(s2, anchor, BRANCH + tail, f"{name} branch")
    wr(path, s2); print(f"  ok  {name}")

PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(page-builder): rendu du logo (site-logo) — media-text + float-text, repli embarqué" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }