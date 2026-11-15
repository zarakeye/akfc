"use client";

import { useState, type JSX } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@akfc/backend/modules/index.ts";

import { trpc } from "#core/trpc/trpcClient.ts";
import { formatDate } from "#features/image-consent/consentFormat.ts";
import { GuardianBirthDateField, isAdultBirthDate } from "#features/image-consent/GuardianBirthDateField.tsx";

/**
 * Page du parent référent : la date de naissance du membre mineur, à renseigner, corriger ou
 * effacer (champ vide), à la demande du mineur. Il se déclare représentant légal et valide. Une
 * date de majeur doit être confirmée : le membre passe alors majeur. Le droit à l'image n'est pas
 * touché.
 */
export function BirthDateGuardianPage({ token }: { token: string }): JSX.Element {
  const request = trpc.imageConsent.birthDateRequest.useQuery({ token }, { retry: false, refetchOnWindowFocus: false });
  const r = request.data;
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm">
      <h1 className="text-xl font-semibold">Date de naissance</h1>
      <p className="mt-1 text-gray-600">AKFC — Association Kung Fu Chambéry</p>
      {request.isPending ? (
        <p className="mt-6 text-gray-600">Chargement…</p>
      ) : request.error ? (
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
          {request.error.message}
        </p>
      ) : r ? (
        <BirthDateForm key={token} token={token} data={r} />
      ) : null}
    </main>
  );
}

type RequestData = inferRouterOutputs<AppRouter>["imageConsent"]["birthDateRequest"];

function BirthDateForm({ token, data: r }: { token: string; data: RequestData }): JSX.Element {
  const [birthDate, setBirthDate] = useState<string>(r.birthDate ?? "");
  const [confirmAdult, setConfirmAdult] = useState(false);
  const [legal, setLegal] = useState(false);
  const confirm = trpc.imageConsent.confirmBirthDate.useMutation();
  const adultDate = isAdultBirthDate(birthDate);
  const clearing = birthDate === "" && r.birthDate !== null;
  const empty = birthDate === "" && r.birthDate === null;
  const blocked = empty || (adultDate && !confirmAdult);

  if (confirm.data) {
    const text =
      confirm.data.result === "ADULT"
        ? `${r.memberName} est majeur : sa date de naissance est enregistrée. Il gère désormais seul son compte et son droit à l'image ; il en est informé.`
        : confirm.data.result === "CLEARED"
          ? `La date de naissance de ${r.memberName} est effacée. ${r.memberName} en est informé.`
          : `La date de naissance de ${r.memberName} est enregistrée. ${r.memberName} en est informé.`;
    return (
      <div className="mt-6 space-y-2 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-900" role="status">
        <p className="font-medium">Merci.</p>
        <p>{text}</p>
        <p>Ce lien ne sert plus.</p>
      </div>
    );
  }

  if (!r.stillMinor) {
    return (
      <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
        {r.memberName} est devenu majeur : il gère désormais lui-même son compte.
      </p>
    );
  }

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (legal && !blocked) {
          confirm.mutate({
            token,
            birthDate: birthDate || null,
            confirmAdult: adultDate ? confirmAdult : undefined,
            isLegalRepresentative: true,
          });
        }
      }}
    >
      <p>
        Bonjour {r.guardianName}. {r.memberName} vous demande de{" "}
        {r.birthDate ? "vérifier sa date de naissance enregistrée par le club" : "renseigner sa date de naissance"}. Elle
        sert à savoir quand il deviendra majeur et décidera seul de l&apos;usage de son image.
      </p>

      <GuardianBirthDateField
        memberName={r.memberName}
        label={`Date de naissance de ${r.memberName}`}
        value={birthDate}
        onChange={setBirthDate}
        confirmAdult={confirmAdult}
        onConfirmAdult={setConfirmAdult}
        hint={
          r.birthDate
            ? "Corrigez-la si besoin, ou videz le champ pour l'effacer (le passage à 18 ans ne sera alors plus automatique)."
            : undefined
        }
        adultConsequence={`Confirmée, elle fait passer ${r.memberName} majeur : il gérera seul son compte et son droit à l'image.`}
      />
      {clearing && (
        <p className="rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-700">
          Champ vide : la date enregistrée sera effacée.
        </p>
      )}

      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" checked={legal} onChange={(e) => setLegal(e.target.checked)} />
        <span>
          Je suis {r.guardianName}, représentant légal ({r.guardianRelation}) de {r.memberName}.
        </span>
      </label>

      {confirm.error && <p className="text-red-600">{confirm.error.message}</p>}
      <button
        type="submit"
        disabled={!legal || blocked || confirm.isPending}
        className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {confirm.isPending ? "Enregistrement…" : clearing ? "J'efface la date" : "J'enregistre la date"}
      </button>
      {!legal && <p className="text-xs text-gray-600">Pour valider, cochez la case « Je suis … représentant légal ».</p>}
      {empty && <p className="text-xs text-gray-600">Pour valider, indiquez sa date de naissance.</p>}
      {adultDate && !confirmAdult && (
        <p className="text-xs text-gray-600">Pour valider, corrigez la date de naissance ou confirmez-la.</p>
      )}
      <p className="text-xs text-gray-500">
        Lien personnel, valable jusqu&apos;au {formatDate(r.expiresAt)} et utilisable une seule fois.
      </p>
    </form>
  );
}
