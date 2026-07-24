#!/usr/bin/env bash
#
# step_mediatext_preview_states.sh
#
# L'aperçu du bloc media-text ne dit jamais POURQUOI il n'affiche pas de
# média. C'est ce qui rend le symptôme indiagnosticable — et c'est un défaut
# en soi, pas seulement une gêne pour nous.
#
# Trois situations produisaient exactement le même rendu — rien du tout :
#
#   1. aucun média choisi ;
#   2. un média choisi, la requête est en cours ;
#   3. un média choisi, mais la résolution rend `null` (média absent de la
#      base, admin sans avatar) ou la requête échoue.
#
# Le cas 3 est le plus traître : la colonne média disparaissait, la mise en
# page basculait en une-seule-colonne, et l'admin en concluait qu'il n'avait
# rien sélectionné.
#
# Deux défauts réels au passage :
#
#   - aucun `.catch` sur les deux requêtes. Une promesse rejetée laissait
#     l'état inchangé, sans trace : ni message à l'écran, ni erreur en
#     console (`void` avale le rejet).
#   - la colonne média disparaissait au lieu de rester occupée, ce qui
#     changeait la disposition et masquait le problème.
#
# Après ce correctif, l'aperçu nomme ce qui se passe. C'est aussi ce qui
# nous dira LAQUELLE des deux branches — bibliothèque ou avatar — échoue,
# sans avoir à instrumenter quoi que ce soit.
#
# Usage :
#   bash step_mediatext_preview_states.sh
#   AKFC_APPLY_ONLY=1 bash step_mediatext_preview_states.sh
#
set -euo pipefail

PREVIEW="apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$PREVIEW" ] || { echo "✗ introuvable : $PREVIEW"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "MediaResolutionNotice" "$PREVIEW"; then
  echo "✓ déjà appliqué (marqueur présent dans $PREVIEW) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

PREVIEW = "apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"

# ── 1/5 : un état de résolution, pas seulement un média ───────────────────
edit(PREVIEW, """  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);""",
"""  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);

  // Pourquoi un état explicite et pas seulement `media | null` : « aucun
  // média choisi », « requête en cours » et « choisi mais introuvable »
  // produisaient le même rendu — rien. L'admin ne pouvait pas les
  // distinguer, et nous non plus au diagnostic.
  const [resolution, setResolution] = useState<Resolution>("idle");""")

# ── 2/5 : le type, au niveau module ───────────────────────────────────────
edit(PREVIEW, """interface ResolvedPreviewMedia {""",
"""/**
 * État de la résolution du média.
 *
 * `missing` = la requête a abouti mais n'a rien rendu (média absent de la
 * base, ou administrateur sans avatar). `error` = la requête elle-même a
 * échoué. Les deux méritaient d'être distingués : le premier est un
 * problème de contenu, le second un problème de transport.
 */
type Resolution = "idle" | "loading" | "ready" | "missing" | "error";

interface ResolvedPreviewMedia {""")

# ── 3/5 : les deux branches signalent leur issue ──────────────────────────
edit(PREVIEW, """    let cancelled = false;
    if (!m) {
      setMedia(null);
      return;
    }

    if (m.kind === "avatar") {""",
"""    let cancelled = false;
    if (!m) {
      setMedia(null);
      setResolution("idle");
      return;
    }

    setMedia(null);
    setResolution("loading");

    if (m.kind === "avatar") {""")

edit(PREVIEW, """      void trpcClient.user.listAvatarCandidates.query().then((admins) => {
        if (cancelled) return;
        const user = admins.find((a) => a.id === m.userId);
        if (user?.avatar) {
          setMedia({
            url: publicIdToUrl(user.avatar),
            kind: "image",
            posterUrl: null,
            caption: m.caption,
          });
        } else {
          setMedia(null);
        }
      });""",
"""      void trpcClient.user.listAvatarCandidates
        .query()
        .then((admins) => {
          if (cancelled) return;
          const user = admins.find((a) => a.id === m.userId);
          if (user?.avatar) {
            setMedia({
              url: publicIdToUrl(user.avatar),
              kind: "image",
              posterUrl: null,
              caption: m.caption,
            });
            setResolution("ready");
          } else {
            // L'administrateur existe mais n'a pas d'avatar — ou n'est plus
            // dans la liste des candidats (rôle changé depuis la sélection).
            setMedia(null);
            setResolution("missing");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });""")

edit(PREVIEW, """      void trpcClient.media.resolveByIds
        .query({ mediaIds: [m.mediaId] })
        .then((resolved) => {
          if (cancelled) return;
          const r = resolved[m.mediaId];
          if (r) {
            setMedia({
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: m.caption,
            });
          } else {
            setMedia(null);
          }
        });""",
"""      void trpcClient.media.resolveByIds
        .query({ mediaIds: [m.mediaId] })
        .then((resolved) => {
          if (cancelled) return;
          const r = resolved[m.mediaId];
          if (r) {
            setMedia({
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: m.caption,
            });
            setResolution("ready");
          } else {
            // `resolveByIds` filtre sur `status: 'published'` : un média
            // repassé en attente ou envoyé à la corbeille APRÈS avoir été
            // choisi revient `null` ici, sans que rien ne le signale.
            setMedia(null);
            setResolution("missing");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });""")

# ── 4/5 : la colonne média reste occupée ──────────────────────────────────
edit(PREVIEW, """  const hasMedia = media !== null;""",
"""  // « Il y a une colonne média » n'est PAS « le média est résolu ». Un média
  // choisi mais non résolu garde sa colonne — sans quoi la mise en page
  // basculerait en une seule colonne et l'admin croirait n'avoir rien
  // sélectionné.
  const hasMedia = block.media != null;""")

edit(PREVIEW, """  const MediaColumn =
    hasMedia && media ? <PreviewFigure media={media} /> : null;""",
"""  const MediaColumn = media ? (
    <PreviewFigure media={media} />
  ) : hasMedia ? (
    <MediaResolutionNotice resolution={resolution} />
  ) : null;""")

# ── 5/5 : le message ──────────────────────────────────────────────────────
edit(PREVIEW, """function PreviewFigure({""",
"""/**
 * Occupe la colonne média quand un média est choisi mais pas affichable, et
 * dit pourquoi. Remplace le rendu vide, qui confondait trois situations.
 */
function MediaResolutionNotice({
  resolution,
}: {
  resolution: Resolution;
}): JSX.Element {
  const message =
    resolution === "loading"
      ? "Chargement du média…"
      : resolution === "error"
        ? "Le média n'a pas pu être chargé (erreur réseau ou serveur)."
        : "Média introuvable : il a peut-être été supprimé, remis en attente, ou l'administrateur choisi n'a pas d'avatar.";

  return (
    <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
      {message}
    </div>
  );
}

function PreviewFigure({""")
PY

echo "✓ 7 substitutions appliquées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "fix(page-builder): l'apercu media-text dit pourquoi il n'affiche rien

Trois situations rendaient la meme chose -- rien : aucun media choisi,
requete en cours, media choisi mais irresolvable. La colonne media
disparaissait, la mise en page basculait, et l'admin en concluait qu'il
n'avait rien selectionne.

Ajoute un etat de resolution explicite, un .catch sur les deux branches
(un rejet etait avale par le void) et un message dans la colonne."

echo "✓ commité"
git log -1 --oneline