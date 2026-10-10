#!/usr/bin/env bash
# AKFC — Réglages du site : l'aperçu du logo choisit son fond d'après la couleur du logo.
#  - LogoPreview.tsx (nouveau) : mesure la luminance moyenne des pixels visibles du logo (canvas) ;
#    logo clair → fond sombre, logo sombre → fond clair ; mesure impossible → fond sombre (en-tête).
#  - /api/media/site-logo?raw=1 : renvoie le SVG lui-même (même origine), indispensable pour que
#    le canvas puisse le lire (la redirection habituelle vers R2 rendrait le canvas illisible).
#    Servi avec CSP « sandbox » et nosniff : un SVG ouvert directement ne peut rien exécuter.
#  - page des réglages : l'aperçu passe par LogoPreview.
# Usage : bash apply-settings-logo-adaptive.sh
set -euo pipefail
[ -f package.json ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
SETTINGS="apps/web/src/app/(admin)/dashboard/settings/page.tsx"
ROUTE="apps/web/src/app/api/media/site-logo/route.ts"
COMP="apps/web/src/features/admin/site-settings/LogoPreview.tsx"
grep -q "LogoPreview" "$SETTINGS" && { echo "— déjà appliqué"; exit 0; }
[ -e "$COMP" ] && { echo "ERREUR: $COMP existe déjà : rien n'a été modifié." >&2; exit 1; }

python3 - "$SETTINGS" "$ROUTE" <<'PY'
import sys, pathlib
settings, route = map(pathlib.Path, sys.argv[1:3])
def edit(p, pairs):
    s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        assert s.count(old) == 1, f"{p} : ancre ×{s.count(old)} : {old[:70]!r}"
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8"); print(f"  ok  {p}")
edit(settings, [
  ('import { trpc } from "@/core/trpc/trpcClient";\n',
   'import { trpc } from "@/core/trpc/trpcClient";\nimport { LogoPreview } from "@features/admin/site-settings/LogoPreview";\n'),
  ('''            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Logo du site"
                className="h-full w-full object-contain"
              />
            </div>
''', '''            {/* Fond choisi d'après la couleur du logo (clair → fond sombre, sombre → fond clair) */}
            <LogoPreview src={logoSrc} />
'''),
])
edit(route, [
  ("export async function GET(_req: NextRequest): Promise<NextResponse> {",
   "export async function GET(req: NextRequest): Promise<NextResponse> {"),
  ('''      Key: SITE_LOGO_KEY,
    });
''', '''      Key: SITE_LOGO_KEY,
    });

    // ?raw=1 : le SVG lui-même, servi par la même origine (aperçu des réglages, qui mesure ses
    // couleurs dans un canvas). Sandbox + nosniff : ouvert directement, il ne peut rien exécuter.
    if (req.nextUrl.searchParams.get("raw") === "1") {
      const object = await s3.send(command);
      const svg = await object.Body?.transformToString();
      if (!svg) return new NextResponse("Not found", { status: 404 });
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
'''),
])
PY
mkdir -p "$(dirname "$COMP")" && echo 'InVzZSBjbGllbnQiOwoKaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdHlwZSBKU1ggfSBmcm9tICJyZWFjdCI7CgovKiogRm9uZCBkZSBsJ2FwZXLDp3UgOiBzb21icmUgcG91ciB1biBsb2dvIGNsYWlyLCBjbGFpciBwb3VyIHVuIGxvZ28gc29tYnJlLiAqLwpleHBvcnQgdHlwZSBMb2dvQmFja2Ryb3AgPSAiZGFyayIgfCAibGlnaHQiOwoKLyoqCiAqIFVSTCBsaXNpYmxlIHBhciB1biBjYW52YXMgKG3Dqm1lIG9yaWdpbmUpLiBMZSBsb2dvIFIyIGVzdCBzZXJ2aSBwYXIgdW5lIHJlZGlyZWN0aW9uIHZlcnMgUjIsCiAqIHVuZSBhdXRyZSBvcmlnaW5lIDogdW4gY2FudmFzIHF1aSBsZSBkZXNzaW5lcmFpdCBkZXZpZW5kcmFpdCBpbGxpc2libGUgKMKrIHRhaW50ZWQgwrspLgogKiBgP3Jhdz0xYCBkZW1hbmRlIMOgIGxhIHJvdXRlIGRlIHJlbnZveWVyIGxlIFNWRyBsdWktbcOqbWUuCiAqLwpleHBvcnQgZnVuY3Rpb24gc2FtZU9yaWdpbkxvZ29Vcmwoc3JjOiBzdHJpbmcpOiBzdHJpbmcgewogIGlmICghc3JjLnN0YXJ0c1dpdGgoIi9hcGkvbWVkaWEvc2l0ZS1sb2dvIikpIHJldHVybiBzcmM7CiAgcmV0dXJuIGAke3NyY30ke3NyYy5pbmNsdWRlcygiPyIpID8gIiYiIDogIj8ifXJhdz0xYDsKfQoKLyoqIEx1bWluYW5jZSDiiaUgMCw1IDogbG9nbyBjbGFpciwgZG9uYyBmb25kIHNvbWJyZS4gTWVzdXJlIGltcG9zc2libGUgOiBmb25kIHNvbWJyZSAoY2VsdWkgZGUgbCdlbi10w6p0ZSkuICovCmV4cG9ydCBmdW5jdGlvbiBiYWNrZHJvcEZvcihsdW1pbmFuY2U6IG51bWJlciB8IG51bGwpOiBMb2dvQmFja2Ryb3AgewogIHJldHVybiBsdW1pbmFuY2UgPT09IG51bGwgfHwgbHVtaW5hbmNlID49IDAuNSA/ICJkYXJrIiA6ICJsaWdodCI7Cn0KCi8qKgogKiBMdW1pbmFuY2UgbW95ZW5uZSAoMCA9IG5vaXIsIDEgPSBibGFuYykgZGVzIHBpeGVscyB2aXNpYmxlcyBkdSBsb2dvLCBwb25kw6lyw6llIHBhciBsZXVyIG9wYWNpdMOpLgogKiBudWxsIHNpIGwnaW1hZ2UgZXN0IGlsbGlzaWJsZSBvdSBlbnRpw6hyZW1lbnQgdHJhbnNwYXJlbnRlLgogKi8KZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lYXN1cmVMb2dvTHVtaW5hbmNlKHVybDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXIgfCBudWxsPiB7CiAgbGV0IG9iamVjdFVybDogc3RyaW5nIHwgbnVsbCA9IG51bGw7CiAgdHJ5IHsKICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwgeyBjcmVkZW50aWFsczogInNhbWUtb3JpZ2luIiB9KTsKICAgIGlmICghcmVzLm9rKSByZXR1cm4gbnVsbDsKICAgIG9iamVjdFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYXdhaXQgcmVzLmJsb2IoKSk7CiAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTsKICAgIGltZy5zcmMgPSBvYmplY3RVcmw7CiAgICBhd2FpdCBpbWcuZGVjb2RlKCk7CgogICAgY29uc3Qgc2l6ZSA9IDY0OwogICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiY2FudmFzIik7CiAgICBjYW52YXMud2lkdGggPSBzaXplOwogICAgY2FudmFzLmhlaWdodCA9IHNpemU7CiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgiMmQiLCB7IHdpbGxSZWFkRnJlcXVlbnRseTogdHJ1ZSB9KTsKICAgIGlmICghY3R4KSByZXR1cm4gbnVsbDsKICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBzaXplLCBzaXplKTsKICAgIGNvbnN0IHsgZGF0YSB9ID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBzaXplLCBzaXplKTsKCiAgICBsZXQgd2VpZ2h0ID0gMDsKICAgIGxldCBzdW0gPSAwOwogICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSA0KSB7CiAgICAgIGNvbnN0IGFscGhhID0gZGF0YVtpICsgM10gLyAyNTU7CiAgICAgIGlmIChhbHBoYSA8IDAuMSkgY29udGludWU7CiAgICAgIGNvbnN0IGx1bSA9ICgwLjIxMjYgKiBkYXRhW2ldICsgMC43MTUyICogZGF0YVtpICsgMV0gKyAwLjA3MjIgKiBkYXRhW2kgKyAyXSkgLyAyNTU7CiAgICAgIHN1bSArPSBsdW0gKiBhbHBoYTsKICAgICAgd2VpZ2h0ICs9IGFscGhhOwogICAgfQogICAgcmV0dXJuIHdlaWdodCA+IDAgPyBzdW0gLyB3ZWlnaHQgOiBudWxsOwogIH0gY2F0Y2ggewogICAgcmV0dXJuIG51bGw7CiAgfSBmaW5hbGx5IHsKICAgIGlmIChvYmplY3RVcmwpIFVSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKTsKICB9Cn0KCi8qKiBBcGVyw6d1IGR1IGxvZ28gZGVzIHLDqWdsYWdlcywgc3VyIHVuIGZvbmQgY2hvaXNpIGQnYXByw6hzIGxhIGNvdWxldXIgZHUgbG9nby4gKi8KZXhwb3J0IGZ1bmN0aW9uIExvZ29QcmV2aWV3KHsgc3JjLCBhbHQgPSAiTG9nbyBkdSBzaXRlIiB9OiB7IHNyYzogc3RyaW5nOyBhbHQ/OiBzdHJpbmcgfSk6IEpTWC5FbGVtZW50IHsKICBjb25zdCBbYmFja2Ryb3AsIHNldEJhY2tkcm9wXSA9IHVzZVN0YXRlPExvZ29CYWNrZHJvcD4oImRhcmsiKTsKCiAgdXNlRWZmZWN0KCgpID0+IHsKICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTsKICAgIHZvaWQgbWVhc3VyZUxvZ29MdW1pbmFuY2Uoc2FtZU9yaWdpbkxvZ29Vcmwoc3JjKSkudGhlbigobHVtKSA9PiB7CiAgICAgIGlmICghY2FuY2VsbGVkKSBzZXRCYWNrZHJvcChiYWNrZHJvcEZvcihsdW0pKTsKICAgIH0pOwogICAgcmV0dXJuICgpID0+IHsKICAgICAgY2FuY2VsbGVkID0gdHJ1ZTsKICAgIH07CiAgfSwgW3NyY10pOwoKICByZXR1cm4gKAogICAgPGRpdgogICAgICBjbGFzc05hbWU9e2BmbGV4IGgtMjQgdy0yNCBzaHJpbmstMCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgb3ZlcmZsb3ctaGlkZGVuIHJvdW5kZWQtbWQgYm9yZGVyIHAtMiAkewogICAgICAgIGJhY2tkcm9wID09PSAiZGFyayIgPyAiYm9yZGVyLWdyYXktNzAwIGJnLW5ldXRyYWwtOTAwIiA6ICJib3JkZXItZ3JheS0zMDAgYmctd2hpdGUiCiAgICAgIH1gfQogICAgICB0aXRsZT17YmFja2Ryb3AgPT09ICJkYXJrIiA/ICJMb2dvIGNsYWlyIDogYXBlcsOndSBzdXIgZm9uZCBzb21icmUiIDogIkxvZ28gc29tYnJlIDogYXBlcsOndSBzdXIgZm9uZCBjbGFpciJ9CiAgICA+CiAgICAgIHsvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQG5leHQvbmV4dC9uby1pbWctZWxlbWVudCAqL30KICAgICAgPGltZyBzcmM9e3NyY30gYWx0PXthbHR9IGNsYXNzTmFtZT0iaC1mdWxsIHctZnVsbCBvYmplY3QtY29udGFpbiIgLz4KICAgIDwvZGl2PgogICk7Cn0K' | base64 -d > "$COMP" && echo "  ok  $COMP (nouveau)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ — pas de commit (git checkout -- \"$SETTINGS\" $ROUTE && rm -rf $(dirname $COMP) pour annuler) :"
  grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -12; exit 1
fi
echo "✅ check OK"; git add "$SETTINGS" "$ROUTE" "$COMP"
git commit -qm "fix(settings): aperçu du logo sur un fond adapté à sa couleur (mesure de luminance, SVG brut même origine)" && echo "✅ commit $(git rev-parse --short HEAD)"