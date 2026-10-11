"use client";

import { useRef, useState, type JSX } from "react";

import { trpc } from "@trpc/trpcClient";

/**
 * Migration Cloudinary → R2 (administrateurs). Lance des lots courts jusqu'à ce qu'il ne reste plus
 * rien à migrer ; un fichier en échec est écarté pour la suite et listé. Relançable sans risque :
 * Cloudinary n'est jamais modifié (copie de secours jusqu'à la fermeture du compte).
 */

type Item = { id: string; kind: "file" | "avatar"; name: string; ok: boolean; error?: string };

export default function MediaMigrationPage(): JSX.Element {
  const utils = trpc.useUtils();
  const status = trpc.mediaMigration.status.useQuery();
  const runBatch = trpc.mediaMigration.runBatch.useMutation();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [failures, setFailures] = useState<Item[]>([]);
  const [fatal, setFatal] = useState<string | null>(null);
  const stopRef = useRef(false);

  const start = async (): Promise<void> => {
    setRunning(true);
    setFatal(null);
    stopRef.current = false;
    const exclude = failures.map((f) => f.id);
    try {
      for (let guard = 0; guard < 2000 && !stopRef.current; guard++) {
        const res = await runBatch.mutateAsync({ max: 6, exclude });
        const failed = res.items.filter((i) => !i.ok) as Item[];
        exclude.push(...failed.map((f) => f.id));
        setDone((n) => n + res.items.filter((i) => i.ok).length);
        if (failed.length) setFailures((f) => [...f, ...failed]);
        utils.mediaMigration.status.setData(undefined, res.status);
        if (res.items.length === 0) break;
      }
    } catch (err) {
      setFatal(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setRunning(false);
      await utils.mediaMigration.status.invalidate();
    }
  };

  const s = status.data;
  const left = s ? s.remaining + s.avatarsRemaining : 0;

  return (
    <div className="mx-auto max-w-3xl p-6 text-sm">
      <h1 className="mb-1 text-2xl font-semibold">Migration des médias vers R2</h1>
      <p className="mb-6 text-gray-600">
        Copie les photos, vidéos et avatars encore chez Cloudinary vers le stockage R2 du club (en Union
        européenne), puis les sert depuis R2. Rien n&apos;est supprimé chez Cloudinary : la copie y reste en
        secours jusqu&apos;à la fermeture du compte. L&apos;opération peut être relancée sans risque.
      </p>

      {status.isPending ? (
        <p className="text-gray-500">Chargement…</p>
      ) : status.error ? (
        <p className="text-red-600">{status.error.message}</p>
      ) : s ? (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Fichiers à migrer" value={s.remaining} />
            <Stat label="Avatars à migrer" value={s.avatarsRemaining} />
            <Stat label="Déjà migrés" value={s.migrated} />
            <Stat label="À la corbeille" value={s.inBin} />
          </dl>

          {s.inBin > 0 && (
            <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3">
              {s.inBin} fichier(s) Cloudinary sont à la corbeille : ils ne sont pas migrés. Videz ou restaurez la
              corbeille, puis relancez la migration ; sinon ils disparaîtront avec le compte Cloudinary.
            </p>
          )}
          {s.contentWithCloudinaryUrls.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3">
              <p className="font-medium">Contenus rédigés contenant encore une adresse Cloudinary</p>
              <p className="mt-1 text-gray-700">
                Ces textes contiennent un lien écrit en dur vers Cloudinary, que la migration ne modifie pas. À
                vérifier dans le constructeur et à remplacer par le média de la bibliothèque :
              </p>
              <ul className="mt-2 list-disc pl-5">
                {s.contentWithCloudinaryUrls.map((c) => (
                  <li key={c.table}>
                    {c.table} : {c.count}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={running || left === 0}
              onClick={() => void start()}
              className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {running ? "Migration en cours…" : left === 0 ? "Tout est migré" : "Lancer la migration"}
            </button>
            {running && (
              <button
                type="button"
                onClick={() => {
                  stopRef.current = true;
                }}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Interrompre après ce lot
              </button>
            )}
            {(running || done > 0) && <span className="text-gray-600">{done} élément(s) migré(s) dans cette session</span>}
          </div>
          {fatal && <p className="mt-3 text-red-600">{fatal}</p>}

          {failures.length > 0 && (
            <div className="mt-6">
              <p className="font-medium text-red-700">En échec ({failures.length}) — écartés pour cette session :</p>
              <ul className="mt-2 list-disc pl-5">
                {failures.map((f) => (
                  <li key={f.id}>
                    {f.kind === "avatar" ? "Avatar de " : ""}
                    {f.name} : {f.error}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-gray-600">
                Un fichier « introuvable chez Cloudinary » n&apos;a plus d&apos;original : supprimez-le de la
                bibliothèque ou déposez-le à nouveau.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  );
}
