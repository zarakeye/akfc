#!/usr/bin/env bash
# AKFC — Logo R2 (Volet 1, incrément 2 : UI Réglages).
#  - backend : mutation clearLogo (rétablit le logo embarqué).
#  - front : bloc « Logo du site » = upload SVG direct (uploadLogo), aperçu depuis
#    logoUrl avec repli /AKFC_logo.svg (corrige le "Chargement…" permanent),
#    bouton "Rétablir le logo embarqué". Supprime MediaPicker/resolveByPaths/Ids.
# Usage : bash apply-logo-r2-2-ui.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
ROUTER="packages/backend/src/modules/siteSettings/router.ts"
PAGE="apps/web/src/app/(admin)/dashboard/settings/page.tsx"
for f in "$ROUTER" "$PAGE"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

# ---------- backend : clearLogo ----------
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "clearLogo" in s:
    print("  — router : clearLogo déjà présent"); sys.exit(0)
anchor = "      return { success: true };\n    }),\n});"
assert s.count(anchor) == 1, f"ancre fin uploadLogo ×{s.count(anchor)}"
add = """      return { success: true };
    }),

  /**
   * Rétablit le logo embarqué : efface la clé R2 (l'objet system/logo.svg reste
   * mais n'est plus référencé — écrasé au prochain upload). Le consommateur
   * retombe alors sur le SVG embarqué.
   */
  clearLogo: protectedProcedure.mutation(async ({ ctx }) => {
    await assertAdmin(ctx);
    await ctx.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: { logoKey: null },
    });
    return { success: true };
  }),
});"""
p.write_text(s.replace(anchor, add), encoding="utf-8")
print("  ok  router : clearLogo ajouté")
PY

# ---------- front : réécriture de la page settings ----------
cat > "$PAGE" <<'TSX'
"use client";

import { useEffect, useRef, useState, type JSX } from "react";

import { trpc } from "@/core/trpc/trpcClient";

/**
 * Réglages du site — identité éditable par un admin.
 *
 * Le LOGO est autonome (comme l'avatar) : upload SVG direct vers R2 via
 * siteSettings.uploadLogo (clé système hors finder). Aucune dépendance au
 * MediaPicker ni aux résolutions d'assets. Aperçu depuis logoUrl, avec repli
 * sur le SVG embarqué (`/AKFC_logo.svg`) — donc jamais de "chargement" bloqué.
 * Le reste du formulaire (titres, accroche, e-mail, langue) est inchangé.
 */
const EMBEDDED_LOGO = "/AKFC_logo.svg";
const MAX_LOGO_BYTES = 512 * 1024;

export default function SiteSettingsPage(): JSX.Element {
  const utils = trpc.useUtils();
  const settings = trpc.siteSettings.get.useQuery();
  const save = trpc.siteSettings.save.useMutation({
    onSuccess: () => void utils.siteSettings.get.invalidate(),
  });
  const uploadLogo = trpc.siteSettings.uploadLogo.useMutation({
    onSuccess: () => void utils.siteSettings.get.invalidate(),
  });
  const clearLogo = trpc.siteSettings.clearLogo.useMutation({
    onSuccess: () => void utils.siteSettings.get.invalidate(),
  });

  const [initialized, setInitialized] = useState(false);
  const [shortTitle, setShortTitle] = useState("");
  const [longTitle, setLongTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [defaultLocale, setDefaultLocale] = useState("fr");
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialized || !settings.isSuccess) return;
    const s = settings.data;
    setShortTitle(s?.shortTitle ?? "AKFC");
    setLongTitle(s?.longTitle ?? "Association de Kung Fu de Chambéry");
    setTagline(s?.tagline ?? "");
    setSupportEmail(s?.supportEmail ?? "");
    setDefaultLocale(s?.defaultLocale ?? "fr");
    setInitialized(true);
  }, [initialized, settings.isSuccess, settings.data]);

  const hasCustomLogo = Boolean(settings.data?.logoKey);
  const logoSrc = settings.data?.logoUrl ?? EMBEDDED_LOGO;

  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = ""; // permet de re-choisir le même fichier
    if (!file) return;
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    if (!isSvg) {
      setLogoError("Le logo doit être un fichier SVG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo trop volumineux (max 512 Ko).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === "string" ? reader.result : "";
      const dataBase64 = res.split(",")[1] ?? "";
      if (!dataBase64) {
        setLogoError("Lecture du fichier impossible.");
        return;
      }
      uploadLogo.mutate({ dataBase64, mimeType: "image/svg+xml" });
    };
    reader.onerror = () => setLogoError("Lecture du fichier impossible.");
    reader.readAsDataURL(file);
  };

  const canSave =
    shortTitle.trim() !== "" && longTitle.trim() !== "" && !save.isPending;

  const onSave = (): void => {
    void save.mutateAsync({
      shortTitle: shortTitle.trim(),
      longTitle: longTitle.trim(),
      tagline: tagline.trim() === "" ? null : tagline.trim(),
      supportEmail: supportEmail.trim() === "" ? "" : supportEmail.trim(),
      defaultLocale: defaultLocale.trim() || "fr",
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

        {/* Logo — upload SVG direct (R2, hors finder) */}
        <div className="space-y-2">
          <span className="block text-sm font-medium">Logo du site</span>
          <div className="flex items-start gap-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Logo du site"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadLogo.isPending}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                {uploadLogo.isPending
                  ? "Envoi…"
                  : hasCustomLogo
                    ? "Remplacer le logo"
                    : "Importer un logo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/svg+xml,.svg"
                onChange={onPickLogo}
                className="hidden"
              />
              {hasCustomLogo && (
                <button
                  type="button"
                  onClick={() => clearLogo.mutate()}
                  disabled={clearLogo.isPending}
                  className="text-left text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
                >
                  {clearLogo.isPending ? "…" : "Rétablir le logo embarqué"}
                </button>
              )}
              <span className="text-xs text-gray-400">
                Fichier SVG, 512 Ko max. Stocké hors bibliothèque média.
              </span>
              {logoError && (
                <span className="text-xs text-red-600">{logoError}</span>
              )}
              {uploadLogo.error && (
                <span className="text-xs text-red-600">
                  {uploadLogo.error.message}
                </span>
              )}
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
    </div>
  );
}
TSX
echo "  ok  page settings réécrite (upload logo SVG)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "prisma generate…"; { pnpm --filter @workspace/backend exec prisma generate || pnpm exec prisma generate || npx --yes prisma generate; } > /tmp/akfc_gen.log 2>&1 || { echo "⚠ generate :"; tail -5 /tmp/akfc_gen.log; }
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(site-settings): UI logo — upload SVG direct (R2) + clearLogo, fin du picker finder" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }