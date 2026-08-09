#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 4b/6 : viewer react-pdf léché.
#
# PRÉALABLE (à faire À LA MAIN d'abord, ça touche le lockfile) :
#     pnpm add react-pdf
#
# Ce script :
#   1. fait STREAMER la route /api/media/member-document/[id] en MÊME ORIGINE
#      (au lieu de la redirection presignée) — indispensable pour que pdf.js
#      puisse fetcher les octets sans se heurter au CORS de R2 ;
#   2. crée le composant `PdfViewer` (react-pdf, rendu canvas, barre pages+zoom) ;
#   3. remplace l'`<object>` provisoire du panneau par `<PdfViewer>` ;
#   4. copie le worker pdf.js de pdfjs-dist vers apps/web/public (version
#      garantie identique à celle installée).
#
# Le typecheck exige que `react-pdf` soit installé. Verif à faire ensuite :
# que le worker se charge et que le PDF s'affiche (voir message final).
#
# Usage normal (Stéphane, APRÈS `pnpm add react-pdf`) : depuis la racine du repo.
#   bash apply-member-documents-viewer.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-viewer.sh
#
set -euo pipefail

ROUTE="apps/web/src/app/api/media/member-document/[id]/route.ts"
PANEL="apps/web/src/features/member-documents/DocumentReaderPanel.tsx"
VIEWER="apps/web/src/features/member-documents/PdfViewer.tsx"
PUBLIC_WORKER="apps/web/public/pdf.worker.min.mjs"

if [ ! -f "package.json" ] || [ ! -f "$ROUTE" ] || [ ! -f "$PANEL" ]; then
  echo "ERREUR: lance depuis la racine, increments 3 et 4a appliqués ($ROUTE, $PANEL attendus)." >&2
  exit 1
fi

# ── 1) Route : streaming même origine ───────────────────────────────────────
python3 - "$ROUTE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "transformToWebStream" in s:
    print("route déjà en streaming"); sys.exit(0)

# import presigner devenu inutile
s = s.replace('import { getSignedUrl } from "@aws-sdk/s3-request-presigner";\n', "", 1)
# constante d'expiration devenue inutile
s = s.replace("const PRESIGNED_URL_EXPIRY_SECONDS = 30 * 60;\n\n", "", 1)

R2_OLD = '''  // ─── R2 (PDF) : redirection presignée, inline forcé ───────────────────
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: asset.fullPath,
      ResponseContentType: contentType,
      ResponseContentDisposition: disposition,
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (err) {
    console.error("[member-document] r2 sign error", id, err);
    return new NextResponse("Internal server error", { status: 500 });
  }'''
R2_NEW = '''  // ─── R2 (PDF) : stream MÊME ORIGINE (gated) ───────────────────────────
  // On streame plutôt que de rediriger vers une URL presignée : pdf.js fetche
  // les octets en JS et se heurterait au CORS d'une redirection cross-origin.
  // En prime, les octets restent gatés à chaque requête (pas d'URL signée
  // partageable).
  try {
    const s3 = getR2Client();
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: asset.fullPath }),
    );
    if (!obj.Body) {
      return new NextResponse("Not found", { status: 404 });
    }
    return new Response(obj.Body.transformToWebStream(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        ...(obj.ContentLength
          ? { "Content-Length": String(obj.ContentLength) }
          : {}),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[member-document] r2 stream error", id, err);
    return new NextResponse("Internal server error", { status: 500 });
  }'''
assert s.count(R2_OLD) == 1, "ancre branche R2 introuvable/multiple — abandon"
s = s.replace(R2_OLD, R2_NEW)
p.write_text(s, encoding="utf-8"); print("route → streaming")
PY

# ── 2) Composant PdfViewer ──────────────────────────────────────────────────
if [ -f "$VIEWER" ]; then echo "viewer déjà présent"; else
cat > "$VIEWER" <<'VIEWER_EOF'
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

// Worker pdf.js self-hosté (copié depuis pdfjs-dist dans /public — version
// garantie identique à celle installée).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Viewer PDF léché, rendu canvas (pas de couche texte : évite les CSS
 * versionnés de react-pdf, suffisant pour une lecture seule). Barre :
 * navigation de pages + zoom. Le PDF est servi même origine par la route
 * gatée, donc pdf.js le fetche sans souci de CORS.
 */
export function PdfViewer({ src }: { src: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPage(1);
  }, []);

  const btn =
    "rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center gap-1 border-b border-gray-200 bg-white px-3 py-2 text-sm">
        <button
          type="button"
          className={btn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="w-16 text-center tabular-nums text-gray-600">
          {page} / {numPages || "…"}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => setPage((p) => Math.min(numPages || 1, p + 1))}
          disabled={numPages > 0 && page >= numPages}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="mx-2 h-4 w-px bg-gray-200" />
        <button
          type="button"
          className={btn}
          onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}
          aria-label="Dézoomer"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}
          aria-label="Zoomer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-auto bg-gray-100 p-4"
      >
        <Document
          file={src}
          onLoadSuccess={onLoadSuccess}
          loading={
            <div className="py-10 text-center text-sm text-gray-500">
              Chargement…
            </div>
          }
          error={
            <div className="py-10 text-center text-sm text-gray-600">
              Impossible d&apos;afficher le document. Utilisez le bouton
              Télécharger.
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={width ? width - 32 : undefined}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto shadow-md"
          />
        </Document>
      </div>
    </div>
  );
}
VIEWER_EOF
echo "PdfViewer créé"
fi

# ── 3) Panneau : <object> → <PdfViewer> ─────────────────────────────────────
python3 - "$PANEL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "<PdfViewer" in s:
    print("panneau déjà sur PdfViewer"); sys.exit(0)

IMP_OLD = 'import { trpc } from "@trpc/trpcClient";'
IMP_NEW = ('import { trpc } from "@trpc/trpcClient";\n'
           'import { PdfViewer } from "@features/member-documents/PdfViewer";')
assert s.count(IMP_OLD) == 1, "ancre import panneau introuvable — abandon"
s = s.replace(IMP_OLD, IMP_NEW)

OBJ_OLD = '''        {/* Aperçu — embed natif provisoire (remplacé par react-pdf en 4b). */}
        <div className="min-h-0 flex-1 bg-gray-100">
          <object data={src} type="application/pdf" className="h-full w-full">
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-gray-600">
              <p>L&apos;aperçu n&apos;est pas disponible sur cet appareil.</p>
              <a
                href={`${src}?download=1`}
                className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Télécharger le document
              </a>
            </div>
          </object>
        </div>'''
OBJ_NEW = '''        {/* Aperçu — viewer react-pdf (canvas). */}
        <div className="min-h-0 flex-1 bg-gray-100">
          <PdfViewer src={src} />
        </div>'''
assert s.count(OBJ_OLD) == 1, "ancre <object> panneau introuvable — abandon"
s = s.replace(OBJ_OLD, OBJ_NEW)
p.write_text(s, encoding="utf-8"); print("panneau → PdfViewer")
PY

# ── 4) Worker pdf.js → public (best-effort) ─────────────────────────────────
if [ -f "$PUBLIC_WORKER" ]; then
  echo "worker déjà en place"
else
  SRC_WORKER="$(find node_modules apps/web/node_modules -path '*pdfjs-dist/build/pdf.worker.min.mjs' 2>/dev/null | head -1 || true)"
  if [ -n "$SRC_WORKER" ]; then
    mkdir -p apps/web/public
    cp "$SRC_WORKER" "$PUBLIC_WORKER"
    echo "worker copié depuis $SRC_WORKER"
  else
    echo "⚠️  worker pdfjs-dist introuvable — as-tu lancé 'pnpm add react-pdf' ?"
    echo "    Copie-le ensuite : cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs $PUBLIC_WORKER"
  fi
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. (react-pdf est-il installé ?) Erreurs :"
  grep -nE "error TS|Error:|erreur|Cannot find module" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): viewer react-pdf intégré + route en streaming même origine" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo ""
  echo "➡️  À vérifier à l'écran : le PDF s'affiche dans le panneau (worker chargé), pages + zoom OK, et le téléchargement fonctionne."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi