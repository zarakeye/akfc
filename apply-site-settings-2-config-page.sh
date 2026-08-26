#!/usr/bin/env bash
#
# AKFC — Réglages du site (CMS) incrément 2 : page de config + lien sidebar.
#
# Prérequis : incrément 1 (modèle + router siteSettings) appliqué et migré.
#
# CE QUE FAIT CET INCRÉMENT (front seul, aucun consommateur encore branché) :
#   1. app/(admin)/dashboard/settings/page.tsx — formulaire admin :
#        shortTitle, longTitle, tagline, supportEmail, defaultLocale (select),
#        et LOGO via MediaPicker (mêmes rouages que la carte de DisciplineForm :
#        le picker rend des CHEMINS → convertis en id via media.resolveByPaths ;
#        aperçu via media.resolveByIds). Charge siteSettings.get (init une fois),
#        enregistre via siteSettings.save + invalide get.
#   2. ControlPanelSidebar — item « Réglages du site » (→ /dashboard/settings),
#        inséré avant « Disciplines », après « Pages éditoriales ».
#
# NOTE SÉCURITÉ (à décider) : siteSettings.save est `protectedProcedure` (calqué
# homeHero/sitePage/siteStyle : tout membre connecté peut écrire, l'accès repose
# sur la visibilité admin du lien). L'identité du site est plus sensible ; si tu
# veux la verrouiller à role.name==="ADMIN" (comme pageVisibility.assertAdmin),
# c'est un durcissement d'une ligne côté router — dis-le et je le livre à part.
#
# HORS PÉRIMÈTRE ici : brancher header/onglet/e-mail (incréments 3-4) et élargir
# la garde média publique pour que le logo choisi soit servi aux anonymes
# (incrément 3, sinon aperçu OK en admin mais 404 public).
#
# Usage : bash apply-site-settings-2-config-page.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-2-config-page.sh   (clone)
#
set -euo pipefail

PAGE_DIR="apps/web/src/app/(admin)/dashboard/settings"
PAGE="$PAGE_DIR/page.tsx"
SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SIDEBAR" ]     || { echo "ERREUR: $SIDEBAR introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. Feature autonome — main ou branche, comme tu veux."
    echo "      (Ctrl-C pour annuler.)"
    sleep 2
  fi
fi

# ── 1. Page de configuration ────────────────────────────────────────────────
mkdir -p "$PAGE_DIR"
cat > "$PAGE" <<'TSX'
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

  const logoImg = trpc.media.resolveByIds.useQuery(
    { mediaIds: logoAssetId ? [logoAssetId] : [] },
    { enabled: logoAssetId !== null },
  );
  const logoUrl = logoAssetId
    ? (logoImg.data?.[logoAssetId]?.url ?? null)
    : null;

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
TSX
echo "écrit  $PAGE"

# ── 2. Lien dans le control panel (avant « Disciplines ») ───────────────────
python3 - "$SIDEBAR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "/dashboard/settings" in s:
    print("déjà présent (Réglages du site)"); sys.exit(0)

anchor = "            {/* Disciplines */}\n"
assert s.count(anchor) == 1, "ancre {/* Disciplines */} introuvable/multiple"

item = (
    "            {/* Réglages du site */}\n"
    "            <li>\n"
    "              <div className=\"flex\">\n"
    "                <button\n"
    "                  className=\"w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]\"\n"
    "                  onClick={() => router.push(\"/dashboard/settings\")}\n"
    "                >\n"
    "                  Réglages du site\n"
    "                </button>\n"
    "              </div>\n"
    "            </li>\n\n"
)
s = s.replace(anchor, item + anchor)
p.write_text(s, encoding="utf-8")
print("sidebar patché (item Réglages du site)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(settings): page dashboard/settings (form identité + picker logo) + lien control panel" \
  && echo "commit $(git rev-parse --short HEAD)"