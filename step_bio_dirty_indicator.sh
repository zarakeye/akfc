#!/usr/bin/env bash
#
# step_bio_dirty_indicator.sh
#
# L'éditeur de bio ne disait jamais s'il y avait des modifications en attente.
#
# ─── Ce que la trace a montré ──────────────────────────────────────────────
#
# La chaîne est saine de bout en bout : AvatarPicker appelle `onSelect`,
# l'éditeur float écrit `media` dans le bloc, `handleUpdate` remplace le bloc
# dans la page, le bouton envoie `current`, et `saveMyInstructorBio` accepte
# du `z.any()` — il stocke tel quel, sans rien filtrer.
#
# Et `parsePageContentV1` renvoie un contenu VIDE quand le parse échoue. Or
# le texte s'affiche : le bloc relu depuis la base est donc valide et n'a
# simplement jamais porté de média. Le choix d'avatar n'a pas été enregistré.
#
# ─── Pourquoi c'était invisible ────────────────────────────────────────────
#
# Entre le clic sur l'avatar et le rechargement, RIEN à l'écran ne signalait
# un changement en attente : l'aperçu restait muet (corrigé depuis) et
# l'enrobage ne s'engageait pas (corrigé aussi). Le bouton « Enregistrer »
# avait exactement la même apparence avec ou sans modification.
#
# Un éditeur qui ne distingue pas « à jour » de « modifié » laisse perdre du
# travail. C'est le vrai défaut, indépendamment de ce qui s'est passé ici.
#
# ─── Ce que ça ajoute ──────────────────────────────────────────────────────
#
#   - un état « Modifications non enregistrées » à côté du bouton ;
#   - le bouton désactivé quand il n'y a rien à enregistrer, ce qui rend
#     l'inverse immédiatement lisible ;
#   - la comparaison se fait sur le contenu sérialisé et non sur un simple
#     drapeau : revenir en arrière sur une modification redonne « à jour »,
#     au lieu de laisser un faux positif collé jusqu'au rechargement.
#
# Usage :
#   bash step_bio_dirty_indicator.sh
#   AKFC_APPLY_ONLY=1 bash step_bio_dirty_indicator.sh
#
set -euo pipefail

BIO="apps/web/src/features/social/InstructorBioEditor.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "savedSnapshot" "$BIO" 2>/dev/null; then
  echo "✓ déjà appliqué (indicateur posé) — rien à faire"
  exit 0
fi

[ -f "$BIO" ] || { echo "✗ introuvable : $BIO"; exit 1; }

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

BIO = "apps/web/src/features/social/InstructorBioEditor.tsx"

# ── 1/3 : l'instantané de référence (hook AVANT les sorties anticipées) ───
edit(BIO, """  const [content, setContent] = useState<PageContentV1 | null>(null);""",
"""  const [content, setContent] = useState<PageContentV1 | null>(null);
  // Instantané sérialisé de ce qui est ENREGISTRÉ. Comparer le contenu plutôt
  // que lever un simple drapeau : si l'on défait une modification, l'éditeur
  // redevient « à jour » au lieu de garder un faux positif jusqu'au
  // rechargement.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);""")

# ── 2/3 : le calcul de l'état ─────────────────────────────────────────────
edit(BIO, """  const current =
    content ??
    (state.data.bio
      ? parsePageContentV1(state.data.bio)
      : emptyPageContentV1());""",
"""  const persisted = state.data.bio
    ? parsePageContentV1(state.data.bio)
    : emptyPageContentV1();
  const current = content ?? persisted;

  // Référence : le dernier enregistrement réussi de cette session, sinon ce
  // qui vient de la base.
  const baseline = savedSnapshot ?? JSON.stringify(persisted);
  const dirty = JSON.stringify(current) !== baseline;""")

# ── 3/3 : l'affichage et le bouton ────────────────────────────────────────
edit(BIO, """        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate({ bio: current })}
          className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >""",
"""        <div className="flex shrink-0 items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-amber-600">
              Modifications non enregistrées
            </span>
          )}
          <button
            type="button"
            disabled={save.isPending || !dirty}
            onClick={() => {
              // L'instantané est pris AVANT l'appel et posé seulement au
              // succès : un enregistrement qui échoue ne doit pas faire
              // croire que le contenu est à jour.
              const snapshot = JSON.stringify(current);
              save.mutate(
                { bio: current },
                { onSuccess: () => setSavedSnapshot(snapshot) },
              );
            }}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >""")

# ── fermeture du conteneur ajouté ─────────────────────────────────────────
edit(BIO, """          {save.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>""",
"""            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>""")
PY

echo "✓ indicateur de modifications non enregistrées posé"

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
git commit -m "feat(instructor-bio): signaler les modifications non enregistrees

L'editeur de bio ne distinguait pas « a jour » de « modifie » : le
bouton Enregistrer avait la meme apparence dans les deux cas. Combine
a un apercu muet et a un enrobage qui ne s'engageait pas, cela rendait
impossible de savoir si un choix d'avatar avait ete pris en compte.

L'etat se calcule en comparant le contenu serialise au dernier
enregistrement reussi, et non par un simple drapeau : defaire une
modification redonne « a jour » au lieu de laisser un faux positif
colle jusqu'au rechargement. L'instantane n'est pose qu'au succes de la
mutation, pour qu'un echec ne fasse pas croire le contraire.

Le bouton est desactive quand il n'y a rien a enregistrer, ce qui rend
l'inverse immediatement lisible."

echo "✓ commité"
git log -1 --oneline