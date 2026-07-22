#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# CLOCHE — ventilation des contenus en attente PAR DOSSIER, avec liens directs.
#
# Aujourd'hui `getAttentionCounts` ne renvoie que des agrégats (perso /
# général / reste) et toute la cloche est UN lien vers la bibliothèque. On veut
# le détail — « n en attente dont m dans X, o dans Y… » — et un lien par ligne
# qui mène au dossier concerné.
#
#   1) `storage.getPendingBreakdown` : groupe les MediaAsset « pending » par
#      dossier parent. Renvoie `kind` ('general' | 'perso' | 'folder') et non
#      un libellé tout fait — la formulation reste à l'UI.
#
#   2) La page bibliothèque accepte `?path=` et positionne le finder dessus.
#      Sans ça, les liens ne mèneraient nulle part de précis.
#
#   3) L'infobulle devient un panneau survolable listant les dossiers, chacun
#      cliquable. Elle perd `pointer-events-none` (sinon les liens seraient
#      inertes) et l'espacement passe en padding, pour que le survol ne se
#      rompe pas entre la cloche et le panneau.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
PAGE="apps/web/src/app/(admin)/dashboard/library/page.tsx"
BELL="apps/web/src/features/app-shell/NotificationBell.tsx"

for f in "$ROUTER" "$PAGE" "$BELL"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done

# Garde sur le DERNIER élément écrit.
if grep -q "getPendingBreakdown" "$BELL"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

ROUTER = "packages/backend/src/modules/storage/router.ts"
PAGE = "apps/web/src/app/(admin)/dashboard/library/page.tsx"
BELL = "apps/web/src/features/app-shell/NotificationBell.tsx"

# ── 1) Backend : ventilation par dossier ────────────────────────────────────
edit(ROUTER,
     """    return {
      pending,
      bin,
      generalPending,
      persoPending: persoCounts.pending,
    };
  }),""",
     '''    return {
      pending,
      bin,
      generalPending,
      persoPending: persoCounts.pending,
    };
  }),

  /**
   * Ventilation des contenus « en attente » par dossier parent.
   *
   * Renvoie le `kind` du dossier plutôt qu'un libellé : la formulation
   * (« le stockage général », « votre stockage personnel »…) appartient à
   * l'UI, pas au backend. Les dossiers sont triés par volume décroissant.
   */
  getPendingBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.mediaAsset.findMany({
      where: { appRoot: ctx.appRoot, status: "pending" },
      select: { fullPath: true },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const segments = row.fullPath.split("/");
      segments.pop(); // le nom du fichier
      const folder = segments.join("/");
      if (!folder) continue;
      counts.set(folder, (counts.get(folder) ?? 0) + 1);
    }

    const generalRoot = `${ctx.appRoot}/general`;
    const persosRoot = `${ctx.appRoot}/persos`;

    const entries = Array.from(counts.entries()).map(([path, count]) => {
      let kind: "general" | "perso" | "folder" = "folder";
      if (path === generalRoot || path.startsWith(`${generalRoot}/`)) {
        kind = "general";
      } else if (path.startsWith(`${persosRoot}/`)) {
        // Personnel de l'utilisateur courant uniquement : le dossier porte
        // son id. Ceux des autres restent des dossiers ordinaires.
        kind = path.includes(ctx.user.id) ? "perso" : "folder";
      }
      // Nom lisible : pour le dossier personnel d'un AUTRE utilisateur, le
      // dernier segment vaut « photos » et n'apprend rien — on prend le
      // segment qui identifie la personne.
      let name = path.split("/").pop() ?? path;
      if (kind === "folder" && path.startsWith(`${persosRoot}/`)) {
        name = path.slice(persosRoot.length + 1).split("/")[0] ?? name;
      }

      return { path, count, kind, name };
    });

    entries.sort((a, b) => b.count - a.count);

    return { total: rows.length, entries };
  }),''',
     "backend : getPendingBreakdown")

# ── 2) Page bibliothèque : lien profond ?path= ──────────────────────────────
edit(PAGE,
     """import { JSX } from 'react';
import Finder from '@features/finder-core/components/Finder';""",
     """import { JSX, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Finder from '@features/finder-core/components/Finder';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';""",
     "page : imports")

edit(PAGE,
     """export default function GalleryPage(): JSX.Element {
  return (""",
     """export default function GalleryPage(): JSX.Element {
  // Lien profond : `?path=AKFC/cours/x` ouvre le finder sur ce dossier.
  // Utilisé par la cloche de notifications pour mener droit au contenu.
  const searchParams = useSearchParams();
  const setPath = useFinderStore((state) => state.setPath);
  const requestedPath = searchParams.get('path');

  useEffect(() => {
    if (requestedPath) setPath(requestedPath);
  }, [requestedPath, setPath]);

  return (""",
     "page : lecture de ?path=")

# ── 3) Cloche : panneau avec liens ──────────────────────────────────────────
edit(BELL,
     """  const { data: counts } = trpc.storage.getAttentionCounts.useQuery(undefined, {
    enabled: canSee,
  });""",
     """  const { data: counts } = trpc.storage.getAttentionCounts.useQuery(undefined, {
    enabled: canSee,
  });
  const { data: breakdown } = trpc.storage.getPendingBreakdown.useQuery(
    undefined,
    { enabled: canSee },
  );""",
     "cloche : requête de ventilation")

edit(BELL,
     '''{total > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-max max-w-64 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          {buildMessage(
            counts!.pending,
            counts!.bin,
            counts!.persoPending,
            counts!.generalPending,
          )}
        </div>
      )}''',
     '''{total > 0 && (
        <div
          role="tooltip"
          /* `pt-1` plutôt qu'une marge : sans zone continue, le survol se
             romprait entre la cloche et le panneau. Et pas de
             `pointer-events-none` — les liens doivent être cliquables. */
          className="absolute right-0 top-full z-50 hidden pt-1 group-hover:block"
        >
          <div className="w-max max-w-80 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
            {counts!.pending > 0 && (
              <>
                <p className="mb-1 font-medium">
                  Vous avez {counts!.pending} contenu
                  {counts!.pending > 1 ? 's' : ''} en attente
                  {breakdown && breakdown.entries.length > 0 ? ' :' : ''}
                </p>
                {breakdown && breakdown.entries.length > 0 && (
                  <ul className="space-y-0.5">
                    {breakdown.entries.map((entry) => (
                      <li key={entry.path}>
                        <Link
                          href={`/dashboard/library?path=${encodeURIComponent(entry.path)}`}
                          className="block rounded px-1 py-0.5 hover:bg-white/10 hover:underline"
                        >
                          {entry.count} dans{' '}
                          {entry.kind === 'general'
                            ? 'le stockage général'
                            : entry.kind === 'perso'
                              ? 'votre stockage personnel'
                              : `« ${entry.name} »`}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {counts!.bin > 0 && (
              <p className={counts!.pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>
                {counts!.bin} contenu{counts!.bin > 1 ? 's' : ''} dans la
                corbeille
              </p>
            )}
          </div>
        </div>
      )}''',
     "cloche : panneau avec liens")
PYEOF

echo
echo "→ contrôle"
grep -q "getPendingBreakdown: protectedProcedure" "$ROUTER" && echo "  ✓ procédure backend" || { echo "  ✗"; exit 1; }
grep -q "useSearchParams" "$PAGE" && echo "  ✓ lien profond dans la page" || { echo "  ✗"; exit 1; }
grep -q "getPendingBreakdown" "$BELL" && echo "  ✓ cloche branchée" || { echo "  ✗"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(notifications): ventilation des contenus en attente par dossier avec liens"
echo "✓ commité."