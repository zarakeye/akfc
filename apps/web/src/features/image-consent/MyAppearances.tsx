"use client";

import Link from "next/link";
import type { JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { VerdictBadges } from "#features/admin/media-people/RightsBadges.tsx";

const SOURCE_LABEL = {
  FORM: "d'après votre dernier formulaire",
  STATUS: "d'après l'autorisation enregistrée par le club",
  NONE: "vous n'avez pas encore donné de réponse",
} as const;

/**
 * Les médias où le membre connecté a été identifié (`mediaPeople.mine`) : vignette, date, où le média
 * est montré, et s'il est masqué sur le site public. En tête, son droit à l'image usage par usage,
 * avec le lien pour le donner ou le modifier.
 */
export function MyAppearances(): JSX.Element {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.mediaPeople.mine.useQuery();
  const setRefusal = trpc.mediaPeople.setMyRefusal.useMutation({
    onSuccess: () => utils.mediaPeople.mine.invalidate(),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Où j&apos;apparais</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les photos et vidéos du club sur lesquelles vous avez été identifié(e). Ce qui en est montré dépend de votre
          droit à l&apos;image. Une photo ne vous plaît pas ? Refusez-la : elle ne sera plus diffusée hors du club, quelle
          que soit votre autorisation pour les autres. Si vous ne vous reconnaissez pas, écrivez au club : il retirera
          l&apos;identification.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : error || !data ? (
        <p className="text-sm text-destructive">Impossible de charger la liste.</p>
      ) : (
        <>
          <section className="rounded-xl border border-border bg-card p-4" aria-label="Mon droit à l'image">
            <p className="text-sm text-foreground">
              Mon droit à l&apos;image ({SOURCE_LABEL[data.source]}) :
            </p>
            <div className="mt-2">
              <VerdictBadges verdicts={data.states} labeled />
            </div>
            <Link href="/profil/droit-a-l-image" className="mt-3 inline-block text-sm font-medium text-success hover:underline">
              Donner ou modifier mon autorisation →
            </Link>
          </section>

          {data.items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Vous n&apos;avez été identifié(e) sur aucune photo ni vidéo.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-tour="appearances.list">
              {data.items.map((m) => (
                <li key={m.mediaAssetId} className="overflow-hidden rounded-xl border border-border bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.thumbUrl} alt="" className="aspect-video w-full bg-muted object-cover" />
                  <div className="space-y-1.5 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">
                      Identifié(e) le {new Date(m.taggedAt).toLocaleDateString("fr-FR")}
                    </p>
                    {m.refusedByMe ? (
                      <p className="rounded-md bg-destructive-muted px-2 py-1 text-xs text-destructive">
                        Vous avez refusé cette photo : elle n&apos;est plus diffusée hors du club (site, réseaux, imprimés, presse).
                        Dans l&apos;espace membres, réservé au club, les responsables en sont avertis.
                      </p>
                    ) : m.hiddenOnPublicSite && (
                      <p className="rounded-md bg-destructive-muted px-2 py-1 text-xs text-destructive">
                        Masqué sur le site public (une personne identifiée l&apos;a refusé).
                      </p>
                    )}
                    {m.shownOn.length === 0 ? (
                      <p className="text-muted-foreground">Dans la bibliothèque du club, montré nulle part pour l&apos;instant.</p>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">Montré sur :</p>
                        <ul className="ml-4 list-disc text-foreground">
                          {m.shownOn.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setRefusal.mutate({ mediaAssetId: m.mediaAssetId, refused: !m.refusedByMe })}
                      disabled={setRefusal.isPending}
                      className={`mt-1 rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                        m.refusedByMe
                          ? "border-border text-foreground hover:bg-muted"
                          : "border-destructive/40 text-destructive hover:bg-destructive-muted"
                      }`}
                    >
                      {m.refusedByMe ? "Annuler mon refus pour cette photo" : "Je ne souhaite pas que cette photo soit diffusée"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
