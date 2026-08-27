"use client";

import { useEffect, useState, type JSX } from "react";

import { trpc, trpcClient } from "@/core/trpc/trpcClient";
import { MediaPicker } from "@/features/finder-core/components/MediaPicker";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

/**
 * Réglages du site — identité éditable par un admin (ce qui, avant, vivait dans
 * le .env réservé au dev). Ne touche PAS aux identités techniques : la racine de
 * stockage (`APP_SHORT_NAME`), les URL de déploiement, SMTP et clés cloud
 * restent au .env.
 *
 * Le logo réutilise les rouages de la carte de discipline : le picker rend des
 * CHEMINS, convertis en identifiant de MediaAsset (media.resolveByPaths) ; on
 * stocke l'id. L'aperçu se résout via media.resolveByIds.
 */
export default function SiteSettingsPage(): JSX.Element {
  const utils = trpc.useUtils();
  const settings = trpc.siteSettings.get.useQuery();
  const save = trpc.siteSettings.save.useMutation({
    onSuccess: () => void utils.siteSettings.get.invalidate(),
  });

  const [initialized, setInitialized] = useState(false);
  const [shortTitle, setShortTitle] = useState("");
  const [longTitle, setLongTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [defaultLocale, setDefaultLocale] = useState("fr");
  const [logoAssetId, setLogoAssetId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Initialisation UNE FOIS quand la requête a répondu (data peut être null si
  // aucune ligne n'existe encore → on prépose les valeurs par défaut du modèle).
  useEffect(() => {
    if (initialized || !settings.isSuccess) return;
    const s = settings.data;
    setShortTitle(s?.shortTitle ?? "AKFC");
    setLongTitle(s?.longTitle ?? "Association de Kung Fu de Chambéry");
    setTagline(s?.tagline ?? "");
    setSupportEmail(s?.supportEmail ?? "");
    setDefaultLocale(s?.defaultLocale ?? "fr");
    setLogoAssetId(s?.logoAssetId ?? null);
    setInitialized(true);
  }, [initialized, settings.isSuccess, settings.data]);

  const savedLogoId = settings.data?.logoAssetId ?? null;
  const savedLogoUrl = settings.data?.logoUrl ?? null;

  // Aperçu : si l'id courant est le logo ENREGISTRÉ, on prend l'URL publique
  // (autorisée même en brouillon via la garde) → un brouillon s'aperçoit
  // comme le produit fini. Sinon (choix pas encore enregistré) : resolveByIds
  // (published) le temps d'enregistrer.
  const picked = trpc.media.resolveByIds.useQuery(
    {
      mediaIds:
        logoAssetId && logoAssetId !== savedLogoId ? [logoAssetId] : [],
    },
    { enabled: logoAssetId !== null && logoAssetId !== savedLogoId },
  );
  const logoUrl = !logoAssetId
    ? null
    : logoAssetId === savedLogoId
      ? savedLogoUrl
      : (picked.data?.[logoAssetId]?.url ?? null);

  const canSave =
    shortTitle.trim() !== "" && longTitle.trim() !== "" && !save.isPending;

  const onSave = (): void => {
    void save.mutateAsync({
      shortTitle: shortTitle.trim(),
      longTitle: longTitle.trim(),
      tagline: tagline.trim() === "" ? null : tagline.trim(),
      supportEmail: supportEmail.trim() === "" ? "" : supportEmail.trim(),
      defaultLocale: defaultLocale.trim() || "fr",
      logoAssetId,
    });
  };

  if (settings.isLoading) {
    return <p className="p-6 text-sm text-gray-500">Chargement…</p>;
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">Réglages du site</h1>
      <p className="mb-6 text-sm text-gray-600">
        Identité affichée du site (titres, logo, coordonnées de support, langue).
        Modifiable sans toucher au code. Les réglages techniques (stockage, URL
        de déploiement, e-mail serveur) restent gérés par le développeur.
      </p>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Titre court</span>
          <input
            className={inputClass}
            value={shortTitle}
            onChange={(e) => setShortTitle(e.target.value)}
            placeholder="AKFC"
          />
          <span className="mt-1 block text-xs text-gray-400">
            Affiché dans le header, l&apos;onglet du navigateur et les e-mails.
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Titre long</span>
          <input
            className={inputClass}
            value={longTitle}
            onChange={(e) => setLongTitle(e.target.value)}
            placeholder="Association de Kung Fu de Chambéry"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Accroche <span className="text-gray-400">(optionnelle)</span>
          </span>
          <input
            className={inputClass}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Une phrase de présentation courte"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            E-mail de contact <span className="text-gray-400">(optionnel)</span>
          </span>
          <input
            type="email"
            className={inputClass}
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="contact@akfc.fr"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Langue par défaut</span>
          <select
            className={inputClass}
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          <span className="mt-1 block text-xs text-gray-400">
            Pilote la langue déclarée de la page et des e-mails. Ne traduit pas
            l&apos;interface (pas de couche i18n à ce stade).
          </span>
        </label>

        {/* Logo */}
        <div className="space-y-2">
          <span className="block text-sm font-medium">Logo du site</span>
          <div className="flex items-start gap-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo du site"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="px-2 text-center text-xs text-gray-400">
                  {logoAssetId ? "Chargement…" : "Logo embarqué"}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
              >
                {logoAssetId ? "Remplacer le logo" : "Choisir un logo"}
              </button>
              {logoAssetId && (
                <button
                  type="button"
                  onClick={() => setLogoAssetId(null)}
                  className="text-left text-xs text-gray-500 hover:text-red-600"
                >
                  Rétablir le logo embarqué
                </button>
              )}
              <span className="text-xs text-gray-400">
                Choisi dans la bibliothèque média.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={!canSave}
            onClick={onSave}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          {save.isSuccess && !save.isPending && (
            <span className="text-sm text-emerald-700">Enregistré.</span>
          )}
          {save.error && (
            <span className="text-sm text-red-600">{save.error.message}</span>
          )}
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          open
          adapter={finderStorageAdapter}
          rootPath={APP_ROOT}
          onClose={() => setPickerOpen(false)}
          onSubmit={(paths) => {
            setPickerOpen(false);
            if (paths.length === 0) return;
            // Le picker rend des CHEMINS ; conversion en identifiant via la même
            // route que le builder, pour une référence identique.
            void trpcClient.media.resolveByPaths
              .query({ appRoot: APP_ROOT, paths })
              .then((resolved) => {
                const found = Object.values(resolved).find(
                  (id): id is string => id !== null,
                );
                if (found) setLogoAssetId(found);
              });
          }}
        />
      )}
    </div>
  );
}
