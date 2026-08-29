"use client";

import { type JSX } from "react";
import Link from "next/link";
import { PAGE_REGISTRY } from "@/config/pageRegistry";
import { Bell, HardDrive } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Cloche de notifications de la bibliothèque — à gauche de l'avatar.
 *
 * Sans rien à traiter, la cloche cède la place à un DISQUE DUR : le
 * raccourci vers la bibliothèque demeure, mais muet (ni badge, ni
 * secousse, ni tooltip). La cloche n'existe que quand elle a quelque
 * chose à dire.
 *
 * Badge = assets « pending » + entrées de corbeille. Tooltip au survol
 * avec la formulation adaptée (les deux / attente seule / corbeille
 * seule, singulier/pluriel géré). La cloche entière est un LIEN vers la
 * bibliothèque ; si la variante dropdown (liens pending/corbeille
 * séparés) est retenue plus tard, seule la partie basse du composant
 * change — les données et le message sont déjà isolés.
 *
 * Gating : visible uniquement pour les utilisateurs ayant AU MOINS UNE
 * permission (tout gestionnaire de contenu) — pas de permission
 * bibliothèque dédiée à ce jour, et un membre simple n'a rien à faire
 * de ces compteurs.
 *
 * Secousse : uniquement quand il y a du contenu à traiter — un wiggle
 * bref toutes les ~6 s (les 15 premiers % de l'animation), désactivé
 * par prefers-reduced-motion.
 */

function buildMessage(
  pending: number,
  bin: number,
  persoPending: number,
  generalPending: number,
): string {
  const s = (n: number) => (n > 1 ? "s" : "");

  // Types de contenus en attente : personnels / dossier « général » /
  // disciplines (le reste).
  const rest = Math.max(0, pending - persoPending - generalPending);
  const typesCount =
    (persoPending > 0 ? 1 : 0) +
    (generalPending > 0 ? 1 : 0) +
    (rest > 0 ? 1 : 0);

  // Partie « en attente » (sans « Vous avez » ni corbeille).
  let attente = "";
  if (pending > 0) {
    if (typesCount >= 2) {
      // ≥ 2 types : total + ventilation « dont … » (le reste non nommé).
      const breakdown: string[] = [];
      if (persoPending > 0) {
        breakdown.push(`${persoPending} personnel${s(persoPending)}`);
      }
      if (generalPending > 0) {
        breakdown.push(`${generalPending} dans le dossier « général »`);
      }
      const dont =
        breakdown.length > 0 ? ` dont ${breakdown.join(" et ")}` : "";
      attente = `${pending} contenu${s(pending)} en attente${dont}`;
    } else if (persoPending > 0) {
      // Uniquement du perso → libellé dédié.
      attente = `${persoPending} contenu${s(persoPending)} personnel${s(persoPending)} en attente`;
    } else if (generalPending > 0) {
      // Uniquement du général → libellé dédié.
      attente = `${generalPending} contenu${s(generalPending)} en attente dans le dossier « général »`;
    } else {
      // Uniquement des disciplines (non nommées).
      attente = `${pending} contenu${s(pending)} en attente`;
    }
  }

  if (attente && bin > 0) {
    return `Vous avez ${attente} et ${bin} dans la corbeille`;
  }
  if (attente) {
    return `Vous avez ${attente}`;
  }
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}

export function NotificationBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const canSee = (user?.role?.permissions.length ?? 0) > 0;
  const isAdmin = (user?.isAdmin ?? false);

  // ─── Pourquoi useQuery et pas useEffect + useState ──────────────────────
  //
  // Ce composant faisait UN fetch au montage, dans un `useEffect([canSee])`,
  // et stockait le résultat dans un `useState`. Il ne se rafraîchissait donc
  // jamais : ni après un upload, ni après une publication. Il fallait
  // recharger la page pour voir un compteur juste.
  //
  // Et surtout, il était HORS du cache react-query. Un `invalidate()` posé
  // au bon endroit n'aurait rien fait — il n'avait rien à invalider. Les
  // deux moitiés du mécanisme manquaient, chacune rendant l'autre inutile.
  //
  // Avec `useQuery`, le cache devient la source unique : les quatre endroits
  // qui font bouger les compteurs (les deux uploaders, `useStatusChange`,
  // `useNodeActions`) invalident, et la cloche suit — sans rien savoir d'eux.
  //
  // Le type vient de la procédure, il n'y a plus rien à écrire à la main.
  // L'annotation précédente disait `{ pending, bin }` alors que le backend
  // en renvoyait quatre depuis un moment.
  const { data: counts } = trpc.storage.getAttentionCounts.useQuery(undefined, {
    enabled: canSee,
  });
  const { data: breakdown } = trpc.storage.getPendingBreakdown.useQuery(
    undefined,
    { enabled: canSee },
  );
  const { data: pageStates } = trpc.pageVisibility.all.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: entityDrafts } =
    trpc.pageVisibility.entityDraftCounts.useQuery(undefined, {
      enabled: isAdmin,
    });

  if (!canSee) return null;

  const pending = counts?.pending ?? 0;
  const bin = counts?.bin ?? 0;
  const persoPending = counts?.persoPending ?? 0;
  const generalPending = counts?.generalPending ?? 0;

  // Brouillons (admin) : pages éditoriales non publiées + entités en
  // brouillon. S'ajoutent au badge et au dropdown.
  const editorialDrafts = isAdmin
    ? PAGE_REGISTRY.filter(
        (pg) =>
          !(pageStates ?? []).some((v) => v.key === pg.key && v.published),
      )
    : [];
  const entityDraftTotal =
    (entityDrafts?.disciplines ?? 0) +
    (entityDrafts?.events ?? 0) +
    (entityDrafts?.stages ?? 0);
  const draftTotal = editorialDrafts.length + entityDraftTotal;

  const total = pending + bin + draftTotal;

  return (
    <div className="group relative">
      <style>{`
        @keyframes akfc-bell-shake {
          0%, 15%, 100% { transform: rotate(0deg); }
          2%  { transform: rotate(14deg); }
          5%  { transform: rotate(-12deg); }
          8%  { transform: rotate(9deg); }
          11% { transform: rotate(-6deg); }
          13% { transform: rotate(3deg); }
        }
        .akfc-bell-shaking {
          animation: akfc-bell-shake 6s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-bell-shaking { animation: none; }
        }
      `}</style>

      <Link
        href="/dashboard/library"
        aria-label={
          total > 0
            ? buildMessage(
                pending,
                bin,
                persoPending,
                generalPending,
              )
            : "Bibliothèque"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {total > 0 ? (
          <>
            <Bell className="akfc-bell-shaking h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {total}
            </span>
          </>
        ) : (
          <HardDrive className="h-5 w-5" aria-hidden />
        )}
      </Link>

      {total > 0 && (
        <div
          role="tooltip"
          /* `pt-1` plutôt qu'une marge : sans zone continue, le survol se
             romprait entre la cloche et le panneau. Et pas de
             `pointer-events-none` — les liens doivent être cliquables. */
          className="absolute right-0 top-full z-50 hidden pt-1 group-hover:block"
        >
          <div className="w-max max-w-80 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
            {pending > 0 && (
              <>
                <p className="mb-1 font-medium">
                  Vous avez {pending} contenu
                  {pending > 1 ? 's' : ''} en attente
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
            {bin > 0 && (
              <p className={pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>
                {bin} contenu{bin > 1 ? 's' : ''} dans la
                corbeille
              </p>
            )}
            {draftTotal > 0 && (
              <div
                className={
                  pending > 0 || bin > 0
                    ? 'mt-1.5 border-t border-white/15 pt-1.5'
                    : ''
                }
              >
                <p className="mb-1 font-medium">
                  {draftTotal} brouillon{draftTotal > 1 ? 's' : ''} à publier :
                </p>
                <ul className="space-y-0.5">
                  {editorialDrafts.map((pg) => (
                    <li key={pg.key}>
                      <Link
                        href={`/dashboard/site-pages/${pg.key}`}
                        className="block rounded px-1 py-0.5 hover:bg-white/10 hover:underline"
                      >
                        Page « {pg.label} »
                      </Link>
                    </li>
                  ))}
                  {(entityDrafts?.disciplines ?? 0) > 0 && (
                    <li>
                      <Link
                        href="/dashboard/disciplines"
                        className="block rounded px-1 py-0.5 hover:bg-white/10 hover:underline"
                      >
                        {entityDrafts!.disciplines} discipline
                        {entityDrafts!.disciplines > 1 ? 's' : ''}
                      </Link>
                    </li>
                  )}
                  {(entityDrafts?.events ?? 0) > 0 && (
                    <li>
                      <Link
                        href="/dashboard/events"
                        className="block rounded px-1 py-0.5 hover:bg-white/10 hover:underline"
                      >
                        {entityDrafts!.events} événement
                        {entityDrafts!.events > 1 ? 's' : ''}
                      </Link>
                    </li>
                  )}
                  {(entityDrafts?.stages ?? 0) > 0 && (
                    <li>
                      <Link
                        href="/dashboard/stages"
                        className="block rounded px-1 py-0.5 hover:bg-white/10 hover:underline"
                      >
                        {entityDrafts!.stages} stage
                        {entityDrafts!.stages > 1 ? 's' : ''}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
