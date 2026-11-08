"use client";

import { useState, type JSX } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@backend/modules";

import { trpc } from "@trpc/trpcClient";
import type { ImageUsageValue } from "@contracts/legal/imageConsent";
import { BlankConsentFormPreview } from "@features/image-consent/BlankConsentFormCard";
import { ConsentChoicesFields } from "@features/image-consent/ConsentChoicesFields";
import { formatDate } from "@features/image-consent/consentFormat";

/**
 * Page du parent référent : le formulaire pré-rempli des souhaits du membre mineur, qu'il peut
 * changer ; il se déclare représentant légal et valide. Ses choix font foi ; les lignes qui
 * s'écartent des souhaits sont marquées « modifié », comme dans le PDF.
 */
export function GuardianConsentPage({ token }: { token: string }): JSX.Element {
  const request = trpc.imageConsent.guardianRequest.useQuery({ token }, { retry: false, refetchOnWindowFocus: false });
  const r = request.data;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm">
      <h1 className="text-xl font-semibold">Autorisation de droit à l&apos;image</h1>
      <p className="mt-1 text-gray-600">AKFC — Association Kung Fu Chambéry</p>
      {request.isPending ? (
        <p className="mt-6 text-gray-600">Chargement…</p>
      ) : request.error ? (
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
          {request.error.message}
        </p>
      ) : r ? (
        // Clé : un rechargement des données repart des souhaits reçus, sans état périmé.
        <GuardianForm key={token} token={token} data={r} />
      ) : null}
    </main>
  );
}

type RequestData = inferRouterOutputs<AppRouter>["imageConsent"]["guardianRequest"];

function GuardianForm({ token, data: r }: { token: string; data: RequestData }): JSX.Element {
  const [usages, setUsages] = useState<ImageUsageValue[]>(r.usages);
  const [keep, setKeep] = useState<boolean>(r.keepAfterLeave ?? false);
  const [legal, setLegal] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const confirm = trpc.imageConsent.confirmGuardian.useMutation();

  if (confirm.data) {
    return (
      <div className="mt-6 space-y-2 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-900" role="status">
        <p className="font-medium">Merci, l&apos;autorisation de {r.memberName} est enregistrée.</p>
        {confirm.data.changes.length > 0 ? (
          <>
            <p>Par rapport à ses souhaits, vous avez changé :</p>
            <ul className="list-disc pl-5">
              {confirm.data.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Vous avez gardé tous ses souhaits.</p>
        )}
        <p>Le club et {r.memberName} en sont informés. Ce lien ne sert plus.</p>
      </div>
    );
  }

  if (!r.stillMinor) {
    return (
      <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
        {r.memberName} est devenu majeur : il donne désormais lui-même son autorisation, depuis son profil.
      </p>
    );
  }

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (legal) confirm.mutate({ token, usages, keepAfterLeave: keep, isLegalRepresentative: true });
      }}
    >
      <p>
        Bonjour {r.guardianName}. {r.memberName} a indiqué ses souhaits pour l&apos;usage de son image par le club. Comme son
        représentant légal ({r.guardianRelation}), c&apos;est vous qui décidez : ses choix sont pré-cochés, vous pouvez les
        modifier. L&apos;autorisation est facultative ; la refuser ne change rien à son inscription.{" "}
        <button type="button" onClick={() => setTextOpen(true)} className="text-emerald-700 underline">
          Lire le texte complet de l&apos;autorisation
        </button>
      </p>

      <ConsentChoicesFields
        usages={usages}
        onUsages={setUsages}
        keep={keep}
        onKeep={setKeep}
        subject="child"
        wishes={{ usages: r.usages, keepAfterLeave: r.keepAfterLeave }}
      />

      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" checked={legal} onChange={(e) => setLegal(e.target.checked)} />
        <span>
          Je suis {r.guardianName}, représentant légal ({r.guardianRelation}) de {r.memberName}, et je donne cette
          autorisation pour lui.
        </span>
      </label>

      {confirm.error && <p className="text-red-600">{confirm.error.message}</p>}
      <button
        type="submit"
        disabled={!legal || confirm.isPending}
        className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {confirm.isPending ? "Enregistrement…" : "Je valide l'autorisation"}
      </button>
      <p className="text-xs text-gray-500">
        Lien personnel, valable jusqu&apos;au {formatDate(r.expiresAt)} et utilisable une seule fois. Version du texte :{" "}
        {r.textVersion}.
      </p>
      {textOpen && <BlankConsentFormPreview onClose={() => setTextOpen(false)} />}
    </form>
  );
}
