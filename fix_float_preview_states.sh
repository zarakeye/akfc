#!/usr/bin/env bash
#
# fix_float_preview_states.sh
#
# L'aperçu du bloc float peut encore échouer sans rien dire, et c'est ce qui
# se passe : ni image, ni message. Deux branches restaient muettes.
#
# ─── Branche muette n°1 : « idle » ─────────────────────────────────────────
#
# L'avis n'apparaissait que si la résolution avait DÉMARRÉ. Quand le bloc n'a
# aucune image côté données (`block.media` absent), l'effet sort tout de suite
# et l'état reste `idle` — donc aucun message, et le rendu se réduit au texte.
# C'est exactement le symptôme décrit.
#
# Or « je n'ai pas encore choisi d'image » et « j'ai choisi une image mais
# elle ne remonte pas » sont deux situations opposées qui produisaient le même
# écran vide.
#
# ─── Branche muette n°2 : l'image résolue mais non chargée ─────────────────
#
# Si la résolution aboutit, l'aperçu se déclare `ready` et pose un `<img>`.
# Si ce binaire répond 401 ou 404, le navigateur n'affiche RIEN — l'`alt` est
# vide, donc l'image cassée n'occupe même pas de place. L'aperçu se croyait
# alors en succès pendant que l'écran restait blanc.
#
# Un `onError` transforme désormais cet échec muet en message, avec l'URL
# fautive, ce qui rend le diagnostic immédiat au lieu d'exiger l'inspecteur.
#
# ─── Pourquoi ça vaut mieux qu'un correctif deviné ─────────────────────────
#
# Les deux causes restantes demandent des correctifs opposés : si le bloc n'a
# pas d'image, le défaut est dans l'enregistrement du choix d'avatar ; si
# l'image ne se charge pas, il est dans l'URL ou le binaire. Livrer un
# correctif sans savoir laquelle des deux, c'est retomber dans l'erreur que
# cette session a déjà punie plusieurs fois.
#
# Le même angle mort existe dans l'aperçu du média-texte (même `alt` vide,
# même absence d'`onError`) : à traiter ensuite, une fois la cause connue.
#
# Usage :
#   bash fix_float_preview_states.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_preview_states.sh
#
set -euo pipefail

PREVIEW="apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "imageFailed" "$PREVIEW" 2>/dev/null; then
  echo "✓ déjà appliqué (états d'aperçu complets) — rien à faire"
  exit 0
fi

[ -f "$PREVIEW" ] || { echo "✗ introuvable : $PREVIEW"; exit 1; }

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

PREVIEW = "apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"

# ── 1/4 : état d'échec de CHARGEMENT, distinct de l'échec de résolution ───
edit(PREVIEW, """  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);
  const [resolution, setResolution] = useState<Resolution>("idle");""",
"""  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);
  const [resolution, setResolution] = useState<Resolution>("idle");
  // Distinct de `resolution` : la résolution peut réussir (on a une URL) et
  // le binaire échouer quand même. Avec un `alt` vide, une image cassée
  // n'occupe aucune place — l'écran reste blanc sans le moindre signe.
  const [imageFailed, setImageFailed] = useState(false);""")

# ── 2/4 : remise à zéro de l'échec quand le média change ──────────────────
edit(PREVIEW, """    setMedia(null);
    setResolution("loading");""",
"""    setMedia(null);
    setImageFailed(false);
    setResolution("loading");""")

# ── 3/4 : l'avis couvre TOUTES les branches, y compris « idle » ───────────
edit(PREVIEW, """      {!media && resolution !== "idle" && (
        <p className="mb-2 text-xs text-muted-foreground">
          {resolution === "loading"
            ? "Chargement du média…"
            : resolution === "missing"
              ? "Média sélectionné introuvable (supprimé, en attente, ou administrateur sans avatar)."
              : "Échec du chargement du média."}
        </p>
      )}""",
"""      {(!media || imageFailed) && (
        <p className="mb-2 text-xs text-muted-foreground">
          {imageFailed
            ? `Image résolue mais non chargée (le binaire n'a pas répondu) : ${media?.url ?? ""}`
            : resolution === "idle"
              ? "Aucune image n'est associée à ce bloc : le choix d'avatar n'a rien enregistré, ou aucune image n'a encore été sélectionnée."
              : resolution === "loading"
                ? "Chargement du média…"
                : resolution === "missing"
                  ? "Média sélectionné introuvable (supprimé, en attente, ou administrateur sans avatar)."
                  : "Échec de la requête de résolution du média."}
        </p>
      )}""")

# ── 4/4 : l'image signale son propre échec de chargement ──────────────────
edit(PREVIEW, """              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.url}
                alt={media.caption ?? ""}
                className="block w-full rounded-md object-cover"
              />""",
"""              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.url}
                alt={media.caption ?? ""}
                onError={() => setImageFailed(true)}
                className="block w-full rounded-md object-cover"
              />""")
PY

echo "✓ aperçu float : plus aucune branche muette"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "fix(float-text): l'apercu ne peut plus echouer en silence

Deux branches restaient muettes, et c'est l'une d'elles qui produisait
un apercu sans image ET sans message.

1. L'etat « idle » : quand le bloc n'a aucune image cote donnees,
   l'effet sort immediatement et l'etat ne change pas, donc aucun avis
   ne s'affichait. « Je n'ai pas encore choisi d'image » et « j'ai
   choisi une image qui ne remonte pas » produisaient le meme ecran.

2. L'image resolue mais non chargee : la resolution se declare ready et
   pose un <img> ; si le binaire repond 401 ou 404, l'alt vide fait que
   l'image cassee n'occupe aucune place. Un onError distingue desormais
   cet echec-la de l'echec de resolution, et affiche l'URL fautive.

Les deux causes restantes appellent des correctifs opposes (choix
d'avatar non enregistre, ou binaire injoignable) : les distinguer avant
de coder plutot que de deviner."

echo "✓ commité"
git log -1 --oneline